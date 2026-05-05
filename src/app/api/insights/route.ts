import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { insightResponseSchema } from '@/lib/validators/transaction';
import { extractJson, getTextContent } from '@/lib/ai/parseAiResponse';

const requestSchema = z.object({
  spending: z.array(z.object({
    category: z.string(),
    total: z.number(),
    count: z.number(),
  })),
  budgets: z.array(z.object({
    category: z.string(),
    limitAmount: z.number(),
  })),
  month: z.string().min(1),
  totalSpent: z.number(),
  transactionCount: z.number(),
  currency: z.string().default('USD'),
});

const SYSTEM_PROMPT = `You are a personal finance advisor. Analyze spending data and provide actionable insights.

Return a JSON object with an "insights" array. Each insight has:
- "message": a clear, specific, actionable insight (1-2 sentences)
- "type": one of "warning" (overspending/concern), "saving" (opportunity to save), "info" (neutral observation)

Guidelines:
- Generate 3-7 insights based on the data
- Compare spending to budgets when available
- Flag categories that exceed budget limits as warnings
- Suggest specific saving opportunities
- Note positive trends as info
- Be specific with numbers and percentages
- Return valid JSON only, no markdown or explanation`;

function buildInsightsPrompt(data: z.infer<typeof requestSchema>): string {
  const { currency } = data;
  const spendingLines = data.spending
    .map(entry => `- ${entry.category}: ${currency} ${entry.total.toFixed(2)} (${entry.count} transactions)`)
    .join('\n');

  const budgetLines = data.budgets.length > 0
    ? data.budgets.map(budget => `- ${budget.category}: ${currency} ${budget.limitAmount.toFixed(2)} limit`).join('\n')
    : 'No budgets set';

  return `Analyze this spending data for ${data.month}:

Total spent: ${currency} ${data.totalSpent.toFixed(2)} across ${data.transactionCount} transactions

Spending by category:
${spendingLines}

Budgets:
${budgetLines}

Use ${currency} as the currency in your response. Return only the JSON object with insights:`;
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
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildInsightsPrompt(parsed.data) }],
    });

    const text = getTextContent(message.content);
    if (!text) {
      return NextResponse.json({ error: 'No text response from AI' }, { status: 502 });
    }

    const jsonString = extractJson(text);
    const rawResponse = JSON.parse(jsonString);
    const validated = insightResponseSchema.parse(rawResponse);

    return NextResponse.json({
      insights: validated.insights,
      month: parsed.data.month,
    });
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
