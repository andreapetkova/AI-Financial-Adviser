import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { categorySchema } from '@/lib/validators/transaction';

const learnedRuleSchema = z.object({
  description: z.string(),
  category: categorySchema,
});

const requestSchema = z.object({
  pdfBase64: z.string().min(1),
  learnedRules: z.array(learnedRuleSchema).optional().default([]),
});

const transactionRowSchema = z.object({
  date: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().finite(),
  currency: z.string().min(1).max(5).optional(),
  category: categorySchema.nullable().optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
});

const responseSchema = z.object({
  transactions: z.array(transactionRowSchema),
});

const SYSTEM_PROMPT = `You are a bank statement parser. You receive bank statement PDFs in any language, format, or layout. Extract every transaction and categorize it in one pass.

Return a JSON object with a "transactions" array. Each item has:
- "date": YYYY-MM-DD
- "description": merchant/payee name — most informative text available
- "amount": negative for debits/expenses, positive for credits/income
- "currency": 3-letter code if detectable (optional)
- "category": one of the valid categories listed below
- "confidence": 0.6–0.95 reflecting how clear the category match is

Valid categories: housing, transportation, food_dining, groceries, utilities, healthcare, entertainment, shopping, subscriptions, travel, education, personal_care, income, savings_investments, debt_payments, gifts_donations, other

Categorization:
- Use the full document context — bank name, country, merchant patterns — to infer categories
- "income": deposits, credits, salary (positive amounts)
- "groceries": supermarkets, food stores
- "food_dining": restaurants, cafes, food delivery apps
- "transportation": fuel stations, parking, public transit, ride-sharing, taxis
- "subscriptions": streaming services, software, SaaS, recurring digital charges
- "utilities": electricity, water, gas, phone, internet bills
- "shopping": retail, department stores, online marketplaces
- "entertainment": cinemas, concerts, gaming, events
- "travel": hotels, flights, travel agencies, car rentals
- "healthcare": pharmacies, doctors, clinics, hospitals, dentists
- "other": last resort only
- Confidence 0.85–0.95 when the merchant type is unambiguous; 0.6–0.75 when uncertain
- Descriptions may be in any language — categorize on merchant type and transaction context, not language

Parsing:
- Merge multi-line records into one entry using the most descriptive text
- Skip header rows, summary/total rows, and blank rows
- Parse dates from any format (DD.MM.YYYY, DD/MM/YYYY, MM/DD/YYYY, etc.) into YYYY-MM-DD
- Separate debit/credit columns: debit = negative, credit = positive
- Prefer recognizable merchant names over internal bank reference codes
- Return valid JSON only — no markdown, no explanation`;

function buildLearnedRulesBlock(learnedRules: Array<{ description: string; category: string }>): string {
  if (learnedRules.length === 0) return '';
  const lines = learnedRules.map(r => `"${r.description}" → ${r.category}`).join('\n');
  return `\nAccount-specific rules (previously confirmed by this user — treat as definitive, confidence 0.95):\n${lines}\n\nWhen a description closely matches any rule above, always use that category.\n`;
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { error: authError } = await supabase.auth.getUser(token);
  if (authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = SYSTEM_PROMPT + buildLearnedRulesBlock(parsed.data.learnedRules);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: parsed.data.pdfBase64,
            },
          },
          {
            text: 'Extract and categorize all transactions from this bank statement. Return only the JSON object.',
          },
        ],
      }],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json({ error: 'No text response from AI' }, { status: 502 });
    }

    const rawResponse = JSON.parse(text);
    const validated = responseSchema.parse(rawResponse);

    return NextResponse.json(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid AI response format', details: error.issues }, { status: 502 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 502 });
    }
    if (error instanceof Error) {
      if (error.message.includes('429') || error.message.toLowerCase().includes('quota')) {
        return NextResponse.json({ error: 'AI service rate limit', message: error.message }, { status: 429 });
      }
      return NextResponse.json({ error: 'AI service error', message: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
