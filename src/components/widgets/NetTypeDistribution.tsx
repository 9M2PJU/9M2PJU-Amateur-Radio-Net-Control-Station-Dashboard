'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface NetTypeData {
    name: string
    value: number
}

interface NetTypeDistributionProps {
    data: NetTypeData[]
    title?: string
}

const COLORS = ['#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899']

export default function NetTypeDistribution({ data, title = 'Net Type Distribution' }: NetTypeDistributionProps) {
    const formatName = (name: string) => name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())

    return (
        <div className="w-full h-full p-6 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-5 bg-violet-500 rounded-full"></div>
                {title}
            </h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                backdropFilter: 'blur(8px)',
                            }}
                            itemStyle={{ color: '#fff', fontWeight: 600 }}
                            formatter={(value: any) => [value, 'Count']}
                        />
                        <Legend
                            formatter={(value) => <span className="text-slate-300 font-medium ml-1">{formatName(value)}</span>}
                            iconType="circle"
                            iconSize={8}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
