import Link from 'next/link'
import { Radio, ArrowRight, Users, BarChart3, Shield, Zap, Activity } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen text-white overflow-hidden">
      {/* Background decorations */}
      <div className="fixed top-20 right-0 -mr-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 -ml-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Hero Section */}
      <div className="min-h-screen flex flex-col pt-20">
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-light border border-white/10 mb-8 animate-slide-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-300 tracking-wide uppercase">System Operational</span>
            </div>

            {/* Logo & Title */}
            <div className="mb-10 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/30 blur-3xl rounded-full"></div>
              <div className="relative inline-flex w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 items-center justify-center shadow-2xl shadow-emerald-500/30 mb-8 animate-float">
                <Radio className="w-12 h-12 text-white" strokeWidth={2} />
              </div>

              <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                <span className="block text-white">9M2PJU</span>
                <span className="title-gradient">Net Control Station</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-delay-100 animate-slide-up">
              The next-generation dashboard for amateur radio net management.
              Real-time logging, advanced analytics, and secure data handling for the modern operator.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-delay-200 animate-slide-up">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:-translate-y-1"
              >
                Launch Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 glass text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center border border-white/10 hover:border-white/20"
              >
                Request Access
              </Link>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section className="py-24 px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="group card glass-card hover:bg-white/5 transition-all duration-300 border-white/5 hover:border-emerald-500/30">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
                  <Users className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Rapid Check-ins</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Streamlined logging interface designed for high-traffic nets with auto-completion.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group card glass-card hover:bg-white/5 transition-all duration-300 border-white/5 hover:border-cyan-500/30">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-cyan-500/20">
                  <BarChart3 className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Live Telemetry</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Real-time visualization of participation stats and signal reports.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group card glass-card hover:bg-white/5 transition-all duration-300 border-white/5 hover:border-violet-500/30">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-violet-500/20">
                  <Activity className="w-7 h-7 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Net Operations</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Advanced tools for preamble management and traffic handling.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group card glass-card hover:bg-white/5 transition-all duration-300 border-white/5 hover:border-amber-500/30">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-amber-500/20">
                  <Shield className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Secure Archive</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Permanent, searchable logs stored securely in the cloud.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-white/5 text-center relative z-10 bg-slate-950/50 backdrop-blur-lg">
          <p className="text-slate-500 text-sm font-mono">
            73 de 9M2PJU • Built for the Amateur Radio Community
          </p>
        </footer>
      </div>
    </div>
  )
}
