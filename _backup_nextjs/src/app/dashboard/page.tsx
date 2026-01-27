export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import StatsCard from '@/components/widgets/StatsCard'
import NetActivityChart from '@/components/widgets/NetActivityChart'
import TopParticipantsChart from '@/components/widgets/TopParticipantsChart'
import NetTypeDistribution from '@/components/widgets/NetTypeDistribution'
import Link from 'next/link'
import { format, subDays } from 'date-fns'
import {
    Radio,
    Users,
    Clock,
    Activity,
    Plus,
    ChevronRight,
    Calendar,
    Signal,
    Globe
} from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch all nets for this user
    const { data: nets } = await supabase
        .from('nets')
        .select('*, checkins(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const allNets = nets || []
    const activeNets = allNets.filter(n => !n.ended_at)
    const totalCheckins = allNets.reduce((sum, n) => sum + (n.checkins?.length || 0), 0)
    const uniqueCallsigns = new Set(allNets.flatMap(n => n.checkins?.map((c: { callsign: string }) => c.callsign) || [])).size

    // Calculate activity for last 7 days
    const activityData = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i)
        const dateStr = format(date, 'yyyy-MM-dd')
        const checkins = allNets.flatMap(n =>
            (n.checkins || []).filter((c: { checked_in_at: string }) =>
                format(new Date(c.checked_in_at), 'yyyy-MM-dd') === dateStr
            )
        ).length
        return { date: dateStr, checkins }
    })

    // Calculate top participants
    const participantCounts: Record<string, number> = {}
    allNets.forEach(n => {
        (n.checkins || []).forEach((c: { callsign: string }) => {
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

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-emerald-500/30 selection:text-emerald-300">
            {/* Background elements */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-20"></div>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/5 rounded-full blur-[100px] -z-10"></div>

            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mt-20 md:mt-24 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            SYSTEM OPERATIONAL
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            Command Center
                        </h1>
                        <p className="text-slate-400 mt-2 max-w-xl">
                            Welcome back, <span className="text-emerald-400 font-medium">{user.user_metadata?.callsign || user.email}</span>.
                            Your station overview and net statistics.
                        </p>
                    </div>
                    <Link href="/nets/new" className="btn btn-primary shadow-lg shadow-emerald-500/20 group">
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        <span>Initialize Net</span>
                    </Link>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatsCard
                        title="Active Nets"
                        value={activeNets.length}
                        subtitle="Currently on-air"
                        icon={Radio}
                        color="emerald"
                    />
                    <StatsCard
                        title="Total Nets"
                        value={allNets.length}
                        subtitle="Lifetime logs"
                        icon={Globe}
                        color="cyan"
                    />
                    <StatsCard
                        title="Check-ins"
                        value={totalCheckins}
                        subtitle="Total stations logged"
                        icon={Users}
                        color="violet"
                    />
                    <StatsCard
                        title="Participants"
                        value={uniqueCallsigns}
                        subtitle="Unique operators"
                        icon={Activity}
                        color="amber"
                    />
                </div>

                {/* Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card glass-card p-1">
                        <NetActivityChart data={activityData} title="Activity (7 Days)" />
                    </div>
                    <div className="card glass-card p-1">
                        <TopParticipantsChart data={topParticipants} title="Top Operators" />
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Distribution Chart */}
                    <div className="card glass-card p-1">
                        <NetTypeDistribution data={netTypeData} title="Net Types" />
                    </div>

                    {/* Recent Nets List */}
                    <div className="lg:col-span-2 card glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-1 bg-emerald-500 rounded-full"></div>
                                <h3 className="text-lg font-bold text-white">Recent Operations</h3>
                            </div>
                            <Link href="/nets" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group transition-colors">
                                Archive <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {allNets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                                    <Radio className="w-8 h-8 text-slate-600" />
                                </div>
                                <h4 className="text-white font-medium mb-1">No operations logged</h4>
                                <p className="text-slate-500 text-sm max-w-xs mb-4">Start your first net control session to begin logging data.</p>
                                <Link href="/nets/new" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                                    Initialize First Net
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {allNets.slice(0, 5).map((net) => (
                                    <Link
                                        key={net.id}
                                        href={`/nets/${net.id}`}
                                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-800/80 transition-all hover:shadow-lg hover:shadow-emerald-500/5"
                                    >
                                        <div className="flex items-start gap-4 mb-3 sm:mb-0">
                                            <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${net.ended_at ? 'bg-slate-600' : 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                                                    {net.name}
                                                    {net.frequency && (
                                                        <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                                                            {net.frequency}
                                                        </span>
                                                    )}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-mono">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(net.started_at), 'MMM d, HH:mm')}
                                                    </span>
                                                    {!net.ended_at && (
                                                        <span className="text-emerald-500 font-bold tracking-wider">LIVE</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 sm:gap-6 pl-6 sm:pl-0 border-l sm:border-l-0 border-slate-800 sm:border-transparent">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${net.type === 'weekly' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    net.type === 'emergency_exercise' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                        'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                                }`}>
                                                {net.type.replace('_', ' ')}
                                            </span>

                                            <div className="flex items-center justify-center min-w-[3rem] px-3 py-1 rounded bg-slate-800/80 border border-slate-700">
                                                <Users className="w-3.5 h-3.5 text-slate-400 mr-2" />
                                                <span className="text-sm font-mono font-bold text-white">{net.checkins?.length || 0}</span>
                                            </div>

                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
