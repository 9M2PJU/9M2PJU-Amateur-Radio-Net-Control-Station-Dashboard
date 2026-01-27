'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { toast } from 'sonner'
import { Radio, Loader2, Signal, Mic2, Tag, FileText } from 'lucide-react'

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
        <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-emerald-500/30 selection:text-emerald-300">
            {/* Background elements */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-20"></div>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/5 rounded-full blur-[100px] -z-10"></div>

            <Navbar />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mt-20 md:mt-24 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-900/50 border border-slate-800 mb-6 shadow-lg shadow-emerald-500/10">
                        <Radio className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">Initialize Operation</h1>
                    <p className="text-slate-400 max-w-lg mx-auto">Configure a new net control session. All parameters can be adjusted during active operation.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="card glass-card p-6 md:p-8 space-y-8">
                    {/* Net Name */}
                    <div className="space-y-4">
                        <label htmlFor="name" className="block text-sm font-bold text-slate-300 uppercase tracking-wider">
                            Operation Name <span className="text-emerald-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Radio className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                            </div>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Weekly Ragchew Net"
                                className="input pl-11 w-full bg-slate-900/50 border-slate-800 focus:border-emerald-500/50 focus:ring-emerald-500/10"
                                required
                            />
                        </div>
                    </div>

                    {/* Net Type */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider">
                            Operation Type <span className="text-emerald-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { value: 'weekly', label: 'Standard Net', desc: 'Regular schedule', color: 'emerald' },
                                { value: 'emergency_exercise', label: 'Emergency', desc: 'Drills / Actual', color: 'rose' },
                                { value: 'special', label: 'Special Event', desc: 'Contest / Field', color: 'violet' },
                            ].map((option) => (
                                <label
                                    key={option.value}
                                    className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${type === option.value
                                        ? `border-${option.color}-500 bg-${option.color}-500/10 shadow-lg shadow-${option.color}-500/10`
                                        : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
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
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`font-bold ${type === option.value ? `text-${option.color}-400` : 'text-white'}`}>{option.label}</span>
                                        {type === option.value && (
                                            <span className={`flex h-2.5 w-2.5 rounded-full bg-${option.color}-500 shadow-[0_0_8px_currentColor]`} />
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400 font-mono">{option.desc}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Frequency & Mode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="frequency" className="block text-sm font-bold text-slate-300 uppercase tracking-wider">
                                Frequency
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Signal className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                </div>
                                <input
                                    id="frequency"
                                    type="text"
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                    placeholder="145.500 MHz"
                                    className="input pl-11 w-full bg-slate-900/50 border-slate-800 focus:border-emerald-500/50 font-mono"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="mode" className="block text-sm font-bold text-slate-300 uppercase tracking-wider">
                                Mode
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mic2 className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                </div>
                                <select
                                    id="mode"
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value)}
                                    className="input pl-11 w-full bg-slate-900/50 border-slate-800 focus:border-emerald-500/50 appearance-none"
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
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-4">
                        <label htmlFor="notes" className="block text-sm font-bold text-slate-300 uppercase tracking-wider">
                            Operational Notes
                        </label>
                        <div className="relative group">
                            <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                                <FileText className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                            </div>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any additional notes about this operation..."
                                rows={3}
                                className="input pl-11 w-full bg-slate-900/50 border-slate-800 focus:border-emerald-500/50 resize-none"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn btn-ghost text-slate-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary min-w-[140px] shadow-lg shadow-emerald-500/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Initializing...
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
