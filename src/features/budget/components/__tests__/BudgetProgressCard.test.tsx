import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BudgetProgressCard } from '../BudgetProgressCard';
import type { Budget } from '@/types';

function makeBudget(overrides: Partial<Budget> = {}): Budget {
  return {
    id: 'budget-1',
    userId: 'user-1',
    category: 'groceries',
    limitAmount: 200,
    month: '2026-01',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('BudgetProgressCard', () => {
  it('renders the category label', () => {
    render(
      <BudgetProgressCard
        budget={makeBudget()}
        spent={100}
        currency="GBP"
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('shows remaining amount when under budget', () => {
    render(
      <BudgetProgressCard
        budget={makeBudget({ limitAmount: 200 })}
        spent={80}
        currency="GBP"
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText(/remaining/i)).toBeInTheDocument();
  });

  it('shows "Over budget" text when spending exceeds the limit', () => {
    render(
      <BudgetProgressCard
        budget={makeBudget({ limitAmount: 100 })}
        spent={150}
        currency="GBP"
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText(/over budget/i)).toBeInTheDocument();
  });

  it('renders the progress bar', () => {
    const { container } = render(
      <BudgetProgressCard
        budget={makeBudget({ limitAmount: 200 })}
        spent={100}
        currency="GBP"
        onEdit={vi.fn()}
      />,
    );
    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
  });

  it('applies a green bar when well under budget', () => {
    const { container } = render(
      <BudgetProgressCard
        budget={makeBudget({ limitAmount: 200 })}
        spent={50}
        currency="GBP"
        onEdit={vi.fn()}
      />,
    );
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument();
  });

  it('applies a yellow bar when between 75% and 90% used', () => {
    const { container } = render(
      <BudgetProgressCard
        budget={makeBudget({ limitAmount: 200 })}
        spent={160}
        currency="GBP"
        onEdit={vi.fn()}
      />,
    );
    expect(container.querySelector('.bg-yellow-500')).toBeInTheDocument();
  });

  it('applies a red bar and shows the warning icon when at or above 90%', () => {
    const { container } = render(
      <BudgetProgressCard
        budget={makeBudget({ limitAmount: 200 })}
        spent={185}
        currency="GBP"
        onEdit={vi.fn()}
      />,
    );
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument();
    expect(
      container.querySelector('[aria-label="Approaching or over budget"]'),
    ).toBeInTheDocument();
  });

  it('does not show the warning icon when well under budget', () => {
    const { container } = render(
      <BudgetProgressCard
        budget={makeBudget({ limitAmount: 200 })}
        spent={50}
        currency="GBP"
        onEdit={vi.fn()}
      />,
    );
    expect(
      container.querySelector('[aria-label="Approaching or over budget"]'),
    ).not.toBeInTheDocument();
  });

  it('caps the progress bar width at 100% when over budget', () => {
    const { container } = render(
      <BudgetProgressCard
        budget={makeBudget({ limitAmount: 100 })}
        spent={150}
        currency="GBP"
        onEdit={vi.fn()}
      />,
    );
    const bar = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.style.width).toBe('100%');
  });

  it('calls onEdit with the budget when the edit button is clicked', () => {
    const onEdit = vi.fn();
    const budget = makeBudget();
    render(
      <BudgetProgressCard budget={budget} spent={50} currency="GBP" onEdit={onEdit} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /edit groceries budget/i }));
    expect(onEdit).toHaveBeenCalledOnce();
    expect(onEdit).toHaveBeenCalledWith(budget);
  });
});
