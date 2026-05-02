import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { CATEGORIES } from '@/types';
import { categorizationResponseSchema } from '@/lib/validators/transaction';
import { extractJson, getTextContent } from '@/lib/ai/parseAiResponse';

const requestSchema = z.object({
  transactions: z.array(z.object({
    id: z.string(),
    description: z.string(),
    amount: z.number(),
  })).min(1).max(100),
});

const SYSTEM_PROMPT = `You are a financial transaction categorizer. You categorize bank transaction descriptions into spending categories.

Valid categories: ${CATEGORIES.join(', ')}

Rules:
- Use "other" only when no category fits
- "income" is for money received (positive amounts or salary/refund descriptions)
- Confidence should be 0.6-0.95 based on how clear the match is
- Return valid JSON only, no markdown or explanation`;

function buildUserPrompt(transactions: Array<{ id: string; description: string; amount: number }>): string {
  const transactionLines = transactions
    .map(transaction => `- ID: "${transaction.id}" | Description: "${transaction.description}" | Amount: ${transaction.amount}`)
    .join('\n');

  return `Categorize these transactions. Return a JSON object with a "results" array where each item has "transactionId", "category", and "confidence".

Transactions:
${transactionLines}

Return only the JSON object:`;
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

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 });
  }

  const { transactions } = parsed.data;

  try {
    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6-20250514';

    const message = await client.messages.create({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(transactions) }],
    });

    const text = getTextContent(message.content);
    if (!text) {
      return NextResponse.json({ error: 'No text response from AI' }, { status: 502 });
    }

    const jsonString = extractJson(text);
    const rawResponse = JSON.parse(jsonString);
    const validated = categorizationResponseSchema.parse(rawResponse);

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
