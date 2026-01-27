import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { User, Mail, Save, Loader2, Shield } from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [name, setName] = useState('')
    const [callsign, setCallsign] = useState('')
    const [email, setEmail] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                navigate('/login')
                return
            }

            setEmail(user.email || '')

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) {
                // If profile doesn't exist but user does, it might not be an error per se, but for now we expect it.
                // In a real app we might want to autocreate here if missing.
                toast.error('Failed to load profile')
            } else if (data) {
                setProfile(data)
                setName(data.name || '')
                setCallsign(data.callsign || '')
            }
            setLoading(false)
        }

        fetchProfile()
    }, [navigate])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile) return

        setSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: name.trim(),
                    callsign: callsign.trim().toUpperCase()
                })
                .eq('id', profile.id)

            if (error) throw error

            toast.success('Profile updated successfully')
            // Refresh local state if needed
        } catch {
            toast.error('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        )
    }

    return (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mt-20 md:mt-24 space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-lg shadow-cyan-500/10">
                    <User className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Operator Profile</h1>
                    <p className="text-slate-400">Manage your station identity and credentials.</p>
                </div>
            </div>

            <div className="card glass-card p-8">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider">
                            Email Address
                        </label>
                        <div className="relative group opacity-75">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="input pl-11 w-full bg-slate-900/30 border-slate-800 text-slate-500 cursor-not-allowed"
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <Shield className="h-4 w-4 text-emerald-500/50" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Verified secure identity
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="callsign" className="block text-sm font-bold text-slate-300 uppercase tracking-wider">
                                Callsign <span className="text-cyan-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                </div>
                                <input
                                    id="callsign"
                                    type="text"
                                    value={callsign}
                                    onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                                    className="input pl-11 w-full bg-slate-900/50 border-slate-800 focus:border-cyan-500/50 font-mono tracking-wider"
                                    placeholder="MY1CALL"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-bold text-slate-300 uppercase tracking-wider">
                                Operator Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input w-full bg-slate-900/50 border-slate-800 focus:border-cyan-500/50"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/20 w-full sm:w-auto"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}
