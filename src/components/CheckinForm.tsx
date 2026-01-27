'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Send, Loader2, Radio, MapPin, User, MessageSquare } from 'lucide-react'

interface CheckinFormProps {
    netId: string
    onCheckinAdded?: () => void
}

const signalReports = [
    '', 'S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S9+10', 'S9+20', 'S9+30', 'S9+40'
]

export default function CheckinForm({ netId, onCheckinAdded }: CheckinFormProps) {
    const [callsign, setCallsign] = useState('')
    const [name, setName] = useState('')
    const [location, setLocation] = useState('')
    const [signalReport, setSignalReport] = useState('')
    const [remarks, setRemarks] = useState('')
    const [traffic, setTraffic] = useState(false)
    const [loading, setLoading] = useState(false)

    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!callsign.trim()) {
            toast.error('Callsign is required')
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.from('checkins').insert({
                net_id: netId,
                callsign: callsign.toUpperCase().trim(),
                name: name.trim() || null,
                location: location.trim() || null,
                signal_report: signalReport || null,
                remarks: remarks.trim() || null,
                traffic,
            })

            if (error) {
                toast.error('Failed to add check-in')
                console.error(error)
                return
            }

            toast.success(`${callsign.toUpperCase()} checked in!`)

            // Reset form
            setCallsign('')
            setName('')
            setLocation('')
            setSignalReport('')
            setRemarks('')
            setTraffic(false)

            onCheckinAdded?.()
        } catch {
            toast.error('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="card glass-card animate-fade-in p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <Radio className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Quick Check-in</h3>
                    <p className="text-sm text-slate-400">Log a new station to the net</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Callsign */}
                <div className="group">
                    <label htmlFor="callsign" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                        Callsign <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="callsign"
                            type="text"
                            value={callsign}
                            onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                            placeholder="9M2ABC"
                            className="input font-mono text-lg uppercase pl-10 border-slate-700 focus:border-emerald-500/50 bg-slate-900/50"
                            required
                        />
                        <Radio className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                </div>

                {/* Name */}
                <div className="group">
                    <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                        Operator Name
                    </label>
                    <div className="relative">
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Operator name"
                            className="input pl-10 border-slate-700 focus:border-emerald-500/50 bg-slate-900/50"
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                </div>

                {/* Location */}
                <div className="group">
                    <label htmlFor="location" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                        Location (QTH)
                    </label>
                    <div className="relative">
                        <input
                            id="location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City / Grid"
                            className="input pl-10 border-slate-700 focus:border-emerald-500/50 bg-slate-900/50"
                        />
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                </div>

                {/* Signal Report */}
                <div className="group">
                    <label htmlFor="signalReport" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                        Signal Report
                    </label>
                    <select
                        id="signalReport"
                        value={signalReport}
                        onChange={(e) => setSignalReport(e.target.value)}
                        className="input border-slate-700 focus:border-emerald-500/50 bg-slate-900/50 appearance-none cursor-pointer"
                    >
                        {signalReports.map((sr) => (
                            <option key={sr || 'none'} value={sr} className="bg-slate-900">
                                {sr || 'No Report'}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Remarks */}
                <div className="md:col-span-2 group">
                    <label htmlFor="remarks" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                        Remarks
                    </label>
                    <div className="relative">
                        <input
                            id="remarks"
                            type="text"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Additional comments..."
                            className="input pl-10 border-slate-700 focus:border-emerald-500/50 bg-slate-900/50"
                        />
                        <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                {/* Traffic Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${traffic ? 'bg-amber-500 border-amber-600' : 'border-slate-600 bg-slate-800'}`}>
                        {traffic && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <input
                        type="checkbox"
                        checked={traffic}
                        onChange={(e) => setTraffic(e.target.checked)}
                        className="hidden"
                    />
                    <span className={`text-sm font-medium transition-colors ${traffic ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-300'}`}>
                        Station has Traffic
                    </span>
                </label>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary min-w-[140px]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Adding...</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            <span>Check In</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
