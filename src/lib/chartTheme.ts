import type { CSSProperties } from 'react';

export const SPENDING_COLOR = '#fb7185';
export const INCOME_COLOR = '#34d399';

export const CHART_AXIS_TICK = { fontSize: 11, fill: 'var(--color-muted-foreground)' };

export const CHART_GRID_STROKE = 'var(--color-border)';

export const CHART_TOOLTIP_STYLE: CSSProperties = {
  backgroundColor: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '0.75rem',
  boxShadow: '0 8px 24px -8px rgb(0 0 0 / 0.12)',
  fontSize: '0.8125rem',
  padding: '0.625rem 0.875rem',
};

export const CHART_TOOLTIP_LABEL_STYLE: CSSProperties = {
  color: 'var(--color-foreground)',
  fontWeight: 500,
  marginBottom: '0.25rem',
};

export const CHART_LEGEND_STYLE: CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--color-muted-foreground)',
};

const INTENSITY_LOW: [number, number, number] = [34, 197, 94]; // green-500
const INTENSITY_MID: [number, number, number] = [245, 158, 11]; // amber-500
const INTENSITY_HIGH: [number, number, number] = [239, 68, 68]; // red-500

function lerpChannel(from: number, to: number, t: number): number {
  return Math.round(from + (to - from) * t);
}

/** Maps a value within [min, max] to a green→amber→red heat color. */
export function getSpendIntensityColor(value: number, min: number, max: number): string {
  const range = max - min;
  const t = range === 0 ? 0.5 : (value - min) / range;
  const [from, to, localT] =
    t < 0.5 ? [INTENSITY_LOW, INTENSITY_MID, t * 2] : [INTENSITY_MID, INTENSITY_HIGH, (t - 0.5) * 2];
  const rgb = from.map((channel, index) => lerpChannel(channel, to[index], localT));
  return `rgb(${rgb.join(',')})`;
}
