'use client';

import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { redirect } from 'next/navigation';

export default function RootPage() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  redirect(user ? '/dashboard' : '/login');
}
