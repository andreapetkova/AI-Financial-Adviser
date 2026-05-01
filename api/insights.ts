import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { extractJson, getTextContent } from './parseAiResponse';

const insightTypeValues = ['warning', 'saving', 'info'] as const;

const insightSchema = z.object({
  message: z.string().min(1),
  type: z.enum(insightTypeValues),
});

const aiInsightResponseSchema = z.object({
  insights: z.array(insightSchema),
});

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
  const spendingLines = data.spending
    .map(entry => `- ${entry.category}: $${entry.total.toFixed(2)} (${entry.count} transactions)`)
    .join('\n');

  const budgetLines = data.budgets.length > 0
    ? data.budgets.map(budget => `- ${budget.category}: $${budget.limitAmount.toFixed(2)} limit`).join('\n')
    : 'No budgets set';

  return `Analyze this spending data for ${data.month}:

Total spent: $${data.totalSpent.toFixed(2)} across ${data.transactionCount} transactions

Spending by category:
${spendingLines}

Budgets:
${budgetLines}

Return only the JSON object with insights:`;
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

  try {
    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6-20250514';

    const message = await client.messages.create({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildInsightsPrompt(parsed.data) }],
    });

    const text = getTextContent(message.content);
    if (!text) {
      return response.status(502).json({ error: 'No text response from AI' });
    }

    const jsonString = extractJson(text);
    const rawResponse = JSON.parse(jsonString);
    const validated = aiInsightResponseSchema.parse(rawResponse);

    return response.status(200).json({
      insights: validated.insights,
      month: parsed.data.month,
    });
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
