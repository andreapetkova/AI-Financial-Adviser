export type Category =
  | 'housing'
  | 'transportation'
  | 'food_dining'
  | 'groceries'
  | 'utilities'
  | 'healthcare'
  | 'entertainment'
  | 'shopping'
  | 'subscriptions'
  | 'travel'
  | 'education'
  | 'personal_care'
  | 'income'
  | 'savings_investments'
  | 'debt_payments'
  | 'gifts_donations'
  | 'other';

export const CATEGORIES: readonly Category[] = [
  'housing',
  'transportation',
  'food_dining',
  'groceries',
  'utilities',
  'healthcare',
  'entertainment',
  'shopping',
  'subscriptions',
  'travel',
  'education',
  'personal_care',
  'income',
  'savings_investments',
  'debt_payments',
  'gifts_donations',
  'other',
] as const;

export type InsightType = 'warning' | 'saving' | 'info';

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: Category | null;
  confidence: number | null;
  manuallyEdited: boolean;
  uploadBatchId: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: Category;
  limitAmount: number;
  month: string;
  createdAt: string;
}

export interface Insight {
  id: string;
  userId: string;
  message: string;
  type: InsightType;
  generatedAt: string;
  month: string;
}

export interface Upload {
  id: string;
  userId: string;
  filename: string;
  rowCount: number;
  createdAt: string;
}

export interface ParsedCSVRow {
  date: string;
  description: string;
  amount: number;
  currency?: string;
}

export interface AICategorizationResult {
  transactionId: string;
  category: Category;
  confidence: number;
}

export interface AICategorizationResponse {
  results: AICategorizationResult[];
}

export interface AIInsight {
  message: string;
  type: InsightType;
}

export interface AIInsightResponse {
  insights: AIInsight[];
  month: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}
