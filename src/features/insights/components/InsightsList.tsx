import { InsightCard } from './InsightCard';
import type { Insight } from '@/types';

function InsightSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex gap-3">
        <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-3/4 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

interface InsightsListProps {
  insights: Insight[];
  isLoading: boolean;
  hasTransactions: boolean;
}

export function InsightsList({ insights, isLoading, hasTransactions }: InsightsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <InsightSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!hasTransactions) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-center">
        <p className="text-sm font-medium text-gray-600">No transactions found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a bank statement to generate financial insights.
        </p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-center">
        <p className="text-sm font-medium text-gray-600">No insights yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Click "Generate Insights" to get personalised financial analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map(insight => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
}
