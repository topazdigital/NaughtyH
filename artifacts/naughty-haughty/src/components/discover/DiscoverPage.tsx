import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'wouter'
import { getPhotoUrl, isOnline, profileUrl } from '../../lib/utils'
import { Heart, MessageCircle, Search, SlidersHorizontal, BadgeCheck, Crown, MapPin, X, Loader2, Zap, Percent, ChevronUp, Flame } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import AdsterraNativeBanner from '../ui/AdsterraNativeBanner'
import { useWSEvent } from '../../hooks/useWebSocket'
import LocationAutocomplete from '../ui/LocationAutocomplete'
import { authFetch } from '../../lib/auth'

interface Props {
  userId: number;
  myCity?: string;
  myCountry?: string;
  myInterests?: string[];
  myLooking?: number;
}

function calcCompatibility(myInterests: string[], theirInterests: string[]): number {
  if (!myInterests.length || !theirInterests.length) return 0
  const their = (() => { try { return JSON.parse(theirInterests as any) } catch { return theirInterests } })()
  const shared = myInterests.filter(i => their.includes(i)).length
  const union = new Set([...myInterests, ...their]).size
  return union === 0 ? 0 : Math.round((shared / union) * 100)
}

// Cycle through varied aspect ratios for masonry feel
const RATIOS = ['2/3', '3/4', '4/5', '3/4', '2/3', '1/1', '3/4', '4/5']

export default function DiscoverPage({ userId, myCity, myCountry, myInterests = [], myLooking }: Props) {
  const [, setLocation] = useLocation()
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterGender, setFilterGender] = useState('0')
  const [genderInitialized, setGenderInitialized] = useState(false)

  useEffect(() => {
    if (!genderInitialized && myLooking) {
      setFilterGender(String(myLooking))
      setGenderInitialized(true)
    }
  }, [myLooking, genderInitialized])

  const [filterCity, setFilterCity] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [filterAgeMin, setFilterAgeMin] = useState(18)
  const [filterAgeMax, setFilterAgeMax] = useState(99)
  const [filterOnline, setFilterOnline] = useState(false)
  const [filterPremium, setFilterPremium] = useState(false)
  const [filterCompatible, setFilterCompatible] = useState(false)
  const [filterMutual, setFilterMutual] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [likedUsers, setLikedUsers] = useState<Set<number>>(new Set())
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set())
  const [showScrollTop, setShowScrollTop] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useWSEvent('user_online', (msg) => {
    setOnlineUserIds(prev => {
      const next = new Set(prev)
      if (msg.online) next.add(msg.userId as number)
      else next.delete(msg.userId as number)
      return next
    })
  })

  function fetchUsers() {
    setLoading(true)
    const params = new URLSearchParams({
      q: search,
      city: filterCity,
      country: filterCountry,
      ageMin: String(filterAgeMin),
      ageMax: String(filterAgeMax),
      gender: filterGender,
      online: filterOnline ? '1' : '0',
      mutual: filterMutual ? '1' : '0',
    })
    authFetch(`/api/users/search?${params}`)
      .then(r => r.json())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [filterGender, filterCity, filterCountry, filterAgeMin, filterAgeMax, filterOnline, filterPremium, filterMutual])
  useEffect(() => { const t = setTimeout(fetchUsers, 400); return () => clearTimeout(t) }, [search])

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (filterPremium && u.premium !== 1) return false
      if (filterCompatible && myInterests.length > 0) {
        const their: string[] = (() => { try { return JSON.parse(u.userExtended?.interests || '[]') } catch { return [] } })()
        if (calcCompatibility(myInterests, their) < 20) return false
      }
      return true
    }).map(u => {
      const their: string[] = (() => { try { return JSON.parse(u.userExtended?.interests || '[]') } catch { return [] } })()
      return { ...u, _compat: myInterests.length > 0 ? calcCompatibility(myInterests, their) : 0 }
    }).sort((a, b) => {
      if (a.isBoosted && !b.isBoosted) return -1
      if (!a.isBoosted && b.isBoosted) return 1
      return b._compat - a._compat
    })
  }, [users, filterPremium, filterCompatible, myInterests])

  const hasActiveFilters = filterGender !== '0' || filterCity || filterCountry || filterAgeMin > 18 || filterAgeMax < 99 || filterOnline || filterPremium || filterCompatible || filterMutual
  const boostedCount = filtered.filter(u => u.isBoosted).length
  const nearbyCount = filtered.filter(u => u.city === myCity || u.country === myCountry).length

  async function likeUser(targetId: number) {
    const isLiked = likedUsers.has(targetId)
    setLikedUsers(prev => { const s = new Set(prev); isLiked ? s.delete(targetId) : s.add(targetId); return s })
    try {
      await authFetch('/api/likes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetId }) })
      if (!isLiked) toast.success('Liked! 💝', { icon: '❤️' })
    } catch { }
  }

  function clearFilters() {
    setFilterGender(myLooking ? String(myLooking) : '0'); setFilterCity(''); setFilterCountry('')
    setFilterAgeMin(18); setFilterAgeMax(99); setFilterOnline(false); setFilterPremium(false); setFilterCompatible(false); setFilterMutual(false); setSearch('')
  }

  return (
    <div className="w-full min-h-screen" style={{ background: '#f8f7ff' }}>

      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-30 backdrop-blur-md border-b border-purple-100/60"
        style={{ background: 'rgba(248,247,255,0.92)' }}>
        <div className="px-3 sm:px-5 py-3">

          {/* Boost banner */}
          {boostedCount === 0 && (
            <Link href="/boost"
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl mb-3 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)' }}>
              <Flame size={15} className="text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm flex-1">Boost your profile — appear at the top for 10× more views</span>
              <span className="text-white/80 text-xs bg-white/20 px-2.5 py-1 rounded-lg font-semibold flex-shrink-0">Try it →</span>
            </Link>
          )}

          {/* Search row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, city…"
                className="w-full pl-9 pr-9 py-2.5 rounded-2xl text-sm outline-none border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all bg-white"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border text-sm font-medium transition-all flex-shrink-0 relative ${showFilters || hasActiveFilters
                ? 'border-purple-500 bg-purple-500 text-white shadow-md shadow-purple-200'
                : 'border-purple-200 bg-white text-purple-600 hover:border-purple-400'
                }`}>
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-pink-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">!</span>}
            </button>
          </div>

          {/* Filter pills */}
          {showFilters && (
            <div className="mt-3 p-4 rounded-2xl border border-purple-100 bg-white shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-[10px] font-bold text-purple-700 mb-1.5 block uppercase tracking-widest">Gender</label>
                  <select value={filterGender} onChange={e => setFilterGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 text-sm bg-white focus:outline-none focus:border-purple-400">
                    <option value="0">All Genders</option>
                    <option value="1">Men</option>
                    <option value="2">Women</option>
                    <option value="3">Non-binary</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-purple-700 mb-1.5 block uppercase tracking-widest">Location</label>
                  <LocationAutocomplete
                    value={filterCity}
                    onChange={(city, country) => { setFilterCity(city); setFilterCountry(country) }}
                    placeholder="Any city…"
                    className="py-2 text-sm"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-purple-700 mb-1.5 block uppercase tracking-widest">
                    Age: {filterAgeMin} – {filterAgeMax}
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    <input type="range" min={18} max={80} value={filterAgeMin} onChange={e => setFilterAgeMin(+e.target.value)} className="flex-1 accent-purple-600" />
                    <input type="range" min={18} max={80} value={filterAgeMax} onChange={e => setFilterAgeMax(+e.target.value)} className="flex-1 accent-purple-600" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-3 flex-wrap">
                  {[
                    { state: filterOnline, set: setFilterOnline, label: '🟢 Online now' },
                    { state: filterPremium, set: setFilterPremium, label: '👑 VIP only' },
                    { state: filterMutual, set: setFilterMutual, label: '🔁 Mutual' },
                    ...(myInterests.length > 0 ? [{ state: filterCompatible, set: setFilterCompatible, label: '💞 Compatible' }] : []),
                  ].map(({ state, set, label }) => (
                    <label key={label} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={state} onChange={e => set(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-purple-600" />
                      <span className="text-xs text-gray-600">{label}</span>
                    </label>
                  ))}
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-purple-600 font-semibold hover:text-purple-800 flex items-center gap-1">
                    <X size={12} /> Clear all
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Context pills */}
          {(nearbyCount > 0 || boostedCount > 0 || myInterests.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-2.5">
              {myCity && nearbyCount > 0 && !filterCity && (
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                  <MapPin size={10} /> {nearbyCount} near {myCity}
                </span>
              )}
              {boostedCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                  <Zap size={10} className="fill-orange-500" /> {boostedCount} boosted
                </span>
              )}
              {myInterests.length > 0 && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-pink-100 text-pink-700">
                  💞 Sorted by compatibility
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="px-1.5 sm:px-2.5 pt-3 pb-20">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center animate-spin"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
              <div className="w-10 h-10 rounded-full bg-purple-50" />
            </div>
            <span className="text-sm text-purple-400 font-medium">Finding members…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-6xl mb-5">✨</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No members found</h2>
            <p className="text-gray-400 text-sm mb-5">Try adjusting your filters</p>
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg shadow-purple-200 transition-transform hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Pinterest masonry grid */}
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-1.5 sm:gap-2">
              {filtered.flatMap((u: any, idx: number) => {
                const isBoosted = !!u.isBoosted
                const compat = u._compat as number
                const showCompat = compat > 0 && u.id !== userId
                const isOnlineNow = onlineUserIds.has(u.id) || isOnline(u.lastAccess)
                const isNearby = u.city === myCity || u.country === myCountry
                const ratio = RATIOS[idx % RATIOS.length]
                const isLiked = likedUsers.has(u.id)

                const card = (
                  <div key={u.id}
                    className="break-inside-avoid mb-1.5 sm:mb-2 group relative rounded-2xl overflow-hidden cursor-pointer bg-purple-100"
                    style={{
                      aspectRatio: ratio,
                      boxShadow: isBoosted
                        ? '0 0 0 2.5px #f97316, 0 4px 20px rgba(249,115,22,0.25)'
                        : '0 2px 12px rgba(109,40,162,0.08)'
                    }}
                    onClick={e => { if (!(e.target as Element).closest('button,a')) setLocation(profileUrl(u)) }}>

                    {/* Photo */}
                    <img
                      src={getPhotoUrl(u.photo || u.photoThumb)}
                      alt={u.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/default-avatar.svg' }}
                    />

                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    {/* Top vignette for badge visibility */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" style={{ height: '40%' }} />

                    {/* Top-left badge */}
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                      {isBoosted && (
                        <span className="flex items-center gap-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                          <Zap size={8} className="fill-white" /> BOOST
                        </span>
                      )}
                      {!isBoosted && showCompat && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full text-white shadow ${compat >= 70 ? 'bg-green-500' : compat >= 40 ? 'bg-purple-500' : 'bg-gray-500'}`}>
                          {compat}%
                        </span>
                      )}
                      {!isBoosted && !showCompat && isNearby && !filterCity && (
                        <span className="flex items-center gap-0.5 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                          <MapPin size={8} /> Near
                        </span>
                      )}
                    </div>

                    {/* Top-right: online / crown */}
                    <div className="absolute top-2 right-2 z-10">
                      {isOnlineNow && (
                        <span className="flex items-center gap-1 bg-green-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                          <span className="w-1.5 h-1.5 bg-white rounded-full" /> Live
                        </span>
                      )}
                      {!isOnlineNow && u.premium === 1 && (
                        <span className="flex items-center gap-0.5 bg-amber-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                          <Crown size={9} />
                        </span>
                      )}
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-white text-sm font-bold truncate leading-tight drop-shadow">{u.name}</span>
                        {u.verified === 1 && <BadgeCheck size={12} className="text-blue-300 flex-shrink-0" />}
                      </div>
                      <div className="text-white/75 text-[11px] flex items-center gap-1 truncate">
                        <span>{u.age}y</span>
                        {u.city && <><span>·</span><span className="truncate">{u.city}</span></>}
                      </div>
                    </div>

                    {/* Hover action bar — slides up from bottom */}
                    <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                      <div className="p-2 pt-6 bg-gradient-to-t from-black/80 to-transparent flex gap-1.5">
                        <button
                          onClick={e => { e.stopPropagation(); likeUser(u.id) }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${isLiked
                            ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/40'
                            : 'bg-white/95 text-pink-500 hover:bg-pink-500 hover:text-white'
                            }`}>
                          <Heart size={13} className={isLiked ? 'fill-white' : ''} />
                          {isLiked ? 'Liked' : 'Like'}
                        </button>
                        <Link
                          href={`/chat/${u.id}`}
                          onClick={e => e.stopPropagation()}
                          className="flex items-center justify-center w-10 rounded-xl bg-white/95 hover:bg-purple-500 hover:text-white text-purple-500 transition-colors">
                          <MessageCircle size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )

                // Inject ad after first ~10 cards
                const adSlot = Math.min(9, filtered.length - 1)
                if (idx === adSlot) {
                  return [card, (
                    <div key={`ad-${idx}`} className="break-inside-avoid mb-2 rounded-2xl overflow-hidden">
                      <AdsterraNativeBanner />
                    </div>
                  )]
                }
                return [card]
              })}
            </div>

            <p className="text-center text-xs text-purple-300 font-medium mt-6">
              {filtered.length} member{filtered.length !== 1 ? 's' : ''} shown
            </p>
          </>
        )}
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-40 w-11 h-11 rounded-full flex items-center justify-center text-white shadow-xl shadow-purple-300/50 transition-all hover:scale-110"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          aria-label="Scroll to top">
          <ChevronUp size={18} />
        </button>
      )}
    </div>
  )
}
