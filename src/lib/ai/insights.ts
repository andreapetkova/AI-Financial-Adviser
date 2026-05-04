import type { Transaction, Budget, AIInsightResponse } from '@/types';
import { insightResponseSchema } from '@/lib/validators/transaction';
import { fetchWithRetry } from './fetchWithRetry';

interface SpendingEntry {
  category: string;
  total: number;
  count: number;
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

  const data = await fetchWithRetry({
    endpoint: '/api/insights',
    body: requestBody,
    accessToken,
  });

  return insightResponseSchema.parse(data);
}
