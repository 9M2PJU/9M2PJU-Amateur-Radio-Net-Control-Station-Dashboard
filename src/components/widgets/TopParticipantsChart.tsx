'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
    callsign: string
    checkins: number
}

interface TopParticipantsChartProps {
    data: DataPoint[]
    title?: string
}

export default function TopParticipantsChart({ data, title = 'Top Participants' }: TopParticipantsChartProps) {
    // Sort by checkins and take top 10
    const sortedData = [...data]
        .sort((a, b) => b.checkins - a.checkins)
        .slice(0, 10)

    return (
        <div className="card animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={sortedData}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                        <XAxis
                            type="number"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <YAxis
                            type="category"
                            dataKey="callsign"
                            stroke="#64748b"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            width={70}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#f1f5f9',
                            }}
                            labelStyle={{ color: '#94a3b8' }}
                            cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                        />
                        <Bar
                            dataKey="checkins"
                            fill="#10b981"
                            radius={[0, 4, 4, 0]}
                            name="Check-ins"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
