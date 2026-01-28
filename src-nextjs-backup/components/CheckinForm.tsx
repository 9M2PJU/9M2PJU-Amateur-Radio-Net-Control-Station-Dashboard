'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Send, Loader2, Radio, MapPin, User, MessageSquare, ShieldAlert, FileText } from 'lucide-react'

interface CheckinFormProps {
    netId: string
    onCheckinAdded?: () => void
}

const readabilityOptions = [1, 2, 3, 4, 5]
const strengthOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export default function CheckinForm({ netId, onCheckinAdded }: CheckinFormProps) {
    const [callsign, setCallsign] = useState('')
    const [name, setName] = useState('')
    const [location, setLocation] = useState('')
    const [readability, setReadability] = useState<number>(5)
    const [strength, setStrength] = useState<number>(9)
    const [remarks, setRemarks] = useState('')
    const [traffic, setTraffic] = useState(false)
    const [trafficPrecedence, setTrafficPrecedence] = useState<'routine' | 'welfare' | 'priority' | 'emergency'>('routine')
    const [trafficDetails, setTrafficDetails] = useState('')
    const [loading, setLoading] = useState(false)

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
                signal_report: `${readability}/${strength}`,
                readability,
                signal_strength: strength,
                remarks: remarks.trim() || null,
                traffic,
                traffic_precedence: traffic ? trafficPrecedence : null,
                traffic_details: traffic ? trafficDetails.trim() || null : null,
                grid_locator: null,
            })

            if (error) {
                console.error('Check-in error detail:', error)
                const errorMsg = typeof error === 'object' ? (error as any).message || JSON.stringify(error) : error
                toast.error(`Failed to add check-in: ${errorMsg}`)
                return
            }

            toast.success(`${callsign.toUpperCase()} checked in!`)

            // Reset form
            setCallsign('')
            setName('')
            setLocation('')
            setReadability(5)
            setStrength(9)
            setRemarks('')
            setTraffic(false)
            setTrafficPrecedence('routine')
            setTrafficDetails('')
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
                            onChange={(e) => {
                                const val = e.target.value.toUpperCase()
                                setCallsign(val)
                                // Auto-populate location based on Malaysian prefix
                                if (val.startsWith('9M2') || val.startsWith('9W2')) {
                                    if (!location) setLocation('West Malaysia')
                                } else if (val.startsWith('9M6') || val.startsWith('9W6')) {
                                    if (!location) setLocation('Sabah')
                                } else if (val.startsWith('9M8') || val.startsWith('9W8')) {
                                    if (!location) setLocation('Sarawak')
                                } else if (val.startsWith('9M4')) {
                                    if (!location) setLocation('Malaysia (Satellite/Special)')
                                }
                            }}
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
                            placeholder="City / State"
                            className="input pl-10 border-slate-700 focus:border-emerald-500/50 bg-slate-900/50"
                        />
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                </div>


                {/* Signal Report - Readability */}
                <div className="group">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                        Readability (R)
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                        {readabilityOptions.map((v) => (
                            <button
                                key={v}
                                type="button"
                                onClick={() => setReadability(v)}
                                className={`py-2 rounded-lg font-bold transition-all ${readability === v
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-slate-900 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Signal Report - Strength */}
                <div className="md:col-span-2 group">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                        Signal Strength (S)
                    </label>
                    <div className="grid grid-cols-9 gap-1">
                        {strengthOptions.map((v) => (
                            <button
                                key={v}
                                type="button"
                                onClick={() => setStrength(v)}
                                className={`py-2 rounded-lg font-bold transition-all ${strength === v
                                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                                    : 'bg-slate-900 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Remarks */}
                <div className="md:col-span-3 group">
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

            {/* Traffic Toggle */}
            <div className="mt-8 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${traffic ? 'bg-amber-500 border-amber-600 scale-110 shadow-lg shadow-amber-500/20' : 'border-slate-600 bg-slate-800'}`}>
                        {traffic && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    <input
                        type="checkbox"
                        checked={traffic}
                        onChange={(e) => setTraffic(e.target.checked)}
                        className="hidden"
                    />
                    <div>
                        <span className={`text-base font-bold transition-colors ${traffic ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-300'}`}>
                            Station has Traffic
                        </span>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Formal message or priority traffic</p>
                    </div>
                </label>
            </div>

            {/* Traffic Form Section */}
            {traffic && (
                <div className="mt-6 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 mb-6">
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                        <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Traffic Header & Details</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                                Precedence
                            </label>
                            <div className="space-y-2">
                                {(['routine', 'welfare', 'priority', 'emergency'] as const).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setTrafficPrecedence(p)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all ${trafficPrecedence === p
                                            ? p === 'emergency' ? 'bg-rose-500 text-white border-rose-600 shadow-lg shadow-rose-500/20' :
                                                p === 'priority' ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20' :
                                                    'bg-cyan-500 text-white border-cyan-600 shadow-lg shadow-cyan-500/20'
                                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700'
                                            }`}
                                    >
                                        <span className="capitalize">{p}</span>
                                        {trafficPrecedence === p && <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="trafficDetails" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                                Traffic Details (Destination / Notes)
                            </label>
                            <div className="relative h-full">
                                <textarea
                                    id="trafficDetails"
                                    value={trafficDetails}
                                    onChange={(e) => setTrafficDetails(e.target.value)}
                                    placeholder="Enter traffic destination, handler, or message summary..."
                                    className="input min-h-[160px] py-4 pl-10 border-slate-700 focus:border-amber-500/50 bg-slate-900/50 resize-none font-mono text-sm"
                                />
                                <FileText className="absolute left-3 top-4 w-4 h-4 text-slate-500" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-end mt-8 pt-6 border-t border-white/5">
                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary min-w-[180px] h-14 rounded-2xl text-lg relative overflow-hidden group shadow-xl shadow-emerald-500/20"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center justify-center gap-3">
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Logging...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                <span>Transmit Log</span>
                            </>
                        )}
                    </div>
                </button>
            </div>
        </form>
    )
}
