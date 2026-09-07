import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  CircleDollarSign,
  BarChart3,
  Settings,
  LogOut,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/format'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/sold', label: 'Sold', icon: CircleDollarSign },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
        <TrendingUp className="h-4 w-4 text-profit" strokeWidth={2.5} />
      </div>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight text-ink">
          FlipMargin
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  const { user, profile, signOut, isGuest } = useAuth()
  const email = isGuest ? 'Guest' : profile?.email || user?.email || ''

  return (
    <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-border bg-surface-elevated lg:flex">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-ink-secondary hover:bg-surface hover:text-ink'
              )
            }
          >
            <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 truncate px-1">
          <p className="text-xs font-medium text-ink-muted">
            {isGuest ? 'Browsing as' : 'Signed in as'}
          </p>
          <p className="truncate text-sm font-medium text-ink" title={email}>
            {email}
          </p>
        </div>
        {isGuest ? (
          <Link
            to="/login"
            className="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
          >
            Sign In
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => void signOut()}
            className="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  )
}

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-elevated/95 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                isActive ? 'text-brand' : 'text-ink-muted'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-5 w-5', isActive && 'text-brand')} strokeWidth={isActive ? 2.25 : 1.75} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export function MobileHeader() {
  const { signOut, isGuest } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface-elevated/95 px-4 backdrop-blur-md lg:hidden">
      <Logo />
      {isGuest ? (
        <Link
          to="/login"
          className="focus-ring rounded-lg px-2 py-1.5 text-sm font-medium text-ink-muted hover:bg-surface hover:text-ink"
        >
          Sign In
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => void signOut()}
          className="focus-ring rounded-lg p-2 text-ink-muted hover:bg-surface hover:text-ink"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      )}
    </header>
  )
}
