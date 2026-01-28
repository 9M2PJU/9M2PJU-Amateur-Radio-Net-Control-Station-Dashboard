import { Link } from 'react-router-dom'
import { ArrowRight, Users, BarChart3, Shield, Activity } from 'lucide-react'

export default function Home() {
    return (
        <div className="min-h-screen text-white overflow-hidden bg-slate-950">
            {/* Background decorations */}
            <div className="fixed top-20 right-0 -mr-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 -ml-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Hero Section */}
            <div className="min-h-[90vh] flex flex-col pt-16 md:pt-20">
                <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 md:py-12 relative z-10">
                    <div className="text-center max-w-4xl mx-auto animate-fade-in">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-light border border-white/10 mb-6 animate-slide-up scale-90 md:scale-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-medium text-emerald-300 tracking-wide uppercase">System Operational</span>
                        </div>

                        {/* Logo & Title */}
                        <div className="mb-6 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-emerald-500/30 blur-3xl rounded-full"></div>
                            <div className="relative inline-flex w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/40 mb-6 animate-float border border-white/20 bg-slate-900">
                                <img src="/logo.png" alt="9M2PJU NCS Dashboard Logo" className="w-full h-full object-cover scale-110" />
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
                                <span className="text-emerald-500">9M2PJU</span> NCS Center
                            </h1>
                        </div>

                        {/* Description */}
                        <p className="text-base md:text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed animate-delay-100 animate-slide-up px-4">
                            The next-generation dashboard for amateur radio net management.
                            Real-time logging, advanced analytics, and secure data handling for the modern operator.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-delay-200 animate-slide-up">
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:-translate-y-1"
                            >
                                Launch Dashboard
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-6 py-3.5 glass text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center border border-white/10 hover:border-white/20 text-sm"
                            >
                                Request Access
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Features Section */}
                <section className="py-12 md:py-16 px-6 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {/* Feature 1 */}
                            <div className="group card glass-card hover:bg-white/5 transition-all duration-300 border-white/5 hover:border-emerald-500/30 p-4 md:p-6">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
                                    <Users className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-base md:text-lg font-bold mb-2 text-white">Rapid Check-ins</h3>
                                <p className="text-slate-400 text-xs leading-relaxed hidden sm:block">
                                    Streamlined logging interface designed for high-traffic nets.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group card glass-card hover:bg-white/5 transition-all duration-300 border-white/5 hover:border-cyan-500/30 p-4 md:p-6">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-cyan-500/20">
                                    <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                                </div>
                                <h3 className="text-base md:text-lg font-bold mb-2 text-white">Live Telemetry</h3>
                                <p className="text-slate-400 text-xs leading-relaxed hidden sm:block">
                                    Real-time visualization of participation stats.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group card glass-card hover:bg-white/5 transition-all duration-300 border-white/5 hover:border-violet-500/30 p-4 md:p-6">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-violet-500/20">
                                    <Activity className="w-5 h-5 md:w-6 md:h-6 text-violet-400" />
                                </div>
                                <h3 className="text-base md:text-lg font-bold mb-2 text-white">Net Ops</h3>
                                <p className="text-slate-400 text-xs leading-relaxed hidden sm:block">
                                    Advanced tools for traffic management.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="group card glass-card hover:bg-white/5 transition-all duration-300 border-white/5 hover:border-amber-500/30 p-4 md:p-6">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-amber-500/20">
                                    <Shield className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                                </div>
                                <h3 className="text-base md:text-lg font-bold mb-2 text-white">Secure</h3>
                                <p className="text-slate-400 text-xs leading-relaxed hidden sm:block">
                                    Enterprise-grade security for your data.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
