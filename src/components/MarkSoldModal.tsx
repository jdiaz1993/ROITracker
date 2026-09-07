import { useEffect, useState, type FormEvent } from 'react'
import type { MarkSoldFormData, Product } from '@/types'
import { ModalShell } from '@/components/ConfirmModal'
import { Button } from '@/components/PageHeader'
import { ProfitDisplay } from '@/components/StatCard'
import { calcNetProfit, calcRoi } from '@/utils/calculations'
import { formatCurrency, todayISO, cn } from '@/utils/format'

interface MarkSoldModalProps {
  open: boolean
  product: Product | null
  loading?: boolean
  onClose: () => void
  onConfirm: (data: MarkSoldFormData) => Promise<void>
}

export function MarkSoldModal({
  open,
  product,
  loading = false,
  onClose,
  onConfirm,
}: MarkSoldModalProps) {
  const [form, setForm] = useState<MarkSoldFormData>({
    sold_price: '',
    sold_date: todayISO(),
    selling_fees: '0',
    shipping_cost: '0',
    other_costs: '0',
    buyer: '',
  })
  const [errors, setErrors] = useState<{ sold_price?: string; sold_date?: string }>({})

  const productId = product?.id
  const estimated = product?.estimated_value

  useEffect(() => {
    if (!productId) return
    setForm({
      sold_price: estimated != null ? String(estimated) : '',
      sold_date: todayISO(),
      selling_fees: '0',
      shipping_cost: '0',
      other_costs: '0',
      buyer: '',
    })
    setErrors({})
  }, [productId, estimated])

  const soldPrice = parseFloat(form.sold_price) || 0
  const fees = parseFloat(form.selling_fees) || 0
  const shipping = parseFloat(form.shipping_cost) || 0
  const other = parseFloat(form.other_costs) || 0
  const purchase = product?.purchase_price ?? 0
  const netProfit = calcNetProfit(soldPrice, purchase, fees, shipping, other)
  const roi = calcRoi(netProfit, purchase)

  function setField<K extends keyof MarkSoldFormData>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!form.sold_price.trim() || Number.isNaN(parseFloat(form.sold_price))) {
      next.sold_price = 'Sold price is required'
    }
    if (!form.sold_date) next.sold_date = 'Sale date is required'
    setErrors(next)
    if (Object.keys(next).length > 0 || loading) return
    await onConfirm(form)
  }

  const fieldClass =
    'focus-ring w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-ink'
  const labelClass = 'mb-1.5 block text-sm font-medium text-ink'

  return (
    <ModalShell open={open && !!product} title="Mark Item as Sold" onClose={onClose}>
      {product && (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
          <p className="text-sm text-ink-secondary">
            Recording sale for <span className="font-semibold text-ink">{product.name}</span>
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
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
            <div>
              <label htmlFor="sold_date" className={labelClass}>
                Sale Date <span className="text-loss">*</span>
              </label>
              <input
                id="sold_date"
                type="date"
                className={cn(fieldClass, errors.sold_date && 'border-loss')}
                value={form.sold_date}
                onChange={(e) => setField('sold_date', e.target.value)}
              />
              {errors.sold_date && (
                <p className="mt-1 text-xs text-loss">{errors.sold_date}</p>
              )}
            </div>
            <div>
              <label htmlFor="selling_fees" className={labelClass}>
                Selling Fees
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-ink-muted">
                  $
                </span>
                <input
                  id="selling_fees"
                  inputMode="decimal"
                  className={cn(fieldClass, 'pl-7')}
                  value={form.selling_fees}
                  onChange={(e) => setField('selling_fees', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="shipping_cost" className={labelClass}>
                Shipping Cost
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-ink-muted">
                  $
                </span>
                <input
                  id="shipping_cost"
                  inputMode="decimal"
                  className={cn(fieldClass, 'pl-7')}
                  value={form.shipping_cost}
                  onChange={(e) => setField('shipping_cost', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="other_costs" className={labelClass}>
                Other Costs
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-ink-muted">
                  $
                </span>
                <input
                  id="other_costs"
                  inputMode="decimal"
                  className={cn(fieldClass, 'pl-7')}
                  value={form.other_costs}
                  onChange={(e) => setField('other_costs', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="buyer" className={labelClass}>
                Buyer / Customer
              </label>
              <input
                id="buyer"
                className={fieldClass}
                value={form.buyer}
                onChange={(e) => setField('buyer', e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Live calculation
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Purchase Price</dt>
                <dd className="font-medium text-ink">{formatCurrency(purchase)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Sold Value</dt>
                <dd className="font-medium text-ink">{formatCurrency(soldPrice)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Fees</dt>
                <dd className="font-medium text-loss">−{formatCurrency(fees)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Shipping</dt>
                <dd className="font-medium text-loss">−{formatCurrency(shipping)}</dd>
              </div>
              {other > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-secondary">Other</dt>
                  <dd className="font-medium text-loss">−{formatCurrency(other)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <dt className="font-semibold text-ink">Net Profit</dt>
                <dd>
                  <ProfitDisplay value={netProfit} size="lg" />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">ROI</dt>
                <dd>
                  <ProfitDisplay value={roi} asPercent size="md" />
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Confirm Sale
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  )
}
