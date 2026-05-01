import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categorizeTransactions } from '@/lib/ai/categorizer';
import { updateTransactionCategories } from '@/lib/supabase/queries';
import type { TransactionInput } from '@/lib/ai/types';
import { useAuth } from './useAuth';

export function useCategorizeMutation() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactions: TransactionInput[]) => {
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const results = await categorizeTransactions(transactions, session.access_token);

      await updateTransactionCategories(
        results.map(result => ({
          id: result.transactionId,
          category: result.category,
          confidence: result.confidence,
        })),
      );

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
