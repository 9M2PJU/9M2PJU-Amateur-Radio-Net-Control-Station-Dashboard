import { Settings as SettingsIcon, Construction, Info, Github } from 'lucide-react'

export default function Settings() {
    return (
        <main className="h-screen pt-16 md:pt-20 overflow-hidden flex flex-col bg-slate-950">
            {/* Header Area */}
            <div className="px-4 md:px-6 py-6 border-b border-white/5 bg-slate-950/50 backdrop-blur-md z-20">
                <div className="max-w-4xl mx-auto flex items-center gap-6">
                    <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 shadow-lg shadow-violet-500/10">
                        <SettingsIcon className="w-8 h-8 text-violet-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">System Configuration</h1>
                        <p className="text-slate-500 text-xs font-mono mt-1 uppercase tracking-wider">Application Settings & Preferences</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex items-center justify-center">
                <div className="w-full max-w-2xl text-center">
                    <div className="card glass-card p-10 md:p-16 relative overflow-hidden group">
                        {/* Decorative Background Element */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-colors duration-700"></div>

                        <div className="relative z-10">
                            <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-violet-500/20 group-hover:scale-110 transition-transform duration-500">
                                <Construction className="w-10 h-10 text-violet-400 animate-pulse" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Module Under Construction</h2>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto mb-10">
                                The settings module is currently being calibrated for advanced operational requirements. Configuration options will be available in the next system update.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-4 hover:border-violet-500/30 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                                        <Info className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-[10px] uppercase tracking-widest text-slate-500">System Version</h3>
                                        <p className="text-cyan-400 text-xs font-mono font-bold mt-1">v1.1.0-ncs.build</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-4 hover:border-violet-500/30 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                                        <Github className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-[10px] uppercase tracking-widest text-slate-500">Open Source</h3>
                                        <p className="text-emerald-400 text-xs font-mono font-bold mt-1">AGPLv3 License</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
