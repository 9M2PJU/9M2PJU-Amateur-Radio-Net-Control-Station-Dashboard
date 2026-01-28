import { format } from 'date-fns'
import { MapPin, MessageSquare, AlertTriangle, Trash2, Signal, Award } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Checkin } from '@/lib/types'

interface CheckinListProps {
    checkins: Checkin[]
    onDelete?: (id: string) => void
    onGenerateCertificate?: (checkin: Checkin) => void | Promise<void>
    showDelete?: boolean
}

export default function CheckinList({ checkins, onDelete, onGenerateCertificate, showDelete = false }: CheckinListProps) {

    const handleDelete = async (id: string, callsign: string) => {
        if (!confirm(`Delete check-in for ${callsign}?`)) return

        try {
            const { error } = await supabase.from('checkins').delete().eq('id', id)

            if (error) {
                toast.error('Failed to delete check-in')
                return
            }

            toast.success('Check-in deleted')
            onDelete?.(id)
        } catch {
            toast.error('An error occurred')
        }
    }

    if (checkins.length === 0) {
        return (
            <div className="card glass-card text-center py-16 animate-fade-in border-dashed border-2 border-slate-800 bg-transparent">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-900/50 flex items-center justify-center border border-slate-800">
                    <MessageSquare className="w-10 h-10 text-slate-700" />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">No check-ins logged</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                    The net is currently empty. Use the form above to add the first check-in.
                </p>
            </div>
        )
    }

    return (
        <div className="card glass-card animate-fade-in p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-emerald-500 rounded-full"></div>
                    <h3 className="text-xl font-bold text-white">
                        Station Log <span className="text-slate-500 font-mono text-sm ml-2 bg-slate-900 px-2 py-1 rounded-md">COUNT: {checkins.length}</span>
                    </h3>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="table w-full">
                    <thead>
                        <tr className="bg-slate-950/50 text-left">
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">#</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Time</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Callsign</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Traffic</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Operator</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Signal</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Location</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Remarks</th>
                            <th className="py-4 px-6 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {checkins.map((checkin, index) => (
                            <tr
                                key={checkin.id}
                                className="group hover:bg-white/[0.02] transition-colors"
                            >
                                <td className="py-4 px-6 text-slate-600 font-mono text-sm select-none">{index + 1}</td>
                                <td className="py-4 px-6 text-slate-400 font-mono text-sm whitespace-nowrap">
                                    {format(new Date(checkin.checked_in_at), 'HH:mm')}
                                </td>
                                <td className="py-4 px-6">
                                    <span className="font-bold text-emerald-400 font-mono text-lg tracking-wide group-hover:text-emerald-300 transition-colors">
                                        {checkin.callsign}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    {checkin.traffic ? (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 w-fit">
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                            <span className="text-xs font-bold text-amber-500 uppercase">Traffic</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-600 text-xs uppercase font-medium">-</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-slate-300 font-medium whitespace-nowrap">
                                    {checkin.name || <span className="text-slate-600">-</span>}
                                </td>
                                <td className="py-4 px-6">
                                    {checkin.signal_report ? (
                                        <div className="flex items-center gap-1.5">
                                            <Signal className={`w-4 h-4 ${checkin.signal_strength && checkin.signal_strength >= 9 ? 'text-emerald-500' :
                                                checkin.signal_strength && checkin.signal_strength >= 7 ? 'text-emerald-400/80' :
                                                    'text-slate-500'
                                                }`} />
                                            <span className="font-mono text-sm font-medium">{checkin.signal_report}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-600">-</span>
                                    )}
                                </td>
                                <td className="py-4 px-6">
                                    {checkin.location ? (
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <MapPin className="w-3.5 h-3.5 text-slate-600" />
                                            <span className="text-sm truncate max-w-[120px]">{checkin.location}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-600">-</span>
                                    )}
                                </td>
                                <td className="py-4 px-6">
                                    <p className="text-sm text-slate-400 max-w-xs truncate" title={checkin.remarks || ''}>
                                        {checkin.remarks || <span className="text-slate-700 italic">No remarks</span>}
                                    </p>
                                </td>
                                <td className="py-4 px-6 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-2">
                                        {onGenerateCertificate && (
                                            <button
                                                onClick={() => onGenerateCertificate(checkin)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all hover:scale-105"
                                                title="Generate Participation Certificate"
                                            >
                                                <Award className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">CERT</span>
                                            </button>
                                        )}
                                        {showDelete && (
                                            <button
                                                onClick={() => handleDelete(checkin.id, checkin.callsign)}
                                                className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete check-in"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
