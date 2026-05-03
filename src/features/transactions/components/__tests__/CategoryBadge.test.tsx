import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryBadge } from '../CategoryBadge';

describe('CategoryBadge', () => {
  it('shows "Uncategorized" when category is null', () => {
    render(<CategoryBadge category={null} confidence={null} manuallyEdited={false} />);
    expect(screen.getByText('Uncategorized')).toBeInTheDocument();
  });

  it('shows the category label when a category is set', () => {
    render(
      <CategoryBadge category="food_dining" confidence={0.9} manuallyEdited={false} />,
    );
    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
  });

  it('applies a yellow ring for low-confidence AI categorization', () => {
    const { container } = render(
      <CategoryBadge category="groceries" confidence={0.6} manuallyEdited={false} />,
    );
    expect(container.querySelector('.ring-yellow-400')).toBeInTheDocument();
  });

  it('does not apply a yellow ring when confidence is at or above 0.7', () => {
    const { container } = render(
      <CategoryBadge category="groceries" confidence={0.7} manuallyEdited={false} />,
    );
    expect(container.querySelector('.ring-yellow-400')).not.toBeInTheDocument();
  });

  it('does not apply a yellow ring when manually edited, regardless of confidence', () => {
    const { container } = render(
      <CategoryBadge category="groceries" confidence={0.5} manuallyEdited={true} />,
    );
    expect(container.querySelector('.ring-yellow-400')).not.toBeInTheDocument();
  });

  it('shows a checkmark icon when manually edited', () => {
    const { container } = render(
      <CategoryBadge category="groceries" confidence={0.9} manuallyEdited={true} />,
    );
    // Lucide CheckCircle renders an SVG
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('includes confidence percentage in the tooltip for AI-categorized items', () => {
    render(
      <CategoryBadge category="groceries" confidence={0.85} manuallyEdited={false} />,
    );
    const badge = screen.getByTitle(/85%/);
    expect(badge).toBeInTheDocument();
  });

  it('shows "Manually categorized" in tooltip when manually edited', () => {
    render(
      <CategoryBadge category="groceries" confidence={0.9} manuallyEdited={true} />,
    );
    expect(screen.getByTitle('Manually categorized')).toBeInTheDocument();
  });
});
