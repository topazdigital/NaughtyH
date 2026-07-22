import { useState, useEffect } from "react"
import { useLocation, Link } from "wouter"
import { authFetch } from "../lib/auth"
import { getPhotoUrl, profileUrl } from "../lib/utils"
import toast from "react-hot-toast"
import { useAuth } from "../hooks/useAuth"
import { ArrowLeft, Gift as GiftIcon, Heart } from "lucide-react"

interface Gift { id: number; name: string; emoji: string; credits: number }
interface ReceivedGift { gift: any; giftInfo: Gift; sender: any }

export default function GiftsPage() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [received, setReceived] = useState<ReceivedGift[]>([])
  const [targetUser, setTargetUser] = useState<any>(null)
  const params = new URLSearchParams(window.location.search)
  const urlToId = params.get('toId') || ''
  const [tab, setTab] = useState<"send" | "received">(urlToId ? "send" : "received")
  const [targetId, setTargetId] = useState(urlToId)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const { user, token } = useAuth()
  const [, setLocation] = useLocation()

  useEffect(() => {
    authFetch("/api/gifts").then(r => r.json()).then(d => { if (Array.isArray(d)) setGifts(d) }).catch(() => {})
    authFetch("/api/gifts/received").then(r => r.json()).then(d => { if (Array.isArray(d)) setReceived(d) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (urlToId && token) {
      fetch(`/api/users/${urlToId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => { if (data?.user) setTargetUser(data.user) })
        .catch(() => {})
    }
  }, [urlToId, token])

  const sendGift = async (gift: Gift) => {
    if (!targetId) { toast.error("Enter a user ID"); return }
    setSending(true)
    try {
      const r = await authFetch("/api/gifts/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toId: parseInt(targetId), giftId: gift.id, message })
      })
      const d = await r.json()
      if (d.error) { toast.error(d.error); return }
      toast.success(`${gift.emoji} ${gift.name} sent!`)
      setMessage("")
    } finally { setSending(false) }
  }

  return (
    <div className="w-full min-h-screen" style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #111827 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => history.back()}
            className="w-10 h-10 flex items-center justify-center rounded-2xl text-white/50 hover:text-white transition-colors flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
              style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)' }}>
              🎁
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Gifts</h1>
              <p className="text-white/35 text-xs">You have <span className="text-amber-400 font-bold">{user?.credits || 0}</span> credits</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {(["received", "send"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={tab === t
                ? { background: 'linear-gradient(135deg, #4A0072, #6B1FA2)', color: '#fff' }
                : { background: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
              {t === "received" ? `Received${received.length > 0 ? ` (${received.length})` : ""}` : "Send a Gift"}
            </button>
          ))}
        </div>

        {tab === "received" ? (
          <div className="space-y-3">
            {received.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-lg font-bold text-white mb-1">No gifts yet</h3>
                <p className="text-white/40 text-sm">Send someone a gift to spark a connection!</p>
              </div>
            )}
            {received.map((row, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-4xl">{row.giftInfo?.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm">{row.giftInfo?.name}</div>
                  <div className="text-sm text-white/45 mt-0.5">
                    from <span className="text-brand-400 font-semibold">{row.sender?.name}</span>
                  </div>
                  {row.gift?.message && (
                    <div className="text-sm text-white/60 mt-1.5 italic">"{row.gift.message}"</div>
                  )}
                </div>
                <Link href={profileUrl(row.sender)}
                  className="text-brand-400 hover:text-brand-300 text-sm font-semibold flex items-center gap-1 transition-colors">
                  View <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {targetUser ? (
              <div className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: 'rgba(107,31,162,0.15)', border: '1px solid rgba(107,31,162,0.3)' }}>
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={getPhotoUrl(targetUser.photoThumb || targetUser.photo)} alt={targetUser.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-white/50 text-xs">Sending gift to</p>
                  <p className="font-bold text-white text-base">{targetUser.name}</p>
                </div>
                <Link href={profileUrl(targetUser)} className="text-brand-400 text-sm font-semibold hover:text-brand-300 transition-colors">
                  View →
                </Link>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-white/50 mb-2">Send to (User ID)</label>
                <input type="number" value={targetId} onChange={e => setTargetId(e.target.value)}
                  placeholder="Enter user ID"
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none text-white placeholder-white/25 border border-white/10 focus:border-brand-500/60 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-white/50 mb-2">Personal message (optional)</label>
              <input value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Add a sweet message..."
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none text-white placeholder-white/25 border border-white/10 focus:border-brand-500/60 transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {gifts.map(g => (
                <button key={g.id} onClick={() => sendGift(g)} disabled={sending || (!targetId && !urlToId)}
                  className="p-5 rounded-2xl text-center transition-all disabled:opacity-40 hover:-translate-y-1 hover:shadow-2xl border"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => { if (!sending) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,31,162,0.5)' }}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'}>
                  <div className="text-4xl mb-2.5">{g.emoji}</div>
                  <div className="font-bold text-white text-sm mb-1">{g.name}</div>
                  <div className="text-brand-400 text-xs font-semibold">{g.credits} credits</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
