'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CheckinForm from '@/components/CheckinForm'
import CheckinList from '@/components/CheckinList'
import RecentCheckins from '@/components/widgets/RecentCheckins'
import StatsCard from '@/components/widgets/StatsCard'
import { toast } from 'sonner'
import { format, differenceInMinutes } from 'date-fns'
import {
    Radio,
    Users,
    Clock,
    ArrowLeft,
    StopCircle,
    Loader2,
    Calendar,
    Wifi,
    AlertTriangle,
    Mic2,
    Activity
} from 'lucide-react'
import type { Net, Checkin } from '@/lib/types'

export default function NetDetailPage() {
    const [net, setNet] = useState<Net | null>(null)
    const [checkins, setCheckins] = useState<Checkin[]>([])
    const [loading, setLoading] = useState(true)
    const [ending, setEnding] = useState(false)

    const router = useRouter()
    const params = useParams()
    const netId = params.id as string
    const supabase = createClient()

    const fetchData = useCallback(async () => {
        const { data: netData, error: netError } = await supabase
            .from('nets')
            .select('*')
            .eq('id', netId)
            .single()

        if (netError || !netData) {
            toast.error('Net not found')
            router.push('/nets')
            return
        }

        setNet(netData)

        const { data: checkinsData } = await supabase
            .from('checkins')
            .select('*')
            .eq('net_id', netId)
            .order('checked_in_at', { ascending: true })

        setCheckins(checkinsData || [])
        setLoading(false)
    }, [netId, router, supabase])

    useEffect(() => {
        fetchData()

        const channel = supabase
            .channel(`net-${netId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'checkins',
                    filter: `net_id=eq.${netId}`,
                },
                (payload: { new: Record<string, unknown> }) => {
                    setCheckins((prev) => [...prev, payload.new as unknown as Checkin])
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'checkins',
                    filter: `net_id=eq.${netId}`,
                },
                (payload: { old: { id: string } }) => {
                    setCheckins((prev) => prev.filter((c) => c.id !== payload.old.id))
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [netId, fetchData, supabase])

    const handleEndNet = async () => {
        if (!confirm('Are you sure you want to end this net?')) return

        setEnding(true)
        try {
            const { error } = await supabase
                .from('nets')
                .update({ ended_at: new Date().toISOString() })
                .eq('id', netId)

            if (error) {
                toast.error('Failed to end net')
                return
            }

            toast.success('Net ended successfully')
            fetchData()
        } catch {
            toast.error('An error occurred')
        } finally {
            setEnding(false)
        }
    }

    const handleCheckinDeleted = (id: string) => {
        setCheckins((prev) => prev.filter((c) => c.id !== id))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[80vh]">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse"></div>
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin relative z-10" />
                    </div>
                    <p className="mt-4 text-slate-400 font-mono text-sm animate-pulse">ESTABLISHING UPLINK...</p>
                </div>
            </div>
        )
    }

    if (!net) return null

    const isActive = !net.ended_at
    const duration = net.ended_at
        ? differenceInMinutes(new Date(net.ended_at), new Date(net.started_at))
        : differenceInMinutes(new Date(), new Date(net.started_at))
    const uniqueCallsigns = new Set(checkins.map(c => c.callsign)).size
    const trafficCount = checkins.filter(c => c.traffic).length

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-emerald-500/30 selection:text-emerald-300">
            {/* Background elements */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-20"></div>
            <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 ${isActive ? 'bg-emerald-500/5' : 'bg-slate-500/5'} rounded-full blur-[100px] -z-10 transition-colors duration-1000`}></div>

            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mt-20 md:mt-24 pb-20 animate-fade-in">
                {/* Back Button & Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/nets')}
                        className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        Back to Operations
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{net.name}</h1>
                                {isActive ? (
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        Live
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                        Offline
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400 font-mono">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    {format(new Date(net.started_at), 'MMMM d, yyyy HH:mm')}
                                </span>
                                {net.frequency && (
                                    <span className="flex items-center gap-1.5">
                                        <Wifi className="w-4 h-4 text-emerald-500" />
                                        <span className="text-emerald-400">{net.frequency}</span>
                                    </span>
                                )}
                                {net.mode && (
                                    <span className="flex items-center gap-1.5">
                                        <Mic2 className="w-4 h-4 text-slate-500" />
                                        <span>{net.mode}</span>
                                    </span>
                                )}
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${net.type === 'weekly' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        net.type === 'emergency_exercise' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                            'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                    }`}>
                                    {net.type.replace('_', ' ')}
                                </span>
                            </div>

                            {net.notes && (
                                <p className="text-slate-400 mt-4 max-w-2xl bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-sm">
                                    <span className="text-emerald-500 font-bold mr-2">// NOTES:</span>
                                    {net.notes}
                                </p>
                            )}
                        </div>

                        {isActive && (
                            <button
                                onClick={handleEndNet}
                                disabled={ending}
                                className="btn bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 shadow-lg shadow-rose-500/5 group"
                            >
                                {ending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Terminating...
                                    </>
                                ) : (
                                    <>
                                        <StopCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        End Operation
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        title="Total Check-ins"
                        value={checkins.length}
                        icon={Users}
                        color="emerald"
                    />
                    <StatsCard
                        title="Unique Stations"
                        value={uniqueCallsigns}
                        icon={Radio}
                        color="cyan"
                    />
                    <StatsCard
                        title="Session Duration"
                        value={`${Math.floor(duration / 60)}h ${duration % 60}m`}
                        icon={Clock}
                        color="violet"
                    />
                    <StatsCard
                        title="Traffic Reports"
                        value={trafficCount}
                        icon={AlertTriangle}
                        color="amber"
                    />
                </div>

                {/* Check-in Form (only for active nets) */}
                {isActive && (
                    <div className="mb-8">
                        <CheckinForm netId={netId} onCheckinAdded={fetchData} />
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Check-in List */}
                    <div className="lg:col-span-2 space-y-6">
                        <CheckinList
                            checkins={checkins}
                            onDelete={handleCheckinDeleted}
                            showDelete={isActive}
                        />
                    </div>

                    {/* Recent Activity Sidebar */}
                    <div className="lg:sticky lg:top-24 h-fit space-y-6">
                        <RecentCheckins
                            checkins={[...checkins].reverse()}
                            title="Live Feed"
                            maxItems={8}
                        />

                        {/* Session Status Widget */}
                        <div className="card glass-card p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <div className="w-1 h-5 bg-slate-500 rounded-full"></div>
                                Connection Status
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <span className="text-sm text-slate-400">Uplink Status</span>
                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">STABLE</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <span className="text-sm text-slate-400">Database</span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        CONNECTED
                                    </span>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <span className="text-xs text-slate-500 block mb-1">SESSION ID</span>
                                    <span className="text-xs font-mono text-slate-300 break-all">{netId}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
