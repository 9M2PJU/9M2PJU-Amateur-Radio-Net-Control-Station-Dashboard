'use client'

import { format } from 'date-fns'
import { MapPin, MessageSquare, AlertTriangle, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Checkin } from '@/lib/types'

interface CheckinListProps {
    checkins: Checkin[]
    onDelete?: (id: string) => void
    showDelete?: boolean
}

export default function CheckinList({ checkins, onDelete, showDelete = false }: CheckinListProps) {
    const supabase = createClient()

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
            <div className="card text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400">No check-ins recorded yet</p>
                <p className="text-sm text-slate-500 mt-1">Use the form above to log check-ins</p>
            </div>
        )
    }

    return (
        <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                    Check-in Log <span className="text-slate-400 font-normal">({checkins.length})</span>
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Time</th>
                            <th>Callsign</th>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Signal</th>
                            <th>Remarks</th>
                            {showDelete && <th></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {checkins.map((checkin, index) => (
                            <tr key={checkin.id} className="animate-fade-in">
                                <td className="text-slate-500">{index + 1}</td>
                                <td className="text-slate-300 font-mono text-sm">
                                    {format(new Date(checkin.checked_in_at), 'HH:mm:ss')}
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-emerald-400">{checkin.callsign}</span>
                                        {checkin.traffic && (
                                            <span className="badge badge-warning flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                Traffic
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="text-slate-300">{checkin.name || '-'}</td>
                                <td>
                                    {checkin.location ? (
                                        <span className="flex items-center gap-1 text-slate-300">
                                            <MapPin className="w-3 h-3 text-slate-500" />
                                            {checkin.location}
                                        </span>
                                    ) : (
                                        <span className="text-slate-500">-</span>
                                    )}
                                </td>
                                <td>
                                    {checkin.signal_report ? (
                                        <span className="badge badge-primary">{checkin.signal_report}</span>
                                    ) : (
                                        <span className="text-slate-500">-</span>
                                    )}
                                </td>
                                <td className="text-slate-400 max-w-xs truncate">{checkin.remarks || '-'}</td>
                                {showDelete && (
                                    <td>
                                        <button
                                            onClick={() => handleDelete(checkin.id, checkin.callsign)}
                                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Delete check-in"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
