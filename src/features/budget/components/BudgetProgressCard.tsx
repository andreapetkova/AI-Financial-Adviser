'use client';

import { AlertTriangle, Pencil } from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/categories';
import type { Budget } from '@/types';

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

interface BudgetProgressCardProps {
  budget: Budget;
  spent: number;
  currency: string;
  onEdit: (budget: Budget) => void;
}

export function BudgetProgressCard({
  budget,
  spent,
  currency,
  onEdit,
}: BudgetProgressCardProps) {
  const percentUsed = budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100 : spent > 0 ? 100 : 0;
  const isOverBudget = spent > budget.limitAmount;
  const isNearLimit = percentUsed >= 90;
  const barWidth = Math.min(percentUsed, 100);

  const barColor = isOverBudget || isNearLimit
    ? 'bg-red-500'
    : percentUsed >= 75
      ? 'bg-yellow-500'
      : 'bg-green-500';

  const statusText = isOverBudget
    ? `Over budget by ${formatAmount(spent - budget.limitAmount, currency)}`
    : `${formatAmount(budget.limitAmount - spent, currency)} remaining`;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isNearLimit && (
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" aria-label="Approaching or over budget" />
          )}
          <span className="font-medium">{CATEGORY_LABELS[budget.category]}</span>
        </div>
        <button
          onClick={() => onEdit(budget)}
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label={`Edit ${CATEGORY_LABELS[budget.category]} budget`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${barWidth}%` }}
          role="progressbar"
          aria-valuenow={Math.round(percentUsed)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className={isOverBudget ? 'font-medium text-red-600' : ''}>
          {statusText}
        </span>
        <span className="tabular-nums">
          {formatAmount(spent, currency)} / {formatAmount(budget.limitAmount, currency)}
        </span>
      </div>
    </div>
  );
}
