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
    Calendar
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-slate-400 mt-1">Welcome to your Net Control Station</p>
                    </div>
                    <Link href="/nets/new" className="btn btn-primary">
                        <Plus className="w-4 h-4" />
                        Start New Net
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        title="Active Nets"
                        value={activeNets.length}
                        subtitle="Currently running"
                        icon={Radio}
                        color="emerald"
                    />
                    <StatsCard
                        title="Total Nets"
                        value={allNets.length}
                        subtitle="All time"
                        icon={Calendar}
                        color="cyan"
                    />
                    <StatsCard
                        title="Total Check-ins"
                        value={totalCheckins}
                        subtitle="Across all nets"
                        icon={Users}
                        color="violet"
                    />
                    <StatsCard
                        title="Unique Callsigns"
                        value={uniqueCallsigns}
                        subtitle="Participating operators"
                        icon={Activity}
                        color="amber"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <NetActivityChart data={activityData} title="Check-ins (Last 7 Days)" />
                    <TopParticipantsChart data={topParticipants} title="Top Participants" />
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <NetTypeDistribution data={netTypeData} title="Net Type Distribution" />

                    {/* Recent Nets */}
                    <div className="lg:col-span-2 card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Recent Nets</h3>
                            <Link href="/nets" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {allNets.length === 0 ? (
                            <div className="text-center py-8">
                                <Radio className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">No nets created yet</p>
                                <Link href="/nets/new" className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 inline-block">
                                    Start your first net →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {allNets.slice(0, 5).map((net) => (
                                    <Link
                                        key={net.id}
                                        href={`/nets/${net.id}`}
                                        className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${net.ended_at ? 'bg-slate-500' : 'bg-emerald-500 animate-pulse'}`} />
                                            <div>
                                                <h4 className="font-medium text-white">{net.name}</h4>
                                                <p className="text-sm text-slate-400">
                                                    {format(new Date(net.started_at), 'MMM d, yyyy HH:mm')}
                                                    {net.frequency && ` • ${net.frequency}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`badge ${net.type === 'weekly' ? 'badge-primary' :
                                                net.type === 'emergency_exercise' ? 'badge-destructive' :
                                                    'badge-accent'
                                                }`}>
                                                {net.type.replace('_', ' ')}
                                            </span>
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <Users className="w-4 h-4" />
                                                <span className="text-sm">{net.checkins?.length || 0}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-500" />
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
