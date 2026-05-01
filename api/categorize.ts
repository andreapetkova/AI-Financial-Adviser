import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { extractJson, getTextContent } from './parseAiResponse';

const CATEGORIES = [
  'housing', 'transportation', 'food_dining', 'groceries', 'utilities',
  'healthcare', 'entertainment', 'shopping', 'subscriptions', 'travel',
  'education', 'personal_care', 'income', 'savings_investments',
  'debt_payments', 'gifts_donations', 'other',
] as const;

const categorySchema = z.enum(CATEGORIES);

const aiResultSchema = z.object({
  transactionId: z.string(),
  category: categorySchema,
  confidence: z.number().min(0).max(1),
});

const aiResponseSchema = z.object({
  results: z.array(aiResultSchema),
});

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

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'AI service not configured' });
  }

  const parsed = requestSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
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
      return response.status(502).json({ error: 'No text response from AI' });
    }

    const jsonString = extractJson(text);
    const rawResponse = JSON.parse(jsonString);
    const validated = aiResponseSchema.parse(rawResponse);

    return response.status(200).json(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(502).json({ error: 'Invalid AI response format', details: error.issues });
    }
    if (error instanceof SyntaxError) {
      return response.status(502).json({ error: 'AI returned invalid JSON' });
    }
    if (error instanceof Anthropic.APIError) {
      const status = error.status === 429 ? 429 : 502;
      return response.status(status).json({ error: 'AI service error', message: error.message });
    }
    return response.status(500).json({ error: 'Internal server error' });
  }
}
