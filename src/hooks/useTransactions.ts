'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, updateTransactionCategory } from '@/lib/supabase/queries';
import { useAuth } from './useAuth';
import type { Category } from '@/types';

export function useTransactionsQuery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: () => getTransactions(user!.id),
    enabled: !!user?.id,
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({
      transactionId,
      category,
    }: {
      transactionId: string;
      category: Category;
    }) => updateTransactionCategory(transactionId, category),

    onMutate: async ({ transactionId, category }) => {
      await queryClient.cancelQueries({ queryKey: ['transactions', user?.id] });

      const previousTransactions = queryClient.getQueryData(['transactions', user?.id]);

      queryClient.setQueryData(
        ['transactions', user?.id],
        (old: ReturnType<typeof Array.prototype.map> | undefined) => {
          if (!old) return old;
          return (old as Array<{ id: string; category: Category; manuallyEdited: boolean; confidence: number | null }>).map(transaction =>
            transaction.id === transactionId
              ? { ...transaction, category, manuallyEdited: true, confidence: 1.0 }
              : transaction,
          );
        },
      );

      return { previousTransactions };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions', user?.id], context.previousTransactions);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    },
  });
}
