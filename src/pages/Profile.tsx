import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { Save, User, Radio, Loader2, MapPin, Grid } from 'lucide-react'

export default function Profile() {
    const { user: authUser } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [callsign, setCallsign] = useState('')
    const [name, setName] = useState('')
    const [handle, setHandle] = useState('')
    const [location, setLocation] = useState('')
    const [gridLocator, setGridLocator] = useState('')

    useEffect(() => {
        const fetchProfile = async () => {
            if (!authUser) return

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single()

                if (error) {
                    console.error('Error fetching profile:', error)
                    return
                }

                if (data) {
                    setCallsign(data.callsign || '')
                    setName(data.name || '')
                    setHandle(data.handle || '')
                    setLocation(data.location || '')
                    setGridLocator(data.grid_locator || '')
                }
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [authUser])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!authUser) return

        if (!callsign.trim()) {
            toast.error('Callsign is required')
            return
        }

        setSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    callsign: callsign.toUpperCase().trim(),
                    name: name.trim(),
                    handle: handle.trim(),
                    location: location.trim(),
                    grid_locator: gridLocator.toUpperCase().trim(),
                })
                .eq('id', authUser.id)

            if (error) throw error

            toast.success('Profile updated successfully')

            // Force a session refresh to update metadata in other components if needed
            // But relying on Supabase realtime or refetching in components is better
            // Ideally, update the local auth context if it stores profile data, 
            // but our current AuthContext primarily tracks the session user.

        } catch (error: any) {
            toast.error(`Failed to update profile: ${error.message}`)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen pt-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    return (
        <main className="min-h-screen pt-24 px-4 pb-12 bg-slate-950 text-white">
            <div className="max-w-2xl mx-auto space-y-6">
                <header>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Operator Profile
                    </h1>
                    <p className="text-slate-400">Manage your station identity and settings</p>
                </header>

                <div className="card glass-card p-8 border border-white/10 shadow-2xl animate-fade-in relative overflow-hidden">
                    {/* Background blob for visual interest */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                    <form onSubmit={handleSave} className="space-y-6 relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                                <span className="text-3xl font-bold font-mono text-white">
                                    {callsign.slice(0, 2).toUpperCase() || 'OP'}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold">{callsign.toUpperCase() || 'Unknown Station'}</h3>
                                <p className="text-sm text-slate-400 font-mono text-[10px] uppercase tracking-wider bg-slate-900/50 px-2 py-1 rounded-md inline-block border border-white/5">
                                    Operator
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">
                                    Callsign <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={callsign}
                                        onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                                        className="input pl-11 uppercase font-mono text-lg transition-all focus:ring-2 ring-emerald-500/20"
                                        placeholder="9M2..."
                                        required
                                    />
                                    <Radio className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <p className="text-xs text-slate-500 ml-1">
                                    This will be displayed on all logs and net operations.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">
                                        Operator Name
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="input pl-11 transition-all focus:ring-2 ring-violet-500/20"
                                            placeholder="Full Name"
                                        />
                                        <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">
                                        Handle (Optional)
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={handle}
                                            onChange={(e) => setHandle(e.target.value)}
                                            className="input pl-11 transition-all focus:ring-2 ring-violet-500/20"
                                            placeholder="Nickname"
                                        />
                                        <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">
                                        Location
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="input pl-11 transition-all focus:ring-2 ring-violet-500/20"
                                            placeholder="City, State"
                                        />
                                        <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">
                                        Grid Square (Optional)
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={gridLocator}
                                            onChange={(e) => setGridLocator(e.target.value.toUpperCase())}
                                            maxLength={6}
                                            className="input pl-11 uppercase font-mono transition-all focus:ring-2 ring-emerald-500/20"
                                            placeholder="OJ11AB"
                                        />
                                        <Grid className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn btn-primary min-w-[140px] shadow-lg shadow-emerald-500/20"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    )
}
