

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { Mail, Lock, User, Antenna, Loader2, Star } from 'lucide-react'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [callsign, setCallsign] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [registered, setRegistered] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate('/dashboard', { replace: true })
            }
        })
    }, [navigate])

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        if (callsign.length < 3) {
            toast.error('Please enter a valid callsign')
            return
        }

        setLoading(true)

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        callsign: callsign.toUpperCase(),
                        name,
                    }
                }
            })

            if (authError) {
                toast.error(authError.message)
                return
            }

            if (authData.user) {
                setRegistered(true)
                toast.success('Check your email to verify your account')
            }
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
            <div className="fixed bottom-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] -z-10 animate-pulse-glow"></div>
            <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10 animate-pulse-glow animate-delay-200"></div>

            <div className="w-full max-w-lg animate-fade-in">
                <div className="card glass-card p-8 border-none shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block group">
                            <div className="relative w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <img
                                    src="/logo.png"
                                    alt="9M2PJU NCS Logo"
                                    width="80" height="80"
                                    className="object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.4)]"

                                />
                            </div>
                        </Link>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
                        <p className="text-slate-400">Join the elite network of operators</p>
                    </div>

                    {registered ? (
                        <div className="text-center py-8 animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                                <Mail className="w-10 h-10 text-emerald-500 animate-bounce" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">Registration Successful!</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                We&apos;ve sent a verification link to <span className="text-emerald-400 font-bold">{email}</span>.<br />
                                Please check your inbox to activate your account.
                            </p>

                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-8">
                                <p className="text-sm text-amber-400 font-medium">
                                    <span className="font-bold">Important:</span> If you don&apos;t see the email within 2 minutes, please check your <span className="underline italic">Spam</span> or <span className="underline italic">Junk</span> folder.
                                </p>
                            </div>

                            <Link
                                to="/login"
                                className="btn bg-slate-800 hover:bg-slate-700 text-white w-full py-3"
                            >
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group">
                                    <label htmlFor="callsign" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                                        Callsign <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="callsign"
                                            type="text"
                                            value={callsign}
                                            onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                                            placeholder="9M2ABC"
                                            required
                                            className="input pl-11 bg-slate-900/50 border-slate-700 hover:border-slate-600 focus:border-violet-500/50 transition-colors py-3 uppercase font-mono"
                                        />
                                        <Antenna className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                    </div>
                                </div>

                                <div className="group">
                                    <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                                        Operator Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your Name"
                                            className="input pl-11 bg-slate-900/50 border-slate-700 hover:border-slate-600 focus:border-violet-500/50 transition-colors py-3"
                                        />
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                                    Email Address <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                        className="input pl-11 bg-slate-900/50 border-slate-700 hover:border-slate-600 focus:border-violet-500/50 transition-colors py-3"
                                    />
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group">
                                    <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                                        Password <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="input pl-11 bg-slate-900/50 border-slate-700 hover:border-slate-600 focus:border-violet-500/50 transition-colors py-3"
                                        />
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                    </div>
                                </div>

                                <div className="group">
                                    <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                                        Confirm <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="input pl-11 bg-slate-900/50 border-slate-700 hover:border-slate-600 focus:border-violet-500/50 transition-colors py-3"
                                        />
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 w-full py-3.5 text-base shadow-lg shadow-violet-500/20 group relative overflow-hidden mt-2"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Join Network
                                            <Star className="w-5 h-5 group-hover:scale-110 transition-transform fill-current" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-400 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors hover:underline decoration-violet-500/30 underline-offset-4">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
