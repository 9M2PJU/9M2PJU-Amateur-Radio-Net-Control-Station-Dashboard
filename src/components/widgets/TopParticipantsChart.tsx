'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Participant {
    callsign: string
    checkins: number
}

interface TopParticipantsChartProps {
    data: Participant[]
    title?: string
}

export default function TopParticipantsChart({ data, title = 'Top Participants' }: TopParticipantsChartProps) {
    return (
        <div className="w-full h-full p-6 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-5 bg-cyan-500 rounded-full"></div>
                {title}
            </h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                        <XAxis
                            type="number"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            dataKey="callsign"
                            type="category"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            width={60}
                            tick={{ fontFamily: 'monospace', fontWeight: 600 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                backdropFilter: 'blur(8px)',
                            }}
                            itemStyle={{ color: '#22d3ee', fontWeight: 600 }}
                            labelStyle={{ color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}
                        />
                        <Bar dataKey="checkins" name="Check-ins" radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`hsla(189, 94%, 48%, ${1 - index * 0.08})`} // Cyan gradient
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
