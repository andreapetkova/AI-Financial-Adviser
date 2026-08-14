import type { CategorizedRow, Category } from '@/types';
import { fetchWithRetry } from './fetchWithRetry';
import { categorySchema } from '@/lib/validators/transaction';
import { z } from 'zod';

const aiTransactionSchema = z.object({
  date: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().finite(),
  currency: z.string().min(1).max(5).optional(),
  category: categorySchema.nullable().optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
});

const aiParseResponseSchema = z.object({
  transactions: z.array(aiTransactionSchema),
});

export interface LearnedRule {
  description: string;
  category: Category;
}

export async function parsePDFWithAI(
  pdfBase64: string,
  accessToken: string,
  learnedRules: LearnedRule[] = [],
): Promise<CategorizedRow[]> {
  const data = await fetchWithRetry({
    endpoint: '/api/parse-csv',
    body: { pdfBase64, learnedRules },
    accessToken,
  });

  const validated = aiParseResponseSchema.parse(data);

  return validated.transactions.map(transaction => ({
    date: transaction.date,
    description: transaction.description,
    amount: transaction.amount,
    currency: transaction.currency,
    category: transaction.category ?? null,
    confidence: transaction.confidence ?? null,
    manuallyEdited: false,
  }));
}
