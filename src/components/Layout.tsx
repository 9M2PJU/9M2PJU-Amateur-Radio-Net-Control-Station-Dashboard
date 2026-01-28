import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function Layout() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                navigate('/login')
            } else {
                setAuthenticated(true)
            }
            setLoading(false)
        }

        checkAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                setAuthenticated(false)
                navigate('/login')
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        )
    }

    if (!authenticated) return null

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-emerald-500/30 selection:text-emerald-300 font-sans">
            {/* Background elements */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-20"></div>

            <Navbar />

            <main className="pb-8 md:pb-12">
                <Outlet />
            </main>

            <Toaster position="top-right" theme="dark" closeButton richColors />
        </div>
    )
}
