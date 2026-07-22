import { useState, useEffect } from 'react'
import { Zap, Clock, TrendingUp, Crown, Loader2, ChevronRight, Star, Users, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authFetch } from '../lib/auth'
import { useAuth } from '../hooks/useAuth'

interface BoostStatus {
  active: boolean
  boost: { startTime: number; endTime: number; creditsSpent: number } | null
  config: { credits: number; duration: number }
  credits: number
}

export default function BoostPage() {
  const [status, setStatus] = useState<BoostStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [boosting, setBoosting] = useState(false)
  const [timeLeftStr, setTimeLeftStr] = useState('')
  const { user } = useAuth()

  async function fetchStatus() {
    try {
      const res = await authFetch('/api/boost/status')
      const data = await res.json()
      setStatus(data)
    } catch { }
    setLoading(false)
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!status?.boost?.endTime) return
    const tick = () => {
      const diff = status.boost!.endTime - Math.floor(Date.now() / 1000)
      if (diff <= 0) { setTimeLeftStr('Expired'); return }
      const m = Math.floor(diff / 60), s = diff % 60
      setTimeLeftStr(m > 0 ? `${m}m ${s}s` : `${s}s`)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [status?.boost?.endTime])

  async function activateBoost() {
    setBoosting(true)
    try {
      const res = await authFetch('/api/boost/activate', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to boost'); return }
      toast.success(`🚀 Profile boosted for ${data.duration} minutes!`)
      fetchStatus()
    } catch {
      toast.error('Something went wrong')
    } finally { setBoosting(false) }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #111827 100%)' }}>
        <Loader2 size={32} className="text-brand-400 animate-spin" />
      </div>
    )
  }

  const config = status?.config || { credits: 50, duration: 30 }
  const credits = status?.credits || 0
  const canAfford = credits >= config.credits

  return (
    <div className="w-full min-h-screen" style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #111827 100%)' }}>
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', boxShadow: '0 12px 40px rgba(249,115,22,0.4)' }}>
            <Zap size={40} className="text-white fill-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Boost Your Profile</h1>
          <p className="text-white/50 text-sm max-w-xs mx-auto leading-relaxed">
            Pin your profile to the top of discovery and get up to 10× more views!
          </p>
        </div>

        {/* Active boost banner */}
        {status?.active && status.boost && (
          <div className="rounded-3xl p-6 mb-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', boxShadow: '0 12px 40px rgba(249,115,22,0.4)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
              <span className="font-black text-white text-lg">🔥 Boost Active!</span>
            </div>
            <p className="text-white/80 text-sm mb-4 leading-relaxed">
              Your profile is pinned at the top of discovery. Make it count!
            </p>
            <div className="inline-flex items-center gap-2.5 bg-white/20 rounded-2xl px-5 py-2.5">
              <Clock size={18} className="text-white" />
              <span className="font-black text-white text-xl">{timeLeftStr}</span>
              <span className="text-white/70 text-sm">remaining</span>
            </div>
          </div>
        )}

        {/* Features */}
        {!status?.active && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { icon: TrendingUp, label: 'Top Placement', desc: 'Appear #1 in discovery', accent: '#3b82f6' },
              { icon: Users, label: '10× Views', desc: 'Massive visibility boost', accent: '#10b981' },
              { icon: Star, label: '⚡ Badge', desc: 'Special boost indicator', accent: '#f97316' },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl p-4 text-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-9 h-9 rounded-xl mx-auto mb-2.5 flex items-center justify-center"
                  style={{ background: `${f.accent}25`, border: `1px solid ${f.accent}40` }}>
                  <f.icon size={16} style={{ color: f.accent }} />
                </div>
                <p className="text-white text-xs font-bold mb-0.5">{f.label}</p>
                <p className="text-white/35 text-[10px] leading-tight">{f.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Main action card */}
        {!status?.active && (
          <div className="rounded-3xl p-6 mb-4"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>

            {/* Price display */}
            <div className="flex items-center justify-between p-4 rounded-2xl mb-4"
              style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)' }}>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Zap size={16} className="text-orange-400" />
                  <span className="font-bold text-white text-sm">Profile Boost</span>
                </div>
                <p className="text-white/45 text-xs">{config.duration} minutes of top placement</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">{config.credits}</p>
                <p className="text-white/45 text-xs font-semibold">credits</p>
              </div>
            </div>

            {/* Balance */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <span className="text-white/50 text-sm font-medium">💳 Your balance</span>
              <span className={`text-lg font-black ${canAfford ? 'text-white' : 'text-red-400'}`}>
                {credits} credits
              </span>
            </div>

            {!canAfford && (
              <div className="rounded-xl p-3.5 mb-4 text-sm flex items-start gap-2.5"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <span className="text-red-400 flex-shrink-0 mt-0.5">⚠️</span>
                <span className="text-red-300/80">
                  You need {config.credits} credits to boost.{' '}
                  <a href="/credits" className="text-red-300 font-bold underline">Buy credits</a> to continue.
                </span>
              </div>
            )}

            <button
              onClick={activateBoost}
              disabled={boosting || !canAfford}
              className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
              style={canAfford ? {
                background: 'linear-gradient(135deg, #f97316, #ef4444)',
                boxShadow: '0 8px 28px rgba(249,115,22,0.4)',
                color: '#fff',
              } : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>
              {boosting ? (
                <><Loader2 size={18} className="animate-spin" /> Activating…</>
              ) : (
                <><Zap size={18} className={canAfford ? 'fill-white' : ''} /> Boost for {config.duration} min · {config.credits} credits</>
              )}
            </button>
          </div>
        )}

        {/* How it works */}
        <div className="rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
            <Crown size={16} className="text-amber-400" /> How Boost Works
          </p>
          <div className="space-y-3.5">
            {[
              { step: '1', text: 'Your profile moves to the very top of the Discover page for everyone', color: '#3b82f6' },
              { step: '2', text: 'A special ⚡ badge appears on your profile so people notice you', color: '#f97316' },
              { step: '3', text: 'After the boost period, your profile returns to normal ranking', color: '#10b981' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
                  style={{ background: item.color }}>
                  {item.step}
                </div>
                <p className="text-white/55 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <a href="/credits" className="flex items-center justify-between text-sm text-brand-400 font-semibold hover:text-brand-300 transition-colors">
              <span>Need more credits? Get them here</span>
              <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
