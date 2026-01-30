'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface DataPoint {
    date: string
    checkins: number
}

interface NetActivityChartProps {
    data: DataPoint[]
    title?: string
}

export default function NetActivityChart({ data, title = 'Net Activity' }: NetActivityChartProps) {
    const formattedData = data.map(item => ({
        ...item,
        displayDate: format(new Date(item.date), 'MMM d'),
    }))

    return (
        <div className="w-full h-full p-6 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                {title}
            </h3>
            <div className="flex-1 w-full min-h-0" style={{ minHeight: '150px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="displayDate"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                backdropFilter: 'blur(8px)',
                            }}
                            itemStyle={{ color: '#10b981', fontWeight: 600 }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                            cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="checkins"
                            stroke="#10b981"
                            strokeWidth={3}
                            fill="url(#colorCheckins)"
                            name="Check-ins"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
