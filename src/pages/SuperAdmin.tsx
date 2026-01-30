import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useImpersonation } from '../contexts/ImpersonationContext'
import { Users, Search, UserCog, X, Loader2, Heart, HeartOff } from 'lucide-react'
import { toast } from 'sonner'

interface User {
    id: string
    email: string
    callsign: string
    name: string | null
    created_at: string
    net_count: number
    hide_donation_popup: boolean
}

export default function SuperAdmin() {
    const { isSuperAdmin } = useAuth()
    const { impersonateUser, stopImpersonation, isImpersonating, impersonatedUser } = useImpersonation()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (!isSuperAdmin) return

        const fetchUsers = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select(`
            id,
            callsign,
            name,
            created_at,
            hide_donation_popup,
            nets:nets(count)
          `)
                    .order('created_at', { ascending: false })

                if (error) throw error

                // Map profile data to user format
                // Note: Email is not available on frontend for security reasons
                const usersData = data.map(profile => ({
                    id: profile.id,
                    email: '***@***', // Email hidden for security
                    callsign: profile.callsign,
                    name: profile.name,
                    created_at: profile.created_at,
                    net_count: profile.nets?.[0]?.count || 0,
                    hide_donation_popup: profile.hide_donation_popup || false
                }))

                setUsers(usersData)
            } catch (error) {
                console.error('Error fetching users:', error)
                toast.error('Failed to load users')
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [isSuperAdmin])

    const handleImpersonate = (user: User) => {
        impersonateUser(user.id, user.callsign, user.email)
        toast.success(`Now impersonating ${user.callsign}`)
    }

    const handleStopImpersonation = () => {
        stopImpersonation()
        toast.success('Stopped impersonation')
    }

    const handleToggleDonationPopup = async (user: User) => {
        try {
            const newValue = !user.hide_donation_popup

            const { error } = await supabase
                .from('profiles')
                .update({ hide_donation_popup: newValue })
                .eq('id', user.id)

            if (error) throw error

            setUsers(users.map(u =>
                u.id === user.id ? { ...u, hide_donation_popup: newValue } : u
            ))

            toast.success(`Donation popup ${newValue ? 'disabled' : 'enabled'} for ${user.callsign}`)
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Failed to update settings')
        }
    }

    const filteredUsers = users.filter(user =>
        user.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!isSuperAdmin) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="text-center">
                    <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-slate-500">You don't have permission to access this page.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-4 px-4 md:px-6">
            {/* Header */}
            <div className="py-4 border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
                <div className="max-w-full mx-auto">
                    <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono mb-1">
                        <UserCog className="w-3 h-3" />
                        SUPER ADMIN
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">User Management</h1>
                    <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                        IMPERSONATE USERS & VIEW THEIR DATA
                    </p>
                </div>
            </div>

            {/* Impersonation Banner */}
            {isImpersonating && impersonatedUser && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UserCog className="w-5 h-5 text-amber-400" />
                        <div>
                            <p className="text-sm font-bold text-amber-400">Currently Impersonating</p>
                            <p className="text-xs text-slate-400">
                                {impersonatedUser.callsign} ({impersonatedUser.email})
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleStopImpersonation}
                        className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Stop Impersonating
                    </button>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search by callsign, email, or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
            </div>

            {/* User List */}
            <div className="card glass-card overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-slate-900/40">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        All Users ({filteredUsers.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-16">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">{user.callsign[0]}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{user.callsign}</h4>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                            {user.name && <p className="text-xs text-slate-400">{user.name}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500">Nets</p>
                                        <p className="text-sm font-bold text-emerald-400">{user.net_count}</p>
                                    </div>

                                    <button
                                        onClick={() => handleToggleDonationPopup(user)}
                                        className={`p-2 rounded-lg transition-colors ${user.hide_donation_popup
                                                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                            }`}
                                        title={user.hide_donation_popup ? "Enable Donation Popup" : "Disable Donation Popup"}
                                    >
                                        {user.hide_donation_popup ? <HeartOff className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                                    </button>

                                    <button
                                        onClick={() => handleImpersonate(user)}
                                        disabled={isImpersonating && impersonatedUser?.id === user.id}
                                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isImpersonating && impersonatedUser?.id === user.id ? 'Current' : 'Impersonate'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
