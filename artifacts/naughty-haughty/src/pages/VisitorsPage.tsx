import { useState, useEffect } from "react"
import { useLocation, Link } from "wouter"
import { authFetch } from "../lib/auth"
import { getPhotoUrl, timeAgo, profileUrl, isOnline } from "../lib/utils"
import { Eye, Crown, Lock, BadgeCheck } from "lucide-react"
import { useAuth } from "../hooks/useAuth"

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [, setLocation] = useLocation()
  const { user } = useAuth()
  const isPremium = user?.premium === 1

  useEffect(() => {
    authFetch("/api/visits").then(r => r.json()).then(d => { setVisitors(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="w-full min-h-screen" style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #111827 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(107,31,162,0.2)', border: '1px solid rgba(107,31,162,0.3)' }}>
              <Eye size={20} className="text-brand-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Profile Visitors</h1>
              <p className="text-white/40 text-xs mt-0.5">{visitors.length} people viewed your profile</p>
            </div>
          </div>
          {isPremium && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-amber-300"
              style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)' }}>
              <Crown size={12} /> VIP Access
            </div>
          )}
        </div>

        {/* Premium gate */}
        {!isPremium && visitors.length > 0 && (
          <div className="rounded-3xl p-6 mb-6 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(217,119,6,0.08))', border: '1px solid rgba(251,191,36,0.25)' }}>
            <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(251,191,36,0.2)' }}>
              <Lock size={28} className="text-amber-400" />
            </div>
            <div className="font-black text-white text-lg mb-2">See Who Viewed You</div>
            <p className="text-white/50 text-sm mb-5 leading-relaxed max-w-xs mx-auto">
              {visitors.length} people visited your profile. Upgrade to VIP to see exactly who they are.
            </p>
            <button onClick={() => setLocation("/premium")}
              className="inline-flex items-center gap-2 py-3 px-7 rounded-2xl font-bold text-white text-sm shadow-xl"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 24px rgba(217,119,6,0.35)' }}>
              <Crown size={15} /> Upgrade to VIP
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-white/5" />
                <div className="p-2 space-y-1.5">
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                  <div className="h-2.5 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : visitors.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Eye size={36} className="text-white/25" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No visitors yet</h2>
            <p className="text-white/40 text-sm mb-6 leading-relaxed max-w-xs mx-auto">
              Boost your profile or add a great photo to attract more visitors
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => setLocation("/boost")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
                ⚡ Boost Profile
              </button>
              <button onClick={() => setLocation("/discover")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white/70 text-sm border border-white/10 hover:border-white/20 transition-colors">
                Browse Members
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {visitors.map((v: any) => {
              const online = isOnline(v.lastAccess)
              return (
                <div key={v.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-2xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onClick={() => setLocation(profileUrl(v))}>
                  {/* Photo */}
                  <div className="relative aspect-[3/4] bg-gray-900">
                    {isPremium ? (
                      <>
                        <img
                          src={getPhotoUrl(v.photoThumb || v.photo)}
                          alt={v.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.svg' }}
                        />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }} />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                        <Lock size={24} className="text-white/20" />
                      </div>
                    )}

                    {/* Online badge */}
                    {online && isPremium && (
                      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
                        style={{ borderColor: '#1a1a1a' }} />
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {v.premium === 1 && isPremium && (
                        <span className="flex items-center gap-0.5 bg-amber-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          <Crown size={8} /> VIP
                        </span>
                      )}
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
                      {isPremium ? (
                        <>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-white text-sm font-bold truncate">{v.name}</span>
                            {v.verified === 1 && <BadgeCheck size={11} className="text-blue-300 flex-shrink-0" />}
                          </div>
                          <div className="text-white/60 text-[11px]">
                            {v.age && <span>{v.age}y</span>}
                            {v.city && <><span className="mx-1">·</span><span className="truncate">{v.city}</span></>}
                          </div>
                          {v.visitTime && (
                            <div className="text-white/35 text-[10px] mt-0.5">{timeAgo(v.visitTime)} ago</div>
                          )}
                        </>
                      ) : (
                        <div className="text-white/30 text-[11px] font-semibold text-center">🔒 Hidden</div>
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
