import type { ProductStatus } from '@/types'
import { cn } from '@/utils/format'

const STATUS_STYLES: Record<ProductStatus, string> = {
  inventory: 'bg-inventory-soft text-inventory',
  listed: 'bg-listed-soft text-listed',
  pending: 'bg-pending-soft text-pending',
  sold: 'bg-profit-soft text-profit',
  returned: 'bg-returned-soft text-returned',
}

const STATUS_LABELS: Record<ProductStatus, string> = {
  inventory: 'Inventory',
  listed: 'Listed',
  pending: 'Pending',
  sold: 'Sold',
  returned: 'Returned',
}

interface StatusBadgeProps {
  status: ProductStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
