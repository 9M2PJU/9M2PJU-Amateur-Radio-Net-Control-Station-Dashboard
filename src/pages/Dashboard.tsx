import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import NetActivityChart from '@/components/widgets/NetActivityChart'
import TopParticipantsChart from '@/components/widgets/TopParticipantsChart'
import NetTypeDistribution from '@/components/widgets/NetTypeDistribution'
import SignalReportChart from '@/components/widgets/SignalReportChart'
import { format, subDays } from 'date-fns'
import {
    Radio,
    Users,
    Activity,
    Plus,
    ChevronRight,
    Globe,
    Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import type { Net, Checkin, Profile } from '@/lib/types'

// Extended Net type to include checkins relation
interface NetWithCheckins extends Net {
    checkins: Checkin[]
}

export default function Dashboard() {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<Profile | null>(null)
    const [nets, setNets] = useState<NetWithCheckins[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                console.log('Dashboard: Fetching user...')
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) {
                    console.log('Dashboard: No session, redirecting...')
                    navigate('/login')
                    return
                }

                const authUser = session.user

                // Get profile data
                console.log('Dashboard: Fetching profile...')
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single()

                if (profileError) console.warn('Dashboard: Profile error:', profileError)

                if (profile) setUser(profile)
                else setUser({ id: authUser.id, email: authUser.email, callsign: 'OPERATOR' } as any)

                // Fetch all nets for this user
                console.log('Dashboard: Fetching nets...')
                const { data: netsData, error } = await supabase
                    .from('nets')
                    .select('*, checkins(*)')
                    .eq('user_id', authUser.id)
                    .order('created_at', { ascending: false })

                if (error) {
                    console.error('Dashboard: Nets error:', error)
                    toast.error('Failed to load dashboard data')
                } else {
                    console.log(`Dashboard: Loaded ${netsData?.length || 0} nets`)
                    setNets(netsData as any || [])
                }
            } catch (err) {
                console.error('Dashboard: Critical error:', err)
                toast.error('System synchronization error')
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [navigate])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            </div>
        )
    }

    const allNets = nets || []
    const activeNets = allNets.filter(n => !n.ended_at)
    const totalCheckins = allNets.reduce((sum, n) => sum + (n.checkins?.length || 0), 0)
    const uniqueCallsigns = new Set(allNets.flatMap(n => n.checkins?.map((c) => c.callsign) || [])).size

    // Calculate activity for last 7 days
    const activityData = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i)
        const dateStr = format(date, 'yyyy-MM-dd')
        const checkinsCount = allNets.flatMap(n =>
            (n.checkins || []).filter((c) =>
                format(new Date(c.checked_in_at), 'yyyy-MM-dd') === dateStr
            )
        ).length
        return { date: dateStr, checkins: checkinsCount }
    })

    // Calculate top participants
    const participantCounts: Record<string, number> = {}
    allNets.forEach(n => {
        (n.checkins || []).forEach((c) => {
            participantCounts[c.callsign] = (participantCounts[c.callsign] || 0) + 1
        })
    })
    const topParticipants = Object.entries(participantCounts)
        .map(([callsign, checkins]) => ({ callsign, checkins }))
        .sort((a, b) => b.checkins - a.checkins)
        .slice(0, 10)

    // Calculate net type distribution
    const typeDistribution: Record<string, number> = {}
    allNets.forEach(n => {
        typeDistribution[n.type] = (typeDistribution[n.type] || 0) + 1
    })
    const netTypeData = Object.entries(typeDistribution)
        .map(([name, value]) => ({ name, value }))

    // Calculate signal report distribution (Strength 1-9)
    const strengthDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
    allNets.forEach(n => {
        (n.checkins || []).forEach(c => {
            if (c.signal_strength) {
                strengthDistribution[c.signal_strength] = (strengthDistribution[c.signal_strength] || 0) + 1
            }
        })
    })
    const signalData = Object.entries(strengthDistribution).map(([name, count]) => ({
        name: `S${name}`,
        count
    }))

    return (
        <main className="h-screen pt-16 md:pt-20 overflow-hidden flex flex-col bg-slate-950">
            {/* Header Area - Fixed Height */}
            <div className="px-4 md:px-6 py-4 border-b border-white/5 bg-slate-950/50 backdrop-blur-md z-20">
                <div className="max-w-full mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono mb-1">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            SYSTEM OPERATIONAL
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                            9M2PJU NCS Center
                        </h1>
                        <p className="text-slate-500 text-[11px] font-mono">
                            OPERATOR: <span className="text-emerald-400 font-bold">{user?.callsign || '9M2PJU'}</span>
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

            {/* Main Content Area - Scrollable Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
                {/* KPI Grid - Top Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card glass-card p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                            <Radio className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active</p>
                            <p className="text-xl font-mono font-bold text-white">{activeNets.length}</p>
                        </div>
                    </div>
                    <div className="card glass-card p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-500">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Nets</p>
                            <p className="text-xl font-mono font-bold text-white">{allNets.length}</p>
                        </div>
                    </div>
                    <div className="card glass-card p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 text-violet-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Check-ins</p>
                            <p className="text-xl font-mono font-bold text-white">{totalCheckins}</p>
                        </div>
                    </div>
                    <div className="card glass-card p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Operators</p>
                            <p className="text-xl font-mono font-bold text-white">{uniqueCallsigns}</p>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-6">
                        {/* Main Activity Chart */}
                        <div className="card glass-card p-4 h-[350px]">
                            <NetActivityChart data={activityData} title="Check-in Activity (7 Days)" />
                        </div>

                        {/* Recent Operations Panel */}
                        <div className="card glass-card flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                                    Recent Operations
                                </h3>
                                <Link to="/nets" className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300">VIEW ALL</Link>
                            </div>
                            <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                                {allNets.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500 text-sm">No operations logged</div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {allNets.slice(0, 8).map((net) => (
                                            <Link
                                                key={net.id}
                                                to={`/nets/${net.id}`}
                                                className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${net.ended_at ? 'bg-slate-700' : 'bg-emerald-500 animate-pulse'}`} />
                                                    <div>
                                                        <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors uppercase truncate max-w-[200px]">{net.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-mono italic">{format(new Date(net.started_at), 'MMM d, HH:mm')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">{net.type.replace('_', ' ')}</span>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-300 min-w-[40px]">
                                                        <Users className="w-3 h-3 text-slate-500" />
                                                        {net.checkins?.length || 0}
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        {/* Signal Strength Radar/Chart */}
                        <div className="card glass-card p-4 h-[300px]">
                            <SignalReportChart data={signalData} title="Signal Quality" />
                        </div>

                        {/* Top Participants Widget */}
                        <div className="card glass-card p-4 h-[350px]">
                            <TopParticipantsChart data={topParticipants} title="Top Field Operators" />
                        </div>

                        {/* Net Types Distribution */}
                        <div className="card glass-card p-4 h-[250px]">
                            <NetTypeDistribution data={netTypeData} title="Operational Breakdown" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
