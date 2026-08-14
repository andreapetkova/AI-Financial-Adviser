import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithRetry } from '@/lib/ai/fetchWithRetry';
import { updateTransactionCategories } from '@/lib/supabase/queries';
import { categorizationResponseSchema } from '@/lib/validators/transaction';
import { useAuth } from './useAuth';

interface TransactionInput {
  id: string;
  description: string;
  amount: number;
}

export function useCategorizeMutation() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactions: TransactionInput[]) => {
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const data = await fetchWithRetry({
        endpoint: '/api/categorize',
        body: { transactions },
        accessToken: session.access_token,
      });

      const { results } = categorizationResponseSchema.parse(data);

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
