import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { classnames } from '@/lib/utils';
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
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/transactions', label: 'Transactions', icon: List },
  { to: '/budget', label: 'Budget', icon: Wallet },
  { to: '/insights', label: 'Insights', icon: Lightbulb },
] as const;

function SidebarLink({ to, icon: Icon, children }: { to: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        classnames(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )
      }
    >
      <Icon className="h-4 w-4" />
      {children}
    </NavLink>
  );
}

export function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      // Auth state listener will handle the redirect if sign-out partially succeeded.
      // If it fully failed, the user stays on the current page — which is correct.
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-60 flex-col border-r bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold tracking-tight">FinanceAI</h2>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, label, icon }) => (
            <SidebarLink key={to} to={to} icon={icon}>
              {label}
            </SidebarLink>
          ))}
        </nav>

        <div className="border-t px-3 py-4">
          <div className="mb-3 truncate px-3 text-sm text-muted-foreground">
            {user?.email}
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
        <div className="mx-auto max-w-6xl p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
