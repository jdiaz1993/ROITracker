import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ALLOW_GUEST } from '@/lib/guest'
import { Skeleton } from '@/components/LoadingSkeleton'

export function ProtectedRoute() {
  const { user, loading, configured, isGuest } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="w-full max-w-sm space-y-3 px-6">
          <Skeleton className="mx-auto h-10 w-10 rounded-xl" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mx-auto h-4 w-2/3" />
        </div>
      </div>
    )
  }

  if (!configured) {
    return <Navigate to="/setup" replace />
  }

  if (!user && !(ALLOW_GUEST && isGuest)) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { user, loading, configured, isGuest } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
    )
  }

  if (!configured && !ALLOW_GUEST) {
    return <Navigate to="/setup" replace />
  }

  if (user && !isGuest) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
