
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import {
    Radio,
    Activity,
    Signal,
    Type,
    FileText,
    Loader2,
    ArrowLeft,
    CheckCircle2
} from 'lucide-react'

export default function NetNew() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [type, setType] = useState<'weekly' | 'emergency_exercise' | 'special'>('weekly')
    const [frequency, setFrequency] = useState('')
    const [mode, setMode] = useState('FM')
    const [notes, setNotes] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error('Session expired. Please login again.')
                navigate('/login')
                return
            }

            const { data, error } = await supabase
                .from('nets')
                .insert([
                    {
                        user_id: session.user.id,
                        name: name.toUpperCase(),
                        type,
                        frequency,
                        mode: mode.toUpperCase(),
                        notes,
                        started_at: new Date().toISOString()
                    }
                ])
                .select()
                .single()

            if (error) throw error

            toast.success('Net initialized successfully')
            if (data) {
                navigate(`/nets/${data.id}`)
            } else {
                navigate('/nets')
            }
        } catch (error: any) {
            console.error('Error creating net:', error)
            toast.error(error.message || 'Failed to initialize net')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 mt-16">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Operations
                </button>

                <div className="card glass-card p-6 md:p-8 border-t-emerald-500/30">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                            <PlusIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Initialize New Net</h1>
                            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-1">
                                Command & Control Setup
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                    Net Name / Event Title <span className="text-emerald-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="E.G. SUNDAY MORNING TRAFFIC NET"
                                        className="input pl-11 bg-slate-900/50 border-slate-700 hover:border-slate-600 focus:border-emerald-500/50 transition-all uppercase placeholder:text-slate-700 font-bold"
                                    />
                                    <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                        Operation Type
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value as any)}
                                            className="input pl-11 bg-slate-900/50 border-slate-700 hover:border-slate-600 focus:border-emerald-500/50 transition-all appearance-none"
                                        >
                                            <option value="weekly">Weekly Net</option>
                                            <option value="emergency_exercise">Emergency Exercise</option>
                                            <option value="special">Special Event</option>
                                        </select>
                                        <Radio className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400" />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                        Operating Frequency
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={frequency}
                                            onChange={(e) => setFrequency(e.target.value)}
                                            placeholder="E.G. 145.500 MHZ"
                                            className="input pl-11 bg-slate-900/50 border-slate-700 hover:border-slate-600 focus:border-emerald-500/50 transition-all font-mono"
                                        />
                                        <Signal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                        Mode
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={mode}
                                            onChange={(e) => setMode(e.target.value)}
                                            placeholder="FM, DMR, SSB, etc."
                                            className="input pl-11 bg-slate-900/50 border-slate-700 hover:border-slate-600 focus:border-emerald-500/50 transition-all font-bold"
                                        />
                                        <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                    Initial Notes / Instructions
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any additional details..."
                                        rows={3}
                                        className="input pl-11 pt-3 bg-slate-900/50 border-slate-700 hover:border-slate-600 focus:border-emerald-500/50 transition-all resize-none min-h-[100px]"
                                    />
                                    <FileText className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn bg-emerald-600 hover:bg-emerald-500 text-white w-full py-4 text-base font-bold shadow-lg shadow-emerald-500/20 group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        SYNCING WITH DATABASE...
                                    </>
                                ) : (
                                    <>
                                        START NET OPERATION
                                        <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    )
}
