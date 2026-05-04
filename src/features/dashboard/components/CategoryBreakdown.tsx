'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

  function handlePieClick(entry: CategoryBreakdownItem) {
    onCategorySelect(selectedCategory === entry.category ? null : entry.category);
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="label"
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={85}
          onClick={(entry) => handlePieClick(entry as unknown as CategoryBreakdownItem)}
          className="cursor-pointer"
        >
          {data.map((entry) => (
            <Cell
              key={entry.category}
              fill={entry.color}
              opacity={selectedCategory && selectedCategory !== entry.category ? 0.35 : 1}
              stroke={selectedCategory === entry.category ? '#111827' : 'transparent'}
              strokeWidth={selectedCategory === entry.category ? 2 : 0}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [formatCurrency(value, currency), name]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
