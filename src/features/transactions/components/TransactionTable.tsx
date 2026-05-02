'use client';

import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { CategoryEditor } from './CategoryEditor';
import type { Transaction, Category } from '@/types';

type SortField = 'date' | 'description' | 'amount' | 'category';
type SortDirection = 'asc' | 'desc';

interface TransactionTableProps {
  transactions: Transaction[];
  onCategoryChange: (transactionId: string, category: Category) => void;
  isPendingUpdate: boolean;
  pendingTransactionId: string | null;
}

function SortIcon({
  field,
  sortField,
  sortDirection,
}: {
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
}) {
  if (field !== sortField) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
  return sortDirection === 'asc'
    ? <ArrowUp className="h-3 w-3" />
    : <ArrowDown className="h-3 w-3" />;
}

function sortTransactions(
  transactions: Transaction[],
  field: SortField,
  direction: SortDirection,
): Transaction[] {
  return [...transactions].sort((a, b) => {
    let comparison = 0;

    if (field === 'date') {
      comparison = a.date.localeCompare(b.date);
    } else if (field === 'description') {
      comparison = a.description.localeCompare(b.description);
    } else if (field === 'amount') {
      comparison = a.amount - b.amount;
    } else if (field === 'category') {
      const aCategory = a.category ?? '';
      const bCategory = b.category ?? '';
      comparison = aCategory.localeCompare(bCategory);
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}

export function TransactionTable({
  transactions,
  onCategoryChange,
  isPendingUpdate,
  pendingTransactionId,
}: TransactionTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  const sorted = sortTransactions(transactions, sortField, sortDirection);

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        No transactions match your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            {(['date', 'description', 'amount', 'category'] as SortField[]).map(field => (
              <th
                key={field}
                className="px-4 py-3 text-left font-medium text-muted-foreground"
              >
                <button
                  onClick={() => handleSort(field)}
                  className="flex items-center gap-1 capitalize hover:text-foreground"
                >
                  {field}
                  <SortIcon
                    field={field}
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                </button>
              </th>
            ))}
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Edit
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map(transaction => {
            const isPending = isPendingUpdate && pendingTransactionId === transaction.id;

            return (
              <tr
                key={transaction.id}
                className={`transition-colors hover:bg-muted/30 ${isPending ? 'opacity-60' : ''}`}
              >
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className="line-clamp-1">{transaction.description}</span>
                </td>
                <td
                  className={`whitespace-nowrap px-4 py-3 tabular-nums font-medium ${
                    transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {transaction.amount < 0 ? '-' : '+'}
                  {Math.abs(transaction.amount).toFixed(2)} {transaction.currency}
                </td>
                <td className="px-4 py-3">
                  <CategoryBadge
                    category={transaction.category}
                    confidence={transaction.confidence}
                    manuallyEdited={transaction.manuallyEdited}
                  />
                </td>
                <td className="px-4 py-3">
                  <CategoryEditor
                    transactionId={transaction.id}
                    currentCategory={transaction.category}
                    onCategoryChange={onCategoryChange}
                    disabled={isPending}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
