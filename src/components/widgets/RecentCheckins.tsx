'use client'

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
        <div className="card animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>

            {recentCheckins.length === 0 ? (
                <div className="text-center py-8">
                    <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No check-ins yet</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {recentCheckins.map((checkin) => (
                        <div
                            key={checkin.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-white">
                                    {checkin.callsign.slice(0, 2)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white">{checkin.callsign}</span>
                                    {checkin.signal_report && (
                                        <span className="badge badge-primary">{checkin.signal_report}</span>
                                    )}
                                    {checkin.traffic && (
                                        <span className="badge badge-warning">Traffic</span>
                                    )}
                                </div>
                                {checkin.name && (
                                    <p className="text-sm text-slate-400">{checkin.name}</p>
                                )}
                                {checkin.remarks && (
                                    <p className="text-sm text-slate-500 truncate">{checkin.remarks}</p>
                                )}
                                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(checkin.checked_in_at), 'HH:mm:ss')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
