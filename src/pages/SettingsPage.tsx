import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Button } from '@/components/PageHeader'
import { useAuth } from '@/contexts/AuthContext'
import { updateProfile } from '@/services/products'

export function SettingsPage() {
  const { user, profile, refreshProfile, signOut, isGuest } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFullName(profile?.full_name ?? '')
  }, [profile?.full_name])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!user || saving || isGuest) return
    setSaving(true)
    try {
      await updateProfile(user.id, fullName)
      await refreshProfile()
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in mx-auto max-w-xl">
      <PageHeader title="Settings" description="Manage your account preferences." />

      {isGuest && (
        <div className="mb-4 rounded-[var(--radius-card)] border border-border bg-surface-elevated p-4 text-sm text-ink-secondary">
          You&apos;re browsing as a guest. Inventory is saved in this browser only.{' '}
          <Link to="/login" className="font-semibold text-brand-accent hover:underline">
            Sign in
          </Link>{' '}
          to sync with your account.
        </div>
      )}

      <form
        onSubmit={(e) => void handleSave(e)}
        className="rounded-[var(--radius-card)] border border-border bg-surface-elevated p-5 shadow-[var(--shadow-card)] sm:p-6"
      >
        <h2 className="font-display text-base font-semibold text-ink">Profile</h2>
        <p className="mt-1 text-sm text-ink-muted">Your name appears on the dashboard greeting.</p>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-ink">
              Full name
            </label>
            <input
              id="fullName"
              className="focus-ring w-full rounded-xl border border-border px-3 py-2.5 text-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              disabled={isGuest}
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink-secondary"
              value={isGuest ? 'Guest' : profile?.email || user?.email || ''}
              disabled
              readOnly
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {!isGuest && (
            <>
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
              <Button type="button" variant="secondary" onClick={() => void signOut()}>
                Sign Out
              </Button>
            </>
          )}
          {isGuest && (
            <Link to="/login">
              <Button type="button">Sign In</Button>
            </Link>
          )}
        </div>
      </form>

      <div className="mt-6 rounded-[var(--radius-card)] border border-border bg-surface-elevated p-5 sm:p-6">
        <h2 className="font-display text-base font-semibold text-ink">About FlipMargin</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          FlipMargin helps resellers track inventory, investment, profit, and ROI in one clean
          workspace. Marketplace integrations, receipt scanning, and team accounts are on the
          roadmap — this MVP focuses on rock-solid inventory and profit tracking.
        </p>
      </div>
    </div>
  )
}
