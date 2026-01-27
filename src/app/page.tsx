import Link from 'next/link'
import { Radio, ArrowRight, Users, BarChart3, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <div className="text-center max-w-3xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                <Radio className="w-10 h-10 text-slate-900" strokeWidth={2.5} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              9M2PJU Net Control
            </h1>
            <p className="text-2xl md:text-3xl text-emerald-400 font-semibold mb-8">
              Station Dashboard
            </p>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Professional net management for amateur radio operators.
              Log check-ins, track participation, and analyze your nets
              with beautiful charts and real-time statistics.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-cyan-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                Sign In
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 border border-slate-700 transition-all duration-200 flex items-center justify-center"
              >
                Create Account
              </Link>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section className="py-20 px-6 border-t border-slate-800 bg-slate-800/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-16">
              Everything you need for net control
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Users className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Quick Check-ins</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Fast logging with callsign, signal reports, and remarks
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Rich Analytics</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Beautiful charts showing participation trends
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Real-time</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Live updates as check-ins happen
                </p>
              </div>

              {/* Feature 4 */}
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Secure</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Your data safely stored in the cloud
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            Built for the amateur radio community • 73 de NCS Dashboard
          </p>
        </footer>
      </div>
    </div>
  )
}
