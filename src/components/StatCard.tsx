import type { ReactNode } from 'react'
import { cn, formatCurrencySigned, formatPercent } from '@/utils/format'

interface ProfitDisplayProps {
  value: number | null | undefined
  asPercent?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  signed?: boolean
}

const SIZE: Record<NonNullable<ProfitDisplayProps['size']>, string> = {
  sm: 'text-sm font-semibold',
  md: 'text-base font-semibold',
  lg: 'text-2xl font-bold tracking-tight',
  xl: 'text-3xl font-bold tracking-tight',
}

export function ProfitDisplay({
  value,
  asPercent = false,
  size = 'md',
  className,
  signed = true,
}: ProfitDisplayProps) {
  if (value == null) {
    return <span className={cn(SIZE[size], 'text-ink-muted', className)}>—</span>
  }

  const color =
    value > 0 ? 'text-profit' : value < 0 ? 'text-loss' : 'text-ink-secondary'

  const text = asPercent
    ? formatPercent(value, signed)
    : signed
      ? formatCurrencySigned(value)
      : formatCurrencySigned(value).replace(/^\+/, '')

  return <span className={cn(SIZE[size], color, className)}>{text}</span>
}

interface StatCardProps {
  label: string
  value: ReactNode
  secondary?: ReactNode
  icon: ReactNode
  accent?: 'default' | 'profit' | 'loss'
}

export function StatCard({ label, value, secondary, icon, accent = 'default' }: StatCardProps) {
  const accentRing =
    accent === 'profit'
      ? 'ring-profit/10'
      : accent === 'loss'
        ? 'ring-loss/10'
        : 'ring-transparent'

  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] bg-surface-elevated p-5 shadow-[var(--shadow-card)] ring-1 ring-border transition-shadow hover:shadow-[var(--shadow-card-hover)]',
        accentRing
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink-secondary">{label}</p>
          <div className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
            {value}
          </div>
          {secondary && (
            <p className="mt-1.5 text-sm text-ink-muted">{secondary}</p>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-ink-secondary">
          {icon}
        </div>
      </div>
    </div>
  )
}
