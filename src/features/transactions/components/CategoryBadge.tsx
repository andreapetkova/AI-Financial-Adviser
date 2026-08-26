'use client';

import { CheckCircle } from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_CHART_COLORS, CATEGORY_TEXT_COLORS } from '@/lib/categories';
import type { Category } from '@/types';

interface CategoryBadgeProps {
  category: Category | null;
  confidence: number | null;
  manuallyEdited: boolean;
}

export function CategoryBadge({ category, confidence, manuallyEdited }: CategoryBadgeProps) {
  if (!category) {
    return (
      <span className="inline-flex items-center rounded-full border border-dashed border-white/20 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        Uncategorized
      </span>
    );
  }

  const isLowConfidence = !manuallyEdited && confidence != null && confidence < 0.7;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isLowConfidence ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-card' : ''
      }`}
      style={{
        backgroundColor: CATEGORY_CHART_COLORS[category],
        color: CATEGORY_TEXT_COLORS[category],
      }}
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
