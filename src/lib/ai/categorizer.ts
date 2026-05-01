import type { AICategorizationResult } from '@/types';
import { categorizationResponseSchema } from '@/lib/validators/transaction';
import type { TransactionInput } from './types';
import { categorizeByRules } from './rules';

const BATCH_SIZE = 50;
const MAX_RETRIES = 3;
const BASE_DELAY_MILLISECONDS = 1000;

async function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function fetchWithRetry(
  transactions: TransactionInput[],
  accessToken: string,
): Promise<AICategorizationResult[]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await delay(BASE_DELAY_MILLISECONDS * Math.pow(2, attempt - 1));
    }

    try {
      const response = await fetch('/api/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ transactions }),
      });

      if (response.status === 429 && attempt < MAX_RETRIES) {
        lastError = new Error('Rate limited');
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          (errorBody as { error?: string }).error ?? `Categorization failed with status ${response.status}`,
        );
      }

      const data = await response.json();
      const validated = categorizationResponseSchema.parse(data);
      return validated.results;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === MAX_RETRIES) break;
    }
  }

  throw lastError ?? new Error('Categorization failed');
}

export async function categorizeTransactions(
  transactions: TransactionInput[],
  accessToken: string,
): Promise<AICategorizationResult[]> {
  const { categorized, uncategorized } = categorizeByRules(transactions);

  if (uncategorized.length === 0) {
    return categorized;
  }

  const batches: TransactionInput[][] = [];
  for (let index = 0; index < uncategorized.length; index += BATCH_SIZE) {
    batches.push(uncategorized.slice(index, index + BATCH_SIZE));
  }

  const allResults: AICategorizationResult[] = [...categorized];
  for (const batch of batches) {
    const batchResults = await fetchWithRetry(batch, accessToken);
    allResults.push(...batchResults);
  }

  return allResults;
}
