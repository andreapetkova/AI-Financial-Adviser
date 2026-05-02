'use client';

import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTransactionsQuery } from '@/hooks/useTransactions';
import { useBudgetsQuery } from '@/hooks/useBudgets';
import { useInsightsQuery, useGenerateInsightsMutation } from '@/hooks/useInsights';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { InlineSpinner } from '@/components/InlineSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { InsightsList } from './components/InsightsList';

export function InsightsPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const { data: transactions = [], isLoading: transactionsLoading } = useTransactionsQuery();
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgetsQuery(selectedMonth);
  const { data: insights = [], isLoading: insightsLoading } = useInsightsQuery(selectedMonth);

  const {
    mutate: generateInsights,
    isPending: isGenerating,
    isError,
    error,
    reset: resetMutation,
  } = useGenerateInsightsMutation();

  const monthTransactions = useMemo(
    () => transactions.filter(transaction => transaction.date.slice(0, 7) === selectedMonth),
    [transactions, selectedMonth],
  );

  const hasTransactions = monthTransactions.length > 0;

  function handleMonthChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedMonth(event.target.value);
    resetMutation();
  }

  function handleGenerate() {
    resetMutation();
    generateInsights({ transactions: monthTransactions, budgets, month: selectedMonth });
  }

  if (transactionsLoading || budgetsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  const generateError = isError && error instanceof Error ? error : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-generated financial analysis based on your spending.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !hasTransactions}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <InlineSpinner />
                Generating…
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Generate Insights
              </>
            )}
          </button>
        </div>
      </div>

      <ErrorBoundary
        fallback={(renderError, reset) => (
          <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-12 text-center">
            <p className="text-sm font-medium text-red-700">Failed to display insights</p>
            <p className="mt-1 text-sm text-red-500">{renderError.message}</p>
            <button
              onClick={reset}
              className="mt-4 flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        )}
      >
        {generateError ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-12 text-center">
            <p className="text-sm font-medium text-red-700">Failed to generate insights</p>
            <p className="mt-1 text-sm text-red-500">{generateError.message}</p>
            <button
              onClick={handleGenerate}
              className="mt-4 flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        ) : (
          <InsightsList
            insights={insights}
            isLoading={insightsLoading || isGenerating}
            hasTransactions={hasTransactions}
          />
        )}
      </ErrorBoundary>
    </div>
  );
}
