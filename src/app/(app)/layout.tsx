'use client';

import { usePathname } from 'next/navigation';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { classnames } from '@/lib/utils';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  LayoutDashboard,
  Upload,
  List,
  Wallet,
  Lightbulb,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/transactions', label: 'Transactions', icon: List },
  { href: '/budget', label: 'Budget', icon: Wallet },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
] as const;

function SidebarLink({
  href,
  icon: Icon,
  active,
  children,
}: {
  href: string;
  icon: LucideIcon;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={classnames(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  if (loading) return <LoadingSpinner />;
  if (!user) redirect('/login');

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      // Auth state listener handles redirect if sign-out partially succeeded.
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-60 flex-col border-r bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold tracking-tight">FinanceAI</h2>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ href, label, icon }) => (
            <SidebarLink
              key={href}
              href={href}
              icon={icon}
              active={pathname === href}
            >
              {label}
            </SidebarLink>
          ))}
        </nav>

        <div className="border-t px-3 py-4">
          <div className="mb-3 truncate px-3 text-sm text-muted-foreground">
            {user.email}
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-6">{children}</div>
      </main>
    </div>
  );
}
