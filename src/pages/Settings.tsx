import { Settings as SettingsIcon, Construction, Info, Github } from 'lucide-react'

export default function Settings() {
    return (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mt-20 md:mt-24 space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-lg shadow-violet-500/10">
                    <SettingsIcon className="w-8 h-8 text-violet-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Configuration</h1>
                    <p className="text-slate-400">Application settings and preferences.</p>
                </div>
            </div>

            <div className="card glass-card p-8 text-center py-16">
                <div className="w-20 h-20 rounded-full bg-slate-900/80 flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-lg shadow-violet-500/10">
                    <Construction className="w-10 h-10 text-violet-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Module Under Construction</h2>
                <p className="text-slate-400 max-w-md mx-auto mb-8">
                    The settings module is currently being calibrated. Advanced configuration options will be available in the next system update.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3">
                        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-white text-sm">System Version</h3>
                            <p className="text-slate-400 text-xs mt-1">v1.0.0-beta.2</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3">
                        <Github className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-white text-sm">Open Source</h3>
                            <p className="text-slate-400 text-xs mt-1">MIT License</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
