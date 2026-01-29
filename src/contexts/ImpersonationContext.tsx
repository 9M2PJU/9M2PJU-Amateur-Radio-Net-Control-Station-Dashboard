import { createContext, useContext, useState, ReactNode } from 'react'

interface ImpersonationContextType {
    impersonatedUserId: string | null
    impersonatedUser: { id: string; callsign: string; email: string } | null
    impersonateUser: (userId: string, callsign: string, email: string) => void
    stopImpersonation: () => void
    isImpersonating: boolean
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined)

export function ImpersonationProvider({ children }: { children: ReactNode }) {
    const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null)
    const [impersonatedUser, setImpersonatedUser] = useState<{ id: string; callsign: string; email: string } | null>(null)

    const impersonateUser = (userId: string, callsign: string, email: string) => {
        setImpersonatedUserId(userId)
        setImpersonatedUser({ id: userId, callsign, email })
        // Store in sessionStorage so it persists across page refreshes
        sessionStorage.setItem('impersonatedUserId', userId)
        sessionStorage.setItem('impersonatedUser', JSON.stringify({ id: userId, callsign, email }))
    }

    const stopImpersonation = () => {
        setImpersonatedUserId(null)
        setImpersonatedUser(null)
        sessionStorage.removeItem('impersonatedUserId')
        sessionStorage.removeItem('impersonatedUser')
    }

    // Restore impersonation from sessionStorage on mount
    useState(() => {
        const storedUserId = sessionStorage.getItem('impersonatedUserId')
        const storedUser = sessionStorage.getItem('impersonatedUser')
        if (storedUserId && storedUser) {
            setImpersonatedUserId(storedUserId)
            setImpersonatedUser(JSON.parse(storedUser))
        }
    })

    return (
        <ImpersonationContext.Provider
            value={{
                impersonatedUserId,
                impersonatedUser,
                impersonateUser,
                stopImpersonation,
                isImpersonating: !!impersonatedUserId,
            }}
        >
            {children}
        </ImpersonationContext.Provider>
    )
}

export function useImpersonation() {
    const context = useContext(ImpersonationContext)
    if (context === undefined) {
        throw new Error('useImpersonation must be used within an ImpersonationProvider')
    }
    return context
}
