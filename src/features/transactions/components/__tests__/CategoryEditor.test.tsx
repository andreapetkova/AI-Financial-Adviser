import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryEditor } from '../CategoryEditor';

describe('CategoryEditor', () => {
  it('renders a select element', () => {
    render(
      <CategoryEditor
        transactionId="tx-1"
        currentCategory={null}
        onCategoryChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows "Select category" placeholder when current category is null', () => {
    render(
      <CategoryEditor
        transactionId="tx-1"
        currentCategory={null}
        onCategoryChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Select category')).toBeInTheDocument();
  });

  it('displays the current category as the selected value', () => {
    render(
      <CategoryEditor
        transactionId="tx-1"
        currentCategory="groceries"
        onCategoryChange={vi.fn()}
      />,
    );
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('groceries');
  });

  it('calls onCategoryChange with the transaction id and new category on change', () => {
    const onCategoryChange = vi.fn();
    render(
      <CategoryEditor
        transactionId="tx-42"
        currentCategory="groceries"
        onCategoryChange={onCategoryChange}
      />,
    );
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'food_dining' },
    });
    expect(onCategoryChange).toHaveBeenCalledOnce();
    expect(onCategoryChange).toHaveBeenCalledWith('tx-42', 'food_dining');
  });

  it('is disabled when the disabled prop is true', () => {
    render(
      <CategoryEditor
        transactionId="tx-1"
        currentCategory="groceries"
        onCategoryChange={vi.fn()}
        disabled={true}
      />,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('is enabled by default', () => {
    render(
      <CategoryEditor
        transactionId="tx-1"
        currentCategory="groceries"
        onCategoryChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('combobox')).not.toBeDisabled();
  });

  it('renders all available categories as options', () => {
    render(
      <CategoryEditor
        transactionId="tx-1"
        currentCategory="groceries"
        onCategoryChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('option', { name: 'Groceries' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Food & Dining' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Housing' })).toBeInTheDocument();
  });
});
