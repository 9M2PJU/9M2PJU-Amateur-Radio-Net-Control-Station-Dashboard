'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Send, Loader2 } from 'lucide-react'

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
        <form onSubmit={handleSubmit} className="card animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Check-in</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Callsign */}
                <div>
                    <label htmlFor="callsign" className="block text-sm font-medium text-slate-300 mb-1">
                        Callsign <span className="text-red-400">*</span>
                    </label>
                    <input
                        id="callsign"
                        type="text"
                        value={callsign}
                        onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                        placeholder="9M2ABC"
                        className="input uppercase"
                        required
                    />
                </div>

                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Operator name"
                        className="input"
                    />
                </div>

                {/* Location */}
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-1">
                        Location
                    </label>
                    <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="QTH"
                        className="input"
                    />
                </div>

                {/* Signal Report */}
                <div>
                    <label htmlFor="signalReport" className="block text-sm font-medium text-slate-300 mb-1">
                        Signal Report
                    </label>
                    <select
                        id="signalReport"
                        value={signalReport}
                        onChange={(e) => setSignalReport(e.target.value)}
                        className="input"
                    >
                        {signalReports.map((sr) => (
                            <option key={sr || 'none'} value={sr}>
                                {sr || 'Select signal...'}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Remarks */}
                <div className="md:col-span-2">
                    <label htmlFor="remarks" className="block text-sm font-medium text-slate-300 mb-1">
                        Remarks
                    </label>
                    <input
                        id="remarks"
                        type="text"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Any remarks..."
                        className="input"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                {/* Traffic Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={traffic}
                        onChange={(e) => setTraffic(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
                    />
                    <span className="text-sm text-slate-300">Has Traffic</span>
                </label>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Adding...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Check In
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
