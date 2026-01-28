'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import CheckinForm from '@/components/CheckinForm'
import CheckinList from '@/components/CheckinList'
import RecentCheckins from '@/components/widgets/RecentCheckins'
import TopParticipantsChart from '@/components/widgets/TopParticipantsChart'
import { toast } from 'sonner'
import { format, differenceInMinutes } from 'date-fns'
import {
    ArrowLeft,
    StopCircle,
    Loader2,
    Calendar,
    Wifi,
    AlertTriangle,
    FileText as FilePdf,
    Upload,
    Trash2
} from 'lucide-react'
import type { Net, Checkin } from '@/lib/types'
import { exportToADIF, exportToPDF, parseADIF, exportCertificate } from '@/lib/exportUtils'

// Dynamic import for NetMap to avoid SSR issues with Leaflet
const NetMap = dynamic(() => import('@/components/widgets/NetMap'), {
    loading: () => <div className="h-full w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
})

export default function NetDetail() {
    const [net, setNet] = useState<Net | null>(null)
    const [checkins, setCheckins] = useState<Checkin[]>([])
    const [loading, setLoading] = useState(true)
    const [ending, setEnding] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [exporting, setExporting] = useState(false)

    const chartRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const params = useParams()
    const netId = params?.id as string

    const fetchData = useCallback(async () => {
        if (!netId) {
            setLoading(false)
            return
        }

        const timeoutId = setTimeout(() => {
            if (loading) {
                console.error('NetDetail: Data fetching timed out')
                setLoading(false)
                toast.error('Sync timed out. Please refresh.')
            }
        }, 30000)

        setLoading(true)
        try {
            console.log('NetDetail: Fetching data for net:', netId)
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

            if (netResponse.error) {
                console.error('Net fetch error:', netResponse.error)
                toast.error('Net operation not found')
                router.push('/nets')
                return
            }

            if (!netResponse.data) {
                console.error('Net data is null')
                toast.error('Data corruption detected')
                router.push('/nets')
                return
            }

            console.log('NetDetail: Success!')
            setNet(netResponse.data)
            setCheckins(checkinsResponse.data || [])
        } catch (error: any) {
            console.error('Data sync error:', error)
            toast.error(`System sync failed: ${error.message || 'Unknown error'}`)
        } finally {
            clearTimeout(timeoutId)
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [netId, router])

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

    const isActive = !!net && !net.ended_at

    // Replaced useBlocker with window.onbeforeunload for basic protection
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isActive) {
                e.preventDefault()
                e.returnValue = ''
                return ''
            }
        }

        if (isActive) {
            window.addEventListener('beforeunload', handleBeforeUnload)
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [isActive])


    const [confirmDelete, setConfirmDelete] = useState(false)
    const [confirmEnd, setConfirmEnd] = useState(false)

    // Reset confirmation states when clicking away or after timeout
    useEffect(() => {
        let timeout: NodeJS.Timeout
        if (confirmDelete) {
            timeout = setTimeout(() => setConfirmDelete(false), 3000)
        }
        return () => clearTimeout(timeout)
    }, [confirmDelete])

    useEffect(() => {
        let timeout: NodeJS.Timeout
        if (confirmEnd) {
            timeout = setTimeout(() => setConfirmEnd(false), 3000)
        }
        return () => clearTimeout(timeout)
    }, [confirmEnd])

    const handleEndNet = async () => {
        if (!confirmEnd) {
            setConfirmEnd(true)
            return
        }

        setEnding(true)
        try {
            console.log('Terminating net:', netId)

            // Add a timeout for the supabase call to prevent indefinite hanging
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Termination request timed out')), 10000)
            )

            const updatePromise = supabase
                .from('nets')
                .update({ ended_at: new Date().toISOString() })
                .eq('id', netId)
                .select()
                .single()

            const { error, data } = await Promise.race([updatePromise, timeoutPromise]) as any

            if (error) {
                console.error('Termination error:', error)
                const errorMsg = typeof error === 'object' ? (error as any).message || JSON.stringify(error) : error
                toast.error(`Termination failed: ${errorMsg}`)
                setEnding(false)
                return
            }

            if (data) {
                console.log('Net terminated successfully:', data.id)
                setNet(data)
            }
            toast.success('Net Operation Terminated')
        } catch (err: any) {
            console.error('System error during termination:', err)
            toast.error(`Error: ${err.message}`)
        } finally {
            setEnding(false)
            setConfirmEnd(false)
        }
    }

    const handleDeleteNet = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true)
            return
        }

        console.log('Delete button clicked for net:', netId)
        setDeleting(true)

        try {
            // Attempt deletion - Cascade should be handled by DB now, checking first
            const { error: netError } = await supabase
                .from('nets')
                .delete()
                .eq('id', netId)

            if (netError) {
                // If FK violation (code 23503), try manual cascade as backup
                if (netError.code === '23503') {
                    toast.info('Cleaning up check-ins...')
                    await supabase.from('checkins').delete().eq('net_id', netId)
                    const { error: retryError } = await supabase.from('nets').delete().eq('id', netId)
                    if (retryError) throw retryError
                } else {
                    throw netError
                }
            }

            toast.success('Net Deleted Successfully')
            router.push('/nets')
        } catch (error: any) {
            console.error('Delete exception:', error)
            toast.error(`Delete failed: ${error.message}`)
            setDeleting(false)
        } finally {
            setConfirmDelete(false)
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
            // Need to pass a valid element or ref. We are using chartRef.current which might be null if not rendered.
            // exportToPDF expects HTML elements to snapshot.
            // In the original, it passed chartRef.current.
            await exportToPDF(net, checkins, chartRef.current ? [chartRef.current] : [])
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
                fetchData() // Refresh
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
        // Redirection happens in fetchData, but fallback UI here
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-slate-400">
                <AlertTriangle className="w-12 h-12 mb-4 text-amber-500" />
                <p className="text-xl font-bold text-white mb-2">Net Operation Not Found</p>
                <p className="mb-6">The net you are looking for may have been deleted.</p>
                <button onClick={() => router.push('/nets')} className="btn btn-primary">
                    Return to Operations
                </button>
            </div>
        )
    }

    const duration = net.ended_at
        ? differenceInMinutes(new Date(net.ended_at), new Date(net.started_at))
        : differenceInMinutes(new Date(), new Date(net.started_at))

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] mt-16 bg-slate-950 overflow-hidden">
            {/* Header Area */}
            <div className="px-4 md:px-6 py-4 border-b border-white/5 bg-slate-950/50 backdrop-blur-md z-20">
                <div className="max-w-full mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/nets')}
                            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all group"
                            title="Back to Operations"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-white tracking-tight">{net.name}</h1>
                                {isActive ? (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        Live
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                                        Offline
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono mt-0.5">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(net.started_at), 'MMM d, HH:mm')}
                                </span>
                                {net.frequency && (
                                    <span className="flex items-center gap-1 text-emerald-500/80">
                                        <Wifi className="w-3 h-3" />
                                        {net.frequency}
                                    </span>
                                )}
                                <span className="uppercase">{net.type.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800/50">
                            <input type="file" ref={fileInputRef} onChange={handleImportADIF} accept=".adi,.adif" className="hidden" />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                title="Import ADIF"
                            >
                                <Upload className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-slate-800 mx-1"></div>
                            <button
                                onClick={handleExportADIF}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-all"
                            >
                                ADIF
                            </button>
                            <button
                                onClick={handleExportPDF}
                                disabled={exporting}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-1.5"
                            >
                                {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FilePdf className="w-3 h-3" />}
                                PDF
                            </button>
                        </div>

                        {isActive && (
                            <button
                                onClick={handleEndNet}
                                disabled={ending}
                                className={`h-10 px-4 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center gap-2 ${confirmEnd ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'}`}
                            >
                                {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : <StopCircle className="w-4 h-4" />}
                                {confirmEnd ? 'Confirm End?' : 'End Net'}
                            </button>
                        )}

                        <button
                            onClick={handleDeleteNet}
                            disabled={deleting}
                            className={`h-10 px-4 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center gap-2 ${confirmDelete ? 'bg-red-600 hover:bg-red-700 text-white border-2 border-white/20' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'}`}
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            {confirmDelete ? 'Sure?' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Dashboard Area */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 pb-20 md:pb-0">

                {/* Left Column: Stats & Operations (3 cols) */}
                <div className="lg:col-span-3 border-r border-white/5 bg-slate-900/20 flex flex-col overflow-hidden">
                    <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                        {/* Compact Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Check-ins</p>
                                <p className="text-xl font-mono font-bold text-emerald-400">{checkins.length}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Stations</p>
                                <p className="text-xl font-mono font-bold text-cyan-400">{new Set(checkins.map(c => c.callsign)).size}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Duration</p>
                                <p className="text-sm font-mono font-bold text-violet-400">{`${Math.floor(duration / 60)}h ${duration % 60}m`}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Traffic</p>
                                <p className="text-xl font-mono font-bold text-amber-400">{checkins.filter(c => c.traffic).length}</p>
                            </div>
                        </div>

                        {/* Quick Check-in Form */}
                        {isActive && (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Transmit Log</h3>
                                </div>
                                <div className="scale-90 origin-top -mt-4 -mx-4 h-full">
                                    <CheckinForm netId={netId!} onCheckinAdded={fetchData} />
                                </div>
                            </div>
                        )}

                        {/* Analysis - Top Stations (Smaller) */}
                        {checkins.length > 0 && (
                            <div className="mt-4 p-3 rounded-xl bg-slate-900/30 border border-slate-800/30 h-64 overflow-hidden" ref={chartRef}>
                                <TopParticipantsChart
                                    data={Object.entries(
                                        checkins.reduce((acc, c) => {
                                            acc[c.callsign] = (acc[c.callsign] || 0) + 1
                                            return acc
                                        }, {} as Record<string, number>)
                                    )
                                        .map(([callsign, checkins]) => ({ callsign, checkins }))
                                        .sort((a, b) => b.checkins - a.checkins)
                                        .slice(0, 5)}
                                    title="Distribution"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Center Column: Station Log (6 cols) */}
                <div className="lg:col-span-6 flex flex-col overflow-hidden bg-slate-950/20">
                    <div className="p-0 flex-1 overflow-y-auto custom-scrollbar relative">
                        <div className="p-4 md:p-6 min-h-full">
                            <CheckinList
                                checkins={checkins}
                                onDelete={handleCheckinDeleted}
                                onGenerateCertificate={handleGenerateCertificate}
                                showDelete={isActive}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Visualization & Status (3 cols) */}
                <div className="lg:col-span-3 border-l border-white/5 bg-slate-900/20 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                        {/* Map Section - Fixed Aspect Ratio */}
                        <div className="p-4 border-b border-white/5 bg-slate-900/40">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Geo Presence</h3>
                            </div>
                            <div className="rounded-xl overflow-hidden border border-slate-800/50 shadow-inner h-48 relative">
                                <NetMap checkins={checkins} className="h-full w-full" />
                            </div>
                        </div>

                        {/* Live Feed Section */}
                        <div className="p-4 flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Feed</h3>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded animate-pulse">STREAMING</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                                <RecentCheckins
                                    checkins={[...checkins].reverse()}
                                    title=""
                                    maxItems={20}
                                />
                            </div>
                        </div>

                        {/* Connection Status - Compact Bottom */}
                        <div className="p-4 mt-auto border-t border-white/5 bg-slate-950/40">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className="text-slate-500">Uplink: <span className="text-emerald-500">STABLE</span></span>
                                <span className="text-slate-500">Latency: <span className="text-emerald-500">24ms</span></span>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
