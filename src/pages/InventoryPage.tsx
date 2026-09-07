import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, AddItemButton } from '@/components/PageHeader'
import { SearchInput, FilterDropdown } from '@/components/SearchInput'
import { ProductCard, ProductTable } from '@/components/ProductCard'
import { EmptyState } from '@/components/EmptyState'
import { ConfirmModal } from '@/components/ConfirmModal'
import { MarkSoldModal } from '@/components/MarkSoldModal'
import { TableSkeleton } from '@/components/LoadingSkeleton'
import { useProducts } from '@/hooks/useProducts'
import { deleteProduct, markProductSold } from '@/services/products'
import { getProductRoi } from '@/utils/calculations'
import type { MarkSoldFormData, Product, SortOption, StatusFilter } from '@/types'

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'listed', label: 'Listed' },
  { value: 'pending', label: 'Pending Sale' },
  { value: 'sold', label: 'Sold' },
  { value: 'returned', label: 'Returned' },
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'highest_cost', label: 'Highest Cost' },
  { value: 'lowest_cost', label: 'Lowest Cost' },
  { value: 'highest_estimated', label: 'Highest Value' },
  { value: 'highest_roi', label: 'Highest ROI' },
]

function sortProducts(list: Product[], sort: SortOption): Product[] {
  const arr = [...list]
  switch (sort) {
    case 'oldest':
      return arr.sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
    case 'highest_cost':
      return arr.sort((a, b) => Number(b.purchase_price) - Number(a.purchase_price))
    case 'lowest_cost':
      return arr.sort((a, b) => Number(a.purchase_price) - Number(b.purchase_price))
    case 'highest_estimated':
      return arr.sort((a, b) => {
        const av =
          a.status === 'sold' ? Number(a.sold_price ?? 0) : Number(a.estimated_value ?? 0)
        const bv =
          b.status === 'sold' ? Number(b.sold_price ?? 0) : Number(b.estimated_value ?? 0)
        return bv - av
      })
    case 'highest_roi':
      return arr.sort((a, b) => (getProductRoi(b) ?? -Infinity) - (getProductRoi(a) ?? -Infinity))
    case 'recent':
    default:
      return arr.sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
  }
}

export function InventoryPage() {
  const navigate = useNavigate()
  const { products, loading, refresh } = useProducts()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<SortOption>('recent')
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [soldTarget, setSoldTarget] = useState<Product | null>(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    let list = products
    if (status !== 'all') list = list.filter((p) => p.status === status)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category ?? '').toLowerCase().includes(q) ||
          (p.platform ?? '').toLowerCase().includes(q)
      )
    }
    return sortProducts(list, sort)
  }, [products, status, search, sort])

  async function handleDelete() {
    if (!deleteTarget || busy) return
    setBusy(true)
    try {
      await deleteProduct(deleteTarget.id)
      toast.success('Item deleted')
      setDeleteTarget(null)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleMarkSold(data: MarkSoldFormData) {
    if (!soldTarget || busy) return
    setBusy(true)
    try {
      await markProductSold(soldTarget.id, data)
      toast.success('Item marked as sold')
      setSoldTarget(null)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not mark as sold')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Inventory"
        description="Search, filter, and manage your flips."
        action={<AddItemButton className="hidden sm:inline-flex" />}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search products…"
          className="sm:col-span-1"
        />
        <FilterDropdown
          label="Filter by status"
          value={status}
          onChange={(v) => setStatus(v as StatusFilter)}
          options={STATUS_FILTERS}
        />
        <FilterDropdown
          label="Sort"
          value={sort}
          onChange={(v) => setSort(v as SortOption)}
          options={SORT_OPTIONS}
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={products.length === 0 ? 'Start tracking your flips.' : 'No items match'}
          description={
            products.length === 0
              ? 'Add your first item to see your inventory, profit, and ROI all in one place.'
              : 'Try adjusting your search or filters.'
          }
          action={products.length === 0 ? <AddItemButton label="Add Your First Item" /> : undefined}
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <ProductTable
              products={filtered}
              onEdit={(p) => navigate(`/inventory/${p.id}/edit`)}
              onDelete={setDeleteTarget}
              onMarkSold={setSoldTarget}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={(item) => navigate(`/inventory/${item.id}/edit`)}
                onDelete={setDeleteTarget}
                onMarkSold={setSoldTarget}
              />
            ))}
          </div>
        </>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this item?"
        description="This action cannot be undone. The product and its sale history will be permanently removed."
        confirmLabel="Delete Item"
        danger
        loading={busy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      <MarkSoldModal
        open={!!soldTarget}
        product={soldTarget}
        loading={busy}
        onClose={() => setSoldTarget(null)}
        onConfirm={handleMarkSold}
      />
    </div>
  )
}
