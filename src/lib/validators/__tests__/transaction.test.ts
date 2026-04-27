import { describe, it, expect } from 'vitest';
import {
  csvRowSchema,
  transactionSchema,
  categorizationResponseSchema,
  insightResponseSchema,
} from '../transaction';

describe('csvRowSchema', () => {
  it('accepts a valid CSV row', () => {
    const result = csvRowSchema.parse({
      date: '2026-01-15',
      description: 'Netflix subscription',
      amount: '14.99',
    });
    expect(result.date).toBe('2026-01-15');
    expect(result.amount).toBe(14.99);
  });

  it('accepts a row with currency', () => {
    const result = csvRowSchema.parse({
      date: '2026-01-15',
      description: 'Grocery store',
      amount: 52.3,
      currency: 'USD',
    });
    expect(result.currency).toBe('USD');
  });

  it('coerces string amounts to numbers', () => {
    const result = csvRowSchema.parse({
      date: '2026-01-15',
      description: 'Transfer',
      amount: '-100.50',
    });
    expect(result.amount).toBe(-100.5);
  });

  it('rejects missing date', () => {
    const result = csvRowSchema.safeParse({
      description: 'Test',
      amount: 10,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const result = csvRowSchema.safeParse({
      date: 'not-a-date',
      description: 'Test',
      amount: 10,
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty description', () => {
    const result = csvRowSchema.safeParse({
      date: '2026-01-15',
      description: '',
      amount: 10,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric amount', () => {
    const result = csvRowSchema.safeParse({
      date: '2026-01-15',
      description: 'Test',
      amount: 'abc',
    });
    expect(result.success).toBe(false);
  });
});

describe('transactionSchema', () => {
  const validTransaction = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    userId: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    date: '2026-01-15',
    description: 'Netflix',
    amount: 14.99,
    currency: 'USD',
    category: 'subscriptions' as const,
    confidence: 0.95,
    manuallyEdited: false,
    uploadBatchId: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    createdAt: '2026-01-15T10:00:00Z',
  };

  it('accepts a valid transaction', () => {
    const result = transactionSchema.parse(validTransaction);
    expect(result.category).toBe('subscriptions');
  });

  it('accepts null category and confidence', () => {
    const result = transactionSchema.parse({
      ...validTransaction,
      category: null,
      confidence: null,
    });
    expect(result.category).toBeNull();
    expect(result.confidence).toBeNull();
  });

  it('rejects invalid category', () => {
    const result = transactionSchema.safeParse({
      ...validTransaction,
      category: 'invalid_cat',
    });
    expect(result.success).toBe(false);
  });

  it('rejects confidence outside 0-1 range', () => {
    const result = transactionSchema.safeParse({
      ...validTransaction,
      confidence: 1.5,
    });
    expect(result.success).toBe(false);
  });
});

describe('categorizationResponseSchema', () => {
  it('accepts a valid response', () => {
    const result = categorizationResponseSchema.parse({
      results: [
        {
          transactionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          category: 'food_dining',
          confidence: 0.85,
        },
      ],
    });
    expect(result.results).toHaveLength(1);
  });

  it('accepts empty results array', () => {
    const result = categorizationResponseSchema.parse({ results: [] });
    expect(result.results).toHaveLength(0);
  });
});

describe('insightResponseSchema', () => {
  it('accepts a valid insight response', () => {
    const result = insightResponseSchema.parse({
      insights: [
        { message: 'You spent 20% more on dining this month.', type: 'warning' },
        { message: 'Consider switching to a cheaper phone plan.', type: 'saving' },
      ],
      month: '2026-01',
    });
    expect(result.insights).toHaveLength(2);
  });

  it('rejects invalid insight type', () => {
    const result = insightResponseSchema.safeParse({
      insights: [{ message: 'Test', type: 'critical' }],
      month: '2026-01',
    });
    expect(result.success).toBe(false);
  });
});
