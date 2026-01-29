
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CheckinForm from '../components/CheckinForm'
import CheckinList from '../components/CheckinList'
import RecentCheckins from '../components/widgets/RecentCheckins'
import NetMap from '../components/widgets/NetMap'
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
import type { Net, Checkin } from '../lib/types'
import { exportToADIF, exportToPDF, parseADIF, exportCertificate } from '../lib/exportUtils'

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
    const navigate = useNavigate()
    const params = useParams()
    const netId = params?.id as string

    const [editingCheckin, setEditingCheckin] = useState<Checkin | null>(null)
    const [editForm, setEditForm] = useState<Partial<Checkin>>({})
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [confirmEnd, setConfirmEnd] = useState(false)

    // Reset confirmation states when clicking away or after timeout
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>
        if (confirmDelete) {
            timeout = setTimeout(() => setConfirmDelete(false), 3000)
        }
        return () => clearTimeout(timeout)
    }, [confirmDelete])

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>
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

            // Try to fetch by slug first, then fallback to ID
            let netQuery = supabase
                .from('nets')
                .select('*, profiles(*)')

            // Check if netId looks like a UUID (contains hyphens and is 36 chars)
            const isUUID = netId.length === 36 && netId.includes('-')

            if (isUUID) {
                netQuery = netQuery.eq('id', netId)
            } else {
                netQuery = netQuery.eq('slug', netId)
            }

            const netResponse = await netQuery.single()

            if (netResponse.error) {
                console.error('Net fetch error:', netResponse.error)
                toast.error('Net operation not found')
                navigate('/nets')
                return
            }

            if (!netResponse.data) {
                console.error('Net data is null')
                toast.error('Data corruption detected')
                navigate('/nets')
                return
            }

            // Fetch checkins using the actual net ID
            const checkinsResponse = await supabase
                .from('checkins')
                .select('*')
                .eq('net_id', netResponse.data.id)
                .order('checked_in_at', { ascending: true })

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

    const handleImportADIF = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !netId) return

        try {
            const text = await file.text()
            const importedCheckins = parseADIF(text)

            for (const checkin of importedCheckins) {
                await supabase.from('checkins').insert({ ...checkin, net_id: netId })
            }

            toast.success(`Imported ${importedCheckins.length} check-ins`)
            fetchData()
        } catch (error: any) {
            toast.error('Failed to import ADIF file')
            console.error(error)
        }
    }

    const handleExportPDF = async () => {
        if (!net) return
        setExporting(true)
        try {
            await exportToPDF(net, checkins, [])
            toast.success('PDF exported successfully')
        } catch (error) {
            toast.error('Failed to export PDF')
            console.error(error)
        } finally {
            setExporting(false)
        }
    }

    const handleExportADIF = () => {
        if (!net) return
        try {
            exportToADIF(net, checkins)
            toast.success('ADIF exported successfully')
        } catch (error) {
            toast.error('Failed to export ADIF')
            console.error(error)
        }
    }

    const handleEndNet = async () => {
        if (!confirmEnd) {
            setConfirmEnd(true)
            return
        }

        setEnding(true)
        try {
            const { error } = await supabase
                .from('nets')
                .update({ ended_at: new Date().toISOString() })
                .eq('id', netId)

            if (error) throw error

            toast.success('Net operation ended')
            setConfirmEnd(false)
            fetchData()
        } catch (error: any) {
            toast.error('Failed to end net')
            console.error(error)
        } finally {
            setEnding(false)
        }
    }

    const handleDeleteNet = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true)
            return
        }

        setDeleting(true)
        try {
            const { error } = await supabase
                .from('nets')
                .delete()
                .eq('id', netId)

            if (error) throw error

            toast.success('Net deleted successfully')
            navigate('/nets')
        } catch (error: any) {
            toast.error('Failed to delete net')
            console.error(error)
            setDeleting(false)
        }
    }

    const handleCheckinDeleted = (checkinId: string) => {
        setCheckins(prev => prev.filter(c => c.id !== checkinId))
    }

    const handleGenerateCertificate = async (checkin: Checkin) => {
        if (!net) return
        try {
            await exportCertificate(net, checkin)
            toast.success('Certificate generated')
        } catch (error) {
            toast.error('Failed to generate certificate')
            console.error(error)
        }
    }

    const duration = net ? differenceInMinutes(
        net.ended_at ? new Date(net.ended_at) : new Date(),
        new Date(net.started_at)
    ) : 0

    // Show loading state while fetching data
    if (loading || !net) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-mono text-sm">Loading net operation...</p>
                </div>
            </div>
        )
    }

    // At this point, net is guaranteed to be present
    const currentNet = net as Net

    return (
<<<<<<< HEAD
        <main className="h-screen pt-16 md:pt-20 overflow-hidden flex flex-col bg-slate-950">
            {/* Header Area - Compact Fixed Height */}
            <div className="px-4 md:px-6 py-3 border-b border-white/5 bg-slate-950/50 backdrop-blur-md z-20 shrink-0">
                <div className="max-w-full mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
=======
        <div className="flex flex-col h-[calc(100vh-64px)] mt-16 bg-slate-950 overflow-hidden">
            {/* Header Area */}
            <div className="px-4 md:px-6 py-4 border-b border-white/5 bg-slate-950/50 backdrop-blur-md z-20">
                <div className="max-w-full mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
>>>>>>> fc8523eeb482617aa02abdbead66537c1fe8912b
                        <button
                            onClick={() => navigate('/nets')}
                            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all group shrink-0"
                            title="Back to Operations"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
<<<<<<< HEAD
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg md:text-xl font-bold text-white tracking-tight truncate">{net.name}</h1>
                                {isActive ? (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase tracking-wider animate-pulse shrink-0">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                        Live
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[8px] font-bold uppercase tracking-wider shrink-0">
                                        <div className="w-1 h-1 rounded-full bg-slate-500"></div>
                                        Offline
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-0.5">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(net.started_at), 'MMM d, HH:mm')}
=======
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-white tracking-tight">{currentNet.name}</h1>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                    }`}>
                                    {isActive ? 'Live Operation' : 'Archived'}
>>>>>>> fc8523eeb482617aa02abdbead66537c1fe8912b
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(currentNet.started_at), 'MMM d, yyyy • HH:mm')}
                                </div>
                                {currentNet.frequency && (
                                    <div className="flex items-center gap-1.5">
                                        <Wifi className="w-3 h-3" />
                                        {currentNet.frequency}
                                    </div>
                                )}
<<<<<<< HEAD
                                <span className="uppercase truncate max-w-[100px]">{net.type.replace('_', ' ')}</span>
=======
>>>>>>> fc8523eeb482617aa02abdbead66537c1fe8912b
                            </div>
                        </div>
                    </div>

<<<<<<< HEAD
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900/80 border border-slate-800/50">
                            <input type="file" ref={fileInputRef} onChange={handleImportADIF} accept=".adi,.adif" className="hidden" />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                title="Import ADIF"
                            >
                                <Upload className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-px h-3 bg-slate-800 mx-0.5"></div>
                            <button
                                onClick={handleExportADIF}
                                className="px-2 py-1 rounded-md text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10 transition-all font-mono"
                            >
                                ADIF
                            </button>
                            <button
                                onClick={handleExportPDF}
                                disabled={exporting}
                                className="px-2 py-1 rounded-md text-[10px] font-bold text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-1 font-mono"
                            >
                                {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FilePdf className="w-3 h-3" />}
                                PDF
                            </button>
                        </div>
=======
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
>>>>>>> fc8523eeb482617aa02abdbead66537c1fe8912b

                        {isActive && (
                            <button
                                onClick={handleEndNet}
                                disabled={ending}
<<<<<<< HEAD
                                className="h-8 px-3 rounded-lg bg-rose-500 text-white font-bold text-[10px] hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 flex items-center gap-1.5 uppercase"
                            >
                                {ending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <StopCircle className="w-3.5 h-3.5" />}
                                End Net
=======
                                className={`h-10 px-4 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center gap-2 ${confirmEnd ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'}`}
                            >
                                {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : <StopCircle className="w-4 h-4" />}
                                {confirmEnd ? 'Confirm End?' : 'End Net'}
>>>>>>> fc8523eeb482617aa02abdbead66537c1fe8912b
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

<<<<<<< HEAD
            {/* Main Content Dashboard Area - Fills remaining space */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">

                {/* Left Column: Stats & Operations (3 cols) */}
                <div className="lg:col-span-3 border-r border-white/5 bg-slate-900/20 flex flex-col overflow-hidden">
                    <div className="p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                        {/* Compact Stats Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/50">
                                <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Check-ins</p>
                                <p className="text-lg font-mono font-bold text-emerald-400">{checkins.length}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/50">
                                <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Stations</p>
                                <p className="text-lg font-mono font-bold text-cyan-400">{new Set(checkins.map(c => c.callsign)).size}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/50">
                                <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Duration</p>
                                <p className="text-xs font-mono font-bold text-violet-400">{`${Math.floor(duration / 60)}h ${duration % 60}m`}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/50">
                                <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Traffic</p>
                                <p className="text-lg font-mono font-bold text-amber-400">{checkins.filter(c => c.traffic).length}</p>
                            </div>
                        </div>

                        {/* Quick Check-in Form */}
                        {isActive && (
                            <div className="mt-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-3.5 bg-emerald-500 rounded-full"></div>
                                    <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Transmit Log</h3>
                                </div>
                                <div className="scale-[0.85] origin-top -mt-6 -mx-6 h-full">
                                    <CheckinForm netId={netId!} onCheckinAdded={fetchData} />
=======
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
>>>>>>> fc8523eeb482617aa02abdbead66537c1fe8912b
                                </div>
                            </div>

<<<<<<< HEAD
                        {/* Analysis - Top Stations (Smaller) */}
                        {checkins.length > 0 && (
                            <div className="mt-2 p-2 rounded-lg bg-slate-900/30 border border-slate-800/30 h-48 overflow-hidden">
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
                        <div className="p-3 md:p-4 min-h-full">
=======
                            {/* Integration of CheckinForm for active nets */}
                            {isActive && userId === currentNet.user_id && (
                                <div className="mb-6">
                                    <CheckinForm
                                        netId={currentNet.id}
                                        onCheckinAdded={fetchData}
                                    />
                                </div>
                            )}

                            {/* Checkin List with Edit support */}
>>>>>>> fc8523eeb482617aa02abdbead66537c1fe8912b
                            <CheckinList
                                checkins={checkins}
                                onDelete={handleCheckinDeleted}
                                onEdit={currentNet && userId === currentNet.user_id ? startEdit : undefined}
                                onGenerateCertificate={handleGenerateCertificate}
                                showDelete={isActive}
                            />
                        </div>
                    </div>

<<<<<<< HEAD
                {/* Right Column: Visualization & Status (3 cols) */}
                <div className="lg:col-span-3 border-l border-white/5 bg-slate-900/20 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                        {/* Map Section - Fixed Aspect Ratio */}
                        <div className="p-3 border-b border-white/5 bg-slate-900/40">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1 h-3.5 bg-cyan-500 rounded-full"></div>
                                <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Geo Presence</h3>
                            </div>
                            <div className="rounded-lg overflow-hidden border border-slate-800/50 shadow-inner h-40">
                                <NetMap checkins={checkins} className="h-full w-full" />
                            </div>
                        </div>

                        {/* Live Feed Section */}
                        <div className="p-3 flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-3.5 bg-emerald-500 rounded-full"></div>
                                    <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Live Feed</h3>
                                </div>
                                <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded animate-pulse shrink-0">STREAMING</span>
=======
                    {/* Right Column: Visualization & Status (4 cols) - Moved INSIDE the grid */}
                    <div className="lg:col-span-4 border-l border-white/5 bg-slate-900/20 flex flex-col overflow-hidden">
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
>>>>>>> fc8523eeb482617aa02abdbead66537c1fe8912b
                            </div>

<<<<<<< HEAD
                        {/* Connection Status - Compact Bottom */}
                        <div className="p-3 mt-auto border-t border-white/5 bg-slate-950/40 shrink-0">
                            <div className="flex items-center justify-between text-[9px] font-mono">
                                <span className="text-slate-500">Uplink: <span className="text-emerald-500">STABLE</span></span>
                                <span className="text-slate-500">Latency: <span className="text-emerald-500">24ms</span></span>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
=======
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
>>>>>>> fc8523eeb482617aa02abdbead66537c1fe8912b
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
