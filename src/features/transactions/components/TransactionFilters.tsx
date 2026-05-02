'use client';

import { CATEGORIES } from '@/types';
import { CATEGORY_LABELS } from '@/lib/categories';
import type { Category } from '@/types';

export interface TransactionFilterValues {
  category: Category | 'all';
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

interface TransactionFiltersProps {
  filters: TransactionFilterValues;
  onFiltersChange: (filters: TransactionFilterValues) => void;
}

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  function handleChange(field: keyof TransactionFilterValues, value: string) {
    onFiltersChange({ ...filters, [field]: value });
  }

  function handleReset() {
    onFiltersChange({
      category: 'all',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
    });
  }

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.amountMin !== '' ||
    filters.amountMax !== '';

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Category</label>
        <select
          value={filters.category}
          onChange={e => handleChange('category', e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map(category => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Date from</label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={e => handleChange('dateFrom', e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Date to</label>
        <input
          type="date"
          value={filters.dateTo}
          onChange={e => handleChange('dateTo', e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Amount from</label>
        <input
          type="number"
          placeholder="-9999"
          value={filters.amountMin}
          onChange={e => handleChange('amountMin', e.target.value)}
          className="w-28 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Amount to</label>
        <input
          type="number"
          placeholder="9999"
          value={filters.amountMax}
          onChange={e => handleChange('amountMax', e.target.value)}
          className="w-28 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className="rounded-md px-3 py-1.5 text-sm text-muted-foreground underline-offset-2 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
