import { z } from 'zod';
import { categorySchema } from './transaction';

export const budgetInputSchema = z.object({
  category: categorySchema,
  limitAmount: z.number().positive('Budget amount must be positive'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});

export const budgetSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  category: categorySchema,
  limitAmount: z.number().positive(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  createdAt: z.string(),
});

export type BudgetInput = z.infer<typeof budgetInputSchema>;
