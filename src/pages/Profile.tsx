import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { User, Mail, Save, Loader2, Shield, Info } from 'lucide-react'
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
        <main className="h-screen pt-16 md:pt-20 overflow-hidden flex flex-col bg-slate-950">
            {/* Header Area */}
            <div className="px-4 md:px-6 py-6 border-b border-white/5 bg-slate-950/50 backdrop-blur-md z-20">
                <div className="max-w-4xl mx-auto flex items-center gap-6">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
                        <User className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Operator Profile</h1>
                        <p className="text-slate-500 text-xs font-mono mt-1 uppercase tracking-wider">Station Identity & Credentials</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex justify-center">
                <div className="w-full max-w-3xl space-y-6">
                    <div className="card glass-card p-6 md:p-8">
                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                    Email Address
                                </label>
                                <div className="relative group opacity-75">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        className="input pl-11 w-full bg-slate-900/30 border-slate-800 text-slate-500 cursor-not-allowed font-mono"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <Shield className="h-4 w-4 text-emerald-500/30" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-600 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                    <Shield className="w-3 h-3 text-emerald-500" />
                                    Verified secure identity
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label htmlFor="callsign" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                        Callsign <span className="text-cyan-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                                        </div>
                                        <input
                                            id="callsign"
                                            type="text"
                                            value={callsign}
                                            onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                                            className="input pl-11 w-full bg-slate-900/50 border-slate-800 focus:border-cyan-500/50 font-mono tracking-widest text-white text-lg font-bold"
                                            placeholder="MY1CALL"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="name" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                        Operator Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input w-full bg-slate-900/50 border-slate-800 focus:border-cyan-500/50 text-white font-bold"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="h-12 px-8 rounded-xl bg-cyan-600 text-white font-bold text-sm hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>SAVING...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            <span>SAVE CHANGES</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="card glass-card p-6 border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-start gap-4">
                            <Info className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Identity Note</h3>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    Your callsign is your primary identifier on the network. Changing it will update all your current and future net sessions to reflect your new identity.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
