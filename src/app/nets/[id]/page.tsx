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
    AlertTriangle
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

        // Set up real-time subscription
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
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
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

    const getTypeBadgeClass = (type: string) => {
        switch (type) {
            case 'weekly': return 'badge-primary'
            case 'emergency_exercise': return 'badge-destructive'
            case 'special': return 'badge-accent'
            default: return 'badge-secondary'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button & Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/nets')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Nets
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white">{net.name}</h1>
                                {isActive ? (
                                    <span className="status-active badge badge-primary">Live</span>
                                ) : (
                                    <span className="badge badge-secondary">Ended</span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(net.started_at), 'MMMM d, yyyy HH:mm')}
                                </span>
                                {net.frequency && (
                                    <span className="flex items-center gap-1">
                                        <Wifi className="w-4 h-4" />
                                        {net.frequency}
                                    </span>
                                )}
                                {net.mode && (
                                    <span className={`badge ${getTypeBadgeClass(net.type)}`}>
                                        {net.type.replace('_', ' ')}
                                    </span>
                                )}
                                {net.mode && (
                                    <span className="badge badge-secondary">{net.mode}</span>
                                )}
                            </div>
                            {net.notes && (
                                <p className="text-slate-500 mt-2">{net.notes}</p>
                            )}
                        </div>

                        {isActive && (
                            <button
                                onClick={handleEndNet}
                                disabled={ending}
                                className="btn bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30"
                            >
                                {ending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Ending...
                                    </>
                                ) : (
                                    <>
                                        <StopCircle className="w-4 h-4" />
                                        End Net
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatsCard
                        title="Total Check-ins"
                        value={checkins.length}
                        icon={Users}
                        color="emerald"
                    />
                    <StatsCard
                        title="Unique Callsigns"
                        value={uniqueCallsigns}
                        icon={Radio}
                        color="cyan"
                    />
                    <StatsCard
                        title="Duration"
                        value={`${Math.floor(duration / 60)}h ${duration % 60}m`}
                        icon={Clock}
                        color="violet"
                    />
                    <StatsCard
                        title="Traffic"
                        value={trafficCount}
                        icon={AlertTriangle}
                        color="amber"
                    />
                </div>

                {/* Check-in Form (only for active nets) */}
                {isActive && (
                    <div className="mb-6">
                        <CheckinForm netId={netId} onCheckinAdded={fetchData} />
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Check-in List */}
                    <div className="lg:col-span-2">
                        <CheckinList
                            checkins={checkins}
                            onDelete={handleCheckinDeleted}
                            showDelete={isActive}
                        />
                    </div>

                    {/* Recent Activity Sidebar */}
                    <div>
                        <RecentCheckins
                            checkins={[...checkins].reverse()}
                            title="Latest Check-ins"
                            maxItems={8}
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}
