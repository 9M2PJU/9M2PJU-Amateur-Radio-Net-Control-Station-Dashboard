export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { format } from 'date-fns'
import {
    Radio,
    Users,
    Plus,
    ChevronRight,
    Calendar,
    Filter
} from 'lucide-react'

export default async function NetsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch all nets for this user
    const { data: nets } = await supabase
        .from('nets')
        .select('*, checkins(id)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const allNets = nets || []

    const getTypeBadgeClass = (type: string) => {
        switch (type) {
            case 'weekly': return 'badge-primary'
            case 'emergency_exercise': return 'badge-destructive'
            case 'special': return 'badge-accent'
            default: return 'badge-secondary'
        }
    }

    const formatType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Nets</h1>
                        <p className="text-slate-400 mt-1">Manage your amateur radio nets</p>
                    </div>
                    <Link href="/nets/new" className="btn btn-primary">
                        <Plus className="w-4 h-4" />
                        Start New Net
                    </Link>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="card text-center">
                        <p className="text-2xl font-bold text-white">{allNets.length}</p>
                        <p className="text-sm text-slate-400">Total Nets</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-2xl font-bold text-emerald-400">
                            {allNets.filter(n => !n.ended_at).length}
                        </p>
                        <p className="text-sm text-slate-400">Active</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-2xl font-bold text-cyan-400">
                            {allNets.filter(n => n.type === 'weekly').length}
                        </p>
                        <p className="text-sm text-slate-400">Weekly</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-2xl font-bold text-rose-400">
                            {allNets.filter(n => n.type === 'emergency_exercise').length}
                        </p>
                        <p className="text-sm text-slate-400">Exercises</p>
                    </div>
                </div>

                {/* Nets List */}
                {allNets.length === 0 ? (
                    <div className="card text-center py-16">
                        <Radio className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No nets yet</h3>
                        <p className="text-slate-400 mb-6">Start your first net to begin logging check-ins</p>
                        <Link href="/nets/new" className="btn btn-primary inline-flex">
                            <Plus className="w-4 h-4" />
                            Start Your First Net
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {allNets.map((net) => (
                            <Link
                                key={net.id}
                                href={`/nets/${net.id}`}
                                className="card card-hover flex flex-col sm:flex-row sm:items-center gap-4 p-5"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${net.ended_at
                                        ? 'bg-slate-700'
                                        : 'bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20'
                                        }`}>
                                        <Radio className={`w-6 h-6 ${net.ended_at ? 'text-slate-400' : 'text-white'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-semibold text-white truncate">{net.name}</h3>
                                            {!net.ended_at && (
                                                <span className="status-active text-xs text-emerald-400">Live</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(net.started_at), 'MMM d, yyyy HH:mm')}
                                            </span>
                                            {net.frequency && (
                                                <span className="flex items-center gap-1">
                                                    <Filter className="w-3.5 h-3.5" />
                                                    {net.frequency}
                                                </span>
                                            )}
                                            {net.mode && (
                                                <span>{net.mode}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`badge ${getTypeBadgeClass(net.type)}`}>
                                        {formatType(net.type)}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm font-medium">{net.checkins?.length || 0}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-500" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
