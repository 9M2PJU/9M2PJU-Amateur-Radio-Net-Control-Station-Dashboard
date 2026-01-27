'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { toast } from 'sonner'
import { Radio, Loader2 } from 'lucide-react'

export default function NewNetPage() {
    const [name, setName] = useState('')
    const [type, setType] = useState<'weekly' | 'emergency_exercise' | 'special'>('weekly')
    const [frequency, setFrequency] = useState('')
    const [mode, setMode] = useState('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            toast.error('Net name is required')
            return
        }

        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error('Not authenticated')
                router.push('/login')
                return
            }

            // Get user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single()

            if (!profile) {
                toast.error('Profile not found')
                return
            }

            const { data: net, error } = await supabase
                .from('nets')
                .insert({
                    user_id: profile.id,
                    name: name.trim(),
                    type,
                    frequency: frequency.trim() || null,
                    mode: mode.trim() || null,
                    notes: notes.trim() || null,
                })
                .select()
                .single()

            if (error) {
                toast.error('Failed to create net')
                console.error(error)
                return
            }

            toast.success('Net created successfully!')
            router.push(`/nets/${net.id}`)
        } catch {
            toast.error('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Navbar />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Start New Net</h1>
                    <p className="text-slate-400 mt-1">Create a new net session for logging check-ins</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="card space-y-6">
                    {/* Net Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                            Net Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Weekly Ragchew Net, Emergency Exercise 2024"
                            className="input"
                            required
                        />
                    </div>

                    {/* Net Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Net Type <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { value: 'weekly', label: 'Weekly Net', desc: 'Regular weekly sessions', color: 'emerald' },
                                { value: 'emergency_exercise', label: 'Emergency Exercise', desc: 'ARES/RACES drills', color: 'rose' },
                                { value: 'special', label: 'Special Event', desc: 'Field day, contests', color: 'violet' },
                            ].map((option) => (
                                <label
                                    key={option.value}
                                    className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${type === option.value
                                        ? `border-${option.color}-500 bg-${option.color}-500/10`
                                        : 'border-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="type"
                                        value={option.value}
                                        checked={type === option.value}
                                        onChange={(e) => setType(e.target.value as typeof type)}
                                        className="sr-only"
                                    />
                                    <span className="font-medium text-white">{option.label}</span>
                                    <span className="text-xs text-slate-400 mt-1">{option.desc}</span>
                                    {type === option.value && (
                                        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-${option.color}-500`} />
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Frequency & Mode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="frequency" className="block text-sm font-medium text-slate-300 mb-2">
                                Frequency
                            </label>
                            <input
                                id="frequency"
                                type="text"
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                                placeholder="e.g., 145.500 MHz"
                                className="input"
                            />
                        </div>
                        <div>
                            <label htmlFor="mode" className="block text-sm font-medium text-slate-300 mb-2">
                                Mode
                            </label>
                            <select
                                id="mode"
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                                className="input"
                            >
                                <option value="">Select mode...</option>
                                <option value="FM">FM</option>
                                <option value="SSB">SSB</option>
                                <option value="AM">AM</option>
                                <option value="CW">CW</option>
                                <option value="Digital">Digital</option>
                                <option value="FT8">FT8</option>
                                <option value="DMR">DMR</option>
                                <option value="D-STAR">D-STAR</option>
                                <option value="YSF">YSF</option>
                                <option value="NXDN">NXDN</option>
                                <option value="P25">P25</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-2">
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional notes about this net..."
                            rows={3}
                            className="input resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Radio className="w-4 h-4" />
                                    Start Net
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
