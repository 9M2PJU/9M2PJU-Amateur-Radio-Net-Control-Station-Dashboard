

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import {
    Radio,
    // Users,
    Plus,
    ChevronRight,
    Calendar,
    Activity,
    Signal,
    Loader2,
    Trash2,
    StopCircle
} from 'lucide-react'
import { toast } from 'sonner'
import type { Net } from '../lib/types'

interface NetWithCount extends Net {
    checkins: { id: string }[]
}

export default function Nets() {
    const [loading, setLoading] = useState(true)
    const [nets, setNets] = useState<NetWithCount[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        const fetchNets = async () => {
            const timeoutId = setTimeout(() => {
                if (loading) {
                    console.error('Nets: Data fetching timed out')
                    setLoading(false)
                    toast.error('Operations log synchronization timed out. Please refresh.')
                }
            }, 30000) // 30 second timeout

            try {
                console.log('Nets: Fetching session...')
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) throw sessionError

                if (!session) {
                    // Handled by Layout
                    return
                }

                const authUser = session.user

                console.log('Nets: Fetching nets...')
                const { data, error: netsError } = await supabase
                    .from('nets')
                    .select('*, checkins(id)')
                    .eq('user_id', authUser.id)
                    .order('created_at', { ascending: false })

                if (netsError) {
                    console.error('Nets: Fetch error:', netsError)
                    throw netsError
                } else {
                    console.log(`Nets: Loaded ${data?.length || 0} nets`)
                    setNets(data as any || [])
                }
            } catch (err: any) {
                console.error('Nets: Critical error:', err)
                toast.error(`System synchronization error: ${err.message || 'Unknown error'}`)
            } finally {
                clearTimeout(timeoutId)
                setLoading(false)
            }
        }
        fetchNets()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            </div>
        )
    }

    const allNets = nets

    const formatType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    const handleDeleteNet = async (id: string, name: string) => {
        // Double confirmation for list view safety
        if (!confirm(`ARE YOU SURE?\n\nThis will PERMANENTLY DELETE net "${name}" and all its logs.\nThis action cannot be undone.`)) return

        try {
            // Optimistic update
            setNets(current => current.filter(n => n.id !== id))

            // Try simple delete first (cascade should work now)
            const { error } = await supabase.from('nets').delete().eq('id', id)

            if (error) {
                // If cascade fails (23503), try manual cleanup
                if (error.code === '23503') {
                    await supabase.from('checkins').delete().eq('net_id', id)
                    await supabase.from('nets').delete().eq('id', id)
                } else {
                    throw error
                }
            }
            toast.success('Net deleted successfully')
        } catch (error: any) {
            console.error('Delete error:', error)
            toast.error('Failed to delete net')
            // Revert optimistic update
            fetchData()
        }
    }

    const handleEndNet = async (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        if (!confirm('End this net operation?')) return

        try {
            const { error } = await supabase
                .from('nets')
                .update({ ended_at: new Date().toISOString() })
                .eq('id', id)

            if (error) throw error

            setNets(current => current.map(n => n.id === id ? { ...n, ended_at: new Date().toISOString() } : n))
            toast.success('Net marked as ended')
        } catch (error) {
            toast.error('Failed to update net status')
        }
    }

    // Helper to refresh data
    const fetchData = async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const { data, error } = await supabase
                .from('nets')
                .select('*, checkins(id)')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setNets(data as any || [])
        } catch (error: any) {
            console.error('Nets refresh error:', error)
            toast.error('Failed to refresh data')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col space-y-4 px-4 md:px-6">
            {/* Header Area */}
            <div className="py-4 border-b border-white/5 bg-slate-950/50 backdrop-blur-md z-20">
                <div className="max-w-full mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono mb-1">
                            <Activity className="w-3 h-3" />
                            NET CONTROL LOGS
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Operations Log</h1>
                        <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                            HISTORY & ARCHIVE OF ON-AIR SESSIONS
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/nets/new" className="h-10 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Initialize Net
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card glass-card p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                        <Radio className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Total</p>
                        <p className="text-lg font-mono font-bold text-white">{allNets.length}</p>
                    </div>
                </div>
                <div className="card glass-card p-3 flex items-center gap-3 border-emerald-500/20">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <Activity className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-emerald-500 tracking-wider">On-Air</p>
                        <p className="text-lg font-mono font-bold text-emerald-400">{allNets.filter(n => !n.ended_at).length}</p>
                    </div>
                </div>
                <div className="card glass-card p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Weekly</p>
                        <p className="text-lg font-mono font-bold text-cyan-400">{allNets.filter(n => n.type === 'weekly').length}</p>
                    </div>
                </div>
                <div className="card glass-card p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                        <Signal className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Exercises</p>
                        <p className="text-lg font-mono font-bold text-rose-400">{allNets.filter(n => n.type === 'emergency_exercise').length}</p>
                    </div>
                </div>
            </div>

            {/* Operations List Container */}
            <div className="flex-1 card glass-card overflow-hidden flex flex-col mb-6">
                <div className="p-4 border-b border-white/5 bg-slate-900/40">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                        Historical Log
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {allNets.length === 0 ? (
                        <div className="p-16 text-center">
                            <Radio className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <h3 className="text-white font-bold mb-2">No operations found</h3>
                            <p className="text-slate-500 text-sm">Start a new net to begin logging.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {allNets.map((net) => (
                                <div
                                    key={net.id}
                                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group relative overflow-hidden"
                                >
                                    <Link to={`/nets/${net.id}`} className="flex-1 flex items-center gap-4 min-w-0">
                                        {!net.ended_at && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                                        )}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-t-white/10 ${net.ended_at
                                            ? 'bg-slate-800/80 border-slate-700'
                                            : 'bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20'
                                            }`}>
                                            <Radio className={`w-5 h-5 ${net.ended_at ? 'text-slate-500' : 'text-white'}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase truncate max-w-[200px] md:max-w-[400px]">{net.name}</h3>
                                                {!net.ended_at && <span className="text-[8px] font-bold text-emerald-500 px-1 border border-emerald-500/30 rounded animate-pulse">LIVE</span>}
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono italic mt-0.5">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(net.started_at), 'MMM d, yyyy')}</span>
                                                {net.frequency && <span className="flex items-center gap-1"><Signal className="w-3 h-3" /> {net.frequency}</span>}
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="flex items-center gap-4 pl-4 border-l border-white/5 bg-transparent z-10">
                                        <span className={`hidden lg:inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${net.type === 'weekly' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                            net.type === 'emergency_exercise' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                                'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                            }`}>
                                            {formatType(net.type)}
                                        </span>

                                        {!net.ended_at && (
                                            <button
                                                onClick={(e) => handleEndNet(net.id, e)}
                                                className="p-2 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
                                                title="End Net"
                                            >
                                                <StopCircle className="w-4 h-4" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDeleteNet(net.id, net.name)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Delete Net"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <Link to={`/nets/${net.id}`}>
                                            <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
