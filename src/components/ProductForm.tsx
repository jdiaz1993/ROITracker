import { useRef, useState, type FormEvent } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import type { Product, ProductFormData, ProductStatus } from '@/types'
import { PLATFORMS, STATUS_OPTIONS } from '@/types'
import { Button } from '@/components/PageHeader'
import { ProductImage } from '@/components/ProductCard'
import { uploadProductImage } from '@/services/products'
import { useAuth } from '@/contexts/AuthContext'
import { todayISO, cn } from '@/utils/format'
import toast from 'react-hot-toast'

export function emptyProductForm(overrides?: Partial<ProductFormData>): ProductFormData {
  return {
    name: '',
    category: '',
    description: '',
    image_url: '',
    purchase_price: '',
    purchase_date: todayISO(),
    estimated_value: '',
    sold_price: '',
    quantity: '1',
    platform: '',
    status: 'inventory',
    notes: '',
    ...overrides,
  }
}

export function productToForm(product: Product): ProductFormData {
  return {
    name: product.name,
    category: product.category ?? '',
    description: product.description ?? '',
    image_url: product.image_url ?? '',
    purchase_price: String(product.purchase_price),
    purchase_date: product.purchase_date ?? '',
    estimated_value: product.estimated_value != null ? String(product.estimated_value) : '',
    sold_price: product.sold_price != null ? String(product.sold_price) : '',
    quantity: String(product.quantity),
    platform: product.platform ?? '',
    status: product.status === 'sold' ? 'sold' : product.status,
    notes: product.notes ?? '',
  }
}

interface ProductFormProps {
  initial?: ProductFormData
  submitLabel?: string
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
  /** When editing a sold item, keep sold status available */
  allowSoldStatus?: boolean
}

export function ProductForm({
  initial,
  submitLabel = 'Save Item',
  onSubmit,
  onCancel,
  allowSoldStatus = false,
}: ProductFormProps) {
  const { user } = useAuth()
  const [form, setForm] = useState<ProductFormData>(initial ?? emptyProductForm())
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const statusOptions = allowSoldStatus
    ? STATUS_OPTIONS
    : STATUS_OPTIONS.filter((s) => s.value !== 'sold')

  function setField<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const next: Partial<Record<keyof ProductFormData, string>> = {}
    if (!form.name.trim()) next.name = 'Product name is required'
    if (!form.purchase_price.trim()) {
      next.purchase_price = 'Purchase price is required'
    } else if (Number.isNaN(parseFloat(form.purchase_price)) || parseFloat(form.purchase_price) < 0) {
      next.purchase_price = 'Enter a valid purchase price'
    }
    if (form.status === 'sold') {
      if (!form.sold_price.trim()) {
        next.sold_price = 'Sold value is required'
      } else if (Number.isNaN(parseFloat(form.sold_price)) || parseFloat(form.sold_price) < 0) {
        next.sold_price = 'Enter a valid sold value'
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate() || saving) return
    setSaving(true)
    try {
      await onSubmit(form)
    } finally {
      setSaving(false)
    }
  }

  async function handleImage(file: File | undefined) {
    if (!file || !user) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB')
      return
    }
    setUploading(true)
    try {
      const url = await uploadProductImage(user.id, file)
      setField('image_url', url)
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const fieldClass =
    'focus-ring w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted transition-colors hover:border-border-strong'
  const labelClass = 'mb-1.5 block text-sm font-medium text-ink'

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <section>
        <h3 className="font-display text-base font-semibold text-ink">Product Details</h3>
        <p className="mt-1 text-sm text-ink-muted">Basic information about this item.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className={labelClass}>
              Product Name <span className="text-loss">*</span>
            </label>
            <input
              id="name"
              className={cn(fieldClass, errors.name && 'border-loss')}
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="e.g. Nike Dunk Low Panda"
              autoComplete="off"
            />
            {errors.name && <p className="mt-1 text-xs text-loss">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <input
              id="category"
              className={fieldClass}
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
              placeholder="e.g. Sneakers"
            />
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              className={fieldClass}
              value={form.status}
              onChange={(e) => setField('status', e.target.value as ProductStatus)}
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className={cn(fieldClass, 'resize-y')}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Condition, size, notable details…"
            />
          </div>
          <div className="sm:col-span-2">
            <span className={labelClass}>Product Image</span>
            <div className="flex items-center gap-4">
              <ProductImage
                src={form.image_url || null}
                alt=""
                className="h-20 w-20 rounded-xl"
              />
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => void handleImage(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-ink hover:bg-surface disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                  {uploading ? 'Uploading…' : 'Upload image'}
                </button>
                <p className="mt-1 text-xs text-ink-muted">JPG, PNG, or WebP up to 5 MB</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-display text-base font-semibold text-ink">Purchase Information</h3>
        <p className="mt-1 text-sm text-ink-muted">What you paid and when you bought it.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="purchase_price" className={labelClass}>
              Purchase Price <span className="text-loss">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-ink-muted">
                $
              </span>
              <input
                id="purchase_price"
                inputMode="decimal"
                className={cn(fieldClass, 'pl-7', errors.purchase_price && 'border-loss')}
                value={form.purchase_price}
                onChange={(e) => setField('purchase_price', e.target.value)}
                placeholder="0.00"
              />
            </div>
            {errors.purchase_price && (
              <p className="mt-1 text-xs text-loss">{errors.purchase_price}</p>
            )}
          </div>
          <div>
            <label htmlFor="purchase_date" className={labelClass}>
              Purchase Date
            </label>
            <input
              id="purchase_date"
              type="date"
              className={fieldClass}
              value={form.purchase_date}
              onChange={(e) => setField('purchase_date', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="quantity" className={labelClass}>
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              className={fieldClass}
              value={form.quantity}
              onChange={(e) => setField('quantity', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-display text-base font-semibold text-ink">Resale Information</h3>
        <p className="mt-1 text-sm text-ink-muted">
          {form.status === 'sold'
            ? 'Where it sold and what you received.'
            : 'Where you plan to sell this item.'}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {form.status === 'sold' && (
            <div>
              <label htmlFor="sold_price" className={labelClass}>
                Sold Value <span className="text-loss">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-ink-muted">
                  $
                </span>
                <input
                  id="sold_price"
                  inputMode="decimal"
                  className={cn(fieldClass, 'pl-7', errors.sold_price && 'border-loss')}
                  value={form.sold_price}
                  onChange={(e) => setField('sold_price', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {errors.sold_price && (
                <p className="mt-1 text-xs text-loss">{errors.sold_price}</p>
              )}
            </div>
          )}
          <div>
            <label htmlFor="platform" className={labelClass}>
              Selling Platform
            </label>
            <select
              id="platform"
              className={fieldClass}
              value={form.platform}
              onChange={(e) => setField('platform', e.target.value)}
            >
              <option value="">Select platform</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-display text-base font-semibold text-ink">Notes</h3>
        <div className="mt-4">
          <label htmlFor="notes" className="sr-only">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            className={cn(fieldClass, 'resize-y')}
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder="Private notes about this flip…"
          />
        </div>
      </section>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving} disabled={saving || uploading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
