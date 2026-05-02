'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTransactionsQuery } from '@/hooks/useTransactions';
import { useBudgetsQuery } from '@/hooks/useBudgets';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SummaryCards } from './components/SummaryCards';
import {
  useSpendingSummary,
  useCategoryBreakdown,
  useSpendingByDay,
  useMonthlyComparison,
} from './hooks/useSpendingData';
import type { Category } from '@/types';

function ChartLoadingSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-lg bg-muted" />
  );
}

const SpendingChart = dynamic(
  () => import('./components/SpendingChart').then(m => m.SpendingChart),
  { ssr: false, loading: () => <ChartLoadingSkeleton /> },
);

const CategoryBreakdown = dynamic(
  () => import('./components/CategoryBreakdown').then(m => m.CategoryBreakdown),
  { ssr: false, loading: () => <ChartLoadingSkeleton /> },
);

const MonthlyComparison = dynamic(
  () => import('./components/MonthlyComparison').then(m => m.MonthlyComparison),
  { ssr: false, loading: () => <ChartLoadingSkeleton /> },
);

function currentMonthString(): string {
  return new Date().toISOString().slice(0, 7);
}

export function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthString);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data: transactions = [], isLoading: transactionsLoading, isError: transactionsError } =
    useTransactionsQuery();
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgetsQuery(selectedMonth);

  const summary = useSpendingSummary(transactions, budgets, selectedMonth);
  const categoryBreakdown = useCategoryBreakdown(transactions, selectedMonth);
  const dailySpending = useSpendingByDay(transactions, selectedMonth);
  const monthlyComparison = useMonthlyComparison(transactions);

  function handleMonthChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedMonth(event.target.value);
    setSelectedCategory(null);
  }

  if (transactionsLoading || budgetsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (transactionsError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load dashboard data. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {transactions.length === 0
              ? 'Upload a CSV to see your financial overview.'
              : 'Your financial overview for the selected month.'}
          </p>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <SummaryCards summary={summary} />

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-medium">
          Daily Spending
          {selectedCategory && (
            <span className="ml-2 text-muted-foreground">
              — all categories shown
            </span>
          )}
        </h2>
        <SpendingChart data={dailySpending} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-1 text-sm font-medium">Spending by Category</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Click a slice to highlight a category.
          </p>
          <CategoryBreakdown
            data={categoryBreakdown}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-medium">Monthly Overview (last 6 months)</h2>
          <MonthlyComparison data={monthlyComparison} />
        </div>
      </div>
    </div>
  );
}
