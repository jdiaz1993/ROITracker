import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { ALLOW_GUEST, GUEST_USER_ID, setUsingGuestData } from '@/lib/guest'
import { fetchProfile } from '@/services/products'
import type { Profile } from '@/types'

function createGuestUser(): User {
  return {
    id: GUEST_USER_ID,
    email: 'guest@local',
    app_metadata: {},
    user_metadata: { full_name: 'Guest' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User
}

const guestProfile: Profile = {
  id: GUEST_USER_ID,
  full_name: 'Guest',
  email: 'guest@local',
  created_at: new Date().toISOString(),
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  configured: boolean
  isGuest: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (fullName: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  continueAsGuest: () => void
  resetPassword: (email: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(ALLOW_GUEST ? createGuestUser() : null)
  const [profile, setProfile] = useState<Profile | null>(ALLOW_GUEST ? guestProfile : null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(ALLOW_GUEST)

  const applyGuest = useCallback(() => {
    setUsingGuestData(true)
    setIsGuest(true)
    setSession(null)
    setUser(createGuestUser())
    setProfile(guestProfile)
  }, [])

  const loadProfile = useCallback(async (uid: string) => {
    try {
      const data = await fetchProfile(uid)
      setProfile(data as Profile | null)
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      if (ALLOW_GUEST) applyGuest()
      setLoading(false)
      return
    }

    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      if (data.session?.user) {
        setUsingGuestData(false)
        setIsGuest(false)
        setSession(data.session)
        setUser(data.session.user)
        void loadProfile(data.session.user.id).finally(() => {
          if (mounted) setLoading(false)
        })
      } else if (ALLOW_GUEST) {
        applyGuest()
        setLoading(false)
      } else {
        setUsingGuestData(false)
        setIsGuest(false)
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (next?.user) {
        setUsingGuestData(false)
        setIsGuest(false)
        setSession(next)
        setUser(next.user)
        void loadProfile(next.user.id)
      } else if (ALLOW_GUEST) {
        applyGuest()
      } else {
        setUsingGuestData(false)
        setIsGuest(false)
        setSession(null)
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [applyGuest, loadProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (isGuest) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [isGuest])

  const continueAsGuest = useCallback(() => {
    applyGuest()
  }, [applyGuest])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    if (error) throw error
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user && !isGuest) await loadProfile(user.id)
  }, [user, isGuest, loadProfile])

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      configured: isSupabaseConfigured || ALLOW_GUEST,
      isGuest,
      signIn,
      signUp,
      signOut,
      continueAsGuest,
      resetPassword,
      refreshProfile,
    }),
    [
      user,
      session,
      profile,
      loading,
      isGuest,
      signIn,
      signUp,
      signOut,
      continueAsGuest,
      resetPassword,
      refreshProfile,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function getFirstName(profile: Profile | null, user: User | null): string {
  const name = profile?.full_name || user?.user_metadata?.full_name || ''
  if (!name) return 'there'
  return String(name).trim().split(/\s+/)[0] || 'there'
}
