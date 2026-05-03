'use client';

import { useState, useMemo, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTransactionsQuery } from '@/hooks/useTransactions';
import { useBudgetsQuery } from '@/hooks/useBudgets';
import { useInsightsQuery, useGenerateInsightsMutation } from '@/hooks/useInsights';
import { useToast } from '@/context/ToastContext';
import { SkeletonCard } from '@/components/Skeleton';
import { InlineSpinner } from '@/components/InlineSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { InsightsList } from './components/InsightsList';

function InsightsErrorBlock({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-12 text-center">
      <p className="text-sm font-medium text-red-700">{title}</p>
      <p className="mt-1 text-sm text-red-500">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Try Again
      </button>
    </div>
  );
}

export function InsightsPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const queryClient = useQueryClient();
  const toast = useToast();
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
    generateInsights(
      { transactions: monthTransactions, budgets, month: selectedMonth },
      {
        onSuccess: (generated) => {
          const count = generated.insights.length;
          toast.success(`${count} insight${count === 1 ? '' : 's'} generated.`);
        },
        onError: (generateError) => {
          toast.error(
            generateError instanceof Error
              ? generateError.message
              : 'Failed to generate insights.',
          );
        },
      },
    );
  }

  // Invalidate cached insights so the boundary re-fetches fresh data after a render error,
  // rather than replaying the same malformed payload that caused the crash.
  const handleBoundaryReset = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['insights'] });
    resetMutation();
  }, [queryClient, resetMutation]);

  // Memoized so ErrorBoundary (class component) receives a stable prop reference.
  const boundaryFallback = useCallback(
    (renderError: Error, reset: () => void) => (
      <InsightsErrorBlock
        title="Failed to display insights"
        message={renderError.message}
        onRetry={reset}
      />
    ),
    [],
  );

  if (transactionsLoading || budgetsLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading insights">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
      </div>
    );
  }

  // Two distinct failure modes:
  // - generateError: API/network failure from the mutation — caught by isError, cleared by resetMutation
  // - render error inside InsightsList/InsightCard: caught by ErrorBoundary below
  const generateError = isError && error instanceof Error ? error : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-generated financial analysis based on your spending.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="insights-month" className="sr-only">
            Select month
          </label>
          <input
            id="insights-month"
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !hasTransactions}
            aria-label={isGenerating ? 'Generating insights…' : 'Generate insights'}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <InlineSpinner />
                Generating…
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Generate Insights
              </>
            )}
          </button>
        </div>
      </div>

      <ErrorBoundary fallback={boundaryFallback} onReset={handleBoundaryReset}>
        {generateError ? (
          <InsightsErrorBlock
            title="Failed to generate insights"
            message={generateError.message}
            onRetry={handleGenerate}
          />
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
