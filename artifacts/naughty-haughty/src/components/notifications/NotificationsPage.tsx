import { timeAgo } from '../../lib/utils'
import { Link } from 'wouter'
import { Bell, Heart, MessageCircle, Eye, Gift, Crown, Star, Sparkles } from 'lucide-react'

const ICONS: Record<string, React.ReactNode> = {
  like: <Heart size={18} className="text-pink-400" />,
  match: <Heart size={18} className="text-red-400 fill-red-400" />,
  message: <MessageCircle size={18} className="text-blue-400" />,
  visit: <Eye size={18} className="text-white/50" />,
  gift: <Gift size={18} className="text-amber-400" />,
  premium: <Crown size={18} className="text-amber-400" />,
  superlike: <Star size={18} className="text-blue-400 fill-blue-400" />,
}

const ICON_BG: Record<string, string> = {
  like: 'rgba(236,72,153,0.15)',
  match: 'rgba(239,68,68,0.15)',
  message: 'rgba(59,130,246,0.15)',
  visit: 'rgba(255,255,255,0.06)',
  gift: 'rgba(251,191,36,0.15)',
  premium: 'rgba(251,191,36,0.15)',
  superlike: 'rgba(59,130,246,0.15)',
}

interface Props { notifications: any[] }

export default function NotificationsPage({ notifications }: Props) {
  return (
    <div className="w-full min-h-screen" style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #111827 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(107,31,162,0.2)', border: '1px solid rgba(107,31,162,0.3)' }}>
            <Bell size={18} className="text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
            {notifications.length > 0 && (
              <p className="text-white/40 text-xs mt-0.5">{notifications.filter(n => n.read === 0).length} unread</p>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(107,31,162,0.15)', border: '1px solid rgba(107,31,162,0.25)' }}>
              <Sparkles size={36} className="text-brand-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">All caught up!</h2>
            <p className="text-white/40 text-sm mb-6">You have no notifications yet. Start connecting with people!</p>
            <Link href="/discover"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #4A0072, #6B1FA2)', boxShadow: '0 8px 24px rgba(107,31,162,0.35)' }}>
              Discover Members
            </Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            {notifications.map((n: any) => (
              <Link key={n.id} href={n.link || '#'}
                className="flex items-start gap-4 px-4 py-4 rounded-2xl transition-all hover:-translate-y-0.5"
                style={{
                  background: n.read === 0 ? 'rgba(107,31,162,0.15)' : 'rgba(255,255,255,0.04)',
                  border: n.read === 0 ? '1px solid rgba(107,31,162,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = n.read === 0 ? 'rgba(107,31,162,0.22)' : 'rgba(255,255,255,0.07)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.read === 0 ? 'rgba(107,31,162,0.15)' : 'rgba(255,255,255,0.04)'}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: ICON_BG[n.type] || 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {ICONS[n.type] || <Bell size={18} className="text-white/40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${n.read === 0 ? 'font-semibold text-white' : 'text-white/65'}`}>{n.message}</p>
                  <p className="text-xs text-white/30 mt-1">{timeAgo(n.time)}</p>
                </div>
                {n.read === 0 && (
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                    style={{ background: 'linear-gradient(135deg, #4A0072, #6B1FA2)' }} />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
