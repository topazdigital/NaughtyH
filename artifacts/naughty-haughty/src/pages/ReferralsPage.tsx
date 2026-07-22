import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { authFetch } from '../lib/auth'
import { useAuth } from '../hooks/useAuth'
import { Users, Copy, Check, Gift, Star, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReferralStats {
  code: string
  totalReferrals: number
  pendingReward: number
  earnedCredits: number
  referrals?: any[]
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const { user } = useAuth()
  const [params] = useLocation()

  useEffect(() => {
    authFetch('/api/referrals')
      .then(r => r.json())
      .then(d => { if (d && !d.error) setStats(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function copyLink() {
    const url = `${window.location.origin}/ref/${stats?.code || ''}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopied(false), 3000)
    })
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f8f7ff]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const referralUrl = `${window.location.origin}/ref/${stats?.code || ''}`

  return (
    <div className="w-full min-h-screen bg-[#f8f7ff]">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center shadow-xl"
            style={{ background: 'linear-gradient(135deg, #4A0072, #6B1FA2)', boxShadow: '0 12px 40px rgba(107,31,162,0.25)' }}>
            <Users size={38} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Refer & Earn</h1>
          <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
            Invite friends and earn credits every time they join!
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: Users, label: 'Referrals', value: stats?.totalReferrals || 0, color: '#6B1FA2', bg: '#f3e8ff' },
            { icon: Gift, label: 'Earned', value: `${stats?.earnedCredits || 0}cr`, color: '#10b981', bg: '#ecfdf5' },
            { icon: Star, label: 'Pending', value: `${stats?.pendingReward || 0}cr`, color: '#f59e0b', bg: '#fffbeb' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-4 text-center bg-white border border-gray-100 shadow-sm">
              <div className="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center"
                style={{ background: s.bg }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div className="text-xl font-black text-gray-900">{s.value}</div>
              <div className="text-gray-400 text-[10px] mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Referral link card */}
        <div className="rounded-3xl p-6 mb-4 bg-white border border-purple-100 shadow-sm">
          <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-3">Your Referral Link</p>
          <div className="flex items-center gap-2 p-3 rounded-2xl mb-4 bg-gray-50 border border-gray-200">
            <span className="flex-1 text-gray-500 text-sm font-mono truncate">{referralUrl}</span>
            <button onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all flex-shrink-0"
              style={copied ? { background: '#10b981' } : { background: 'linear-gradient(135deg, #4A0072, #6B1FA2)' }}>
              {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { const t = encodeURIComponent(`Join me on NaughtyHaughty! ${referralUrl}`); window.open(`https://wa.me/?text=${t}`, '_blank') }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: '#25D366' }}>
              💬 WhatsApp
            </button>
            <button
              onClick={() => { const t = encodeURIComponent(`Join me on NaughtyHaughty! ${referralUrl}`); window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${t}`, '_blank') }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: '#229ED9' }}>
              ✈️ Telegram
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-3xl p-5 bg-white border border-gray-100 shadow-sm">
          <p className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-brand-500" /> How It Works
          </p>
          <div className="space-y-3.5">
            {[
              { step: '1', text: 'Share your unique referral link with friends', color: '#6B1FA2' },
              { step: '2', text: 'Your friend signs up using your link', color: '#3b82f6' },
              { step: '3', text: 'You earn credits when they join and verify', color: '#10b981' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
                  style={{ background: item.color }}>
                  {item.step}
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
