import { useMemo } from 'react';
import { CATEGORY_LABELS, CATEGORY_CHART_COLORS } from '@/lib/categories';
import type { Transaction, Budget, Category } from '@/types';

function filterByMonth(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter(transaction => transaction.date.slice(0, 7) === month);
}

function buildCategorySpendingMap(transactions: Transaction[]): Map<Category, number> {
  const map = new Map<Category, number>();
  for (const transaction of transactions) {
    if (transaction.amount < 0 && transaction.category) {
      map.set(transaction.category, (map.get(transaction.category) ?? 0) + Math.abs(transaction.amount));
    }
  }
  return map;
}

export interface SpendingSummary {
  totalSpending: number;
  totalIncome: number;
  transactionCount: number;
  topCategory: Category | null;
  topCategoryLabel: string | null;
  budgetsOnTrack: number;
  budgetsTotal: number;
}

export function useSpendingSummary(
  transactions: Transaction[],
  budgets: Budget[],
  month: string,
): SpendingSummary {
  return useMemo(() => {
    const monthTransactions = filterByMonth(transactions, month);
    const categorySpending = buildCategorySpendingMap(monthTransactions);

    const totalSpending = monthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalIncome = monthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    let topCategory: Category | null = null;
    let topAmount = 0;
    for (const [category, amount] of categorySpending) {
      if (amount > topAmount) {
        topAmount = amount;
        topCategory = category;
      }
    }

    let budgetsOnTrack = 0;
    for (const budget of budgets) {
      const spent = categorySpending.get(budget.category) ?? 0;
      if (spent <= budget.limitAmount) budgetsOnTrack++;
    }

    return {
      totalSpending,
      totalIncome,
      transactionCount: monthTransactions.length,
      topCategory,
      topCategoryLabel: topCategory ? CATEGORY_LABELS[topCategory] : null,
      budgetsOnTrack,
      budgetsTotal: budgets.length,
    };
  }, [transactions, budgets, month]);
}

export interface CategoryBreakdownItem {
  category: Category;
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

export function useCategoryBreakdown(
  transactions: Transaction[],
  month: string,
): CategoryBreakdownItem[] {
  return useMemo(() => {
    const monthTransactions = filterByMonth(transactions, month);
    const categorySpending = buildCategorySpendingMap(monthTransactions);
    const total = Array.from(categorySpending.values()).reduce((sum, v) => sum + v, 0);

    if (total === 0) return [];

    return Array.from(categorySpending.entries())
      .map(([category, amount]) => ({
        category,
        label: CATEGORY_LABELS[category],
        amount,
        percentage: (amount / total) * 100,
        color: CATEGORY_CHART_COLORS[category],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, month]);
}

export interface DailySpendingItem {
  date: string;
  spending: number;
  income: number;
}

export function useSpendingByDay(
  transactions: Transaction[],
  month: string,
): DailySpendingItem[] {
  return useMemo(() => {
    const monthTransactions = filterByMonth(transactions, month);
    const dailyMap = new Map<string, { spending: number; income: number }>();

    for (const transaction of monthTransactions) {
      const day = transaction.date.slice(0, 10);
      const entry = dailyMap.get(day) ?? { spending: 0, income: 0 };
      if (transaction.amount < 0) {
        entry.spending += Math.abs(transaction.amount);
      } else {
        entry.income += transaction.amount;
      }
      dailyMap.set(day, entry);
    }

    return Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { spending, income }]) => ({ date, spending, income }));
  }, [transactions, month]);
}

export interface MonthlyComparisonItem {
  month: string;
  label: string;
  spending: number;
  income: number;
}

export function useMonthlyComparison(transactions: Transaction[]): MonthlyComparisonItem[] {
  return useMemo(() => {
    const monthlyMap = new Map<string, { spending: number; income: number }>();

    for (const transaction of transactions) {
      const month = transaction.date.slice(0, 7);
      const entry = monthlyMap.get(month) ?? { spending: 0, income: 0 };
      if (transaction.amount < 0) {
        entry.spending += Math.abs(transaction.amount);
      } else {
        entry.income += transaction.amount;
      }
      monthlyMap.set(month, entry);
    }

    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, { spending, income }]) => ({
        month,
        label: (() => {
          const [year, m] = month.split('-');
          return new Date(Number(year), Number(m) - 1).toLocaleDateString('en-GB', {
            month: 'short',
            year: '2-digit',
          });
        })(),
        spending,
        income,
      }));
  }, [transactions]);
}
