import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { cn } from '@/utils/format'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-ink-secondary sm:text-base">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

interface AddItemButtonProps {
  className?: string
  label?: string
}

export function AddItemButton({ className, label = 'Add Item' }: AddItemButtonProps) {
  return (
    <Link
      to="/inventory/new"
      className={cn(
        'focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md active:scale-[0.98]',
        className
      )}
    >
      <Plus className="h-4 w-4" />
      {label}
    </Link>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  loading,
  className,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const styles = {
    primary:
      'bg-brand text-white hover:bg-slate-800 shadow-sm hover:shadow-md',
    secondary:
      'bg-surface-elevated text-ink border border-border hover:border-border-strong hover:bg-surface',
    ghost: 'text-ink-secondary hover:bg-surface hover:text-ink',
    danger: 'bg-loss text-white hover:bg-red-700',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        styles[variant],
        className
      )}
      {...props}
    >
      {loading ? 'Please wait…' : children}
    </button>
  )
}
