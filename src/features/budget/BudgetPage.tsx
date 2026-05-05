'use client';

import { useState, useMemo } from 'react';
import { useTransactionsQuery } from '@/hooks/useTransactions';
import { useBudgetsQuery } from '@/hooks/useBudgets';
import { SkeletonCard } from '@/components/Skeleton';
import { BudgetOverview } from './components/BudgetOverview';
import { BudgetForm } from './components/BudgetForm';
import type { Budget, Category } from '@/types';

export function BudgetPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const { data: transactions = [], isLoading: transactionsLoading } = useTransactionsQuery();
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgetsQuery(selectedMonth);

  const currency = transactions[0]?.currency ?? 'USD';

  const categorySpending = useMemo(() => {
    const map = new Map<Category, number>();
    for (const transaction of transactions) {
      if (
        transaction.date.slice(0, 7) === selectedMonth &&
        transaction.amount < 0 &&
        transaction.category
      ) {
        map.set(
          transaction.category,
          (map.get(transaction.category) ?? 0) + Math.abs(transaction.amount),
        );
      }
    }
    return map;
  }, [transactions, selectedMonth]);

  function handleMonthChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedMonth(event.target.value);
    setEditingBudget(null);
  }

  function handleEdit(budget: Budget) {
    setEditingBudget(budget);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }

  function handleFormSuccess() {
    setEditingBudget(null);
  }

  if (transactionsLoading || budgetsLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading budgets">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
        </div>
        <SkeletonCard lines={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set monthly spending limits per category and track your progress.
          </p>
        </div>
        <label htmlFor="budget-page-month" className="sr-only">Select month</label>
        <input
          id="budget-page-month"
          type="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <BudgetOverview
        budgets={budgets}
        categorySpending={categorySpending}
        currency={currency}
        onEdit={handleEdit}
      />

      <BudgetForm
        key={editingBudget?.id ?? 'new'}
        editingBudget={editingBudget}
        defaultMonth={selectedMonth}
        onSuccess={handleFormSuccess}
        onCancel={() => setEditingBudget(null)}
      />
    </div>
  );
}
