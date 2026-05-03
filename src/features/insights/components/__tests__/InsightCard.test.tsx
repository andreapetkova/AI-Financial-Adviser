import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InsightCard } from '../InsightCard';
import type { Insight } from '@/types';

function makeInsight(overrides: Partial<Insight> = {}): Insight {
  return {
    id: 'ins-1',
    userId: 'user-1',
    message: 'You spent 20% more on dining this month.',
    type: 'info',
    generatedAt: '2026-01-15T10:00:00Z',
    month: '2026-01',
    ...overrides,
  };
}

describe('InsightCard', () => {
  it('renders the insight message', () => {
    render(<InsightCard insight={makeInsight()} />);
    expect(
      screen.getByText('You spent 20% more on dining this month.'),
    ).toBeInTheDocument();
  });

  it('shows "Info" label for an info-type insight', () => {
    render(<InsightCard insight={makeInsight({ type: 'info' })} />);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('shows "Warning" label for a warning-type insight', () => {
    render(<InsightCard insight={makeInsight({ type: 'warning' })} />);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('shows "Saving Tip" label for a saving-type insight', () => {
    render(<InsightCard insight={makeInsight({ type: 'saving' })} />);
    expect(screen.getByText('Saving Tip')).toBeInTheDocument();
  });

  it('applies amber border classes for a warning insight', () => {
    const { container } = render(
      <InsightCard insight={makeInsight({ type: 'warning' })} />,
    );
    expect(container.querySelector('.border-amber-200')).toBeInTheDocument();
  });

  it('applies emerald border classes for a saving insight', () => {
    const { container } = render(
      <InsightCard insight={makeInsight({ type: 'saving' })} />,
    );
    expect(container.querySelector('.border-emerald-200')).toBeInTheDocument();
  });

  it('applies blue border classes for an info insight', () => {
    const { container } = render(
      <InsightCard insight={makeInsight({ type: 'info' })} />,
    );
    expect(container.querySelector('.border-blue-200')).toBeInTheDocument();
  });
});
