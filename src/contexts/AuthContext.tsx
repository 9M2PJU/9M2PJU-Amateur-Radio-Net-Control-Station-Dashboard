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
    const [profile, setProfile] = useState<Profile | null>(null)
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
            } else {
                setProfile(null)
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

        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                await fetchProfile(session.user.id)
            }
            setLoading(false)
            clearTimeout(loadingTimeout)
            console.log('AuthContext: Initial session loaded', !!session)
        }).catch((error) => {
            console.error('AuthContext: Error getting session', error)
            setLoading(false)
            clearTimeout(loadingTimeout)
        })

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('AuthContext: Auth state change', _event)
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                await fetchProfile(session.user.id)
            } else {
                setProfile(null)
            }
            setLoading(false)
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
