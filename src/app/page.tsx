import Link from 'next/link'
import { Radio, ArrowRight, Users, Activity, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 mb-8 shadow-2xl shadow-emerald-500/30 animate-pulse-glow">
            <Radio className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Net Control Station
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Dashboard
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Professional net management for amateur radio operators.
            Log check-ins, track participation, and analyze your nets with
            beautiful charts and real-time statistics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="btn btn-primary text-lg px-8 py-4 rounded-xl"
            >
              Sign In
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/register"
              className="btn btn-secondary text-lg px-8 py-4 rounded-xl"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
            Everything you need for net control
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card card-hover text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Quick Check-ins</h3>
              <p className="text-slate-400">
                Fast and efficient logging of stations with callsign, signal reports, and remarks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card card-hover text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Activity className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Rich Analytics</h3>
              <p className="text-slate-400">
                Beautiful charts and graphs showing participation trends and net statistics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card card-hover text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure & Reliable</h3>
              <p className="text-slate-400">
                Your data is safely stored in the cloud with secure authentication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-slate-800 text-center">
        <p className="text-slate-500 text-sm">
          Built for the amateur radio community • 73 de NCS Dashboard
        </p>
      </footer>
    </div>
  )
}
