'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTransactionsQuery } from '@/hooks/useTransactions';
import { useBudgetsQuery } from '@/hooks/useBudgets';
import { SkeletonCard } from '@/components/Skeleton';
import { MonthPicker } from '@/components/MonthPicker';
import { SummaryCards } from './components/SummaryCards';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import {
  useSpendingSummary,
  useCategoryBreakdown,
  useSpendingByDay,
  useMonthlyComparison,
} from './hooks/useSpendingData';
import { CATEGORY_LABELS } from '@/lib/categories';
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

const MonthlyComparison = dynamic(
  () => import('./components/MonthlyComparison').then(m => m.MonthlyComparison),
  { ssr: false, loading: () => <ChartLoadingSkeleton /> },
);

export function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // If navigating from the upload success screen, use the uploaded month
    const focused = sessionStorage.getItem('dashboard_focus_month');
    if (focused) {
      sessionStorage.removeItem('dashboard_focus_month');
      return focused;
    }
    return new Date().toISOString().slice(0, 7);
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const hasAutoSelectedMonth = useRef(false);

  const { data: transactions = [], isLoading: transactionsLoading, isError: transactionsError } =
    useTransactionsQuery();

  // Fallback auto-select: when there is no data for the current month, switch to the
  // most recent month that has spending transactions.
  useEffect(() => {
    if (hasAutoSelectedMonth.current || transactions.length === 0) return;
    hasAutoSelectedMonth.current = true;
    const hasSpendingInSelectedMonth = transactions.some(
      t => t.amount < 0 && t.date.slice(0, 7) === selectedMonth,
    );
    if (!hasSpendingInSelectedMonth) {
      const mostRecentSpendingMonth = transactions
        .filter(t => t.amount < 0)
        .map(t => t.date.slice(0, 7))
        .sort()
        .at(-1);
      if (mostRecentSpendingMonth) setSelectedMonth(mostRecentSpendingMonth);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgetsQuery(selectedMonth);

  const currency = transactions[0]?.currency ?? 'USD';

  const chartTransactions = useMemo(
    () => selectedCategory ? transactions.filter(t => t.category === selectedCategory) : transactions,
    [transactions, selectedCategory],
  );

  const summary = useSpendingSummary(transactions, budgets, selectedMonth);
  const categoryBreakdown = useCategoryBreakdown(transactions, selectedMonth);
  const dailySpending = useSpendingByDay(chartTransactions, selectedMonth);
  const monthlyComparison = useMonthlyComparison(transactions);

  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }, [selectedMonth]);
  const previousSummary = useSpendingSummary(transactions, [], previousMonth);

  function handleMonthChange(month: string) {
    setSelectedMonth(month);
    setSelectedCategory(null);
  }

  if (transactionsLoading || budgetsLoading) {
    return (
      <div className="space-y-6" aria-label="Loading dashboard" role="status">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
        </div>
        <SkeletonCard lines={4} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
        </div>
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
              ? 'Upload a bank statement to see your financial overview.'
              : 'Your financial overview for the selected month.'}
          </p>
        </div>
        <MonthPicker
          id="dashboard-month"
          label="Select month"
          value={selectedMonth}
          onChange={handleMonthChange}
        />
      </div>

      <SummaryCards summary={summary} previousSummary={previousSummary} currency={currency} />

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-medium">
          Daily Spending
          {selectedCategory && (
            <span className="ml-2 font-normal text-muted-foreground">
              {`— ${CATEGORY_LABELS[selectedCategory]}`}
            </span>
          )}
        </h2>
        <SpendingChart data={dailySpending} currency={currency} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-1 text-sm font-medium">Top Categories</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Click a category to filter the chart above.
          </p>
          <CategoryBreakdown
            data={categoryBreakdown.slice(0, 5)}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            currency={currency}
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-medium">Monthly Overview (last 6 months)</h2>
          <MonthlyComparison data={monthlyComparison} currency={currency} />
        </div>
      </div>
    </div>
  );
}
