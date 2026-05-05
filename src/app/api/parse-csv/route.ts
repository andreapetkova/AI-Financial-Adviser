import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { extractJson, getTextContent } from '@/lib/ai/parseAiResponse';

const requestSchema = z.object({
  rawText: z.string().min(1).max(50_000),
});

const transactionRowSchema = z.object({
  date: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().finite(),
  currency: z.string().min(1).max(5).optional(),
});

const responseSchema = z.object({
  transactions: z.array(transactionRowSchema),
});

const SYSTEM_PROMPT = `You are a bank statement CSV parser. You receive raw CSV/text content from bank statements in any language, encoding, delimiter, or format. Your job is to extract every transaction into a structured JSON array.

Rules:
- Return a JSON object with a "transactions" array
- Each transaction has: "date" (YYYY-MM-DD format), "description" (the merchant/payee/description — use the most informative text available), "amount" (negative for expenses/debits, positive for income/credits), and optionally "currency" (3-letter code if detectable)
- Merge multi-line records: if a transaction spans multiple rows (e.g. main row + reference number rows), combine them into one transaction using the most descriptive text
- Skip header rows, summary/total rows, and empty rows
- Parse dates from any format (DD.MM.YYYY, DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, etc.) into YYYY-MM-DD
- If there are separate debit and credit columns, use the debit amount as negative and credit as positive
- If all amounts are positive but the context shows they are debits/expenses, make them negative
- Extract the merchant/payee name from whatever column contains it — prefer the column with recognizable merchant names (e.g. "KAUFLAND", "Spotify", "SHELL") over internal bank reference text
- If text is in a non-English language, still extract it as-is — do not translate
- Return valid JSON only, no markdown or explanation`;

function buildUserPrompt(rawText: string): string {
  return `Parse the following bank statement CSV content and extract all transactions. Return only the JSON object:

\`\`\`
${rawText}
\`\`\``;
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
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
    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

    const message = await client.messages.create({
      model,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(parsed.data.rawText) }],
    });

    const text = getTextContent(message.content);
    if (!text) {
      return NextResponse.json({ error: 'No text response from AI' }, { status: 502 });
    }

    const jsonString = extractJson(text);
    const rawResponse = JSON.parse(jsonString);
    const validated = responseSchema.parse(rawResponse);

    return NextResponse.json(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid AI response format', details: error.issues }, { status: 502 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 502 });
    }
    if (error instanceof Anthropic.APIError) {
      const status = error.status === 429 ? 429 : 502;
      return NextResponse.json({ error: 'AI service error', message: error.message }, { status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
