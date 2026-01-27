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
        border: 'border-emerald-500/20',
        icon: 'text-emerald-400',
        text: 'text-emerald-400',
    },
    cyan: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        icon: 'text-cyan-400',
        text: 'text-cyan-400',
    },
    violet: {
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
        icon: 'text-violet-400',
        text: 'text-violet-400',
    },
    amber: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        icon: 'text-amber-400',
        text: 'text-amber-400',
    },
    rose: {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        icon: 'text-rose-400',
        text: 'text-rose-400',
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
        <div className="card glass-card p-6 relative overflow-hidden group">
            {/* Background decoration */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] transition-opacity opacity-0 group-hover:opacity-50 ${colors.bg}`} />

            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{title}</p>
                    <p className="text-3xl font-bold text-white mb-1 font-mono">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
                    )}
                    {trend && trendValue && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
                            <TrendIcon className="w-4 h-4" />
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl border ${colors.bg} ${colors.border} transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
            </div>
        </div>
    )
}
