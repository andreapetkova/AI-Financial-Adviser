import { describe, it, expect } from 'vitest';
import { matchRule, categorizeByRules } from '../rules';
import type { TransactionInput } from '../types';

function makeTransaction(id: string, description: string): TransactionInput {
  return { id, description, amount: -10 };
}

describe('matchRule', () => {
  it('matches Netflix to subscriptions', () => {
    const result = matchRule('Netflix subscription charge');
    expect(result?.category).toBe('subscriptions');
    expect(result?.confidence).toBe(0.95);
  });

  it('matches case-insensitively', () => {
    expect(matchRule('NETFLIX PAYMENT')?.category).toBe('subscriptions');
  });

  it('matches Starbucks to food_dining', () => {
    expect(matchRule('Starbucks Coffee #4221')?.category).toBe('food_dining');
  });

  it('matches Kroger to groceries', () => {
    expect(matchRule('KROGER #0432 Purchase')?.category).toBe('groceries');
  });

  it('matches Whole Foods to groceries', () => {
    expect(matchRule('Whole Foods Market')?.category).toBe('groceries');
  });

  it('matches Verizon to utilities', () => {
    expect(matchRule('Verizon Wireless Bill')?.category).toBe('utilities');
  });

  it('matches salary direct deposit to income', () => {
    expect(matchRule('Monthly Salary Direct Deposit')?.category).toBe('income');
  });

  it('matches CVS pharmacy to healthcare', () => {
    expect(matchRule('CVS Pharmacy #1234')?.category).toBe('healthcare');
  });

  it('returns null for an unknown merchant', () => {
    expect(matchRule("Bob's Random Emporium 99")).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(matchRule('')).toBeNull();
  });
});

describe('categorizeByRules', () => {
  it('categorizes a matched transaction', () => {
    const { categorized, uncategorized } = categorizeByRules([
      makeTransaction('1', 'Netflix'),
    ]);
    expect(categorized).toHaveLength(1);
    expect(uncategorized).toHaveLength(0);
    expect(categorized[0].transactionId).toBe('1');
    expect(categorized[0].category).toBe('subscriptions');
    expect(categorized[0].confidence).toBe(0.95);
  });

  it('puts unmatched transactions in uncategorized', () => {
    const { categorized, uncategorized } = categorizeByRules([
      makeTransaction('1', 'Unknown Vendor XYZ 12345'),
    ]);
    expect(categorized).toHaveLength(0);
    expect(uncategorized).toHaveLength(1);
    expect(uncategorized[0].id).toBe('1');
  });

  it('splits a mixed batch correctly', () => {
    const { categorized, uncategorized } = categorizeByRules([
      makeTransaction('1', 'Netflix'),
      makeTransaction('2', 'Unknown Corp'),
      makeTransaction('3', 'Starbucks'),
    ]);
    expect(categorized).toHaveLength(2);
    expect(uncategorized).toHaveLength(1);
    expect(uncategorized[0].id).toBe('2');
  });

  it('returns empty arrays for empty input', () => {
    const { categorized, uncategorized } = categorizeByRules([]);
    expect(categorized).toHaveLength(0);
    expect(uncategorized).toHaveLength(0);
  });
});
