import { Link } from 'react-router-dom'
import { ImageIcon, MoreHorizontal, Pencil, Trash2, Eye, CircleDollarSign } from 'lucide-react'
import type { Product } from '@/types'
import { StatusBadge } from '@/components/StatusBadge'
import { ProfitDisplay } from '@/components/StatCard'
import { formatCurrency, formatDate, cn } from '@/utils/format'
import { getProductNetProfit, getProductRoi } from '@/utils/calculations'
import { useEffect, useRef, useState } from 'react'

interface ProductImageProps {
  src: string | null
  alt: string
  className?: string
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
  if (!src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-surface text-ink-muted',
          className
        )}
      >
        <ImageIcon className="h-5 w-5" />
      </div>
    )
  }
  return <img src={src} alt={alt} className={cn('object-cover', className)} />
}

interface ProductCardProps {
  product: Product
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
  onMarkSold: (p: Product) => void
}

export function ProductCard({ product, onEdit, onDelete, onMarkSold }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-elevated shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <Link to={`/inventory/${product.id}`} className="block">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="aspect-[4/3] w-full"
        />
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/inventory/${product.id}`}
              className="block truncate font-semibold text-ink hover:text-brand-accent"
            >
              {product.name}
            </Link>
            <p className="mt-0.5 truncate text-xs text-ink-muted">
              {product.category || 'Uncategorized'} · {formatDate(product.purchase_date)}
            </p>
          </div>
          <StatusBadge status={product.status} />
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-ink-muted">Cost</p>
            <p className="font-semibold text-ink">{formatCurrency(product.purchase_price)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-muted">
              {product.status === 'sold' ? 'Sold value' : 'Est. value'}
            </p>
            {product.status === 'sold' ? (
              <p className="font-semibold text-ink">
                {product.sold_price != null ? formatCurrency(product.sold_price) : '—'}
              </p>
            ) : (
              <p className="font-semibold text-ink">
                {product.estimated_value != null
                  ? formatCurrency(product.estimated_value)
                  : '—'}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2 border-t border-border pt-3">
          <Link
            to={`/inventory/${product.id}`}
            className="focus-ring flex-1 rounded-lg py-2 text-center text-xs font-semibold text-ink-secondary hover:bg-surface"
          >
            View
          </Link>
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="focus-ring flex-1 rounded-lg py-2 text-xs font-semibold text-ink-secondary hover:bg-surface"
          >
            Edit
          </button>
          {product.status !== 'sold' && (
            <button
              type="button"
              onClick={() => onMarkSold(product)}
              className="focus-ring flex-1 rounded-lg py-2 text-xs font-semibold text-profit hover:bg-profit-soft"
            >
              Sold
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="focus-ring rounded-lg px-2 py-2 text-ink-muted hover:bg-loss-soft hover:text-loss"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  )
}

interface ProductTableProps {
  products: Product[]
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
  onMarkSold: (p: Product) => void
}

function RowActions({
  product,
  onEdit,
  onDelete,
  onMarkSold,
}: {
  product: Product
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
  onMarkSold: (p: Product) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="focus-ring rounded-lg p-1.5 text-ink-muted hover:bg-surface hover:text-ink"
        aria-label="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-surface-elevated py-1 shadow-lg">
          <Link
            to={`/inventory/${product.id}`}
            className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface"
            onClick={() => setOpen(false)}
          >
            <Eye className="h-3.5 w-3.5" /> View
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface"
            onClick={() => {
              setOpen(false)
              onEdit(product)
            }}
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          {product.status !== 'sold' && (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-profit hover:bg-profit-soft"
              onClick={() => {
                setOpen(false)
                onMarkSold(product)
              }}
            >
              <CircleDollarSign className="h-3.5 w-3.5" /> Mark Sold
            </button>
          )}
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-loss hover:bg-loss-soft"
            onClick={() => {
              setOpen(false)
              onDelete(product)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

export function ProductTable({ products, onEdit, onDelete, onMarkSold }: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-elevated shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/80 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Cost</th>
              <th className="px-4 py-3 font-semibold">Value</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-border last:border-0 transition-colors hover:bg-surface/60"
              >
                <td className="px-4 py-3">
                  <Link to={`/inventory/${product.id}`} className="flex items-center gap-3 group">
                    <ProductImage
                      src={product.image_url}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg"
                    />
                    <span className="font-medium text-ink group-hover:text-brand-accent">
                      {product.name}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-secondary">
                  {product.category || '—'}
                </td>
                <td className="px-4 py-3 font-medium text-ink">
                  {formatCurrency(product.purchase_price)}
                </td>
                <td className="px-4 py-3 text-ink">
                  {product.status === 'sold' && product.sold_price != null ? (
                    <div className="flex flex-col">
                      <span>{formatCurrency(product.sold_price)}</span>
                      <ProfitDisplay value={getProductRoi(product)} asPercent size="sm" />
                    </div>
                  ) : product.estimated_value != null ? (
                    formatCurrency(product.estimated_value)
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={product.status} />
                </td>
                <td className="px-4 py-3 text-ink-secondary">
                  {formatDate(product.purchase_date)}
                </td>
                <td className="px-4 py-3 text-right">
                  <RowActions
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMarkSold={onMarkSold}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface ActivityRowProps {
  product: Product
}

export function ActivityRow({ product }: ActivityRowProps) {
  const profit = getProductNetProfit(product)
  const displayValue =
    product.status === 'sold' && product.sold_price != null
      ? product.sold_price
      : product.estimated_value

  return (
    <Link
      to={`/inventory/${product.id}`}
      className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-surface sm:gap-4"
    >
      <ProductImage
        src={product.image_url}
        alt=""
        className="h-11 w-11 shrink-0 rounded-lg"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{product.name}</p>
        <p className="text-xs text-ink-muted">
          {formatCurrency(product.purchase_price)} ·{' '}
          {formatDate(product.status === 'sold' ? product.sold_date : product.purchase_date)}
        </p>
      </div>
      <StatusBadge status={product.status} className="hidden sm:inline-flex" />
      <div className="text-right">
        <p className="text-sm font-medium text-ink">
          {displayValue != null ? formatCurrency(displayValue) : '—'}
        </p>
        {product.status === 'sold' && <ProfitDisplay value={profit} size="sm" />}
      </div>
    </Link>
  )
}
