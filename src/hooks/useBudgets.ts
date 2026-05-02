'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBudgets, upsertBudget } from '@/lib/supabase/queries';
import { useAuth } from './useAuth';
import type { BudgetInput } from '@/lib/validators/budget';

export function useBudgetsQuery(month?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['budgets', user?.id, month ?? 'all'],
    queryFn: () => getBudgets(user!.id, month),
    enabled: !!user?.id,
  });
}

export function useUpsertBudgetMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: BudgetInput) =>
      upsertBudget({
        user_id: user!.id,
        category: input.category,
        limit_amount: input.limitAmount,
        month: input.month,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
