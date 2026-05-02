'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlyComparisonItem } from '../hooks/useSpendingData';

interface MonthlyComparisonProps {
  data: MonthlyComparisonItem[];
}

export function MonthlyComparison({ data }: MonthlyComparisonProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No monthly data available yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(value: number) => `£${value.toFixed(0)}`}
          width={52}
        />
        <Tooltip formatter={(value: number, name: string) => [`£${value.toFixed(2)}`, name]} />
        <Legend />
        <Bar dataKey="spending" name="Spending" fill="#ef4444" radius={[3, 3, 0, 0]} />
        <Bar dataKey="income" name="Income" fill="#22c55e" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
