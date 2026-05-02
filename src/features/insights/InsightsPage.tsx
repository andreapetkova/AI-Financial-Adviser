'use client';

import { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTransactionsQuery } from '@/hooks/useTransactions';
import { useBudgetsQuery } from '@/hooks/useBudgets';
import { useInsightsQuery, useGenerateInsightsMutation } from '@/hooks/useInsights';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { InsightsList } from './components/InsightsList';

function InsightsErrorFallback({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-12 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-red-400" />
      <p className="text-sm font-medium text-red-700">Failed to generate insights</p>
      <p className="mt-1 text-sm text-red-500">{error.message}</p>
      <button
        onClick={onRetry}
        className="mt-4 flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}

export function InsightsPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [generateError, setGenerateError] = useState<Error | null>(null);

  const { data: transactions = [], isLoading: transactionsLoading } = useTransactionsQuery();
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgetsQuery(selectedMonth);
  const {
    data: insights = [],
    isLoading: insightsLoading,
  } = useInsightsQuery(selectedMonth);

  const { mutate: generateInsights, isPending: isGenerating } = useGenerateInsightsMutation();

  const monthTransactions = transactions.filter(
    transaction => transaction.date.slice(0, 7) === selectedMonth,
  );

  const hasTransactions = monthTransactions.length > 0;

  function handleMonthChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedMonth(event.target.value);
    setGenerateError(null);
  }

  function handleGenerate() {
    setGenerateError(null);
    generateInsights(
      { transactions: monthTransactions, budgets, month: selectedMonth },
      {
        onError: (error) => {
          setGenerateError(error instanceof Error ? error : new Error(String(error)));
        },
      },
    );
  }

  if (transactionsLoading || budgetsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

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
                <LoadingSpinner className="h-4 w-4" />
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

      {generateError ? (
        <InsightsErrorFallback error={generateError} onRetry={handleGenerate} />
      ) : (
        <InsightsList
          insights={insights}
          isLoading={insightsLoading || isGenerating}
          hasTransactions={hasTransactions}
        />
      )}
    </div>
  );
}
