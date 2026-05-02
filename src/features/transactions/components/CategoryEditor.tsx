'use client';

import { CATEGORIES } from '@/types';
import { CATEGORY_LABELS } from '@/lib/categories';
import type { Category } from '@/types';

interface CategoryEditorProps {
  transactionId: string;
  currentCategory: Category | null;
  onCategoryChange: (transactionId: string, category: Category) => void;
  disabled?: boolean;
}

export function CategoryEditor({
  transactionId,
  currentCategory,
  onCategoryChange,
  disabled = false,
}: CategoryEditorProps) {
  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selected = event.target.value as Category;
    onCategoryChange(transactionId, selected);
  }

  return (
    <select
      value={currentCategory ?? ''}
      onChange={handleChange}
      disabled={disabled}
      className="rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Change category"
    >
      {!currentCategory && (
        <option value="" disabled>
          Select category
        </option>
      )}
      {CATEGORIES.map(category => (
        <option key={category} value={category}>
          {CATEGORY_LABELS[category]}
        </option>
      ))}
    </select>
  );
}
