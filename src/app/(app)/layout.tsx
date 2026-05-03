'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { classnames } from '@/lib/utils';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ToastProvider } from '@/context/ToastContext';
import { ToastContainer } from '@/components/ToastContainer';
import {
  LayoutDashboard,
  Upload,
  List,
  Wallet,
  Lightbulb,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/transactions', label: 'Transactions', icon: List },
  { href: '/budget', label: 'Budget', icon: Wallet },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
] as const;

function NavLinks({
  pathname,
  onLinkClick,
}: {
  pathname: string;
  onLinkClick?: () => void;
}) {
  return (
    <>
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onLinkClick}
          aria-current={pathname === href ? 'page' : undefined}
          className={classnames(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname === href
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileNavOpen]);

  // Close mobile nav on route change.
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

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
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar — always visible on md+ */}
        <aside className="hidden md:flex w-60 flex-col border-r bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="text-lg font-semibold tracking-tight">FinanceAI</h2>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
            <NavLinks pathname={pathname} />
          </nav>
          <div className="border-t px-3 py-4">
            <div
              className="mb-3 truncate px-3 text-sm text-muted-foreground"
              title={user.email ?? ''}
            >
              {user.email}
            </div>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Mobile sidebar — only rendered when open to keep it out of tab order */}
        {isMobileNavOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
              aria-hidden="true"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <aside
              className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card md:hidden"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="text-lg font-semibold tracking-tight">FinanceAI</h2>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-label="Close navigation"
                  className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 px-3 py-4">
                <NavLinks
                  pathname={pathname}
                  onLinkClick={() => setIsMobileNavOpen(false)}
                />
              </nav>
              <div className="border-t px-3 py-4">
                <div
                  className="mb-3 truncate px-3 text-sm text-muted-foreground"
                  title={user.email ?? ''}
                >
                  {user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </aside>
          </>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile top bar */}
          <header className="flex items-center gap-3 border-b bg-card px-4 py-3 md:hidden">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation"
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold">FinanceAI</span>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl p-4 md:p-6">{children}</div>
          </main>
        </div>
      </div>

      <ToastContainer />
    </ToastProvider>
  );
}
