import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'

interface AuthContextType {
    session: Session | null
    user: User | null
    profile: Profile | null
    loading: boolean
    isSuperAdmin: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    isSuperAdmin: false,
    signOut: async () => { }
})

export const useAuth = () => {
    return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<Profile | null>(() => {
        // Optimistic load from local cache
        const saved = localStorage.getItem('9m2pju_user_profile')
        if (saved) {
            try {
                return JSON.parse(saved)
            } catch (e) {
                return null
            }
        }
        return null
    })
    const [loading, setLoading] = useState(true)
    const mounted = useRef(true)

    // Robust sign out function that clears everything immediately
    const signOut = useCallback(async () => {
        try {
            // Optimistically clear local state immediately
            if (mounted.current) {
                setSession(null)
                setUser(null)
                setProfile(null)
                setLoading(false)
            }

            // Clear all local storage
            localStorage.clear()
            sessionStorage.clear()

            // Attempt Supabase sign out
            const { error } = await supabase.auth.signOut()
            if (error) throw error

        } catch (error) {
            console.error('Error signing out:', error)
            // Force clear if something went wrong
            localStorage.clear()
            sessionStorage.clear()
        }
    }, [])

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (!mounted.current) return

            if (error) {
                console.error('Error fetching profile:', error)
                setProfile(null)
                return
            }

            if (data) {
                setProfile(data)
                localStorage.setItem('9m2pju_user_profile', JSON.stringify(data))
            } else {
                setProfile(null)
                localStorage.removeItem('9m2pju_user_profile')
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err)
            if (mounted.current) setProfile(null)
        }
    }, [])

    useEffect(() => {
        mounted.current = true
        console.log('AuthContext: Initializing...')

        // Safety timeout
        const loadingTimeout = setTimeout(() => {
            if (mounted.current && loading) {
                console.warn('AuthContext: Loading timeout reached, forcing completion')
                setLoading(false)
            }
        }, 10000)

        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (!mounted.current) return

                if (error) {
                    console.error('AuthContext: Error getting session', error)
                    if (error.message.includes('JWT') || error.status === 401 || error.status === 400) {
                        await signOut()
                    }
                    setLoading(false)
                    return
                }

                if (session) {
                    setSession(session)
                    setUser(session.user)
                    await fetchProfile(session.user.id)
                }
            } catch (err) {
                console.error('AuthContext: Unexpected error during init', err)
            } finally {
                if (mounted.current) {
                    setLoading(false)
                }
            }
        }

        initAuth()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('AuthContext: Auth event:', event)
            if (!mounted.current) return

            if (event === 'SIGNED_OUT') {
                setSession(null)
                setUser(null)
                setProfile(null)
                localStorage.removeItem('9m2pju_user_profile')
                setLoading(false)
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                setSession(session)
                setUser(session?.user ?? null)
                if (session?.user) {
                    await fetchProfile(session.user.id)
                }
                setLoading(false)
            }
        })

        return () => {
            mounted.current = false
            subscription.unsubscribe()
            clearTimeout(loadingTimeout)
        }
    }, [fetchProfile, signOut]) // Added signOut to dependencies as it is now stable via useCallback

    const value = {
        session,
        user,
        profile,
        loading,
        isSuperAdmin: profile?.is_super_admin || false,
        signOut
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
