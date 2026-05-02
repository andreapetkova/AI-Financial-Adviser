'use client';

import { CheckCircle } from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/categories';
import type { Category } from '@/types';

const CATEGORY_COLORS: Record<Category, string> = {
  housing: 'bg-blue-100 text-blue-800',
  transportation: 'bg-orange-100 text-orange-800',
  food_dining: 'bg-yellow-100 text-yellow-800',
  groceries: 'bg-green-100 text-green-800',
  utilities: 'bg-cyan-100 text-cyan-800',
  healthcare: 'bg-red-100 text-red-800',
  entertainment: 'bg-purple-100 text-purple-800',
  shopping: 'bg-pink-100 text-pink-800',
  subscriptions: 'bg-indigo-100 text-indigo-800',
  travel: 'bg-sky-100 text-sky-800',
  education: 'bg-teal-100 text-teal-800',
  personal_care: 'bg-rose-100 text-rose-800',
  income: 'bg-emerald-100 text-emerald-800',
  savings_investments: 'bg-lime-100 text-lime-800',
  debt_payments: 'bg-amber-100 text-amber-800',
  gifts_donations: 'bg-violet-100 text-violet-800',
  other: 'bg-gray-100 text-gray-800',
};

interface CategoryBadgeProps {
  category: Category | null;
  confidence: number | null;
  manuallyEdited: boolean;
}

export function CategoryBadge({ category, confidence, manuallyEdited }: CategoryBadgeProps) {
  if (!category) {
    return (
      <span className="inline-flex items-center rounded-full border border-dashed border-gray-300 px-2.5 py-0.5 text-xs font-medium text-gray-400">
        Uncategorized
      </span>
    );
  }

  const colorClasses = CATEGORY_COLORS[category];
  const isLowConfidence = !manuallyEdited && confidence != null && confidence < 0.7;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses} ${
        isLowConfidence ? 'ring-2 ring-yellow-400 ring-offset-1' : ''
      }`}
      title={
        manuallyEdited
          ? 'Manually categorized'
          : isLowConfidence
            ? `AI suggested (${Math.round((confidence ?? 0) * 100)}% confidence)`
            : `AI categorized (${Math.round((confidence ?? 1) * 100)}% confidence)`
      }
    >
      {CATEGORY_LABELS[category]}
      {manuallyEdited && <CheckCircle className="h-3 w-3" />}
    </span>
  );
}

export { CATEGORY_LABELS } from '@/lib/categories';
