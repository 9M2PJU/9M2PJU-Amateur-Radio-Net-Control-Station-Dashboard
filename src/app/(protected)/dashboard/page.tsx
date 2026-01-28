'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
    const router = useRouter()

    useEffect(() => {
        const fetchDashboardData = async () => {
            const timeoutId = setTimeout(() => {
                if (loading) {
                    console.error('Dashboard: Data fetching timed out')
                    setLoading(false)
                    toast.error('Dashboard synchronization timed out. Please refresh.')
                }
            }, 30000) // 30 second timeout

            try {
                console.log('Dashboard: Fetching user...')
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) throw sessionError

                if (!session) {
                    // Handled by Layout, but safe to check
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
                const { data: netsData, error: netsError } = await supabase
                    .from('nets')
                    .select('*, checkins(*)')
                    .eq('user_id', authUser.id)
                    .order('created_at', { ascending: false })

                if (netsError) {
                    console.error('Dashboard: Nets error:', netsError)
                    throw netsError
                } else {
                    console.log(`Dashboard: Loaded ${netsData?.length || 0} nets`)
                    setNets(netsData as any || [])
                }
            } catch (err: any) {
                console.error('Dashboard: Critical error:', err)
                toast.error(`System synchronization error: ${err.message || 'Unknown error'}`)
            } finally {
                clearTimeout(timeoutId)
                setLoading(false)
            }
        }

        fetchDashboardData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
        <div className="flex flex-col h-[calc(100vh-64px)] mt-16 overflow-hidden bg-slate-950">
            <div className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col gap-4">
                {/* Stats Row - Compact */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 h-24">
                    <div className="card glass-card p-4 flex items-center gap-4 hover:bg-slate-900/80 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 shrink-0">
                            <Radio className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">Active Networks</p>
                            <p className="text-2xl font-mono font-bold text-white truncate">{activeNets.length}</p>
                        </div>
                    </div>
                    <div className="card glass-card p-4 flex items-center gap-4 hover:bg-slate-900/80 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-500 shrink-0">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">Total Nets</p>
                            <p className="text-2xl font-mono font-bold text-white truncate">{allNets.length}</p>
                        </div>
                    </div>
                    <div className="card glass-card p-4 flex items-center gap-4 hover:bg-slate-900/80 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 text-violet-500 shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">Total Check-ins</p>
                            <p className="text-2xl font-mono font-bold text-white truncate">{totalCheckins}</p>
                        </div>
                    </div>
                    <div className="card glass-card p-4 flex items-center gap-4 hover:bg-slate-900/80 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 shrink-0">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">Unique Operators</p>
                            <p className="text-2xl font-mono font-bold text-white truncate">{uniqueCallsigns}</p>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Grid - Flex Grow to fill remaining space */}
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left Column: Activity & Operations (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-4 h-full min-h-0">
                        {/* Main Activity Chart - ~40% Height */}
                        <div className="card glass-card p-4 h-[40%] shrink-0 flex flex-col relative min-h-0">
                            <NetActivityChart data={activityData} title="Check-in Activity (7 Days)" />
                        </div>

                        {/* Recent Operations Panel - Fills remainig height */}
                        <div className="card glass-card flex flex-col flex-1 min-h-0 overflow-hidden">
                            <div className="p-3 border-b border-white/5 flex items-center justify-between shrink-0 bg-slate-950/20">
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                                    Recent Operations
                                </h3>
                                <Link href="/nets" className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                                    View All <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                                {allNets.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">No operations logged</div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {allNets.map((net) => (
                                            <Link
                                                key={net.id}
                                                href={`/nets/${net.id}`}
                                                className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${net.ended_at ? 'bg-slate-700' : 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]'}`} />
                                                    <div>
                                                        <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors uppercase truncate">{net.name}</p>
                                                        <p className="text-[11px] text-slate-500 font-mono">{format(new Date(net.started_at), 'MMM d, HH:mm')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50 min-w-[80px] text-center">{net.type.replace('_', ' ')}</span>
                                                    <div className="flex items-center gap-2 text-xs text-slate-300 w-12 justify-end">
                                                        <Users className="w-3.5 h-3.5 text-slate-500" />
                                                        {net.checkins?.length || 0}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Statistics (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-4 h-full min-h-0">
                        {/* Signal Strength - 33% */}
                        <div className="card glass-card p-1 flex-1 min-h-0 flex flex-col relative overflow-hidden">
                            <SignalReportChart data={signalData} title="Signal Quality" />
                        </div>

                        {/* Top Participants - 33% */}
                        <div className="card glass-card p-1 flex-1 min-h-0 flex flex-col relative overflow-hidden">
                            <TopParticipantsChart data={topParticipants} title="Top Field Operators" />
                        </div>

                        {/* Net Types - 33% (Now Bar Chart) */}
                        <div className="card glass-card p-1 flex-1 min-h-0 flex flex-col relative overflow-hidden">
                            <NetTypeDistribution data={netTypeData} title="Operational Breakdown" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
