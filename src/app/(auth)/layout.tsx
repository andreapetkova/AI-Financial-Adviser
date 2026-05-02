'use client';

import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { redirect } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (user) redirect('/dashboard');

  return <>{children}</>;
}
