'use client';

import { formatCurrency } from '@/lib/utils';
import type { CategoryBreakdownItem } from '../hooks/useSpendingData';
import type { Category } from '@/types';

interface CategoryBreakdownProps {
  data: CategoryBreakdownItem[];
  selectedCategory: Category | null;
  onCategorySelect: (category: Category | null) => void;
  currency: string;
}

export function CategoryBreakdown({
  data,
  selectedCategory,
  onCategorySelect,
  currency,
}: CategoryBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No categorized spending this month.
      </div>
    );
  }

  const maxAmount = data[0].amount;

  return (
    <ul className="space-y-1">
      {data.map((item, index) => {
        const isSelected = selectedCategory === item.category;
        const isDimmed = selectedCategory !== null && !isSelected;

        return (
          <li key={item.category}>
            <button
              type="button"
              onClick={() => onCategorySelect(isSelected ? null : item.category)}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-opacity hover:bg-accent ${
                isDimmed ? 'opacity-40' : ''
              }`}
            >
              <span className="w-4 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.label}</span>
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {formatCurrency(item.amount, currency)}
              </span>
              <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${Math.max((item.amount / maxAmount) * 100, 6)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
