import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateInsights } from '@/lib/ai/insights';
import { getInsights, saveInsights } from '@/lib/supabase/queries';
import type { Transaction, Budget, AIInsightResponse } from '@/types';
import { useAuth } from './useAuth';

export function useInsightsQuery(month: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['insights', user?.id, month],
    queryFn: () => {
      if (!user) throw new Error('Not authenticated');
      return getInsights(user.id, month);
    },
    enabled: !!user && !!month,
  });
}

export function useGenerateInsightsMutation() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactions,
      budgets,
      month,
    }: {
      transactions: Transaction[];
      budgets: Budget[];
      month: string;
    }): Promise<AIInsightResponse> => {
      if (!session?.access_token || !user) {
        throw new Error('Not authenticated');
      }

      const response = await generateInsights(transactions, budgets, month, session.access_token);

      await saveInsights(
        response.insights.map(insight => ({
          user_id: user.id,
          message: insight.message,
          type: insight.type,
          month: response.month,
        })),
      );

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}
