import { SkeletonCard } from '@/components/Skeleton';
import { InsightCard } from './InsightCard';
import type { Insight } from '@/types';

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
          <SkeletonCard key={index} lines={2} />
        ))}
      </div>
    );
  }

  if (!hasTransactions) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">No transactions found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a bank statement to generate financial insights.
        </p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">No insights yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {"Click \"Generate Insights\" to get personalised financial analysis."}
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
