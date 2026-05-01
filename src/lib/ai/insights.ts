import type { Transaction, Budget, AIInsightResponse } from '@/types';
import { insightResponseSchema } from '@/lib/validators/transaction';

const MAX_RETRIES = 3;
const BASE_DELAY_MILLISECONDS = 1000;

interface SpendingEntry {
  category: string;
  total: number;
  count: number;
}

async function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function buildSpendingSummary(transactions: Transaction[]): {
  spending: SpendingEntry[];
  totalSpent: number;
  transactionCount: number;
} {
  const expenses = transactions.filter(
    transaction => transaction.category !== 'income',
  );

  const categoryTotals = new Map<string, { total: number; count: number }>();

  for (const transaction of expenses) {
    const category = transaction.category ?? 'other';
    const existing = categoryTotals.get(category) ?? { total: 0, count: 0 };
    existing.total += Math.abs(transaction.amount);
    existing.count += 1;
    categoryTotals.set(category, existing);
  }

  const spending: SpendingEntry[] = Array.from(categoryTotals.entries())
    .map(([category, data]) => ({ category, total: data.total, count: data.count }))
    .sort((a, b) => b.total - a.total);

  const totalSpent = spending.reduce((sum, entry) => sum + entry.total, 0);

  return { spending, totalSpent, transactionCount: expenses.length };
}

export async function generateInsights(
  transactions: Transaction[],
  budgets: Budget[],
  month: string,
  accessToken: string,
): Promise<AIInsightResponse> {
  const { spending, totalSpent, transactionCount } = buildSpendingSummary(transactions);

  const requestBody = {
    spending,
    budgets: budgets.map(budget => ({
      category: budget.category,
      limitAmount: budget.limitAmount,
    })),
    month,
    totalSpent,
    transactionCount,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await delay(BASE_DELAY_MILLISECONDS * Math.pow(2, attempt - 1));
    }

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 429 && attempt < MAX_RETRIES) {
        lastError = new Error('Rate limited');
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          (errorBody as { error?: string }).error ?? `Insights generation failed with status ${response.status}`,
        );
      }

      const data = await response.json();
      return insightResponseSchema.parse(data);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === MAX_RETRIES) break;
    }
  }

  throw lastError ?? new Error('Insights generation failed');
}
