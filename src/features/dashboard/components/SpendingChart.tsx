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
import type { DailySpendingItem } from '../hooks/useSpendingData';

interface SpendingChartProps {
  data: DailySpendingItem[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No spending data for this month.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => new Date(value).getDate().toString()}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(value: number) => `£${value.toFixed(0)}`}
          width={52}
        />
        <Tooltip
          formatter={(value: number, name: string) => [`£${value.toFixed(2)}`, name]}
          labelFormatter={(label: string) =>
            new Date(label).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })
          }
        />
        <Legend />
        <Bar dataKey="spending" name="Spending" fill="#ef4444" radius={[3, 3, 0, 0]} />
        <Bar dataKey="income" name="Income" fill="#22c55e" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
