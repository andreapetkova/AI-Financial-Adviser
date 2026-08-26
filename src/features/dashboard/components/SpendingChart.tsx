'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import {
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_STYLE,
  SPENDING_COLOR,
  getSpendIntensityColor,
} from '@/lib/chartTheme';
import type { DailySpendingItem } from '../hooks/useSpendingData';

interface SpendingChartProps {
  data: DailySpendingItem[];
  currency: string;
}

export function SpendingChart({ data, currency }: SpendingChartProps) {
  const gradientStops = useMemo(() => {
    if (data.length === 0) return [];
    const values = data.map(day => day.spending);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return data.map((day, index) => ({
      offset: `${(index / Math.max(data.length - 1, 1)) * 100}%`,
      color: getSpendIntensityColor(day.spending, min, max),
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No spending data for this month.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 8 }}>
        <defs>
          <linearGradient id="spendingFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SPENDING_COLOR} stopOpacity={0.35} />
            <stop offset="100%" stopColor={SPENDING_COLOR} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="spendingIntensityStroke" x1="0" y1="0" x2="1" y2="0">
            {gradientStops.map((stop, index) => (
              <stop key={index} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={CHART_GRID_STROKE} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => new Date(value).getDate().toString()}
          tick={CHART_AXIS_TICK}
          axisLine={false}
          tickLine={false}
        />
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
          formatter={(value: number) => [formatCurrency(value, currency), 'Spending']}
          labelFormatter={(label: string) =>
            new Date(label).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })
          }
          contentStyle={CHART_TOOLTIP_STYLE}
          labelStyle={CHART_TOOLTIP_LABEL_STYLE}
          cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="spending"
          name="Spending"
          stroke="url(#spendingIntensityStroke)"
          strokeWidth={2.5}
          fill="url(#spendingFill)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
