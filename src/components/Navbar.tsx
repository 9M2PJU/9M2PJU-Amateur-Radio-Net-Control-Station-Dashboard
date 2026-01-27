'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
    Radio,
    LayoutDashboard,
    List,
    Plus,
    LogOut,
    Menu,
    X,
    User
} from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function Navbar() {
    const [user, setUser] = useState<Profile | null>(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single()

                if (profile) {
                    setUser(profile)
                }
            }
        }
        getUser()
    }, [supabase])

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error('Failed to sign out')
            return
        }
        toast.success('Signed out successfully')
        router.push('/login')
        router.refresh()
    }

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/nets', label: 'Nets', icon: List },
        { href: '/nets/new', label: 'New Net', icon: Plus },
    ]

    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

    return (
        <nav className="sticky top-0 z-50 glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
                            <Radio className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white hidden sm:block">
                            NCS Dashboard
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.href)
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        {user && (
                            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-semibold text-white">{user.callsign}</p>
                                    {user.name && (
                                        <p className="text-xs text-slate-400">{user.name}</p>
                                    )}
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
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
                <div className="md:hidden glass border-t border-white/10 animate-fade-in">
                    <div className="px-4 py-4 space-y-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive(link.href)
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {link.label}
                                </Link>
                            )
                        })}

                        <hr className="border-white/10 my-3" />

                        {user && (
                            <div className="flex items-center gap-3 px-4 py-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{user.callsign}</p>
                                    {user.name && (
                                        <p className="text-sm text-slate-400">{user.name}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                handleLogout()
                                setMobileMenuOpen(false)
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all w-full"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    )
}
