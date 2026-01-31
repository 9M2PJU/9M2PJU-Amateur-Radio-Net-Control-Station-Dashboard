import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Heart, Coffee } from 'lucide-react'

export default function DonationPopup() {
    const { user, profile } = useAuth()
    const [isVisible, setIsVisible] = useState(false)
    const [timeLeft, setTimeLeft] = useState(10)

    useEffect(() => {
        // Hardcoded excluded emails (super admins)
        const excludedEmails = ['9m2pju@gmail.com', '9m2pju@hamradio.my']

        // Check if user is excluded via email OR via profile setting
        const isExcluded =
            (user?.email && excludedEmails.includes(user.email)) ||
            profile?.hide_donation_popup

        if (user && !isExcluded) {
            // Check session storage to see if we already showed it
            const hasShown = sessionStorage.getItem(`donation_popup_shown_${user.id}`)
            if (hasShown) return

            // Show popup
            setIsVisible(true)
            sessionStorage.setItem(`donation_popup_shown_${user.id}`, 'true')

            // Timer to close
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        setIsVisible(false)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => clearInterval(timer)
        }
    }, [user, profile])

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>

                <div className="relative z-10 text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <Heart className="w-8 h-8 text-emerald-400 fill-emerald-400/20 animate-pulse" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Support This Project</h2>

                    <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                        This dashboard is provided free of charge for the amateur radio community.
                        If you find it useful, please consider supporting its development and server costs.
                    </p>

                    <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 mb-6 flex flex-col items-center">
                        <div className="bg-white p-2 rounded-lg mb-4 w-48 h-48 flex items-center justify-center">
                            <img
                                src="/donation-qr.png"
                                alt="DuitNow QR"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div className="flex items-center gap-2 mb-1">
                            <Coffee className="w-4 h-4 text-amber-400" />
                            <span className="text-white font-bold text-sm">Scan to Donate</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono text-center max-w-[250px] mb-3">
                            Support 9M2PJU via DuitNow QR<br />
                            Every contribution helps keep the station on air!
                        </p>

                        <div className="flex flex-col items-center gap-2 w-full pt-3 border-t border-white/5">
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Or via Buy Me a Coffee</span>
                            <a
                                href="https://buymeacoffee.com/9m2pju"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-[#FFDD00] text-black rounded-lg font-bold text-sm hover:bg-[#FFDD00]/90 transition-colors w-full justify-center"
                            >
                                <Coffee className="w-4 h-4" />
                                Buy Me A Coffee
                            </a>
                        </div>
                    </div>

                    <div className="w-full bg-slate-800/50 rounded-full h-1 overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${(timeLeft / 10) * 100}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-mono">
                        Auto-closing in {timeLeft}s
                    </p>
                </div>
            </div>
        </div>
    )
}
