import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
    session: Session | null
    user: User | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true
})

export const useAuth = () => {
    return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Initial session check
        console.log('AuthContext: Initializing...')
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
            console.log('AuthContext: Initial session loaded', !!session)
        })

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('AuthContext: Auth state change', _event)
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const value = {
        session,
        user,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
