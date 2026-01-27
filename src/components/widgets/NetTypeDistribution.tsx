'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface DataPoint {
    name: string
    value: number
}

interface NetTypeDistributionProps {
    data: DataPoint[]
    title?: string
}

const COLORS = ['#10b981', '#ef4444', '#8b5cf6', '#f59e0b']

const typeLabels: Record<string, string> = {
    weekly: 'Weekly Net',
    emergency_exercise: 'Emergency Exercise',
    special: 'Special Event',
}

export default function NetTypeDistribution({ data, title = 'Net Types' }: NetTypeDistributionProps) {
    const formattedData = data.map(item => ({
        ...item,
        name: typeLabels[item.name] || item.name,
    }))

    const total = formattedData.reduce((sum, item) => sum + item.value, 0)

    return (
        <div className="card animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={formattedData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {formattedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="transparent"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#f1f5f9',
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
                <p className="text-2xl font-bold text-white">{total}</p>
                <p className="text-sm text-slate-400">Total Nets</p>
            </div>
        </div>
    )
}
