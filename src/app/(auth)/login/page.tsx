'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Radio, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                toast.error(error.message)
                return
            }

            toast.success('Welcome back!')
            router.push('/dashboard')
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full bg-slate-950 -z-20"></div>
            <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10 animate-pulse-glow"></div>
            <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -z-10 animate-pulse-glow animate-delay-200"></div>

            <div className="w-full max-w-md animate-fade-in">
                <div className="card glass-card p-8 border-none shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block group">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Radio className="w-8 h-8 text-white" strokeWidth={2.5} />
                            </div>
                        </Link>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
                        <p className="text-slate-400">Sign in to manage your nets</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="group">
                                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                        className="input pl-11 bg-slate-900/50 border-slate-700 hover:border-slate-600 focus:border-emerald-500/50 transition-colors py-3"
                                    />
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                                        Password
                                    </label>
                                    <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Forgot?</a>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="input pl-11 bg-slate-900/50 border-slate-700 hover:border-slate-600 focus:border-emerald-500/50 transition-colors py-3"
                                    />
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-3.5 text-base shadow-lg shadow-emerald-500/20 group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-400 text-sm">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors hover:underline decoration-emerald-500/30 underline-offset-4">
                                Create one now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
