import { z } from 'zod';

const categoryValues = [
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

const insightTypeValues = ['warning', 'saving', 'info'] as const;

export const categorySchema = z.enum(categoryValues);

export const csvRowSchema = z.object({
  date: z.string().min(1, 'Date is required').refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid date format' },
  ),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().refine(
    (val) => isFinite(val),
    { message: 'Amount must be a valid number' },
  ),
  currency: z.string().min(1).max(3).optional(),
});

export const transactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  description: z.string().min(1),
  amount: z.number().finite(),
  currency: z.string().min(1).max(3),
  category: categorySchema.nullable(),
  confidence: z.number().min(0).max(1).nullable(),
  manuallyEdited: z.boolean(),
  uploadBatchId: z.string().uuid(),
  createdAt: z.string(),
});

export const categorizationResultSchema = z.object({
  transactionId: z.string().uuid(),
  category: categorySchema,
  confidence: z.number().min(0).max(1),
});

export const categorizationResponseSchema = z.object({
  results: z.array(categorizationResultSchema),
});

export const insightSchema = z.object({
  message: z.string().min(1),
  type: z.enum(insightTypeValues),
});

export const insightResponseSchema = z.object({
  insights: z.array(insightSchema),
  month: z.string().min(1),
});

export type CSVRowInput = z.input<typeof csvRowSchema>;
export type CSVRowOutput = z.output<typeof csvRowSchema>;
