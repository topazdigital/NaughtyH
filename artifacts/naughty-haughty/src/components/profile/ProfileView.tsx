import { useState, useRef, useEffect } from 'react'
import { getPhotoUrl, isOnline, genderLabel, timeAgo, htmlDecode } from '../../lib/utils'
import { Link, useLocation } from 'wouter'
import { Heart, MessageCircle, BadgeCheck, Crown, MapPin, Edit3, Gift, Flag, ShieldOff, ChevronLeft, ChevronRight, X, Send, Video, Smile, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { INTERESTS } from '../settings/SettingsPage'
import { ScrollToTopButton } from '../ui/ScrollToTopButton'

interface Props {
  user: any; photos: any[]; isOwnProfile: boolean;
  myId: number; hasLiked: boolean; isMatch: boolean;
  myInterests?: string[];
}

function calcZodiac(birthday: string): string {
  if (!birthday) return ''
  const d = new Date(birthday)
  const month = d.getMonth() + 1
  const day = d.getDate()
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '♈ Aries'
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '♉ Taurus'
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return '♊ Gemini'
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return '♋ Cancer'
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '♌ Leo'
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '♍ Virgo'
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return '♎ Libra'
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return '♏ Scorpio'
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return '♐ Sagittarius'
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '♑ Capricorn'
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '♒ Aquarius'
  return '♓ Pisces'
}

function calcAge(birthday: string): number | null {
  if (!birthday) return null
  const d = new Date(birthday)
  const t = new Date()
  let age = t.getFullYear() - d.getFullYear()
  const m = t.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--
  return age
}

function calcCompatibility(myInterests: string[], theirInterests: string[]): number | null {
  if (!myInterests.length || !theirInterests.length) return null
  const shared = myInterests.filter(i => theirInterests.includes(i)).length
  const union = new Set([...myInterests, ...theirInterests]).size
  return Math.round((shared / union) * 100)
}

function lookingForLabel(val: any): string {
  const map: Record<string, string> = { '1': 'Men', '2': 'Women', '3': 'Everyone', 'm': 'Men', 'f': 'Women', 'both': 'Everyone' }
  return map[String(val)] || String(val || '')
}

const QUICK_MESSAGES = [
  "Hey! I came across your profile and I'd love to chat 😊",
  "Your profile really caught my eye! How are you?",
  "Hi there! You seem really interesting, let's talk!",
]

const REPORT_REASONS = [
  "Fake profile",
  "Inappropriate photos",
  "Harassment or abuse",
  "Spam or scam",
  "Underage user",
  "Other",
]

export default function ProfileView({ user, photos, isOwnProfile, myId, hasLiked, isMatch, myInterests = [] }: Props) {
  const [liked, setLiked] = useState(hasLiked)
  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [blocked, setBlocked] = useState(false)
  const [msgText, setMsgText] = useState('')
  const [sending, setSending] = useState(false)
  const [showQuick, setShowQuick] = useState(false)
  const [stories, setStories] = useState<any[]>([])
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [liveLastAccess, setLiveLastAccess] = useState(user.lastAccess)
  const [heroPhotoIdx, setHeroPhotoIdx] = useState(0)
  const msgRef = useRef<HTMLInputElement>(null)
  const [, setLocation] = useLocation()
  const { token } = useAuth()

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/users/${user.id}/stories`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setStories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
    fetch(`/api/users/${user.id}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.lastAccess) setLiveLastAccess(data.lastAccess) })
      .catch(() => {})
  }, [user?.id, token])

  const allPhotos = [
    ...(user.photo ? [{ id: 0, photo: user.photo, thumb: user.photoThumb }] : []),
    ...photos.filter((p: any) => p.photo !== user.photo),
  ]

  const userInterests: string[] = (() => {
    try { return JSON.parse(user.userExtended?.interests || '[]') } catch { return [] }
  })()
  const interestDetails = userInterests
    .map(id => INTERESTS.find(i => i.id === id))
    .filter(Boolean) as typeof INTERESTS

  const sharedInterestIds = myInterests.filter(i => userInterests.includes(i))
  const sharedInterestDetails = sharedInterestIds
    .map(id => INTERESTS.find(i => i.id === id))
    .filter(Boolean) as typeof INTERESTS

  const compatibility = !isOwnProfile ? calcCompatibility(myInterests, userInterests) : null
  const displayAge = user.birthday ? calcAge(user.birthday) ?? user.age : user.age
  const zodiac = user.birthday ? calcZodiac(user.birthday) : ''
  const heroPhoto = allPhotos[heroPhotoIdx] || allPhotos[0]

  async function toggleLike() {
    const prev = liked
    setLiked(!liked)
    try {
      await fetch('/api/likes', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ targetId: user.id }) })
      if (!prev) toast.success('💝 Liked!')
    } catch { setLiked(prev) }
  }

  async function blockUser() {
    if (!confirm(`Block ${user.name}? They won't be able to contact you.`)) return
    try {
      await fetch(`/api/block/${user.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      setBlocked(true)
      toast.success(`${user.name} has been blocked`)
    } catch { toast.error('Failed to block') }
  }

  async function submitReport() {
    if (!reportReason) { toast.error('Please select a reason'); return }
    try {
      await fetch(`/api/report/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: reportReason }),
      })
      toast.success('Report submitted. Thank you for keeping our community safe.')
      setShowReportModal(false)
      setReportReason('')
    } catch { toast.error('Failed to submit report') }
  }

  async function sendMessage(text?: string) {
    const message = (text || msgText).trim()
    if (!message) { msgRef.current?.focus(); return }
    setSending(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toUserId: user.id, message }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Message sent!')
        setLocation(`/chat/${user.id}`)
      } else if (data.error === 'Insufficient credits') {
        toast.error(`Not enough credits (need ${data.creditsNeeded})`)
        setLocation('/credits')
      } else if (data.error === 'premium_required') {
        toast.error('Upgrade to Premium to share contact info')
      } else {
        toast.error(data.error || 'Failed to send')
      }
    } catch { toast.error('Failed to send') }
    finally { setSending(false) }
  }

  function navPhoto(dir: 1 | -1) {
    setActivePhotoIdx(prev => prev === null ? 0 : (prev + dir + allPhotos.length) % allPhotos.length)
  }

  if (blocked) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <ShieldOff size={36} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name} has been blocked</h2>
          <p className="text-gray-500 mb-6">They can no longer contact you or view your profile.</p>
          <Link href="/discover" className="btn-primary">Browse Members</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#0d0d1a]">

      {/* ── Desktop: two-column sticky layout / Mobile: stacked ── */}
      <div className="lg:flex lg:h-[calc(100dvh-3.5rem)] lg:overflow-hidden">

        {/* ══ LEFT — Sticky hero photo ══ */}
        <div className="lg:w-[52%] lg:flex-shrink-0 lg:h-full lg:sticky lg:top-0 relative">
          <div className="relative h-[80vh] lg:h-full bg-gray-950 overflow-hidden">

            {/* Hero photo */}
            <img
              src={getPhotoUrl(heroPhoto?.photo || heroPhoto?.thumb || user.photo)}
              alt={user.name || 'Profile'}
              className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500"
            />

            {/* Multi-layer gradient for depth */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 25%, transparent 50%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,0.95) 100%)'
            }} />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to right, transparent 60%, rgba(13,13,26,0.85) 100%)'
            }} />

            {/* Top badges */}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
              <div className="flex flex-col gap-2">
                {user.premium === 1 && (
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-xl">
                    <Crown size={11} /> VIP Member
                  </div>
                )}
                {compatibility !== null && compatibility > 0 && (
                  <div className={`flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl backdrop-blur-sm ${compatibility >= 70 ? 'bg-emerald-500/90' : compatibility >= 40 ? 'bg-brand-500/90' : 'bg-white/20'}`}>
                    {compatibility}% Match
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {isOnline(liveLastAccess) && (
                  <div className="flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full shadow-xl font-semibold">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Online
                  </div>
                )}
                {isOwnProfile && (
                  <Link href="/settings" className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-all border border-white/20">
                    <Edit3 size={17} className="text-white" />
                  </Link>
                )}
              </div>
            </div>

            {/* Photo strip — only on mobile (desktop uses grid below) */}
            {allPhotos.length > 1 && (
              <div className="absolute bottom-32 left-4 flex gap-2 z-10 lg:hidden">
                {allPhotos.slice(0, 5).map((p, i) => (
                  <button
                    key={p.id || i}
                    onClick={() => setHeroPhotoIdx(i)}
                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${heroPhotoIdx === i ? 'border-white scale-110 shadow-lg' : 'border-white/30 opacity-70'}`}>
                    <img src={getPhotoUrl(p.thumb || p.photo)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {allPhotos.length > 5 && (
                  <div className="w-10 h-10 rounded-lg bg-black/40 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white text-xs font-bold">
                    +{allPhotos.length - 5}
                  </div>
                )}
              </div>
            )}

            {/* Bottom hero text */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <div className="flex items-end gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                  {user.name || (isOwnProfile ? 'Your Profile' : 'Member')}
                </h1>
                {user.verified === 1 && (
                  <BadgeCheck size={26} className="text-blue-400 drop-shadow mb-1 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-white/85 text-sm mb-1.5">
                {displayAge && displayAge > 0 && <span className="font-semibold text-base text-white">{displayAge}</span>}
                {zodiac && <span className="text-white/60 font-normal">{zodiac}</span>}
                {genderLabel(user.gender) && genderLabel(user.gender) !== 'Unknown' && (
                  <><span className="text-white/30">·</span><span className="text-white/75">{genderLabel(user.gender)}</span></>
                )}
                {user.city && (
                  <span className="flex items-center gap-1 text-white/70">
                    <span className="text-white/30">·</span><MapPin size={12} className="text-white/60" />{user.city}
                  </span>
                )}
              </div>
              {!isOnline(liveLastAccess) && liveLastAccess && Number(liveLastAccess) > 0 && (
                <p className="text-white/45 text-xs">Last seen {timeAgo(liveLastAccess)}</p>
              )}

              {/* Bio preview on mobile */}
              {user.bio && (
                <p className="text-white/60 text-sm leading-relaxed mt-2 line-clamp-2 lg:hidden">{htmlDecode(user.bio)}</p>
              )}
            </div>
          </div>
        </div>

        {/* ══ RIGHT — Scrollable info panel ══ */}
        <div className="lg:flex-1 lg:h-full lg:overflow-y-auto bg-[#0d0d1a] lg:bg-[#0d0d1a]">
          <div className="px-5 sm:px-8 py-6 pb-28 lg:pb-10 max-w-xl lg:max-w-none">

            {/* ── Desktop: Name + status (hidden on mobile, shown in photo) ── */}
            <div className="hidden lg:block mb-6">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-white tracking-tight">
                  {user.name || 'Member'}
                </h1>
                {user.verified === 1 && <BadgeCheck size={24} className="text-blue-400" />}
                {user.premium === 1 && (
                  <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                    <Crown size={10} /> VIP
                  </span>
                )}
              </div>
              <div className="flex items-center flex-wrap gap-2 text-white/60 text-sm">
                {displayAge && displayAge > 0 && <span className="text-white/80 font-medium">{displayAge} yrs</span>}
                {zodiac && <><span className="text-white/25">·</span><span>{zodiac}</span></>}
                {user.city && <><span className="text-white/25">·</span><span className="flex items-center gap-1"><MapPin size={11} />{user.city}</span></>}
                {isOnline(liveLastAccess) ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online now
                  </span>
                ) : liveLastAccess && Number(liveLastAccess) > 0 ? (
                  <span className="text-white/35 text-xs">· Last seen {timeAgo(liveLastAccess)}</span>
                ) : null}
              </div>

              {/* Compatibility bar */}
              {compatibility !== null && compatibility > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${compatibility >= 70 ? 'bg-emerald-400' : compatibility >= 40 ? 'bg-brand-400' : 'bg-white/30'}`}
                      style={{ width: `${compatibility}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${compatibility >= 70 ? 'text-emerald-400' : 'text-brand-400'}`}>{compatibility}% Match</span>
                </div>
              )}
            </div>

            {/* ── Desktop: Photo strip ── */}
            {allPhotos.length > 1 && (
              <div className="hidden lg:flex gap-2.5 mb-6 flex-wrap">
                {allPhotos.map((p, i) => (
                  <button
                    key={p.id || i}
                    onClick={() => setHeroPhotoIdx(i)}
                    className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${heroPhotoIdx === i ? 'border-brand-400 shadow-lg shadow-brand-500/30' : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'}`}>
                    <img src={getPhotoUrl(p.thumb || p.photo)} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
                <button
                  onClick={() => setActivePhotoIdx(0)}
                  className="w-16 h-20 rounded-xl border-2 border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 hover:border-white/30 transition-all text-xs font-semibold gap-1 flex-col">
                  <Camera size={16} />
                  <span>All</span>
                </button>
              </div>
            )}

            {/* ── Match banner ── */}
            {isMatch && !isOwnProfile && (
              <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl mb-4 text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, rgba(107,31,162,0.3), rgba(236,72,153,0.2))', border: '1px solid rgba(107,31,162,0.4)' }}>
                <Heart size={16} className="text-pink-400 fill-pink-400 animate-pulse" />
                <span className="text-white">You matched with {user.name}! Start chatting 💬</span>
              </div>
            )}

            {/* ── Actions for OTHER user ── */}
            {!isOwnProfile && (
              <div className="space-y-3 mb-6">
                {/* Primary actions */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setLocation(`/chat/${user.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 8px 24px rgba(16,185,129,0.35)' }}>
                    <MessageCircle size={17} /> Chat Now
                  </button>
                  <button
                    onClick={toggleLike}
                    className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-xl hover:-translate-y-0.5 ${liked
                      ? 'text-white shadow-brand-500/40'
                      : 'text-white/80 border border-white/15 hover:border-brand-400/60'
                    }`}
                    style={liked ? { background: 'linear-gradient(135deg, #6B1FA2, #9340d6)', boxShadow: '0 8px 24px rgba(107,31,162,0.4)' } : { background: 'rgba(255,255,255,0.05)' }}>
                    <Heart size={17} className={liked ? 'fill-white' : ''} />
                    {liked ? 'Liked ✓' : 'Like'}
                  </button>
                  <Link
                    href={`/gifts?toId=${user.id}`}
                    className="flex items-center justify-center px-4 py-3.5 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5 text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-400/60"
                    style={{ background: 'rgba(251,191,36,0.08)' }}
                    title="Send a gift">
                    <Gift size={17} />
                  </Link>
                </div>

                {/* Message input */}
                <div className="relative">
                  <div className="flex items-center gap-2 rounded-2xl px-4 py-3 border border-white/10 focus-within:border-brand-500/50 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <input
                      ref={msgRef}
                      type="text"
                      value={msgText}
                      onChange={e => setMsgText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage()}
                      placeholder={`Send ${user.name?.split(' ')[0] || 'a'} a message…`}
                      className="flex-1 text-sm bg-transparent outline-none text-white placeholder-white/35 min-w-0"
                    />
                    <button type="button" onClick={() => setShowQuick(p => !p)}
                      className="text-white/30 hover:text-brand-400 transition-colors flex-shrink-0">
                      <Smile size={17} />
                    </button>
                    <button type="button" onClick={() => sendMessage()} disabled={sending}
                      className="rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1 flex-shrink-0 disabled:opacity-60 text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #4A0072, #6B1FA2)' }}>
                      <Send size={13} /> {sending ? '…' : 'Send'}
                    </button>
                  </div>
                  {showQuick && (
                    <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl overflow-hidden z-20 border border-white/10"
                      style={{ background: '#1a1a2e' }}>
                      {QUICK_MESSAGES.map((q, i) => (
                        <button key={i} onClick={() => { setMsgText(q); setShowQuick(false); msgRef.current?.focus() }}
                          className="w-full text-left text-sm px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors">
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Shared interests */}
                {sharedInterestDetails.length > 0 && (
                  <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 border border-emerald-500/25"
                    style={{ background: 'rgba(16,185,129,0.08)' }}>
                    <span className="text-emerald-400 font-semibold text-xs uppercase tracking-wide flex-shrink-0">You both love</span>
                    <div className="flex flex-wrap gap-1">
                      {sharedInterestDetails.slice(0, 4).map(i => (
                        <span key={i.id} className="text-xs px-2.5 py-1 rounded-full text-white font-medium" style={{ background: i.color }}>
                          {i.emoji} {i.label}
                        </span>
                      ))}
                      {sharedInterestDetails.length > 4 && <span className="text-xs text-emerald-400 font-medium">+{sharedInterestDetails.length - 4}</span>}
                    </div>
                  </div>
                )}

                {/* Block / Report */}
                <div className="flex gap-1 pt-1">
                  <button onClick={blockUser}
                    className="flex items-center gap-1.5 text-xs text-white/25 hover:text-red-400 transition-colors px-3 py-2 rounded-xl hover:bg-red-500/10">
                    <ShieldOff size={12} /> Block
                  </button>
                  <button onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-1.5 text-xs text-white/25 hover:text-orange-400 transition-colors px-3 py-2 rounded-xl hover:bg-orange-500/10">
                    <Flag size={12} /> Report
                  </button>
                </div>
              </div>
            )}

            {/* ── OWN PROFILE actions ── */}
            {isOwnProfile && (
              <div className="mb-6 space-y-3">
                {(!user.name || !user.bio) && (
                  <div className="rounded-2xl p-4 flex items-center gap-3 border border-brand-500/30"
                    style={{ background: 'rgba(107,31,162,0.15)' }}>
                    <Edit3 size={18} className="text-brand-400 flex-shrink-0" />
                    <p className="text-white/70 text-sm flex-1">Complete your profile to get more matches</p>
                    <Link href="/settings"
                      className="text-white text-xs font-bold px-3.5 py-2 rounded-xl flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #4A0072, #6B1FA2)' }}>Edit</Link>
                  </div>
                )}
                <Link href="/settings"
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white/80 border border-white/10 hover:border-white/20 hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Edit3 size={16} /> Edit Profile
                </Link>
                <div className="pt-2 border-t border-white/5">
                  <Link href="/contact"
                    className="flex items-center gap-2 text-xs text-white/25 hover:text-brand-400 transition-colors py-1">
                    <MessageCircle size={12} /> Have an issue? Contact Us
                  </Link>
                </div>
              </div>
            )}

            {/* ── Bio ── */}
            {user.bio && (
              <div className="mb-5">
                <p className="text-white/55 text-xs font-semibold uppercase tracking-widest mb-2">About</p>
                <p className="text-white/75 text-sm leading-relaxed">{htmlDecode(user.bio)}</p>
              </div>
            )}

            {/* ── Interests ── */}
            {interestDetails.length > 0 && (
              <div className="mb-5">
                <p className="text-white/55 text-xs font-semibold uppercase tracking-widest mb-3">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {interestDetails.map(interest => {
                    const isShared = sharedInterestIds.includes(interest.id)
                    return (
                      <div key={interest.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-lg transition-transform hover:scale-105 ${isShared && !isOwnProfile ? 'ring-2 ring-white/40' : ''}`}
                        style={{ background: interest.color }}>
                        <span>{interest.emoji}</span>
                        <span>{interest.label}</span>
                        {isShared && !isOwnProfile && <span className="text-white/70 text-[10px]">✓</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── About / Extended info ── */}
            {user.userExtended && Object.values(user.userExtended).some((v: any) => v && v !== '' && v !== '[]') && (
              <div className="mb-5">
                <p className="text-white/55 text-xs font-semibold uppercase tracking-widest mb-3">Details</p>
                <div className="grid grid-cols-2 gap-2">
                  {zodiac && (
                    <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 border border-white/5"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <span className="text-lg leading-none">{zodiac.split(' ')[0]}</span>
                      <div>
                        <p className="text-[10px] text-white/35 leading-none mb-0.5">Zodiac</p>
                        <p className="text-xs font-semibold text-white/80">{zodiac.split(' ').slice(1).join(' ')}</p>
                      </div>
                    </div>
                  )}
                  {user.looking && (
                    <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 border border-white/5"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <span className="text-lg leading-none">💞</span>
                      <div>
                        <p className="text-[10px] text-white/35 leading-none mb-0.5">Looking for</p>
                        <p className="text-xs font-semibold text-white/80">{lookingForLabel(user.looking)}</p>
                      </div>
                    </div>
                  )}
                  {[
                    ['💼', 'Work', user.userExtended.occupation],
                    ['🎓', 'Education', user.userExtended.education],
                    ['📏', 'Height', user.userExtended.height],
                    ['💪', 'Body', user.userExtended.bodyType],
                    ['🌍', 'Ethnicity', user.userExtended.ethnicity],
                    ['🙏', 'Religion', user.userExtended.religion],
                    ['🚬', 'Smoking', user.userExtended.smoking],
                    ['🍷', 'Drinking', user.userExtended.drinking],
                    ['👶', 'Children', user.userExtended.children],
                    ['💬', 'Languages', user.userExtended.languages],
                  ].filter(([, , v]) => v && v !== '[]').map(([emoji, label, value]) => (
                    <div key={label as string} className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 border border-white/5"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <span className="text-lg leading-none">{emoji}</span>
                      <div className="min-w-0">
                        <p className="text-[10px] text-white/35 leading-none mb-0.5">{label}</p>
                        <p className="text-xs font-semibold text-white/80 truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {user.userExtended.selfDescription && (
                  <div className="mt-3 p-4 rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-white/55 text-sm leading-relaxed italic">"{user.userExtended.selfDescription}"</p>
                  </div>
                )}
                {user.userExtended.passions && (
                  <div className="mt-2">
                    <p className="text-[10px] text-white/35 uppercase tracking-widest mb-1.5">Passions</p>
                    <p className="text-white/65 text-sm leading-relaxed">{user.userExtended.passions}</p>
                  </div>
                )}
                {user.userExtended.idealDate && (
                  <div className="mt-3">
                    <p className="text-[10px] text-white/35 uppercase tracking-widest mb-1.5">Ideal date</p>
                    <p className="text-white/65 text-sm leading-relaxed">{user.userExtended.idealDate}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Photo grid ── */}
            {allPhotos.length > 1 && (
              <div className="mb-5">
                <p className="text-white/55 text-xs font-semibold uppercase tracking-widest mb-3">Photos ({allPhotos.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {allPhotos.map((p: any, i: number) => (
                    <button key={p.id || i} onClick={() => setActivePhotoIdx(i)}
                      className="aspect-[3/4] rounded-xl overflow-hidden hover:opacity-90 hover:scale-[1.02] transition-all border border-white/5">
                      <img src={getPhotoUrl(p.thumb || p.photo)} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Stories / Videos ── */}
            {stories.length > 0 && (
              <div className="mb-5">
                <p className="text-white/55 text-xs font-semibold uppercase tracking-widest mb-3">
                  Videos & Stories ({stories.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {stories.map((s: any) => {
                    const hasVideo = !!s.video
                    const thumb = s.photo ? getPhotoUrl(s.photo) : null
                    return (
                      <button key={s.id}
                        onClick={() => hasVideo ? setActiveVideo(getPhotoUrl(s.video)) : null}
                        className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-800 border border-white/5 ${hasVideo ? 'cursor-pointer' : 'cursor-default'} hover:opacity-90 transition-opacity`}>
                        {thumb && <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />}
                        {!thumb && hasVideo && (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <Video size={24} className="text-white/40" />
                          </div>
                        )}
                        {hasVideo && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <Video size={18} className="text-white fill-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Video lightbox ── */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setActiveVideo(null)}>
          <button className="absolute top-4 right-4 w-11 h-11 bg-white/15 rounded-full flex items-center justify-center text-white hover:bg-white/25 z-10">
            <X size={20} />
          </button>
          <video src={activeVideo} controls autoPlay className="max-w-[92vw] max-h-[90vh] rounded-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* ── Photo lightbox ── */}
      {activePhotoIdx !== null && allPhotos[activePhotoIdx] && (
        <div className="fixed inset-0 z-50 bg-black/97 flex items-center justify-center" onClick={() => setActivePhotoIdx(null)}>
          <button className="absolute top-4 right-4 w-11 h-11 bg-white/15 rounded-full flex items-center justify-center text-white hover:bg-white/25 z-10">
            <X size={20} />
          </button>
          {allPhotos.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/15 rounded-full flex items-center justify-center text-white hover:bg-white/25 z-10"
                onClick={e => { e.stopPropagation(); navPhoto(-1) }}>
                <ChevronLeft size={22} />
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/15 rounded-full flex items-center justify-center text-white hover:bg-white/25 z-10"
                onClick={e => { e.stopPropagation(); navPhoto(1) }}>
                <ChevronRight size={22} />
              </button>
            </>
          )}
          <img
            src={getPhotoUrl(allPhotos[activePhotoIdx].photo)}
            alt=""
            className="max-w-[92vw] max-h-[90vh] object-contain rounded-2xl"
            onClick={e => e.stopPropagation()}
          />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/60 text-white/70 text-sm px-4 py-1.5 rounded-full backdrop-blur-sm">
            {activePhotoIdx + 1} / {allPhotos.length}
          </div>
        </div>
      )}

      {/* ── Report Modal ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setShowReportModal(false)}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-white/10" style={{ background: '#1a1a2e' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Flag size={16} className="text-orange-400" /> Report {user.name}
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-white/40 hover:text-white/70">
                <X size={18} />
              </button>
            </div>
            <p className="text-white/50 text-sm mb-4">Why are you reporting this profile?</p>
            <div className="space-y-2 mb-5">
              {REPORT_REASONS.map(reason => (
                <button key={reason} onClick={() => setReportReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm border-2 transition-all font-medium ${reportReason === reason ? 'border-brand-500 bg-brand-500/20 text-brand-300' : 'border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'}`}>
                  {reason}
                </button>
              ))}
            </div>
            <button onClick={submitReport} disabled={!reportReason}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
              Submit Report
            </button>
          </div>
        </div>
      )}

      <ScrollToTopButton />
    </div>
  )
}
