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

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  if (loading) return <LoadingSpinner />;
  if (!user) redirect('/login');

  return (
    <AppLayoutShell
      user={user}
      signOut={signOut}
      pathname={pathname}
      isMobileNavOpen={isMobileNavOpen}
      setIsMobileNavOpen={setIsMobileNavOpen}
    >
      {children}
    </AppLayoutShell>
  );
}

function AppLayoutShell({
  user,
  signOut,
  pathname,
  isMobileNavOpen,
  setIsMobileNavOpen,
  children,
}: {
  user: { email?: string | null };
  signOut: () => Promise<void>;
  pathname: string;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  children: React.ReactNode;
}) {
  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      // Auth state listener handles redirect if sign-out partially succeeded.
    }
  }

  const userInitial = user.email?.[0]?.toUpperCase() ?? '?';
  const currentPage = navItems.find(item => item.href === pathname)?.label ?? 'FinanceAI';

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-background">

        {/* ── Desktop icon sidebar ── */}
        <aside className="hidden md:flex w-[76px] shrink-0 flex-col bg-card border-r border-border">
          {/* Logo mark */}
          <div className="flex h-16 shrink-0 items-center justify-center border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
              <span className="text-sm font-bold text-primary-foreground">F</span>
            </div>
          </div>

          {/* Nav icons */}
          <nav className="flex flex-1 flex-col items-center gap-1 px-2 py-4" aria-label="Main navigation">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  title={label}
                  className={classnames(
                    'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </Link>
              );
            })}
          </nav>

          {/* Sign out */}
          <div className="flex flex-col items-center px-2 py-4 border-t border-border">
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </aside>

        {/* ── Mobile slide-in nav ── */}
        {isMobileNavOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
              aria-hidden="true"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <aside
              className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-card border-r border-border md:hidden"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <span className="text-xs font-bold text-primary-foreground">F</span>
                  </div>
                  <span className="text-sm font-semibold">FinanceAI</span>
                </div>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-label="Close navigation"
                  className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileNavOpen(false)}
                    aria-current={pathname === href ? 'page' : undefined}
                    className={classnames(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      pathname === href
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-border px-3 py-4">
                <div
                  className="mb-3 truncate px-3 text-sm text-muted-foreground"
                  title={user.email ?? ''}
                >
                  {user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </aside>
          </>
        )}

        {/* ── Right column (header + content) ── */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Top header */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open navigation"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="text-base font-semibold text-foreground">{currentPage}</span>
            </div>

            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">{user.email}</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm">
                <span className="text-sm font-semibold text-primary-foreground">{userInitial}</span>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl p-4 md:p-6">{children}</div>
          </main>
        </div>
      </div>

      <ToastContainer />
    </ToastProvider>
  );
}
