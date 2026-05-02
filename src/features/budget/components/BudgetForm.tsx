'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/types';
import { CATEGORY_LABELS } from '@/lib/categories';
import { budgetInputSchema } from '@/lib/validators/budget';
import { useUpsertBudgetMutation } from '@/hooks/useBudgets';
import { SubmitButton } from '@/components/SubmitButton';
import type { Budget } from '@/types';

interface BudgetFormProps {
  editingBudget: Budget | null;
  defaultMonth: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormErrors {
  category?: string;
  limitAmount?: string;
  month?: string;
}

export function BudgetForm({
  editingBudget,
  defaultMonth,
  onSuccess,
  onCancel,
}: BudgetFormProps) {
  const upsertMutation = useUpsertBudgetMutation();

  const [category, setCategory] = useState(editingBudget?.category ?? '');
  const [limitAmount, setLimitAmount] = useState(
    editingBudget ? String(editingBudget.limitAmount) : '',
  );
  const [month, setMonth] = useState(editingBudget?.month ?? defaultMonth);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const parsed = budgetInputSchema.safeParse({
      category,
      limitAmount: Number(limitAmount),
      month,
    });

    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await upsertMutation.mutateAsync(parsed.data);
      onSuccess();
    } catch {
      setFormError('Failed to save budget. Please try again.');
    }
  }

  const isEditing = editingBudget !== null;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-medium">
        {isEditing ? `Edit budget — ${CATEGORY_LABELS[editingBudget.category]}` : 'Add budget'}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            disabled={isEditing}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>Select category</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Monthly limit</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={limitAmount}
            onChange={e => setLimitAmount(e.target.value)}
            className="w-36 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.limitAmount && (
            <p className="text-xs text-destructive">{errors.limitAmount}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Month</label>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            disabled={isEditing}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.month && (
            <p className="text-xs text-destructive">{errors.month}</p>
          )}
        </div>

        <div className="flex gap-2">
          <SubmitButton disabled={upsertMutation.isPending}>
            {upsertMutation.isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Add budget'}
          </SubmitButton>
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
          )}
        </div>

        {formError && (
          <p className="w-full text-xs text-destructive">{formError}</p>
        )}
      </form>
    </div>
  );
}
