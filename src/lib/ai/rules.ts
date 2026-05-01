import type { Category, AICategorizationResult } from '@/types';
import type { TransactionInput } from './types';

interface CategorizationRule {
  keywords: string[];
  category: Category;
}

const RULES: CategorizationRule[] = [
  { keywords: ['netflix', 'spotify', 'hulu', 'disney+', 'hbo', 'apple music', 'youtube premium', 'amazon prime', 'subscription'], category: 'subscriptions' },
  { keywords: ['uber ride', 'lyft', 'gas station', 'shell gas', 'bp gas', 'chevron', 'parking', 'transit', 'metro', 'bus fare', 'train ticket', 'toll'], category: 'transportation' },
  { keywords: ['kroger', 'whole foods', 'trader joe', 'aldi', 'safeway', 'publix', 'grocery', 'supermarket'], category: 'groceries' },
  { keywords: ['mcdonald', 'starbucks', 'chipotle', 'doordash', 'uber eats', 'grubhub', 'restaurant', 'pizza', 'cafe', 'diner', 'burger king', 'wendy', 'taco bell', 'subway sandwich', 'kfc'], category: 'food_dining' },
  { keywords: ['rent payment', 'mortgage payment', 'property tax', 'hoa fee', 'home insurance'], category: 'housing' },
  { keywords: ['electric bill', 'water bill', 'gas bill', 'internet bill', 'phone bill', 'verizon', 'at&t', 'comcast', 'xfinity', 't-mobile', 'utility'], category: 'utilities' },
  { keywords: ['cvs pharmacy', 'walgreens', 'pharmacy', 'doctor', 'hospital', 'dental', 'medical', 'health insurance', 'clinic', 'optometrist'], category: 'healthcare' },
  { keywords: ['amazon.com', 'ebay', 'etsy', 'best buy', 'apple store', 'nike', 'zara', 'h&m', 'nordstrom', 'target', 'walmart', 'costco'], category: 'shopping' },
  { keywords: ['movie theater', 'cinema', 'concert', 'theater ticket', 'gaming', 'bowling', 'amusement park', 'event ticket', 'ticketmaster'], category: 'entertainment' },
  { keywords: ['hotel', 'airbnb', 'airline', 'flight', 'booking.com', 'expedia', 'travel', 'vacation'], category: 'travel' },
  { keywords: ['tuition', 'university', 'college', 'course fee', 'textbook', 'udemy', 'coursera', 'school'], category: 'education' },
  { keywords: ['salon', 'barber', 'spa', 'gym membership', 'fitness', 'beauty', 'massage'], category: 'personal_care' },
  { keywords: ['payroll', 'salary', 'direct deposit', 'freelance payment', 'payment received'], category: 'income' },
  { keywords: ['investment', '401k', 'ira contribution', 'stock purchase', 'savings transfer', 'brokerage', 'vanguard', 'fidelity'], category: 'savings_investments' },
  { keywords: ['loan payment', 'credit card payment', 'student loan', 'car payment'], category: 'debt_payments' },
  { keywords: ['donation', 'charity', 'tithe', 'church', 'nonprofit'], category: 'gifts_donations' },
];

export function matchRule(description: string): { category: Category; confidence: number } | null {
  const lower = description.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some(keyword => lower.includes(keyword))) {
      return { category: rule.category, confidence: 0.95 };
    }
  }
  return null;
}

export interface RuleCategorizeResult {
  categorized: AICategorizationResult[];
  uncategorized: TransactionInput[];
}

export function categorizeByRules(transactions: TransactionInput[]): RuleCategorizeResult {
  const categorized: AICategorizationResult[] = [];
  const uncategorized: TransactionInput[] = [];

  for (const transaction of transactions) {
    const result = matchRule(transaction.description);
    if (result) {
      categorized.push({
        transactionId: transaction.id,
        category: result.category,
        confidence: result.confidence,
      });
    } else {
      uncategorized.push(transaction);
    }
  }

  return { categorized, uncategorized };
}
