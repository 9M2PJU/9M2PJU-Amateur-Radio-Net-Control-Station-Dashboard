'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import CheckinForm from '@/components/CheckinForm'
import CheckinList from '@/components/CheckinList'
import RecentCheckins from '@/components/widgets/RecentCheckins'
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
    Trash2,
    Edit2
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
    const [userId, setUserId] = useState<string | null>(null)

    const chartRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const params = useParams()
    const netId = params?.id as string

    const [editingCheckin, setEditingCheckin] = useState<Checkin | null>(null)
    const [editForm, setEditForm] = useState<Partial<Checkin>>({})
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

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null))
    }, [])

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

    const startEdit = (checkin: Checkin) => {
        setEditingCheckin(checkin)
        setEditForm({
            callsign: checkin.callsign,
            name: checkin.name,
            location: checkin.location,
            signal_report: checkin.signal_report,
            remarks: checkin.remarks,
            traffic: checkin.traffic
        })
    }

    const saveEdit = async () => {
        if (!editingCheckin) return

        try {
            const { error, data } = await supabase
                .from('checkins')
                .update(editForm)
                .eq('id', editingCheckin.id)
                .select()
                .single()

            if (error) throw error

            setCheckins(prev => prev.map(c => c.id === editingCheckin.id ? data : c))
            toast.success('Check-in Log Updated')
            setEditingCheckin(null)
        } catch (error: any) {
            console.error('Update error:', error)
            toast.error('Failed to update log entry')
        }
    }

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
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-white tracking-tight">{net?.name}</h1>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                    }`}>
                                    {isActive ? 'Live Operation' : 'Archived'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" />
                                    {net?.started_at && format(new Date(net.started_at), 'MMM d, yyyy • HH:mm')}
                                </div>
                                {net?.frequency && (
                                    <div className="flex items-center gap-1.5">
                                        <Wifi className="w-3 h-3" />
                                        {net.frequency}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".adi,.adif"
                            onChange={handleImportADIF}
                        />

                        {isActive && (
                            <>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-10 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-all border border-slate-700 flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    Import ADIF
                                </button>
                            </>
                        )}

                        <div className="h-6 w-px bg-white/10 mx-2"></div>

                        <button
                            onClick={handleExportPDF}
                            disabled={exporting}
                            className="h-10 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                        >
                            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePdf className="w-4 h-4" />}
                            PDF Report
                        </button>

                        <button
                            onClick={handleExportADIF}
                            className="h-10 px-4 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20 flex items-center gap-2"
                        >
                            <FilePdf className="w-4 h-4" />
                            ADIF Export
                        </button>

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

            {/* Main Content Grid */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full grid grid-cols-1 lg:grid-cols-12">
                    {/* Left Panel: Check-in List (Scrollable) */}
                    <div className="lg:col-span-8 h-full flex flex-col min-h-0 bg-slate-950/30">
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="card glass-card p-4">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Check-ins</p>
                                    <p className="text-2xl font-mono font-bold text-white mt-1">{checkins.length}</p>
                                </div>
                                <div className="card glass-card p-4">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Unique Ops</p>
                                    <p className="text-2xl font-mono font-bold text-white mt-1">
                                        {new Set(checkins.map(c => c.callsign)).size}
                                    </p>
                                </div>
                                <div className="card glass-card p-4">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Duration</p>
                                    <p className="text-2xl font-mono font-bold text-white mt-1">{duration}m</p>
                                </div>
                                <div className="card glass-card p-4">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Traffic</p>
                                    <p className="text-2xl font-mono font-bold text-amber-500 mt-1">
                                        {checkins.filter(c => c.traffic).length}
                                    </p>
                                </div>
                            </div>

                            {/* Checkin List with Edit support */}
                            <CheckinList
                                checkins={checkins}
                                onDelete={handleCheckinDeleted}
                                onEdit={net && userId === net.user_id ? startEdit : undefined}
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
