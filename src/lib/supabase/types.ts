import type { Category, InsightType } from '@/types';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: Partial<ProfileInsert>;
      };
      transactions: {
        Row: TransactionRow;
        Insert: TransactionInsert;
        Update: Partial<TransactionInsert>;
      };
      budgets: {
        Row: BudgetRow;
        Insert: BudgetInsert;
        Update: Partial<BudgetInsert>;
      };
      insights: {
        Row: InsightRow;
        Insert: InsightInsert;
        Update: Partial<InsightInsert>;
      };
      uploads: {
        Row: UploadRow;
        Insert: UploadInsert;
        Update: Partial<UploadInsert>;
      };
    };
  };
}

export interface ProfileRow {
  id: string;
  email: string;
  created_at: string;
}

export interface ProfileInsert {
  id: string;
  email: string;
  created_at?: string;
}

export interface TransactionRow {
  id: string;
  user_id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: Category | null;
  confidence: number | null;
  manually_edited: boolean;
  upload_batch_id: string;
  created_at: string;
}

export interface TransactionInsert {
  id?: string;
  user_id: string;
  date: string;
  description: string;
  amount: number;
  currency?: string;
  category?: Category | null;
  confidence?: number | null;
  manually_edited?: boolean;
  upload_batch_id: string;
  created_at?: string;
}

export interface BudgetRow {
  id: string;
  user_id: string;
  category: Category;
  limit_amount: number;
  month: string;
  created_at: string;
}

export interface BudgetInsert {
  id?: string;
  user_id: string;
  category: Category;
  limit_amount: number;
  month: string;
  created_at?: string;
}

export interface InsightRow {
  id: string;
  user_id: string;
  message: string;
  type: InsightType;
  generated_at: string;
  month: string;
}

export interface InsightInsert {
  id?: string;
  user_id: string;
  message: string;
  type: InsightType;
  month: string;
  generated_at?: string;
}

export interface UploadRow {
  id: string;
  user_id: string;
  filename: string;
  row_count: number;
  created_at: string;
}

export interface UploadInsert {
  id?: string;
  user_id: string;
  filename: string;
  row_count: number;
  created_at?: string;
}
