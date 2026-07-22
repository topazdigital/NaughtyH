import { useState, useEffect } from 'react'
import { Link, useLocation } from 'wouter'
import { getPhotoUrl, timeAgo, isOnline, profileUrl } from '../lib/utils'
import { Heart, Star, MessageCircle, BadgeCheck, Crown, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

const TABS = ['Matches', 'Liked Me', 'I Liked']

export default function LikesPage() {
  const [tab, setTab] = useState('Matches')
  const [data, setData] = useState<{ likedMe: any[]; iLiked: any[]; matches: any[] }>({ likedMe: [], iLiked: [], matches: [] })
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()
  const [, setLocation] = useLocation()

  useEffect(() => {
    if (!token) return
    fetch('/api/likes', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d && !d.error) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const list = tab === 'Matches' ? data.matches : tab === 'Liked Me' ? data.likedMe : data.iLiked

  const tabCounts = {
    Matches: data.matches.length,
    'Liked Me': data.likedMe.length,
    'I Liked': data.iLiked.length,
  }

  const tabIcons = {
    Matches: <Heart size={14} />,
    'Liked Me': <Star size={14} />,
    'I Liked': <Heart size={14} />,
  }

  async function superLike(targetId: number) {
    try {
      await fetch('/api/likes/super', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ targetId }) })
      toast.success('⭐ Super liked!')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="w-full min-h-screen" style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #111827 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(236,72,153,0.2)', border: '1px solid rgba(236,72,153,0.3)' }}>
              <Heart size={20} className="text-pink-400 fill-pink-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Likes & Matches</h1>
              <p className="text-white/40 text-xs mt-0.5">
                {data.matches.length} match{data.matches.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={tab === t
                ? { background: 'linear-gradient(135deg, #4A0072, #6B1FA2)', color: '#fff', boxShadow: '0 4px 12px rgba(107,31,162,0.35)' }
                : { background: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
              {tabIcons[t as keyof typeof tabIcons]}
              {t}
              {tabCounts[t as keyof typeof tabCounts] > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'}`}>
                  {tabCounts[t as keyof typeof tabCounts]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-white/5" />
                <div className="p-3 space-y-1.5">
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                  <div className="h-2.5 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)' }}>
              {tab === 'Matches' ? <Users size={36} className="text-pink-400/60" /> : <Heart size={36} className="text-pink-400/60" />}
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {tab === 'Matches' ? 'No matches yet' : tab === 'Liked Me' ? 'Nobody liked you yet' : "You haven't liked anyone yet"}
            </h2>
            <p className="text-white/40 text-sm mb-6 max-w-xs mx-auto">
              {tab === 'Matches' ? 'Keep liking people — when they like you back, it\'s a match!' : 'Discover and like people to get likes back!'}
            </p>
            <button onClick={() => setLocation('/discover')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #4A0072, #6B1FA2)', boxShadow: '0 8px 24px rgba(107,31,162,0.35)' }}>
              Discover Members
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {list.map((u: any) => {
              const online = isOnline(u.lastAccess)
              return (
                <div key={u.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onClick={() => setLocation(profileUrl(u))}>
                  {/* Photo */}
                  <div className="relative aspect-[3/4] bg-gray-900">
                    <img
                      src={getPhotoUrl(u.photoThumb || u.photo)}
                      alt={u.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.svg' }}
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 50%)' }} />

                    {/* Top badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
                      <div className="flex flex-col gap-1">
                        {u.premium === 1 && (
                          <span className="flex items-center gap-0.5 bg-amber-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                            <Crown size={8} />
                          </span>
                        )}
                      </div>
                      {online && (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2" style={{ borderColor: '#1a1a1a' }} />
                      )}
                    </div>

                    {/* Match ribbon */}
                    {tab === 'Matches' && (
                      <div className="absolute top-0 right-0 bg-gradient-to-bl from-pink-500 to-transparent w-16 h-16 flex items-start justify-end p-1.5">
                        <Heart size={14} className="text-white fill-white drop-shadow" />
                      </div>
                    )}

                    {/* Hover actions */}
                    <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex gap-1.5 p-2 pt-6" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                        <button
                          onClick={e => { e.stopPropagation(); setLocation(`/chat/${u.id}`) }}
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                          <MessageCircle size={12} /> Chat
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); superLike(u.id) }}
                          className="w-9 flex items-center justify-center rounded-xl"
                          style={{ background: 'rgba(59,130,246,0.8)' }}>
                          <Star size={13} className="text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-white text-sm font-bold truncate leading-tight">{u.name}</span>
                        {u.verified === 1 && <BadgeCheck size={11} className="text-blue-300 flex-shrink-0" />}
                      </div>
                      <div className="text-white/60 text-[11px]">
                        {u.age && <span>{u.age}y</span>}
                        {u.city && <><span className="mx-1">·</span><span className="truncate">{u.city}</span></>}
                      </div>
                      {u.likedAt && (
                        <p className="text-white/30 text-[10px] mt-0.5">{timeAgo(u.likedAt)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
