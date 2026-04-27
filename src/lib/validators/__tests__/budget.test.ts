import { describe, it, expect } from 'vitest';
import { budgetInputSchema, budgetSchema } from '../budget';

describe('budgetInputSchema', () => {
  it('accepts valid budget input', () => {
    const result = budgetInputSchema.parse({
      category: 'food_dining',
      limitAmount: 500,
      month: '2026-01',
    });
    expect(result.limitAmount).toBe(500);
  });

  it('rejects negative limit', () => {
    const result = budgetInputSchema.safeParse({
      category: 'food_dining',
      limitAmount: -100,
      month: '2026-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero limit', () => {
    const result = budgetInputSchema.safeParse({
      category: 'food_dining',
      limitAmount: 0,
      month: '2026-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid month format', () => {
    const result = budgetInputSchema.safeParse({
      category: 'groceries',
      limitAmount: 300,
      month: 'January 2026',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = budgetInputSchema.safeParse({
      category: 'invalid',
      limitAmount: 300,
      month: '2026-01',
    });
    expect(result.success).toBe(false);
  });
});

describe('budgetSchema', () => {
  it('accepts a valid full budget object', () => {
    const result = budgetSchema.parse({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      userId: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      category: 'entertainment',
      limitAmount: 200,
      month: '2026-03',
      createdAt: '2026-03-01T00:00:00Z',
    });
    expect(result.category).toBe('entertainment');
  });
});
