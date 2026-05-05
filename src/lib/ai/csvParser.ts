import type { ParsedCSVRow } from '@/types';
import { fetchWithRetry } from './fetchWithRetry';
import { z } from 'zod';

const aiTransactionSchema = z.object({
  date: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().finite(),
  currency: z.string().min(1).max(5).optional(),
});

const aiParseResponseSchema = z.object({
  transactions: z.array(aiTransactionSchema),
});

const MAX_TEXT_LENGTH = 50_000;

export async function parseCSVWithAI(
  rawText: string,
  accessToken: string,
): Promise<ParsedCSVRow[]> {
  const trimmedText = rawText.length > MAX_TEXT_LENGTH
    ? rawText.slice(0, MAX_TEXT_LENGTH)
    : rawText;

  const data = await fetchWithRetry({
    endpoint: '/api/parse-csv',
    body: { rawText: trimmedText },
    accessToken,
  });

  const validated = aiParseResponseSchema.parse(data);

  return validated.transactions.map(transaction => ({
    date: transaction.date,
    description: transaction.description,
    amount: transaction.amount,
    currency: transaction.currency,
  }));
}
