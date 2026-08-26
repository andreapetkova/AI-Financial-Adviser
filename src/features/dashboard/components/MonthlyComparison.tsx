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
import {
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  CHART_LEGEND_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_STYLE,
  INCOME_COLOR,
  SPENDING_COLOR,
} from '@/lib/chartTheme';
import type { MonthlyComparisonItem } from '../hooks/useSpendingData';

interface MonthlyComparisonProps {
  data: MonthlyComparisonItem[];
  currency: string;
}

export function MonthlyComparison({ data, currency }: MonthlyComparisonProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No monthly data available yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 8 }} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke={CHART_GRID_STROKE} />
        <XAxis dataKey="label" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis
          tick={CHART_AXIS_TICK}
          tickFormatter={(value: number) =>
            formatCurrency(value, currency, { maximumFractionDigits: 0 })
          }
          width={68}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number, name: string) => [formatCurrency(value, currency), name]}
          contentStyle={CHART_TOOLTIP_STYLE}
          labelStyle={CHART_TOOLTIP_LABEL_STYLE}
          cursor={{ fill: 'var(--color-muted)' }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={CHART_LEGEND_STYLE} />
        <Bar
          dataKey="spending"
          name="Spending"
          fill={SPENDING_COLOR}
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
        />
        <Bar
          dataKey="income"
          name="Income"
          fill={INCOME_COLOR}
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
