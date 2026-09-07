import type { ReactNode } from 'react'
import { PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
  icon?: ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-surface-elevated px-6 py-16 text-center animate-fade-in">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-ink-muted">
        {icon ?? <PackageOpen className="h-7 w-7" />}
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-secondary">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
