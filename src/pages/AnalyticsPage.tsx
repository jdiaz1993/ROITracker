import { Link } from 'react-router-dom'
import { type ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Clock, Percent, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { PageHeader, AddItemButton } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { StatCard, ProfitDisplay } from '@/components/StatCard'
import { ProductImage } from '@/components/ProductCard'
import { StatCardSkeleton, TableSkeleton } from '@/components/LoadingSkeleton'
import { useProducts } from '@/hooks/useProducts'
import { useAnalytics } from '@/hooks/useAnalytics'
import { formatCurrency } from '@/utils/format'

const PIE_COLORS = ['#2563EB', '#16A34A', '#D97706', '#7C3AED', '#0F172A', '#DC2626', '#6B7280']

export function AnalyticsPage() {
  const { products, loading } = useProducts()
  const analytics = useAnalytics(products)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={3} />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Analytics" description="Deeper insight into your flipping performance." />
        <EmptyState
          title="Start tracking your flips."
          description="Add inventory and complete sales to unlock charts and performance insights."
          action={<AddItemButton label="Add Your First Item" />}
        />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Analytics"
        description="Deeper insight into your flipping performance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Net Profit / Loss"
          value={<ProfitDisplay value={analytics.totalProfit} size="lg" />}
          secondary={
            analytics.totalProfit >= 0
              ? 'Realized across all sales'
              : 'Overall net loss so far'
          }
          icon={
            analytics.totalProfit >= 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )
          }
          accent={analytics.totalProfit >= 0 ? 'profit' : 'loss'}
        />
        <StatCard
          label="Average ROI"
          value={<ProfitDisplay value={analytics.avgRoi} asPercent size="lg" />}
          secondary={`${analytics.soldCount} completed sales`}
          icon={<Percent className="h-5 w-5" />}
        />
        <StatCard
          label="Avg. Days to Sell"
          value={analytics.avgDaysToSell != null ? String(analytics.avgDaysToSell) : '—'}
          secondary="Purchase date to sale date"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Sales Recorded"
          value={String(analytics.soldCount)}
          secondary="Used for profit analytics"
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>

      {analytics.soldCount === 0 ? (
        <EmptyState
          title="Mark your first sale"
          description="Analytics for profit, revenue, and platform performance unlock after you sell an item."
        />
      ) : (
        <>
          <ChartCard
            title="Net Profit & Loss by Month"
            subtitle="Green = profit months, red = loss months"
          >
            {analytics.byMonth.length === 0 ? (
              <ChartEmpty />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.byMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `$${v}`}
                      width={52}
                    />
                    <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="4 4" />
                    <Tooltip
                      formatter={(v: number) => [
                        formatCurrency(Math.abs(v)),
                        v >= 0 ? 'Net profit' : 'Net loss',
                      ]}
                      contentStyle={tooltipStyle}
                    />
                    <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                      {analytics.byMonth.map((row) => (
                        <Cell
                          key={row.month}
                          fill={row.profit >= 0 ? '#16A34A' : '#DC2626'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Profit vs Loss" subtitle="How wins and losses stack up">
              <div className="space-y-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Winning sales
                    </p>
                    <p className="mt-1 text-2xl font-bold text-profit">
                      {formatCurrency(analytics.winTotal)}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {analytics.winCount} sale{analytics.winCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Losing sales
                    </p>
                    <p className="mt-1 text-2xl font-bold text-loss">
                      −{formatCurrency(analytics.lossTotal)}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {analytics.lossCount} sale{analytics.lossCount === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                {analytics.winTotal + analytics.lossTotal > 0 ? (
                  <div
                    className="flex h-3 overflow-hidden rounded-full bg-surface"
                    role="img"
                    aria-label="Profit versus loss share"
                  >
                    {analytics.winTotal > 0 && (
                      <div
                        className="bg-profit transition-all"
                        style={{
                          width: `${(analytics.winTotal / (analytics.winTotal + analytics.lossTotal)) * 100}%`,
                        }}
                      />
                    )}
                    {analytics.lossTotal > 0 && (
                      <div
                        className="bg-loss transition-all"
                        style={{
                          width: `${(analytics.lossTotal / (analytics.winTotal + analytics.lossTotal)) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="h-3 rounded-full bg-surface" />
                )}

                <div className="rounded-xl border border-border bg-surface px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-ink-secondary">Net result</span>
                    <ProfitDisplay value={analytics.totalProfit} size="md" />
                  </div>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Revenue by Month" subtitle="Gross sale amounts">
              {analytics.byMonth.length === 0 ? (
                <ChartEmpty />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.byMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}`} width={48} />
                      <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} contentStyle={tooltipStyle} />
                      <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Money Invested" subtitle="Purchase spend by month">
              {analytics.investedByMonth.length === 0 ? (
                <ChartEmpty />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.investedByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}`} width={48} />
                      <Tooltip formatter={(v: number) => [formatCurrency(v), 'Invested']} contentStyle={tooltipStyle} />
                      <Bar dataKey="amount" fill="#0F172A" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>

            <ChartCard title="Sales by Platform" subtitle="Where your sales land">
              {analytics.byPlatform.length === 0 ? (
                <ChartEmpty />
              ) : (
                <div className="flex h-64 items-center gap-4">
                  <div className="h-full min-w-0 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.byPlatform}
                          dataKey="count"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={2}
                        >
                          {analytics.byPlatform.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="shrink-0 space-y-2 text-sm">
                    {analytics.byPlatform.map((p, i) => (
                      <li key={p.name} className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="text-ink-secondary">{p.name}</span>
                        <span className="font-semibold text-ink">{p.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </ChartCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <PerformerList
              title="Best Performing"
              subtitle="Highest ROI sales"
              items={analytics.best}
              empty="No sold items yet"
            />
            <PerformerList
              title="Worst Performing"
              subtitle="Lowest ROI sales"
              items={analytics.worst}
              empty="No sold items yet"
            />
          </div>
        </>
      )}

      <ChartCard title="Inventory by Category" subtitle="Active (unsold) stock mix">
        {analytics.byCategory.length === 0 ? (
          <ChartEmpty message="No active inventory categorized yet." />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.byCategory} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#6B7280" radius={[0, 6, 6, 0]} name="Items" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  )
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E5E7EB',
  boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-border bg-surface-elevated p-5 shadow-[var(--shadow-card)]">
      <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
      <p className="mb-4 text-sm text-ink-muted">{subtitle}</p>
      {children}
    </section>
  )
}

function ChartEmpty({ message = 'Not enough data for this chart yet.' }: { message?: string }) {
  return (
    <div className="flex h-48 items-center justify-center text-sm text-ink-muted">{message}</div>
  )
}

function PerformerList({
  title,
  subtitle,
  items,
  empty,
}: {
  title: string
  subtitle: string
  items: { product: { id: string; name: string; image_url: string | null }; roi: number; profit: number }[]
  empty: string
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-border bg-surface-elevated p-5 shadow-[var(--shadow-card)]">
      <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
      <p className="mb-4 text-sm text-ink-muted">{subtitle}</p>
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map(({ product, roi, profit }) => (
            <li key={product.id}>
              <Link
                to={`/inventory/${product.id}`}
                className="flex items-center gap-3 py-3 transition-colors hover:bg-surface/80"
              >
                <ProductImage src={product.image_url} alt="" className="h-10 w-10 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{product.name}</p>
                  <p className="text-xs text-ink-muted">{formatCurrency(profit)} profit</p>
                </div>
                <ProfitDisplay value={roi} asPercent size="sm" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
