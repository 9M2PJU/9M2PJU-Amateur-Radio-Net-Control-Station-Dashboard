import { Outlet } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { Toaster } from 'sonner'

export default function Layout() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-emerald-500/30 selection:text-emerald-300 font-sans">
            {/* Background elements */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-20"></div>

            <Navbar />

            <main>
                <Outlet />
            </main>

            <Toaster position="top-right" theme="dark" closeButton richColors />
        </div>
    )
}
