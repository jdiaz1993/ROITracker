import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/layout/Sidebar'
import { Button } from '@/components/PageHeader'
import { cn } from '@/utils/format'

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(37,99,235,0.12), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(22,163,74,0.08), transparent)',
        }}
      />
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-1 text-sm text-ink-secondary">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

const fieldClass =
  'focus-ring w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted'
const labelClass = 'mb-1.5 block text-sm font-medium text-ink'

export function LoginPage() {
  const { signIn, resetPassword, continueAsGuest } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      if (resetMode) {
        await resetPassword(email)
        toast.success('Password reset email sent')
        setResetMode(false)
      } else {
        await signIn(email, password)
        toast.success('Welcome back')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  function handleGuest() {
    continueAsGuest()
    navigate('/dashboard')
  }

  return (
    <AuthShell
      title={resetMode ? 'Reset password' : 'Sign in'}
      subtitle={
        resetMode
          ? 'Enter your email and we’ll send a reset link.'
          : 'Track inventory, profit, and ROI in one place.'
      }
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        {!resetMode && (
          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              className={fieldClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        )}
        <Button type="submit" loading={loading} className="w-full">
          {resetMode ? 'Send Reset Link' : 'Sign In'}
        </Button>
      </form>

      {!resetMode && (
        <div className="mt-3">
          <Button type="button" variant="secondary" className="w-full" onClick={handleGuest}>
            Continue as Guest
          </Button>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 text-center text-sm">
        {!resetMode && (
          <button
            type="button"
            onClick={() => setResetMode(true)}
            className="text-ink-secondary hover:text-brand-accent"
          >
            Forgot Password?
          </button>
        )}
        {resetMode && (
          <button
            type="button"
            onClick={() => setResetMode(false)}
            className="text-ink-secondary hover:text-brand-accent"
          >
            Back to sign in
          </button>
        )}
        <p className="text-ink-muted">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-brand-accent hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}

export function SignUpPage() {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (loading) return
    setLoading(true)
    try {
      await signUp(fullName, email, password)
      toast.success('Account created — check your email if confirmation is required')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Create account" subtitle="Start tracking your flips in minutes.">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <label htmlFor="fullName" className={labelClass}>
            Name
          </label>
          <input
            id="fullName"
            required
            autoComplete="name"
            className={fieldClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jordan Lee"
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            className={fieldClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>
        <div>
          <label htmlFor="confirm" className={labelClass}>
            Confirm Password
          </label>
          <input
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            className={cn(fieldClass, error && 'border-loss')}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {error && <p className="mt-1 text-xs text-loss">{error}</p>}
        </div>
        <Button type="submit" loading={loading} className="w-full">
          Create Account
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-accent hover:underline">
          Sign In
        </Link>
      </p>
    </AuthShell>
  )
}

export function SetupPage() {
  return (
    <AuthShell
      title="Connect Supabase"
      subtitle="Add your project credentials to start using FlipMargin."
    >
      <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-ink-secondary">
        <li>
          Create a project at{' '}
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand-accent hover:underline"
          >
            supabase.com
          </a>
        </li>
        <li>
          Run <code className="rounded bg-surface px-1.5 py-0.5 text-xs text-ink">supabase_setup.sql</code> in
          the SQL Editor
        </li>
        <li>
          Copy <code className="rounded bg-surface px-1.5 py-0.5 text-xs text-ink">.env.example</code> to{' '}
          <code className="rounded bg-surface px-1.5 py-0.5 text-xs text-ink">.env</code>
        </li>
        <li>
          Set <code className="rounded bg-surface px-1.5 py-0.5 text-xs text-ink">VITE_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-surface px-1.5 py-0.5 text-xs text-ink">VITE_SUPABASE_ANON_KEY</code>
        </li>
        <li>Restart the dev server</li>
      </ol>
    </AuthShell>
  )
}
