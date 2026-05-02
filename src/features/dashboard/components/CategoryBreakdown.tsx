'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { CategoryBreakdownItem } from '../hooks/useSpendingData';
import type { Category } from '@/types';

interface CategoryBreakdownProps {
  data: CategoryBreakdownItem[];
  selectedCategory: Category | null;
  onCategorySelect: (category: Category | null) => void;
}

export function CategoryBreakdown({
  data,
  selectedCategory,
  onCategorySelect,
}: CategoryBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No categorized spending this month.
      </div>
    );
  }

  function handlePieClick(_: unknown, index: number) {
    const clicked = data[index];
    onCategorySelect(selectedCategory === clicked.category ? null : clicked.category);
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
          onClick={handlePieClick}
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
          formatter={(value: number, name: string) => [
            `£${value.toFixed(2)}`,
            name,
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
