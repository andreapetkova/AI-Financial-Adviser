import type { AICategorizationResult } from '@/types';
import { categorizationResponseSchema } from '@/lib/validators/transaction';
import type { TransactionInput } from './types';
import { categorizeByRules } from './rules';
import { fetchWithRetry } from './fetchWithRetry';

const BATCH_SIZE = 50;

async function categorizeBatch(
  transactions: TransactionInput[],
  accessToken: string,
): Promise<AICategorizationResult[]> {
  const data = await fetchWithRetry({
    endpoint: '/api/categorize',
    body: { transactions },
    accessToken,
  });
  return categorizationResponseSchema.parse(data).results;
}

export async function categorizeTransactions(
  transactions: TransactionInput[],
  accessToken: string,
): Promise<AICategorizationResult[]> {
  const { categorized, uncategorized } = categorizeByRules(transactions);

  if (uncategorized.length === 0) {
    return categorized;
  }

  const allResults: AICategorizationResult[] = [...categorized];
  for (let index = 0; index < uncategorized.length; index += BATCH_SIZE) {
    const batch = uncategorized.slice(index, index + BATCH_SIZE);
    const batchResults = await categorizeBatch(batch, accessToken);
    allResults.push(...batchResults);
  }

  return allResults;
}
