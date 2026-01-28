import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import {
    Radio,
    Users,
    Plus,
    ChevronRight,
    Calendar,
    Activity,
    Signal,
    Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import type { Net } from '@/lib/types'

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
            }, 10000) // 10 second timeout

            try {
                console.log('Nets: Fetching session...')
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) throw sessionError

                if (!session) {
                    console.log('Nets: No session, redirecting...')
                    navigate('/login')
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
    }, [navigate])


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

    return (
        <main className="h-screen pt-16 md:pt-20 overflow-hidden flex flex-col bg-slate-950">
            {/* Header Area - Compact Fixed Height */}
            <div className="px-4 md:px-6 py-3 border-b border-white/5 bg-slate-950/50 backdrop-blur-md z-20 shrink-0">
                <div className="max-w-full mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-3">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono mb-0.5">
                            <Activity className="w-3 h-3" />
                            NET CONTROL LOGS
                        </div>
                        <h1 className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight">Operations Log</h1>
                        <p className="text-slate-500 text-[10px] font-mono">
                            HISTORY & ARCHIVE OF ON-AIR SESSIONS
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/nets/new" className="h-9 px-3 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Initialize Net
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Split into Stats and List */}
            <div className="flex-1 overflow-hidden flex flex-col p-4 md:p-6 space-y-3">
                {/* Stats Summary - Compact Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
                    <div className="card glass-card p-2.5 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                            <Radio className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider truncate">Total</p>
                            <p className="text-base font-mono font-bold text-white">{allNets.length}</p>
                        </div>
                    </div>
                    <div className="card glass-card p-2.5 flex items-center gap-3 border-emerald-500/20">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0">
                            <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase font-bold text-emerald-500 tracking-wider truncate">On-Air</p>
                            <p className="text-base font-mono font-bold text-emerald-400">{allNets.filter(n => !n.ended_at).length}</p>
                        </div>
                    </div>
                    <div className="card glass-card p-2.5 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shrink-0">
                            <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider truncate">Weekly</p>
                            <p className="text-base font-mono font-bold text-cyan-400">{allNets.filter(n => n.type === 'weekly').length}</p>
                        </div>
                    </div>
                    <div className="card glass-card p-2.5 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20 shrink-0">
                            <Signal className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider truncate">Exercises</p>
                            <p className="text-base font-mono font-bold text-rose-400">{allNets.filter(n => n.type === 'emergency_exercise').length}</p>
                        </div>
                    </div>
                </div>

                {/* Operations List Container - Viewport Filling */}
                <div className="flex-1 card glass-card overflow-hidden flex flex-col border-white/5">
                    <div className="p-3 border-b border-white/5 bg-slate-900/40 shrink-0">
                        <h3 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
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
                                    <Link
                                        key={net.id}
                                        to={`/nets/${net.id}`}
                                        className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors group relative overflow-hidden"
                                    >
                                        {!net.ended_at && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                                        )}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-t-white/10 ${net.ended_at
                                                ? 'bg-slate-800/80 border-slate-700'
                                                : 'bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20'
                                                }`}>
                                                <Radio className={`w-4 h-4 ${net.ended_at ? 'text-slate-500' : 'text-white'}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors uppercase truncate max-w-[400px]">{net.name}</h3>
                                                    {!net.ended_at && <span className="text-[8px] font-bold text-emerald-500 px-1 border border-emerald-500/30 rounded animate-pulse">LIVE</span>}
                                                </div>
                                                <div className="flex items-center gap-4 text-[9px] text-slate-500 font-mono italic mt-0.5">
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(net.started_at), 'MMM d, yyyy')}</span>
                                                    {net.frequency && <span className="flex items-center gap-1"><Signal className="w-3 h-3" /> {net.frequency}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5 shrink-0">
                                            <span className={`hidden sm:inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${net.type === 'weekly' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                net.type === 'emergency_exercise' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                                    'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                                }`}>
                                                {formatType(net.type)}
                                            </span>
                                            <div className="flex items-center gap-2 bg-slate-900/50 px-2 py-1 rounded-lg border border-white/5">
                                                <Users className="w-3 h-3 text-slate-500" />
                                                <span className="text-[11px] font-mono font-bold text-white">{net.checkins?.length || 0}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
