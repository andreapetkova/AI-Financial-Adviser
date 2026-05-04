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
import { formatCurrency } from '@/lib/utils';
import type { DailySpendingItem } from '../hooks/useSpendingData';

interface SpendingChartProps {
  data: DailySpendingItem[];
  currency: string;
}

export function SpendingChart({ data, currency }: SpendingChartProps) {
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
          tickFormatter={(value: number) =>
            formatCurrency(value, currency, { maximumFractionDigits: 0 })
          }
          width={68}
        />
        <Tooltip
          formatter={(value: number, name: string) => [formatCurrency(value, currency), name]}
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
