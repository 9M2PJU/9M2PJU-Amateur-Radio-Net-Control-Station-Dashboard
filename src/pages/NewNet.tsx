import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Radio, Loader2, Signal, Mic2, FileText } from 'lucide-react'

export default function NewNet() {
    const [name, setName] = useState('')
    const [type, setType] = useState<'weekly' | 'emergency_exercise' | 'special'>('weekly')
    const [frequency, setFrequency] = useState('')
    const [mode, setMode] = useState('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

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
                navigate('/login')
                return
            }

            // Get user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single()

            if (!profile) {
                // Try to create profile if it doesn't exist (fallback)
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        callsign: user.user_metadata?.callsign || 'UNKNOWN',
                        name: user.user_metadata?.name || null
                    })
                    .select('id')
                    .single()

                if (profileError) {
                    console.error('Profile creation error:', profileError)
                    toast.error('Profile sync failed. Please try logging out and back in.')
                    return
                }
            }

            let formattedFrequency = frequency.trim()
            if (formattedFrequency && !isNaN(Number(formattedFrequency))) {
                formattedFrequency += ' MHz'
            }

            const { data: net, error } = await supabase
                .from('nets')
                .insert({
                    user_id: user.id,
                    name: name.trim(),
                    type,
                    frequency: formattedFrequency || null,
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
            navigate(`/nets/${net.id}`)
        } catch {
            toast.error('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="h-screen pt-16 md:pt-20 overflow-hidden flex flex-col bg-slate-950">
            {/* Header Area - Fixed Height */}
            <div className="px-4 md:px-6 py-6 border-b border-white/5 bg-slate-950/50 backdrop-blur-md z-20">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                        <Radio className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Initialize Operation</h1>
                        <p className="text-slate-500 text-xs font-mono mt-1 uppercase tracking-wider">Configure New Net Control Session</p>
                    </div>
                </div>
            </div>

            {/* Form Container - Scrollable if needed, but optimized for viewport */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex justify-center">
                <form onSubmit={handleSubmit} className="card glass-card w-full max-w-3xl p-6 md:p-10 space-y-8 h-fit">
                    {/* Net Name */}
                    <div className="space-y-4">
                        <label htmlFor="name" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                            Operation Name <span className="text-emerald-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Radio className="h-5 w-5 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                            </div>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Weekly Ragchew Net"
                                className="input pl-11 w-full bg-slate-900/50 border-slate-800 focus:border-emerald-500/50 focus:ring-emerald-500/10 text-lg font-bold"
                                required
                            />
                        </div>
                    </div>

                    {/* Net Type */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                            Operation Type <span className="text-emerald-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { value: 'weekly', label: 'Standard Net', desc: 'REGULAR SCHEDULE', color: 'emerald' },
                                { value: 'emergency_exercise', label: 'Emergency', desc: 'DRILLS / ACTUAL', color: 'rose' },
                                { value: 'special', label: 'Special Event', desc: 'FIELD OPS', color: 'violet' },
                            ].map((option) => (
                                <label
                                    key={option.value}
                                    className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${type === option.value
                                        ? `border-${option.color}-500/50 bg-${option.color}-500/5 shadow-lg shadow-${option.color}-500/5`
                                        : 'border-slate-800/50 bg-slate-900/30 hover:border-slate-700'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="type"
                                        value={option.value}
                                        checked={type === option.value}
                                        onChange={(e) => setType(e.target.value as any)}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-sm font-bold uppercase tracking-tight ${type === option.value ? `text-${option.color}-400` : 'text-slate-400'}`}>{option.label}</span>
                                        {type === option.value && (
                                            <span className={`flex h-1.5 w-1.5 rounded-full bg-${option.color}-500 shadow-[0_0_8px_currentColor]`} />
                                        )}
                                    </div>
                                    <span className="text-[9px] text-slate-600 font-mono font-bold tracking-widest">{option.desc}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Frequency & Mode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label htmlFor="frequency" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                Frequency
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Signal className="h-5 w-5 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                                </div>
                                <input
                                    id="frequency"
                                    type="text"
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                    placeholder="145.500"
                                    className="input pl-11 pr-16 w-full bg-slate-900/50 border-slate-800 focus:border-emerald-500/50 font-mono text-white"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <span className="text-[10px] font-bold text-slate-700 group-focus-within:text-emerald-500/50 uppercase tracking-widest">MHz</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label htmlFor="mode" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                Mode
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mic2 className="h-5 w-5 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                                </div>
                                <select
                                    id="mode"
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value)}
                                    className="input pl-11 w-full bg-slate-900/50 border-slate-800 focus:border-emerald-500/50 appearance-none text-white text-sm"
                                >
                                    <option value="" className="bg-slate-900">Select mode...</option>
                                    <option value="FM" className="bg-slate-900">FM</option>
                                    <option value="SSB" className="bg-slate-900">SSB</option>
                                    <option value="AM" className="bg-slate-900">AM</option>
                                    <option value="CW" className="bg-slate-900">CW</option>
                                    <option value="Digital" className="bg-slate-900">Digital</option>
                                    <option value="FT8" className="bg-slate-900">FT8</option>
                                    <option value="DMR" className="bg-slate-900">DMR</option>
                                    <option value="D-STAR" className="bg-slate-900">D-STAR</option>
                                    <option value="YSF" className="bg-slate-900">YSF</option>
                                    <option value="NXDN" className="bg-slate-900">NXDN</option>
                                    <option value="P25" className="bg-slate-900">P25</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-4">
                        <label htmlFor="notes" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                            Operational Notes
                        </label>
                        <div className="relative group">
                            <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                                <FileText className="h-5 w-5 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                            </div>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any additional notes about this operation..."
                                rows={2}
                                className="input pl-11 w-full bg-slate-900/50 border-slate-800 focus:border-emerald-500/50 resize-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Submit Section */}
                    <div className="flex items-center justify-end gap-5 pt-8 border-t border-white/5">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors px-4"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-12 px-8 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Initializing...</span>
                                </>
                            ) : (
                                <>
                                    <Radio className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span>START OPERATION</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}
