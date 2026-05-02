'use client';

import { BudgetProgressCard } from './BudgetProgressCard';
import type { Budget, Category } from '@/types';

interface BudgetOverviewProps {
  budgets: Budget[];
  categorySpending: Map<Category, number>;
  currency: string;
  onEdit: (budget: Budget) => void;
}

export function BudgetOverview({
  budgets,
  categorySpending,
  currency,
  onEdit,
}: BudgetOverviewProps) {
  if (budgets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No budgets set for this month. Use the form below to add one.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {budgets.map(budget => (
        <BudgetProgressCard
          key={budget.id}
          budget={budget}
          spent={categorySpending.get(budget.category) ?? 0}
          currency={currency}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
