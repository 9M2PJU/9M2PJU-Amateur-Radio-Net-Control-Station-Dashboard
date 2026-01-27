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
        <div className="card animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis
                            dataKey="displayDate"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
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
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#f1f5f9',
                            }}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="checkins"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#colorCheckins)"
                            name="Check-ins"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
