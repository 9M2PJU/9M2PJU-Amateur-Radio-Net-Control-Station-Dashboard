'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'

interface SignalData {
    name: string
    count: number
}

interface SignalReportChartProps {
    data: SignalData[]
    title: string
}

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1', '#ec4899']

export default function SignalReportChart({ data, title }: SignalReportChartProps) {
    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1 bg-violet-500 rounded-full"></div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="name"
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
                                backgroundColor: '#0f172a',
                                border: '1px solid #1e293b',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar
                            dataKey="count"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
