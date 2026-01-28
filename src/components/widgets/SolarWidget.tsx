import { useEffect, useState } from 'react'
import { Sun, Radio, Activity, Loader2 } from 'lucide-react'

interface SolarData {
    sfi: number
    ssn: number
    aIndex: number
    kIndex: number
    conditions: {
        hf: string
        vhf: string
    }
}

export default function SolarWidget() {
    const [data, setData] = useState<SolarData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSolarData = async () => {
            try {
                // In a real scenario, we might want to fetch from multiple NOAA endpoints
                // and combine them. For now, we'll simulate or use a proxy if needed.
                // Since direct NOAA JSON might still have CORS or be tricky to parse 
                // into hams' favorite "Signal Conditions", we'll use a reliable method.

                const response = await fetch('https://services.swpc.noaa.gov/products/summary/10cm-flux-6-hour.json')
                const sfiData = await response.json()
                const sfi = sfiData[0]?.flux || 0

                const kResponse = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json')
                const kData = await kResponse.json()
                const kIndex = parseInt(kData[kData.length - 1]?.[1] || '0')

                // Simplified condition logic
                let hfStatus = 'Fair'
                if (sfi > 150 && kIndex < 3) hfStatus = 'Excellent'
                else if (sfi > 100 && kIndex < 4) hfStatus = 'Good'
                else if (kIndex > 5) hfStatus = 'Poor/Storm'

                setData({
                    sfi,
                    ssn: Math.max(0, Math.floor((sfi - 66) * 0.9)), // Approximate SSN from SFI
                    aIndex: Math.floor(kIndex * 2.5), // Rough A-index estimate
                    kIndex,
                    conditions: {
                        hf: hfStatus,
                        vhf: kIndex < 3 ? 'Normal' : 'Disturbed'
                    }
                })
            } catch (err) {
                console.error('Failed to fetch solar data:', err)
                setError('Failed to load solar data')
            } finally {
                setLoading(false)
            }
        }

        fetchSolarData()
        const interval = setInterval(fetchSolarData, 1000 * 60 * 60) // Update every hour
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="card glass-card p-6 flex items-center justify-center min-h-[160px]">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="card glass-card p-6 flex items-center justify-center min-h-[160px]">
                <p className="text-slate-400 text-sm">{error || 'No data available'}</p>
            </div>
        )
    }

    const getConditionColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'excellent': return 'text-emerald-400'
            case 'good': return 'text-cyan-400'
            case 'fair': return 'text-amber-400'
            case 'poor': case 'storm': return 'text-rose-400'
            default: return 'text-slate-400'
        }
    }

    return (
        <div className="card glass-card p-6 relative overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] transition-opacity opacity-0 group-hover:opacity-50 bg-amber-500/10" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Solar Weather / Propagation</h3>
                    <Sun className="w-5 h-5 text-amber-400" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 font-medium">Solar Flux (SFI)</p>
                        <p className="text-2xl font-bold text-white font-mono">{data.sfi}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 font-medium">K-Index</p>
                        <p className={`text-2xl font-bold font-mono ${data.kIndex > 4 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {data.kIndex}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Radio className="w-4 h-4" />
                            <span>HF Conditions:</span>
                        </div>
                        <span className={`font-bold ${getConditionColor(data.conditions.hf)}`}>{data.conditions.hf}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Activity className="w-4 h-4" />
                            <span>VHF Aurora:</span>
                        </div>
                        <span className="font-bold text-slate-300">{data.conditions.vhf}</span>
                    </div>
                </div>

                <p className="text-[10px] text-slate-600 mt-4 text-center italic">
                    Data provided by NOAA SWPC • Updated hourly
                </p>
            </div>
        </div>
    )
}
