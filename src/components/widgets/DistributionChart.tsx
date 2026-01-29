'use client'

import { useEffect, useState } from 'react'

interface Participant {
    callsign: string
    checkins: number
}

interface DistributionChartProps {
    data: Participant[]
    title?: string
}

export default function DistributionChart({ data, title = 'Distribution' }: DistributionChartProps) {
    const [animated, setAnimated] = useState(false)

    useEffect(() => {
        // Trigger animation after mount
        const timer = setTimeout(() => setAnimated(true), 100)
        return () => clearTimeout(timer)
    }, [])

    if (!data || data.length === 0) {
        return (
            <div className="w-full h-full p-6 flex items-center justify-center">
                <p className="text-slate-500 text-sm">No data available</p>
            </div>
        )
    }

    const maxCheckins = Math.max(...data.map(d => d.checkins))
    const colors = [
        'from-emerald-500 to-emerald-400',
        'from-cyan-500 to-cyan-400',
        'from-blue-500 to-blue-400',
        'from-violet-500 to-violet-400',
        'from-purple-500 to-purple-400',
    ]

    return (
        <div className="w-full h-full p-4 flex flex-col">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-emerald-500 to-violet-500 rounded-full"></div>
                {title}
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto">
                {data.map((participant, index) => {
                    const percentage = (participant.checkins / maxCheckins) * 100
                    const color = colors[index % colors.length]

                    return (
                        <div key={participant.callsign} className="group">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-white transition-colors">
                                    {participant.callsign}
                                </span>
                                <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-400 transition-colors">
                                    {participant.checkins}
                                </span>
                            </div>
                            <div className="relative h-2 bg-slate-900/50 rounded-full overflow-hidden border border-slate-800/50">
                                <div
                                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${color} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                                    style={{
                                        width: animated ? `${percentage}%` : '0%',
                                        boxShadow: animated ? '0 0 10px currentColor' : 'none'
                                    }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
