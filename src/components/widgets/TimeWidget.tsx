'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function TimeWidget() {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="h-full flex flex-col">
            {/* UTC Time */}
            <div className="flex-1 flex flex-col items-center justify-center border-b border-white/5 bg-slate-900/40">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">UTC / ZULU</span>
                    </div>
                    <div className="font-mono text-3xl font-bold text-white tracking-wider tabular-nums">
                        {time.toISOString().substring(11, 19)}
                        <span className="text-sm text-slate-600 ml-1">Z</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                        {format(time, 'yyyy-MM-dd')}
                    </div>
                </div>
            </div>

            {/* Local Time */}
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/20">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">LOCAL</span>
                    </div>
                    <div className="font-mono text-2xl font-bold text-slate-300 tracking-wider tabular-nums">
                        {format(time, 'HH:mm:ss')}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                        {format(time, 'EEE, MMM d')}
                    </div>
                </div>
            </div>
        </div>
    )
}
