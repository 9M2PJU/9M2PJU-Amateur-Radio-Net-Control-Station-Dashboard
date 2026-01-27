import { format } from 'date-fns'
import { Clock, User } from 'lucide-react'
import type { Checkin } from '@/lib/types'

interface RecentCheckinsProps {
    checkins: Checkin[]
    title?: string
    maxItems?: number
}

export default function RecentCheckins({
    checkins,
    title = 'Recent Check-ins',
    maxItems = 10
}: RecentCheckinsProps) {
    const recentCheckins = checkins.slice(0, maxItems)

    return (
        <div className="card glass-card p-6 h-full">
            <div className="flex items-center gap-2 mb-6">
                <div className="h-5 w-1 bg-cyan-500 rounded-full"></div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>

            {recentCheckins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                    <User className="w-12 h-12 text-slate-600 mb-3" />
                    <p className="text-slate-400 font-medium">No check-ins yet</p>
                </div>
            ) : (
                <div className="space-y-3 relative">
                    {/* Connection line */}
                    <div className="absolute left-5 top-4 bottom-4 w-px bg-slate-800 -z-10"></div>

                    {recentCheckins.map((checkin) => (
                        <div
                            key={checkin.id}
                            className="group flex items-start gap-4 p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/30 hover:bg-slate-800/60 transition-all"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all">
                                <span className="text-sm font-bold font-mono text-cyan-400">
                                    {checkin.callsign.slice(0, 2)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-white font-mono tracking-wide">{checkin.callsign}</span>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(checkin.checked_in_at), 'HH:mm')}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                    {checkin.signal_report && (
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${checkin.signal_strength && checkin.signal_strength >= 9 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                            'bg-slate-800 border-slate-700 text-slate-400'
                                            }`}>
                                            RST {checkin.signal_report}
                                        </span>
                                    )}
                                    {checkin.traffic && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse">
                                            Traffic
                                        </span>
                                    )}
                                </div>

                                {checkin.name && (
                                    <p className="text-xs text-slate-400 mt-1">{checkin.name}</p>
                                )}
                                {checkin.remarks && (
                                    <p className="text-xs text-slate-500 mt-1 truncate border-l-2 border-slate-700 pl-2 italic">{checkin.remarks}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
