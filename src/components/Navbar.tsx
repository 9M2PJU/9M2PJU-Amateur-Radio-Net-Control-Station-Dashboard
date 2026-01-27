import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
    Radio,
    LayoutDashboard,
    List,
    Plus,
    LogOut,
    Menu,
    X,
    User,
} from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function Navbar() {
    const [user, setUser] = useState<Profile | null>(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const pathname = location.pathname

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const fetchUser = async (authUser: any) => {
            if (!authUser) return
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single()

            if (profile) {
                setUser(profile)
            } else {
                // Fallback if profile doesn't exist yet but user is authenticated
                setUser({
                    id: authUser.id,
                    callsign: authUser.user_metadata?.callsign || 'OPERATOR',
                    name: authUser.user_metadata?.name || null,
                    created_at: authUser.created_at
                })
            }
        }

        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                await fetchUser(session.user)
            }
        }

        checkSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user) {
                await fetchUser(session.user)
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error('Failed to sign out')
            return
        }
        toast.success('Signed out successfully')
        navigate('/login')
    }

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/nets', label: 'Nets', icon: List },
        { href: '/nets/new', label: 'New Net', icon: Plus },
    ]

    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'pt-4 px-4' : 'pt-0 px-0'}`}>
            <nav className={`mx-auto transition-all duration-300 ${scrolled
                ? 'max-w-5xl rounded-2xl glass shadow-2xl border-white/10'
                : 'max-w-7xl border-b border-white/5 bg-slate-950/50 backdrop-blur-md'
                }`}>
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all duration-300">
                                    <Radio className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                                    9M2PJU
                                </span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold font-mono">
                                    NCS Dashboard
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
                            {navLinks.map((link) => {
                                const Icon = link.icon
                                const active = isActive(link.href)
                                return (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${active
                                            ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)] border border-emerald-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${active ? 'animate-pulse-glow' : ''}`} />
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* User Menu */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors group">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white font-mono leading-none">{user.callsign}</span>
                                        {user.name && <span className="text-[10px] text-slate-400 leading-none mt-1">{user.name}</span>}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-medium text-sm"
                                >
                                    Login
                                </Link>
                            )}

                            {user && (
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden glass border-t border-white/10 animate-fade-in mx-4 mb-4 rounded-xl overflow-hidden mt-2">
                        <div className="px-4 py-6 space-y-3">
                            {user && (
                                <div className="flex items-center gap-4 px-4 py-4 rounded-xl bg-white/5 mb-6 border border-white/5">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                                        <span className="text-lg font-bold text-white font-mono">{user.callsign.substring(0, 2)}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white font-mono text-lg">{user.callsign}</p>
                                        <p className="text-sm text-slate-400">{user.name || 'Operator'}</p>
                                    </div>
                                </div>
                            )}

                            {navLinks.map((link) => {
                                const Icon = link.icon
                                const active = isActive(link.href)
                                return (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-all ${active
                                            ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border border-emerald-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${active ? 'text-emerald-400' : ''}`} />
                                        {link.label}
                                    </Link>
                                )
                            })}

                            <hr className="border-white/10 my-4" />

                            <button
                                onClick={() => {
                                    handleLogout()
                                    setMobileMenuOpen(false)
                                }}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10 transition-all w-full"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </div>
    )
}
