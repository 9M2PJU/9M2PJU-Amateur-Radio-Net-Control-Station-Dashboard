import { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: LucideIcon
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    color?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose'
}

const colorClasses = {
    emerald: {
        bg: 'bg-emerald-500/10',
        icon: 'text-emerald-400',
        gradient: 'from-emerald-500 to-cyan-500',
    },
    cyan: {
        bg: 'bg-cyan-500/10',
        icon: 'text-cyan-400',
        gradient: 'from-cyan-500 to-blue-500',
    },
    violet: {
        bg: 'bg-violet-500/10',
        icon: 'text-violet-400',
        gradient: 'from-violet-500 to-purple-500',
    },
    amber: {
        bg: 'bg-amber-500/10',
        icon: 'text-amber-400',
        gradient: 'from-amber-500 to-orange-500',
    },
    rose: {
        bg: 'bg-rose-500/10',
        icon: 'text-rose-400',
        gradient: 'from-rose-500 to-pink-500',
    },
}

export default function StatsCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    color = 'emerald',
}: StatsCardProps) {
    const colors = colorClasses[color]

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
    const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'

    return (
        <div className="card card-hover animate-fade-in">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white mb-1">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-slate-500">{subtitle}</p>
                    )}
                    {trend && trendValue && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
                            <TrendIcon className="w-4 h-4" />
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
            </div>
        </div>
    )
}
