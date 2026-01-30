'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'

interface NetTypeData {
    name: string
    value: number
}

interface NetTypeDistributionProps {
    data: NetTypeData[]
    title?: string
}

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899']

export default function NetTypeDistribution({ data, title = 'Operational Breakdown' }: NetTypeDistributionProps) {
    const formatName = (name: string) => name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())

    return (
        <div className="w-full h-full p-4 flex flex-col">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                <div className="w-1 h-4 bg-violet-500 rounded-full"></div>
                {title}
            </h3>
            <div className="flex-1 w-full min-h-0" style={{ minHeight: '100px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                        barSize={20}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                            tickFormatter={formatName}
                            width={100}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(8px)',
                            }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
