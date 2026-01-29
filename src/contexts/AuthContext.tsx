import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'

interface AuthContextType {
    session: Session | null
    user: User | null
    profile: Profile | null
    loading: boolean
    isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    isSuperAdmin: false
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

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
                // Profile might not exist yet, set to null
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
            setProfile(null)
        }
    }

    useEffect(() => {
        // Initial session check
        console.log('AuthContext: Initializing...')

        // Safety timeout - if loading takes more than 10 seconds, force it to finish
        const loadingTimeout = setTimeout(() => {
            if (loading) {
                console.warn('AuthContext: Loading timeout reached, forcing completion')
                setLoading(false)
            }
        }, 10000)

        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('AuthContext: Error getting session', error)
                    // If we have a JWT error or similar, clear only Supabase keys to fix the loop
                    if (error.message.includes('JWT') || error.status === 401 || error.status === 400) {
                        console.warn('AuthContext: Invalid session detected, clearing stale auth data...')
                        await supabase.auth.signOut()

                        // Targeted cleanup of Supabase keys
                        Object.keys(localStorage).forEach(key => {
                            if (key.includes('supabase.auth.token') || key.startsWith('sb-')) {
                                localStorage.removeItem(key)
                            }
                        })
                    }
                    setLoading(false)
                    return
                }

                setSession(session)
                setUser(session?.user ?? null)
                if (session?.user) {
                    await fetchProfile(session.user.id)
                }
            } catch (err) {
                console.error('AuthContext: Unexpected error during init', err)
            } finally {
                setLoading(false)
                clearTimeout(loadingTimeout)
            }
        }

        initAuth()

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('AuthContext: Auth event:', _event)

            // Critical: Only update if the session has actually changed or if it's a major event
            // This prevents rapid re-renders during the sign-in process
            if (_event === 'SIGNED_OUT') {
                setSession(null)
                setUser(null)
                setProfile(null)
                localStorage.removeItem('9m2pju_user_profile')
                setLoading(false)
            } else if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED' || _event === 'USER_UPDATED') {
                setSession(session)
                setUser(session?.user ?? null)
                if (session?.user) {
                    await fetchProfile(session.user.id)
                }
                setLoading(false)
            } else if (_event === 'INITIAL_SESSION') {
                // Handled by initAuth, but safe to set loading false here too
                setLoading(false)
            }
        })

        return () => {
            subscription.unsubscribe()
            clearTimeout(loadingTimeout)
        }
    }, [])

    const value = {
        session,
        user,
        profile,
        loading,
        isSuperAdmin: profile?.is_super_admin || false
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
