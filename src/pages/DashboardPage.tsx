 import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet,
  Package,
  TrendingUp,
  TrendingDown,
  Percent,
  BarChart3,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useAuth, getFirstName } from '@/contexts/AuthContext'
import { useProducts } from '@/hooks/useProducts'
import { useDashboardStats, useProfitOverTime } from '@/hooks/useAnalytics'
import { StatCard, ProfitDisplay } from '@/components/StatCard'
import { ActivityRow } from '@/components/ProductCard'
import { EmptyState } from '@/components/EmptyState'
import { AddItemButton } from '@/components/PageHeader'
import { StatCardSkeleton, TableSkeleton } from '@/components/LoadingSkeleton'
import { formatCurrency, formatPercent, cn } from '@/utils/format'
import type { DateRange } from '@/types'

const RANGES: { value: DateRange; label: string }[] = [
  { value: '30d', label: '30 Days' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
]

export function DashboardPage() {
  const { user, profile } = useAuth()
  const { products, loading } = useProducts()
  const stats = useDashboardStats(products)
  const [range, setRange] = useState<DateRange>('3m')
  const chartData = useProfitOverTime(products, range)

  const recent = useMemo(
    () =>
      [...products]
        .sort((a, b) => (a.updated_at > b.updated_at ? -1 : 1))
        .slice(0, 8),
    [products]
  )

  const firstName = getFirstName(profile, user)

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div>
          <div className="h-8 w-56 skeleton" />
          <div className="mt-2 h-4 w-72 skeleton" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={4} />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-ink-secondary">Your flip command center.</p>
        <div className="mt-8">
          <EmptyState
            title="Start tracking your flips."
            description="Add your first item to see your inventory, profit, and ROI all in one place."
            action={<AddItemButton label="Add Your First Item" />}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-ink-secondary">Here&apos;s how your inventory is performing.</p>
        </div>
        <AddItemButton className="hidden sm:inline-flex" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Invested"
          value={formatCurrency(stats.totalInvested)}
          secondary={`Across ${products.length} item${products.length === 1 ? '' : 's'}`}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Current Inventory"
          value={String(stats.currentInventoryCount)}
          secondary={`${formatCurrency(stats.currentInventoryValue)} invested`}
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          label="Net Profit / Loss"
          value={<ProfitDisplay value={stats.totalProfit} size="lg" />}
          secondary={
            <span className={stats.overallReturn >= 0 ? 'text-profit' : 'text-loss'}>
              {formatPercent(stats.overallReturn, true)} overall return
            </span>
          }
          icon={
            stats.totalProfit >= 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )
          }
          accent={stats.totalProfit >= 0 ? 'profit' : 'loss'}
        />
        <StatCard
          label="Average ROI"
          value={<ProfitDisplay value={stats.averageRoi} asPercent size="lg" />}
          secondary={`From ${stats.totalSoldCount} completed sale${stats.totalSoldCount === 1 ? '' : 's'}`}
          icon={<Percent className="h-5 w-5" />}
        />
      </div>

      <section className="rounded-[var(--radius-card)] border border-border bg-surface-elevated p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Profit Over Time</h2>
            <p className="text-sm text-ink-muted">Cumulative realized profit from sales</p>
          </div>
          <div className="flex flex-wrap gap-1 rounded-xl bg-surface p-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRange(r.value)}
                className={cn(
                  'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                  range === r.value
                    ? 'bg-surface-elevated text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {chartData.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-ink-muted">
              <BarChart3 className="h-6 w-6" />
            </div>
            <p className="font-medium text-ink">Not enough sales data yet</p>
            <p className="mt-1 max-w-xs text-sm text-ink-muted">
              Mark items as sold to see your profit trend over time.
            </p>
            <Link
              to="/inventory"
              className="mt-4 text-sm font-semibold text-brand-accent hover:underline"
            >
              Go to inventory →
            </Link>
          </div>
        ) : (
          <div className="h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16A34A" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                  width={56}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Profit']}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#16A34A"
                  strokeWidth={2.5}
                  fill="url(#profitFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-[var(--radius-card)] border border-border bg-surface-elevated p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Recent Activity</h2>
          <Link to="/inventory" className="text-sm font-semibold text-brand-accent hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.map((p) => (
            <ActivityRow key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  )
}
