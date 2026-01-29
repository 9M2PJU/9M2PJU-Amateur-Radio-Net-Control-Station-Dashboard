import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate('/dashboard', { replace: true })
            }
        })
    }, [navigate])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (loading) return
        setLoading(true)

        // Safety timeout for the login button
        const loginTimeout = setTimeout(() => {
            if (loading) {
                console.warn('Login: Process timed out')
                setLoading(false)
            }
        }, 12000)

        try {
            const { error, data } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error('Login error:', error)
                toast.error(error.message)
                setLoading(false)
                clearTimeout(loginTimeout)
                return
            }

            if (data?.session) {
                toast.success('Welcome back!')
                // Force a small delay to let AuthContext catch up if needed
                setTimeout(() => {
                    navigate('/dashboard', { replace: true })
                    clearTimeout(loginTimeout)
                }, 100)
            }
        } catch (err) {
            console.error('Unexpected login error:', err)
            toast.error('An unexpected error occurred')
            setLoading(false)
            clearTimeout(loginTimeout)
        } finally {
            // Note: loading is set to false in the specific branches or timeout
            // to avoid flickering if navigate is successful
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
                        <Link to="/" className="inline-block group">
                            <div className="relative w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <img
                                    src="/logo.png"
                                    alt="9M2PJU NCS Logo"
                                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                />
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
                                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="callsign@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 disabled:text-slate-500 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:shadow-none"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center space-y-3">
                        <p className="text-slate-400 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                                Request Access
                            </Link>
                        </p>
                        <p className="text-slate-500 text-xs">
                            <Link to="/" className="hover:text-slate-300 transition-colors">
                                ← Back to Main
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
