import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import CheckinForm from '@/components/CheckinForm'
import CheckinList from '@/components/CheckinList'
import RecentCheckins from '@/components/widgets/RecentCheckins'
import StatsCard from '@/components/widgets/StatsCard'
import NetMap from '@/components/widgets/NetMap'
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
    FileJson,
    FileText as FilePdf,
    Upload
} from 'lucide-react'
import type { Net, Checkin } from '@/lib/types'
import { exportToADIF, exportToPDF, parseADIF, exportCertificate } from '@/lib/exportUtils'
import TopParticipantsChart from '@/components/widgets/TopParticipantsChart'

export default function NetDetail() {
    const [net, setNet] = useState<Net | null>(null)
    const [checkins, setCheckins] = useState<Checkin[]>([])
    const [loading, setLoading] = useState(true)
    const [ending, setEnding] = useState(false)
    const [exporting, setExporting] = useState(false)

    const chartRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    const { id: netId } = useParams()

    const fetchData = useCallback(async () => {
        if (!netId) return

        try {
            const [netResponse, checkinsResponse] = await Promise.all([
                supabase
                    .from('nets')
                    .select('*, profiles(*)')
                    .eq('id', netId)
                    .single(),
                supabase
                    .from('checkins')
                    .select('*')
                    .eq('net_id', netId)
                    .order('checked_in_at', { ascending: true })
            ])

            if (netResponse.error || !netResponse.data) {
                console.error('Net fetch error:', netResponse.error)
                toast.error('Net operation not found')
                navigate('/nets')
                return
            }

            console.log('NetDetail: Fetched net:', netResponse.data?.id)
            console.log('NetDetail: Fetched checkins:', checkinsResponse.data?.length || 0)

            setNet(netResponse.data)
            setCheckins(checkinsResponse.data || [])
        } catch (error) {
            console.error('Data sync error:', error)
            toast.error('System synchronization failed')
        } finally {
            setLoading(false)
        }
    }, [netId, navigate])

    useEffect(() => {
        fetchData()

        if (!netId) return

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
                (payload) => {
                    setCheckins((prev) => {
                        const exists = prev.some(c => c.id === payload.new.id)
                        if (exists) return prev
                        return [...prev, payload.new as Checkin]
                    })
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
                (payload) => {
                    setCheckins((prev) => prev.filter((c) => c.id !== payload.old.id))
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'nets',
                    filter: `id=eq.${netId}`,
                },
                (payload) => {
                    setNet(payload.new as Net)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [netId, fetchData])

    const handleEndNet = async () => {
        if (!confirm('Are you sure you want to end this net?')) return

        setEnding(true)
        try {
            const { error, data } = await supabase
                .from('nets')
                .update({ ended_at: new Date().toISOString() })
                .eq('id', netId)
                .select()
                .single()

            if (error) {
                console.error('Termination error:', error)
                toast.error(`Termination failed: ${error.message}`)
                return
            }

            if (data) setNet(data)
            toast.success('Net Operation Terminated')
            // No need to manually fetchData() as real-time subscription will handle it
            // but we update the net state directly for immediate feedback
        } catch (err) {
            console.error('System error during termination:', err)
            toast.error('An unexpected error occurred')
        } finally {
            setEnding(false)
        }
    }

    const handleExportADIF = () => {
        if (!net) return
        exportToADIF(net, checkins)
        toast.success('ADIF Log Exported')
    }

    const handleGenerateCertificate = async (checkin: Checkin) => {
        if (!net) return
        try {
            await exportCertificate(net, checkin)
            toast.success(`Certificate for ${checkin.callsign} generated`)
        } catch (err) {
            console.error(err)
            toast.error('Failed to generate certificate')
        }
    }

    const handleExportPDF = async () => {
        if (!net) return
        setExporting(true)
        try {
            await exportToPDF(net, checkins, [chartRef.current])
            toast.success('PDF Report Exported')
        } catch (error) {
            console.error(error)
            toast.error('Failed to export PDF')
        } finally {
            setExporting(false)
        }
    }

    const handleImportADIF = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !netId) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            const content = event.target?.result as string
            const importedRecords = parseADIF(content)

            if (importedRecords.length === 0) {
                toast.error('No valid records found in ADIF')
                return
            }

            toast.loading(`Importing ${importedRecords.length} records...`)

            const toInsert = importedRecords.map(r => ({
                ...r,
                net_id: netId,
                checked_in_at: new Date().toISOString()
            }))

            const { error } = await supabase.from('checkins').insert(toInsert)

            if (error) {
                toast.error('Import failed: ' + error.message)
            } else {
                toast.dismiss()
                toast.success(`Successfully imported ${importedRecords.length} stations`)
                fetchData()
            }
        }
        reader.readAsText(file)
        e.target.value = '' // Reset
    }

    const handleCheckinDeleted = (id: string) => {
        setCheckins((prev) => prev.filter((c) => c.id !== id))
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh]">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse"></div>
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin relative z-10" />
                </div>
                <p className="mt-4 text-slate-400 font-mono text-sm animate-pulse">ESTABLISHING UPLINK...</p>
            </div>
        )
    }

    if (!net) {
        console.warn('NetDetail: Loading finished but net is null. Redirecting...')
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-slate-400">
                <AlertTriangle className="w-12 h-12 mb-4 text-amber-500" />
                <p className="text-xl font-bold text-white mb-2">Net Operation Not Found</p>
                <p className="mb-6">The net you are looking for may have been deleted.</p>
                <button onClick={() => navigate('/nets')} className="btn btn-primary">
                    Return to Operations
                </button>
            </div>
        )
    }

    const isActive = !net.ended_at
    const duration = net.ended_at
        ? differenceInMinutes(new Date(net.ended_at), new Date(net.started_at))
        : differenceInMinutes(new Date(), new Date(net.started_at))

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mt-20 md:mt-24 pb-20 animate-fade-in">
            {/* Back Button & Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/nets')}
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

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Import / Export Controls */}
                        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900/50 border border-slate-800">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImportADIF}
                                accept=".adi,.adif"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                                title="Import ADIF"
                            >
                                <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>

                            <div className="w-px h-6 bg-slate-800 mx-1"></div>

                            <button
                                onClick={handleExportADIF}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-emerald-400 hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20"
                            >
                                <FileJson className="w-4 h-4" />
                                ADIF
                            </button>
                            <button
                                onClick={handleExportPDF}
                                disabled={exporting}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                            >
                                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePdf className="w-4 h-4" />}
                                PDF
                            </button>
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
                    value={new Set(checkins.map(c => c.callsign)).size}
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
                    value={checkins.filter(c => c.traffic).length}
                    icon={AlertTriangle}
                    color="amber"
                />
            </div>

            {/* Analysis Section (Charts) */}
            {checkins.length > 0 && (
                <div className="mb-8 card glass-card overflow-hidden" ref={chartRef}>
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 p-1">
                        <TopParticipantsChart
                            data={Object.entries(
                                checkins.reduce((acc, c) => {
                                    acc[c.callsign] = (acc[c.callsign] || 0) + 1
                                    return acc
                                }, {} as Record<string, number>)
                            )
                                .map(([callsign, checkins]) => ({ callsign, checkins }))
                                .sort((a, b) => b.checkins - a.checkins)
                                .slice(0, 10)}
                            title="Net Distribution (Top Stations)"
                        />
                    </div>
                </div>
            )}

            {/* Net Map Visualization */}
            <div className="mb-8">
                <div className="card glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                        <h3 className="text-lg font-bold text-white">Geographic Distribution</h3>
                    </div>
                    <NetMap checkins={checkins} />
                </div>
            </div>

            {/* Check-in Form (only for active nets) */}
            {isActive && (
                <div className="mb-8">
                    <CheckinForm netId={netId!} onCheckinAdded={fetchData} />
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Check-in List */}
                <div className="lg:col-span-2 space-y-6">
                    <CheckinList
                        checkins={checkins}
                        onDelete={handleCheckinDeleted}
                        onGenerateCertificate={handleGenerateCertificate}
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
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
