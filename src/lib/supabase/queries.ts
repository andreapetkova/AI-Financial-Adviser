import type {
  Transaction,
  Budget,
  Insight,
  Upload,
  Category,
} from '@/types';
import type { TransactionInsert, BudgetInsert, InsightInsert, UploadInsert } from './types';
import { supabase } from './client';

function toTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    date: row.date as string,
    description: row.description as string,
    amount: Number(row.amount),
    currency: row.currency as string,
    category: (row.category as Category) ?? null,
    confidence: row.confidence != null ? Number(row.confidence) : null,
    manuallyEdited: row.manually_edited as boolean,
    uploadBatchId: row.upload_batch_id as string,
    createdAt: row.created_at as string,
  };
}

function toBudget(row: Record<string, unknown>): Budget {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    category: row.category as Category,
    limitAmount: Number(row.limit_amount),
    month: row.month as string,
    createdAt: row.created_at as string,
  };
}

function toInsight(row: Record<string, unknown>): Insight {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    message: row.message as string,
    type: row.type as Insight['type'],
    generatedAt: row.generated_at as string,
    month: row.month as string,
  };
}

function toUpload(row: Record<string, unknown>): Upload {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    filename: row.filename as string,
    rowCount: Number(row.row_count),
    createdAt: row.created_at as string,
  };
}

// --- Transactions ---

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toTransaction);
}

export async function upsertTransactions(
  transactions: TransactionInsert[],
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .upsert(transactions)
    .select();

  if (error) throw error;
  return (data ?? []).map(toTransaction);
}

export async function updateTransactionCategory(
  transactionId: string,
  category: Category,
  manuallyEdited: boolean = true,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      category,
      manually_edited: manuallyEdited,
      confidence: manuallyEdited ? 1.0 : undefined,
    })
    .eq('id', transactionId)
    .select()
    .single();

  if (error) throw error;
  return toTransaction(data);
}

export async function updateTransactionCategories(
  updates: Array<{ id: string; category: Category; confidence: number }>,
): Promise<void> {
  const { error } = await supabase.rpc('batch_update_categories', {
    updates: JSON.stringify(updates),
  });

  if (error) {
    const results = await Promise.allSettled(
      updates.map(update =>
        supabase
          .from('transactions')
          .update({
            category: update.category,
            confidence: update.confidence,
            manually_edited: false,
          })
          .eq('id', update.id),
      ),
    );

    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      throw new Error(`Failed to update ${failures.length} of ${updates.length} transactions`);
    }
  }
}

// --- Budgets ---

export async function getBudgets(
  userId: string,
  month?: string,
): Promise<Budget[]> {
  let query = supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);

  if (month) {
    query = query.eq('month', month);
  }

  const { data, error } = await query.order('category');

  if (error) throw error;
  return (data ?? []).map(toBudget);
}

export async function upsertBudget(budget: BudgetInsert): Promise<Budget> {
  const { data, error } = await supabase
    .from('budgets')
    .upsert(budget, { onConflict: 'user_id,category,month' })
    .select()
    .single();

  if (error) throw error;
  return toBudget(data);
}

// --- Insights ---

export async function getInsights(
  userId: string,
  month: string,
): Promise<Insight[]> {
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .order('generated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toInsight);
}

export async function saveInsights(
  insights: InsightInsert[],
): Promise<Insight[]> {
  const { data, error } = await supabase
    .from('insights')
    .insert(insights)
    .select();

  if (error) throw error;
  return (data ?? []).map(toInsight);
}

// --- Uploads ---

export async function createUpload(upload: UploadInsert): Promise<Upload> {
  const { data, error } = await supabase
    .from('uploads')
    .insert(upload)
    .select()
    .single();

  if (error) throw error;
  return toUpload(data);
}

export async function getUploads(userId: string): Promise<Upload[]> {
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toUpload);
}
