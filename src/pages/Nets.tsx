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
            try {
                console.log('Nets: Fetching session...')
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) {
                    console.log('Nets: No session, redirecting...')
                    navigate('/login')
                    return
                }

                const authUser = session.user

                console.log('Nets: Fetching nets...')
                const { data, error } = await supabase
                    .from('nets')
                    .select('*, checkins(id)')
                    .eq('user_id', authUser.id)
                    .order('created_at', { ascending: false })

                if (error) {
                    console.error('Nets: Fetch error:', error)
                    toast.error('Failed to load nets')
                } else {
                    console.log(`Nets: Loaded ${data?.length || 0} nets`)
                    setNets(data as any || [])
                }
            } catch (err) {
                console.error('Nets: Critical error:', err)
                toast.error('System synchronization error')
            } finally {
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 mt-16 md:mt-20 pb-16 md:pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
                        <Activity className="w-3 h-3" />
                        NET CONTROL LOGS
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Operations Log</h1>
                    <p className="text-slate-400 mt-2 max-w-xl">
                        History of your net control sessions and exercises.
                    </p>
                </div>
                <Link to="/nets/new" className="btn btn-primary shadow-lg shadow-emerald-500/20 group">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>Initialize Net</span>
                </Link>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card glass-card p-5 flex flex-col items-center justify-center text-center group hover:bg-slate-800/80 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Radio className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-3xl font-bold text-white font-mono">{allNets.length}</p>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mt-1">Total Nets</p>
                </div>
                <div className="card glass-card p-5 flex flex-col items-center justify-center text-center group hover:bg-slate-800/80 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-3xl font-bold text-emerald-400 font-mono">
                        {allNets.filter(n => !n.ended_at).length}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mt-1">Live Active</p>
                </div>
                <div className="card glass-card p-5 flex flex-col items-center justify-center text-center group hover:bg-slate-800/80 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                    </div>
                    <p className="text-3xl font-bold text-cyan-400 font-mono">
                        {allNets.filter(n => n.type === 'weekly').length}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mt-1">Weekly</p>
                </div>
                <div className="card glass-card p-5 flex flex-col items-center justify-center text-center group hover:bg-slate-800/80 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Signal className="w-5 h-5 text-rose-400" />
                    </div>
                    <p className="text-3xl font-bold text-rose-400 font-mono">
                        {allNets.filter(n => n.type === 'emergency_exercise').length}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mt-1">Exercises</p>
                </div>
            </div>

            {/* Nets List */}
            <div className="card glass-card p-6 min-h-[400px]">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                    All Operations
                </h3>

                {allNets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                            <Radio className="w-10 h-10 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No operations logged</h3>
                        <p className="text-slate-500 mb-6 max-w-sm">Start your first net control session to begin logging check-ins and tracking statistics.</p>
                        <Link to="/nets/new" className="btn btn-primary shadow-lg shadow-emerald-500/20">
                            <Plus className="w-4 h-4" />
                            Initialize First Net
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {allNets.map((net) => (
                            <Link
                                key={net.id}
                                to={`/nets/${net.id}`}
                                className="group flex flex-col md:flex-row md:items-center p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-800/80 transition-all hover:shadow-lg hover:shadow-emerald-500/5 relative overflow-hidden"
                            >
                                {/* Active indicator strip */}
                                {!net.ended_at && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 animate-pulse"></div>
                                )}

                                <div className="flex items-center gap-5 flex-1 pl-2">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-t-white/10 ${net.ended_at
                                        ? 'bg-slate-800 border-slate-700'
                                        : 'bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20'
                                        }`}>
                                        <Radio className={`w-6 h-6 ${net.ended_at ? 'text-slate-500' : 'text-white'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                                                {net.name}
                                            </h3>
                                            {!net.ended_at && (
                                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 animate-pulse">
                                                    LIVE
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-400 font-mono">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                {format(new Date(net.started_at), 'MMM d, yyyy HH:mm')}
                                            </span>
                                            {net.frequency && (
                                                <span className="flex items-center gap-1.5">
                                                    <Signal className="w-3.5 h-3.5 text-slate-500" />
                                                    {net.frequency}
                                                </span>
                                            )}
                                            {net.mode && (
                                                <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                                                    {net.mode}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-4 md:mt-0 pl-16 md:pl-0">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${net.type === 'weekly' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        net.type === 'emergency_exercise' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                            'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                        }`}>
                                        {formatType(net.type)}
                                    </span>

                                    <div className="flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 group-hover:border-emerald-500/20 transition-colors">
                                        <Users className="w-3.5 h-3.5 text-slate-400 mr-2" />
                                        <span className="text-sm font-mono font-bold text-white">{net.checkins?.length || 0}</span>
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
