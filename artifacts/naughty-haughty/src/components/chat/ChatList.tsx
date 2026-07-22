import { getPhotoUrl, isOnline, timeAgo, truncate } from '../../lib/utils'
import { Link } from 'wouter'
import { BadgeCheck, Crown, MessageCircle, Search } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useWSEvent } from '../../hooks/useWebSocket'

interface Props { userId: number; conversations: any[] }

export default function ChatList({ userId, conversations: initial }: Props) {
  const [convos] = useState(initial)
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set())
  const typingTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  // WSHandler signature requires (msg: WSMessage) where WSMessage = { type: string; [key: string]: any }
  useWSEvent('typing', (msg) => {
    const fromId = msg.fromUserId as number
    if (!fromId || fromId === userId) return
    if (msg.typing) {
      setTypingUsers(prev => new Set(prev).add(fromId))
      const existing = typingTimers.current.get(fromId)
      if (existing) clearTimeout(existing)
      const timer = setTimeout(() => {
        setTypingUsers(prev => { const s = new Set(prev); s.delete(fromId); return s })
        typingTimers.current.delete(fromId)
      }, 5000)
      typingTimers.current.set(fromId, timer)
    } else {
      const existing = typingTimers.current.get(fromId)
      if (existing) clearTimeout(existing)
      typingTimers.current.delete(fromId)
      setTypingUsers(prev => { const s = new Set(prev); s.delete(fromId); return s })
    }
  })

  useEffect(() => () => { typingTimers.current.forEach(t => clearTimeout(t)) }, [])

  return (
    <div className="w-full min-h-screen" style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #111827 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Messages</h1>
            {convos.length > 0 && (
              <p className="text-white/40 text-sm mt-0.5">{convos.length} conversation{convos.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <Link href="/discover"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all text-white"
            style={{ background: 'linear-gradient(135deg, #4A0072, #6B1FA2)' }}>
            <Search size={14} /> New Chat
          </Link>
        </div>

        {convos.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(107,31,162,0.2)', border: '1px solid rgba(107,31,162,0.3)' }}>
              <MessageCircle size={36} className="text-brand-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No conversations yet</h2>
            <p className="text-white/40 text-sm mb-6">Start by discovering new people near you</p>
            <Link href="/discover"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm shadow-xl"
              style={{ background: 'linear-gradient(135deg, #4A0072, #6B1FA2)', boxShadow: '0 8px 24px rgba(107,31,162,0.35)' }}>
              Browse Members
            </Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            {convos.map((c: any) => {
              const isTyping = typingUsers.has(c.otherId)
              const online = isOnline(c.lastAccess)
              const unread = c.unread > 0
              return (
                <Link key={c.otherId} href={`/chat/${c.otherId}`}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group hover:-translate-y-0.5"
                  style={{
                    background: unread ? 'rgba(107,31,162,0.15)' : 'rgba(255,255,255,0.04)',
                    border: unread ? '1px solid rgba(107,31,162,0.35)' : '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = unread ? 'rgba(107,31,162,0.22)' : 'rgba(255,255,255,0.07)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = unread ? 'rgba(107,31,162,0.15)' : 'rgba(255,255,255,0.04)'}>
                  {/* Avatar — API returns flat fields: c.photoThumb, c.photo, c.lastAccess */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-13 h-13 rounded-2xl overflow-hidden ring-2 ${online ? 'ring-emerald-400' : 'ring-white/10'}`}
                      style={{ width: '3.25rem', height: '3.25rem' }}>
                      <img
                        src={getPhotoUrl(c.photoThumb || c.photo)}
                        alt={c.name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.svg' }}
                      />
                    </div>
                    {online && (
                      <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 border-2 rounded-full"
                        style={{ borderColor: '#111827' }} />
                    )}
                  </div>

                  {/* Content — API flat fields: c.name, c.verified, c.premium, c.lastMsg */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`font-bold text-sm truncate ${unread ? 'text-white' : 'text-white/80'}`}>
                        {c.name || 'Unknown'}
                      </span>
                      {c.verified === 1 && <BadgeCheck size={13} className="text-blue-400 flex-shrink-0" />}
                      {c.premium === 1 && <Crown size={12} className="text-amber-400 flex-shrink-0" />}
                    </div>
                    <p className={`text-xs truncate leading-snug ${unread ? 'text-white/70 font-medium' : 'text-white/35'}`}>
                      {isTyping ? (
                        <span className="text-brand-400 font-semibold">typing…</span>
                      ) : (
                        truncate(c.lastMsg || 'Say hello!', 46)
                      )}
                    </p>
                  </div>

                  {/* Right meta */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {c.lastTime && (
                      <span className="text-[10px] text-white/30">{timeAgo(c.lastTime)}</span>
                    )}
                    {unread && (
                      <span className="flex items-center justify-center min-w-[1.25rem] h-5 rounded-full text-[10px] font-bold text-white px-1.5"
                        style={{ background: 'linear-gradient(135deg, #4A0072, #6B1FA2)' }}>
                        {c.unread > 9 ? '9+' : c.unread}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
