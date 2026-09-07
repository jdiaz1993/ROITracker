import { format, parseISO, isValid } from 'date-fns'

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '$0.00'
  const abs = Math.abs(value)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs)
  if (value < 0) return `-${formatted}`
  return formatted
}

export function formatCurrencySigned(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '$0.00'
  const formatted = formatCurrency(Math.abs(value))
  if (value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted.replace('-', '')}`
  return formatted
}

export function formatPercent(value: number | null | undefined, signed = false): string {
  if (value == null || Number.isNaN(value)) return '0%'
  const rounded = Math.round(value * 10) / 10
  const str = `${Math.abs(rounded).toFixed(1)}%`
  if (signed) {
    if (rounded > 0) return `+${str}`
    if (rounded < 0) return `-${str}`
  }
  if (rounded < 0) return `-${str}`
  return str
}

export function formatDate(date: string | null | undefined, pattern = 'MMM d, yyyy'): string {
  if (!date) return '—'
  try {
    const parsed = parseISO(date)
    if (!isValid(parsed)) return '—'
    return format(parsed, pattern)
  } catch {
    return '—'
  }
}

export function formatShortDate(date: string | null | undefined): string {
  return formatDate(date, 'MMM d')
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
