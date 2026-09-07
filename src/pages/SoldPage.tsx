import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { EmptyState } from '@/components/EmptyState'
import { AddItemButton } from '@/components/PageHeader'
import { ProductImage } from '@/components/ProductCard'
import { ProfitDisplay, StatCard } from '@/components/StatCard'
import { TableSkeleton, StatCardSkeleton } from '@/components/LoadingSkeleton'
import { useProducts } from '@/hooks/useProducts'
import { getProductNetProfit, getProductRoi } from '@/utils/calculations'
import { formatCurrency, formatDate } from '@/utils/format'
import { DollarSign, TrendingUp, Percent, ShoppingBag } from 'lucide-react'

export function SoldPage() {
  const { products, loading } = useProducts()
  const [search, setSearch] = useState('')

  const sold = useMemo(() => {
    let list = products.filter((p) => p.status === 'sold')
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.platform ?? '').toLowerCase().includes(q) ||
          (p.buyer ?? '').toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => {
      const da = a.sold_date ?? a.updated_at
      const db = b.sold_date ?? b.updated_at
      return da > db ? -1 : 1
    })
  }, [products, search])

  const stats = useMemo(() => {
    const allSold = products.filter((p) => p.status === 'sold' && p.sold_price != null)
    const revenue = allSold.reduce((s, p) => s + Number(p.sold_price), 0)
    const profit = allSold.reduce((s, p) => s + (getProductNetProfit(p) ?? 0), 0)
    const avgRoi =
      allSold.length === 0
        ? 0
        : allSold.reduce((s, p) => s + (getProductRoi(p) ?? 0), 0) / allSold.length
    return { revenue, profit, avgRoi, count: allSold.length }
  }, [products])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Sold" description="Completed sales and realized returns." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.revenue)}
          secondary="Gross sale amount"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Total Profit"
          value={<ProfitDisplay value={stats.profit} size="lg" />}
          secondary="After fees & costs"
          icon={<TrendingUp className="h-5 w-5" />}
          accent={stats.profit >= 0 ? 'profit' : 'loss'}
        />
        <StatCard
          label="Average ROI"
          value={<ProfitDisplay value={stats.avgRoi} asPercent size="lg" />}
          secondary="Across completed sales"
          icon={<Percent className="h-5 w-5" />}
        />
        <StatCard
          label="Number of Sales"
          value={String(stats.count)}
          secondary="Items sold"
          icon={<ShoppingBag className="h-5 w-5" />}
        />
      </div>

      <div className="mb-5 max-w-md">
        <SearchInput value={search} onChange={setSearch} placeholder="Search sold items…" />
      </div>

      {stats.count === 0 ? (
        <EmptyState
          title="No sales yet"
          description="When you mark items as sold, they’ll appear here with profit and ROI."
          action={<AddItemButton label="Add an Item" />}
        />
      ) : sold.length === 0 ? (
        <EmptyState title="No matches" description="Try a different search term." />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-elevated shadow-[var(--shadow-card)] lg:block">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/80 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Purchase</th>
                  <th className="px-4 py-3">Sold Value</th>
                  <th className="px-4 py-3">Fees</th>
                  <th className="px-4 py-3">Net Profit</th>
                  <th className="px-4 py-3">ROI</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Platform</th>
                </tr>
              </thead>
              <tbody>
                {sold.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface/60">
                    <td className="px-4 py-3">
                      <Link to={`/inventory/${p.id}`} className="flex items-center gap-3 group">
                        <ProductImage src={p.image_url} alt="" className="h-10 w-10 rounded-lg" />
                        <span className="font-medium text-ink group-hover:text-brand-accent">
                          {p.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatCurrency(p.purchase_price)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(p.sold_price)}</td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {formatCurrency(
                        Number(p.selling_fees) + Number(p.shipping_cost) + Number(p.other_costs)
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ProfitDisplay value={getProductNetProfit(p)} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <ProfitDisplay value={getProductRoi(p)} asPercent size="sm" />
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{formatDate(p.sold_date)}</td>
                    <td className="px-4 py-3 text-ink-secondary">{p.platform || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {sold.map((p) => (
              <Link
                key={p.id}
                to={`/inventory/${p.id}`}
                className="flex gap-3 rounded-[var(--radius-card)] border border-border bg-surface-elevated p-4 shadow-[var(--shadow-card)]"
              >
                <ProductImage src={p.image_url} alt="" className="h-14 w-14 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{p.name}</p>
                  <p className="text-xs text-ink-muted">
                    {formatDate(p.sold_date)} · {p.platform || '—'}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-ink-secondary">
                      {formatCurrency(p.purchase_price)} → {formatCurrency(p.sold_price)}
                    </span>
                    <ProfitDisplay value={getProductNetProfit(p)} size="sm" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
