'use client';

import { useQuery } from '@tanstack/react-query';
import { getBudgets } from '@/lib/supabase/queries';
import { useAuth } from './useAuth';

export function useBudgetsQuery(month?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['budgets', user?.id, month ?? 'all'],
    queryFn: () => getBudgets(user!.id, month),
    enabled: !!user?.id,
  });
}
