import type { Category, InsightType } from '@/types';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: Partial<ProfileInsert>;
        Relationships: [];
      };
      transactions: {
        Row: TransactionRow;
        Insert: TransactionInsert;
        Update: Partial<TransactionInsert>;
        Relationships: [];
      };
      budgets: {
        Row: BudgetRow;
        Insert: BudgetInsert;
        Update: Partial<BudgetInsert>;
        Relationships: [];
      };
      insights: {
        Row: InsightRow;
        Insert: InsightInsert;
        Update: Partial<InsightInsert>;
        Relationships: [];
      };
      uploads: {
        Row: UploadRow;
        Insert: UploadInsert;
        Update: Partial<UploadInsert>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

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

export interface CategorizationRuleRow {
  id: string;
  user_id: string;
  description: string;
  category: string;
  last_confirmed_at: string;
}

export interface CategorizationRuleInsert {
  user_id: string;
  description: string;
  category: string;
  last_confirmed_at?: string;
}
