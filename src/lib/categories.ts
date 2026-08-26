import type { Category } from '@/types';

export const CATEGORY_LABELS: Record<Category, string> = {
  housing: 'Housing',
  transportation: 'Transportation',
  food_dining: 'Food & Dining',
  groceries: 'Groceries',
  utilities: 'Utilities',
  healthcare: 'Healthcare',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  subscriptions: 'Subscriptions',
  travel: 'Travel',
  education: 'Education',
  personal_care: 'Personal Care',
  income: 'Income',
  savings_investments: 'Savings & Investments',
  debt_payments: 'Debt Payments',
  gifts_donations: 'Gifts & Donations',
  other: 'Other',
};

// Copilot Money's tag palette (Coral, Lime, Tangerine, Hot Pink, Violet,
// Sunflower, Sky, Ember, Olive, Slate), extended to cover all 17 categories.
export const CATEGORY_CHART_COLORS: Record<Category, string> = {
  housing: '#ffcc02', // Sunflower
  transportation: '#ff8833', // Tangerine
  food_dining: '#ff4433', // Coral
  groceries: '#00cc4b', // Lime
  utilities: '#5c6f8a', // Slate
  healthcare: '#ea687c', // Ember
  entertainment: '#9019e6', // Violet
  shopping: '#ff33aa', // Hot Pink
  subscriptions: '#00acfe', // Sky
  travel: '#94ae43', // Olive
  education: '#00acfe', // Sky
  personal_care: '#ea687c', // Ember
  income: '#00cc4b', // Lime
  savings_investments: '#ffcc02', // Sunflower
  debt_payments: '#ff4433', // Coral
  gifts_donations: '#ff33aa', // Hot Pink
  other: '#5c6f8a', // Slate
};

// Text color for legibility on top of each solid tag fill above (most of
// Copilot's tag hues are bright/mid-tone, so black text reads better than
// white on all but the two darkest — Violet and Slate).
export const CATEGORY_TEXT_COLORS: Record<Category, string> = {
  housing: '#0b0f14',
  transportation: '#0b0f14',
  food_dining: '#0b0f14',
  groceries: '#0b0f14',
  utilities: '#ffffff',
  healthcare: '#0b0f14',
  entertainment: '#ffffff',
  shopping: '#0b0f14',
  subscriptions: '#0b0f14',
  travel: '#0b0f14',
  education: '#0b0f14',
  personal_care: '#0b0f14',
  income: '#0b0f14',
  savings_investments: '#0b0f14',
  debt_payments: '#0b0f14',
  gifts_donations: '#0b0f14',
  other: '#ffffff',
};
