'use client';

import { TrendingDown, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { SpendingSummary } from '../hooks/useSpendingData';

interface TrendTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accentClass: string;
  currentAmount: number;
  previousAmount: number;
  /** Which direction of change is good news for this metric. */
  goodDirection: 'up' | 'down';
}

function TrendTile({
  icon,
  label,
  value,
  accentClass,
  currentAmount,
  previousAmount,
  goodDirection,
}: TrendTileProps) {
  const hasPreviousData = previousAmount > 0;
  const deltaPercent = hasPreviousData
    ? ((currentAmount - previousAmount) / previousAmount) * 100
    : 0;
  const isIncrease = deltaPercent > 0;
  const isGood = hasPreviousData
    ? (isIncrease && goodDirection === 'up') || (!isIncrease && goodDirection === 'down')
    : false;
  const DeltaIcon = isIncrease ? ArrowUp : ArrowDown;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        <div className={`rounded-lg p-2 ${accentClass}`}>{icon}</div>
      </div>
      {hasPreviousData && deltaPercent !== 0 && (
        <p
          className={`mt-3 flex items-center gap-1 text-xs font-medium ${
            isGood ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          <DeltaIcon className="h-3 w-3" aria-hidden="true" />
          {Math.abs(deltaPercent).toFixed(0)}% vs last month
        </p>
      )}
    </div>
  );
}

interface SummaryCardsProps {
  summary: SpendingSummary;
  previousSummary: SpendingSummary;
  currency: string;
}

export function SummaryCards({ summary, previousSummary, currency }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <TrendTile
        icon={<TrendingDown className="h-5 w-5" />}
        label="Total Spending"
        value={formatCurrency(summary.totalSpending, currency)}
        accentClass="bg-rose-500/15 text-rose-400"
        currentAmount={summary.totalSpending}
        previousAmount={previousSummary.totalSpending}
        goodDirection="down"
      />
      <TrendTile
        icon={<TrendingUp className="h-5 w-5" />}
        label="Total Income"
        value={formatCurrency(summary.totalIncome, currency)}
        accentClass="bg-emerald-500/15 text-emerald-400"
        currentAmount={summary.totalIncome}
        previousAmount={previousSummary.totalIncome}
        goodDirection="up"
      />
    </div>
  );
}
