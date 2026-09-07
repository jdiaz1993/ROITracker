import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft, Pencil, Trash2, CircleDollarSign } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  createProduct,
  updateProduct,
  fetchProduct,
  deleteProduct,
  markProductSold,
} from '@/services/products'
import { ProductForm, emptyProductForm, productToForm } from '@/components/ProductForm'
import { ProductImage } from '@/components/ProductCard'
import { StatusBadge } from '@/components/StatusBadge'
import { ProfitDisplay } from '@/components/StatCard'
import { Button } from '@/components/PageHeader'
import { ConfirmModal } from '@/components/ConfirmModal'
import { MarkSoldModal } from '@/components/MarkSoldModal'
import { Skeleton } from '@/components/LoadingSkeleton'
import type { MarkSoldFormData, Product, ProductFormData } from '@/types'
import {
  calcPotentialProfit,
  calcPotentialRoi,
  getProductNetProfit,
  getProductRoi,
} from '@/utils/calculations'
import { formatCurrency, formatDate } from '@/utils/format'

export function AddProductPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  async function handleSubmit(data: ProductFormData) {
    if (!user) return
    try {
      const product = await createProduct(data, user.id)
      toast.success('Item created')
      navigate(`/inventory/${product.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create item')
    }
  }

  return (
    <div className="animate-fade-in mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Add Item</h1>
      <p className="mt-1 text-sm text-ink-secondary">Log a new purchase for resale.</p>
      <div className="mt-6 rounded-[var(--radius-card)] border border-border bg-surface-elevated p-5 shadow-[var(--shadow-card)] sm:p-6">
        <ProductForm
          initial={emptyProductForm()}
          submitLabel="Save Item"
          onSubmit={handleSubmit}
          onCancel={() => navigate('/inventory')}
        />
      </div>
    </div>
  )
}

export function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchProduct(id)
      .then(setProduct)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(data: ProductFormData) {
    if (!id) return
    try {
      await updateProduct(id, data)
      toast.success('Item updated')
      navigate(`/inventory/${id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update item')
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!product) {
    return <p className="text-ink-secondary">Product not found.</p>
  }

  return (
    <div className="animate-fade-in mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => navigate(`/inventory/${id}`)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Edit Item</h1>
      <p className="mt-1 text-sm text-ink-secondary">Update details for {product.name}.</p>
      <div className="mt-6 rounded-[var(--radius-card)] border border-border bg-surface-elevated p-5 shadow-[var(--shadow-card)] sm:p-6">
        <ProductForm
          initial={productToForm(product)}
          submitLabel="Save Changes"
          allowSoldStatus={product.status === 'sold'}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/inventory/${id}`)}
        />
      </div>
    </div>
  )
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [soldOpen, setSoldOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function load() {
    if (!id) return
    setLoading(true)
    try {
      setProduct(await fetchProduct(id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleDelete() {
    if (!id || busy) return
    setBusy(true)
    try {
      await deleteProduct(id)
      toast.success('Item deleted')
      navigate('/inventory')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleMarkSold(data: MarkSoldFormData) {
    if (!id || busy) return
    setBusy(true)
    try {
      const updated = await markProductSold(id, data)
      setProduct(updated)
      setSoldOpen(false)
      toast.success('Item marked as sold')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not mark as sold')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="aspect-[16/9] w-full max-w-xl rounded-2xl" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  if (!product) {
    return <p className="text-ink-secondary">Product not found.</p>
  }

  const isSold = product.status === 'sold'
  const potentialProfit = calcPotentialProfit(product.estimated_value, product.purchase_price)
  const potentialRoi = calcPotentialRoi(product.estimated_value, product.purchase_price)
  const netProfit = getProductNetProfit(product)
  const roi = getProductRoi(product)

  return (
    <div className="animate-fade-in">
      <button
        type="button"
        onClick={() => navigate('/inventory')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Inventory
      </button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="aspect-[4/3] w-full rounded-2xl border border-border"
        />

        <div>
          <div className="flex flex-wrap items-start gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {product.name}
            </h1>
            <StatusBadge status={product.status} />
          </div>
          {product.category && (
            <p className="mt-1 text-sm text-ink-muted">{product.category}</p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Metric label="Purchase Price" value={formatCurrency(product.purchase_price)} />
            {isSold ? (
              <>
                <Metric label="Sold Value" value={formatCurrency(product.sold_price)} />
                <Metric
                  label="Net Profit"
                  value={<ProfitDisplay value={netProfit} size="lg" />}
                />
                <Metric label="ROI" value={<ProfitDisplay value={roi} asPercent size="lg" />} />
              </>
            ) : (
              <>
                <Metric
                  label="Estimated Value"
                  value={
                    product.estimated_value != null
                      ? formatCurrency(product.estimated_value)
                      : '—'
                  }
                />
                <Metric
                  label="Potential Profit"
                  value={<ProfitDisplay value={potentialProfit} size="lg" />}
                />
                <Metric
                  label="Potential ROI"
                  value={<ProfitDisplay value={potentialRoi} asPercent size="lg" />}
                />
              </>
            )}
          </div>

          <dl className="mt-6 space-y-2 text-sm">
            <InfoRow label="Purchase Date" value={formatDate(product.purchase_date)} />
            <InfoRow label="Platform" value={product.platform || '—'} />
            <InfoRow label="Quantity" value={String(product.quantity)} />
            {isSold && (
              <>
                <InfoRow label="Sale Date" value={formatDate(product.sold_date)} />
                <InfoRow label="Fees" value={formatCurrency(product.selling_fees)} />
                <InfoRow label="Shipping" value={formatCurrency(product.shipping_cost)} />
                <InfoRow label="Other Costs" value={formatCurrency(product.other_costs)} />
                {product.buyer && <InfoRow label="Buyer" value={product.buyer} />}
              </>
            )}
          </dl>

          {product.description && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-ink">Description</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}
          {product.notes && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-ink">Notes</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary whitespace-pre-wrap">
                {product.notes}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            <Button onClick={() => navigate(`/inventory/${product.id}/edit`)}>
              <Pencil className="h-4 w-4" /> Edit Item
            </Button>
            {!isSold && (
              <Button variant="secondary" onClick={() => setSoldOpen(true)}>
                <CircleDollarSign className="h-4 w-4" /> Mark as Sold
              </Button>
            )}
            <Button variant="ghost" onClick={() => setDeleteOpen(true)} className="text-loss hover:bg-loss-soft">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        title="Delete this item?"
        description="This action cannot be undone."
        confirmLabel="Delete Item"
        danger
        loading={busy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteOpen(false)}
      />
      <MarkSoldModal
        open={soldOpen}
        product={product}
        loading={busy}
        onClose={() => setSoldOpen(false)}
        onConfirm={handleMarkSold}
      />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <div className="mt-1 text-lg font-semibold text-ink">{value}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink text-right">{value}</dd>
    </div>
  )
}
