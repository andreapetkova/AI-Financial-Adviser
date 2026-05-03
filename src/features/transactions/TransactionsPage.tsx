'use client';

import { useState, useMemo } from 'react';
import { Upload } from 'lucide-react';
import { useTransactionsQuery, useUpdateCategoryMutation } from '@/hooks/useTransactions';
import { useToast } from '@/context/ToastContext';
import { SkeletonTable } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { TransactionTable } from './components/TransactionTable';
import {
  TransactionFilters,
  type TransactionFilterValues,
} from './components/TransactionFilters';
import type { Category, Transaction } from '@/types';

const DEFAULT_FILTERS: TransactionFilterValues = {
  category: 'all',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
};

function applyFilters(
  transactions: Transaction[],
  filters: TransactionFilterValues,
): Transaction[] {
  return transactions.filter(transaction => {
    if (filters.category !== 'all' && transaction.category !== filters.category) {
      return false;
    }
    const transactionDate = transaction.date.slice(0, 10);
    if (filters.dateFrom && transactionDate < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && transactionDate > filters.dateTo) {
      return false;
    }
    if (filters.amountMin !== '' && transaction.amount < Number(filters.amountMin)) {
      return false;
    }
    if (filters.amountMax !== '' && transaction.amount > Number(filters.amountMax)) {
      return false;
    }
    return true;
  });
}

export function TransactionsPage() {
  const { data: transactions, isLoading, isError } = useTransactionsQuery();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const toast = useToast();
  const [filters, setFilters] = useState<TransactionFilterValues>(DEFAULT_FILTERS);
  const [pendingTransactionIds, setPendingTransactionIds] = useState<Set<string>>(new Set());

  const filteredTransactions = useMemo(
    () => applyFilters(transactions ?? [], filters),
    [transactions, filters],
  );

  function handleCategoryChange(transactionId: string, category: Category) {
    setPendingTransactionIds(previous => new Set(previous).add(transactionId));
    updateCategoryMutation.mutate(
      { transactionId, category },
      {
        onSuccess: () => {
          toast.success('Category updated.');
        },
        onError: () => {
          toast.error('Failed to update category. Please try again.');
        },
        onSettled: () =>
          setPendingTransactionIds(previous => {
            const next = new Set(previous);
            next.delete(transactionId);
            return next;
          }),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-40 animate-pulse rounded-md bg-muted" aria-hidden="true" />
        </div>
        <SkeletonTable rows={8} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load transactions. Please refresh the page.
      </div>
    );
  }

  const total = transactions?.length ?? 0;
  const filtered = filteredTransactions.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total === 0
            ? 'No transactions yet — upload a CSV to get started.'
            : filtered < total
              ? `Showing ${filtered} of ${total} transactions`
              : `${total} transaction${total === 1 ? '' : 's'}`}
        </p>
      </div>

      {total > 0 && (
        <TransactionFilters filters={filters} onFiltersChange={setFilters} />
      )}

      {total === 0 ? (
        <EmptyState
          icon={Upload}
          title="No transactions yet"
          message="Upload a bank statement CSV to see your transactions here."
          action={{ label: 'Upload CSV', href: '/upload' }}
        />
      ) : (
        <TransactionTable
          transactions={filteredTransactions}
          onCategoryChange={handleCategoryChange}
          pendingTransactionIds={pendingTransactionIds}
        />
      )}
    </div>
  );
}
