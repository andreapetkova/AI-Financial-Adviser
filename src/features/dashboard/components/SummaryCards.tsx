'use client';

import { TrendingDown, TrendingUp, Tag, Target } from 'lucide-react';
import type { SpendingSummary } from '../hooks/useSpendingData';

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  }).format(amount);
}

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  accent: 'red' | 'green' | 'blue' | 'yellow';
}

const ACCENT_CLASSES = {
  red: 'bg-red-50 text-red-600',
  green: 'bg-green-50 text-green-600',
  blue: 'bg-blue-50 text-blue-600',
  yellow: 'bg-yellow-50 text-yellow-600',
};

function SummaryCard({ icon, label, value, subtext, accent }: SummaryCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        </div>
        <div className={`rounded-lg p-2 ${ACCENT_CLASSES[accent]}`}>{icon}</div>
      </div>
    </div>
  );
}

interface SummaryCardsProps {
  summary: SpendingSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const budgetSubtext =
    summary.budgetsTotal === 0
      ? 'No budgets set'
      : `${summary.budgetsOnTrack} of ${summary.budgetsTotal} on track`;

  const budgetAccent: SummaryCardProps['accent'] =
    summary.budgetsTotal === 0
      ? 'blue'
      : summary.budgetsOnTrack === summary.budgetsTotal
        ? 'green'
        : 'yellow';

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <SummaryCard
        icon={<TrendingDown className="h-5 w-5" />}
        label="Total Spending"
        value={formatAmount(summary.totalSpending)}
        subtext={`${summary.transactionCount} transaction${summary.transactionCount === 1 ? '' : 's'}`}
        accent="red"
      />
      <SummaryCard
        icon={<TrendingUp className="h-5 w-5" />}
        label="Total Income"
        value={formatAmount(summary.totalIncome)}
        accent="green"
      />
      <SummaryCard
        icon={<Tag className="h-5 w-5" />}
        label="Top Category"
        value={summary.topCategoryLabel ?? '—'}
        subtext={summary.topCategory ? 'Highest spend' : 'No data yet'}
        accent="blue"
      />
      <SummaryCard
        icon={<Target className="h-5 w-5" />}
        label="Budget Status"
        value={
          summary.budgetsTotal === 0
            ? '—'
            : `${Math.round((summary.budgetsOnTrack / summary.budgetsTotal) * 100)}%`
        }
        subtext={budgetSubtext}
        accent={budgetAccent}
      />
    </div>
  );
}
