import { useState, useRef, useEffect } from 'react'
import { User, Camera, Lock, LogOut, Save, Loader2, X, Shield, Trash2, Bell, MapPin, BadgeCheck, Heart, CheckCircle2, Circle, ChevronRight } from 'lucide-react'
import { getPhotoUrl } from '../../lib/utils'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import LocationAutocomplete from '../ui/LocationAutocomplete'

interface Props { user: any }
const TABS = ['Profile', 'Interests', 'Verify', 'Photos', 'Password', 'Privacy']

// ── Interests catalogue ──────────────────────────────────────────────
export const INTERESTS = [
  { id: "travel", label: "Travel", emoji: "✈️", color: "#3b82f6" },
  { id: "photography", label: "Photography", emoji: "📸", color: "#8b5cf6" },
  { id: "cooking", label: "Cooking", emoji: "🍳", color: "#f59e0b" },
  { id: "fitness", label: "Fitness", emoji: "💪", color: "#ef4444" },
  { id: "reading", label: "Reading", emoji: "📚", color: "#10b981" },
  { id: "music", label: "Music", emoji: "🎵", color: "#6366f1" },
  { id: "dancing", label: "Dancing", emoji: "💃", color: "#ec4899" },
  { id: "art", label: "Art", emoji: "🎨", color: "#f97316" },
  { id: "yoga", label: "Yoga", emoji: "🧘", color: "#14b8a6" },
  { id: "hiking", label: "Hiking", emoji: "🥾", color: "#84cc16" },
  { id: "cycling", label: "Cycling", emoji: "🚴", color: "#06b6d4" },
  { id: "swimming", label: "Swimming", emoji: "🏊", color: "#0ea5e9" },
  { id: "gaming", label: "Gaming", emoji: "🎮", color: "#7c3aed" },
  { id: "movies", label: "Movies", emoji: "🎬", color: "#dc2626" },
  { id: "theater", label: "Theater", emoji: "🎭", color: "#b45309" },
  { id: "coffee", label: "Coffee", emoji: "☕", color: "#92400e" },
  { id: "wine_dining", label: "Wine & Dining", emoji: "🍷", color: "#7f1d1d" },
  { id: "fashion", label: "Fashion", emoji: "👗", color: "#db2777" },
  { id: "interior_design", label: "Interior Design", emoji: "🛋️", color: "#0891b2" },
  { id: "architecture", label: "Architecture", emoji: "🏛️", color: "#78716c" },
  { id: "business", label: "Business", emoji: "💼", color: "#1d4ed8" },
  { id: "investing", label: "Investing", emoji: "📈", color: "#15803d" },
  { id: "technology", label: "Technology", emoji: "💻", color: "#2563eb" },
  { id: "science", label: "Science", emoji: "🔬", color: "#0d9488" },
  { id: "history", label: "History", emoji: "🏺", color: "#b45309" },
  { id: "languages", label: "Languages", emoji: "🗣️", color: "#7c3aed" },
  { id: "meditation", label: "Meditation", emoji: "🧠", color: "#0369a1" },
  { id: "volunteering", label: "Volunteering", emoji: "🤝", color: "#047857" },
  { id: "pets", label: "Pets", emoji: "🐾", color: "#a16207" },
  { id: "dogs", label: "Dogs", emoji: "🐕", color: "#b45309" },
  { id: "cats", label: "Cats", emoji: "🐈", color: "#9333ea" },
  { id: "nature", label: "Nature", emoji: "🌿", color: "#16a34a" },
  { id: "camping", label: "Camping", emoji: "⛺", color: "#15803d" },
  { id: "sailing", label: "Sailing", emoji: "⛵", color: "#1e40af" },
  { id: "skiing", label: "Skiing", emoji: "⛷️", color: "#7dd3fc" },
  { id: "surfing", label: "Surfing", emoji: "🏄", color: "#0284c7" },
  { id: "golf", label: "Golf", emoji: "⛳", color: "#4d7c0f" },
  { id: "tennis", label: "Tennis", emoji: "🎾", color: "#ca8a04" },
  { id: "running", label: "Running", emoji: "🏃", color: "#dc2626" },
  { id: "pilates", label: "Pilates", emoji: "🤸", color: "#ec4899" },
  { id: "crossfit", label: "Crossfit", emoji: "🏋️", color: "#b91c1c" },
  { id: "nutrition", label: "Nutrition", emoji: "🥗", color: "#16a34a" },
  { id: "astrology", label: "Astrology", emoji: "⭐", color: "#7c3aed" },
  { id: "chess", label: "Chess", emoji: "♟️", color: "#374151" },
  { id: "poker", label: "Poker", emoji: "🃏", color: "#1f2937" },
  { id: "boardgames", label: "Board Games", emoji: "🎲", color: "#dc2626" },
  { id: "concerts", label: "Concerts", emoji: "🎤", color: "#9333ea" },
  { id: "podcasts", label: "Podcasts", emoji: "🎙️", color: "#6366f1" },
  { id: "gardening", label: "Gardening", emoji: "🌱", color: "#15803d" },
  { id: "diy", label: "DIY & Crafts", emoji: "🔧", color: "#78716c" },
  { id: "cars", label: "Cars", emoji: "🚗", color: "#1d4ed8" },
  { id: "motorsports", label: "Motorsports", emoji: "🏎️", color: "#dc2626" },
  { id: "football", label: "Football", emoji: "⚽", color: "#15803d" },
  { id: "basketball", label: "Basketball", emoji: "🏀", color: "#ea580c" },
  { id: "cricket", label: "Cricket", emoji: "🏏", color: "#65a30d" },
  { id: "rugby", label: "Rugby", emoji: "🏉", color: "#1e40af" },
  { id: "boxing", label: "Boxing", emoji: "🥊", color: "#dc2626" },
  { id: "martial_arts", label: "Martial Arts", emoji: "🥋", color: "#1f2937" },
  { id: "horse_riding", label: "Horse Riding", emoji: "🐴", color: "#b45309" },
  { id: "luxury_travel", label: "Luxury Travel", emoji: "🛩️", color: "#b45309" },
  { id: "nightlife", label: "Nightlife", emoji: "🌃", color: "#4c1d95" },
  { id: "brunch", label: "Brunch", emoji: "🥂", color: "#f59e0b" },
  { id: "wine_tasting", label: "Wine Tasting", emoji: "🍾", color: "#7f1d1d" },
  { id: "museums", label: "Museums", emoji: "🏛️", color: "#374151" },
  { id: "spirituality", label: "Spirituality", emoji: "🙏", color: "#7c3aed" },
  { id: "writing", label: "Writing", emoji: "✍️", color: "#1e40af" },
  { id: "comedy", label: "Comedy", emoji: "😂", color: "#ca8a04" },
  { id: "standup", label: "Stand-up Comedy", emoji: "🎤", color: "#f59e0b" },
  { id: "beach", label: "Beach Life", emoji: "🏖️", color: "#0ea5e9" },
  { id: "food", label: "Foodie", emoji: "🍜", color: "#ea580c" },
]

function InterestBadge({ interest, selected, onClick }: { interest: typeof INTERESTS[0]; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
      style={selected
        ? { background: interest.color, color: '#fff', transform: 'scale(1.05)', boxShadow: `0 4px 16px ${interest.color}55` }
        : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <span>{interest.emoji}</span>
      <span>{interest.label}</span>
    </button>
  )
}

// ── Verification tab ──────────────────────────────────────────────────
function VerificationTab({ token, initialUser }: { token: string | null; initialUser: any }) {
  const [challenge, setChallenge] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!token) return
    fetch('/api/verification/challenge', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setChallenge(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  async function submit() {
    if (!file || !token) return
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('photo', file)
      const res = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message)
        setChallenge((prev: any) => ({ ...prev, status: data.status, verified: data.verified }))
        setFile(null)
        setPreview(null)
      } else {
        toast.error(data.error || 'Submission failed')
      }
    } catch { toast.error('Submission failed') }
    finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="rounded-3xl p-8 flex justify-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Loader2 size={24} className="animate-spin text-brand-400" />
    </div>
  )

  const status = challenge?.status || 'none'
  const verified = challenge?.verified === 1

  return (
    <div className="rounded-3xl p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: verified ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${verified ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
          <BadgeCheck size={24} className={verified ? 'text-blue-400' : 'text-white/40'} />
        </div>
        <div>
          <h3 className="font-bold text-white">Identity Verification</h3>
          <p className="text-sm text-white/50">
            {verified ? 'Your account is verified ✓' : 'Get a blue tick to stand out and build trust'}
          </p>
        </div>
      </div>

      {/* Status badge */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium`}
        style={verified
          ? { background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' }
          : status === 'pending' ? { background: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' }
          : status === 'rejected' ? { background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }
          : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {verified ? '✅ Verified — your blue tick is active' :
         status === 'pending' ? '⏳ Under review — an admin will check your photo shortly' :
         status === 'rejected' ? `❌ Rejected${challenge?.note ? `: ${challenge.note}` : ''} — please try again` :
         '⚪ Not yet verified — follow the steps below'}
      </div>

      {!verified && (
        <>
          {/* Gesture challenge */}
          {challenge?.gesture && (
            <div className="rounded-xl p-4" style={{ background: 'rgba(107,31,162,0.2)', border: '1px solid rgba(107,31,162,0.35)' }}>
              <p className="text-xs font-semibold text-brand-400 uppercase tracking-wide mb-1">Your Challenge</p>
              {challenge?.gestureImage && (
                <div className="mb-3 flex justify-center">
                  <img src={challenge.gestureImage} alt="Gesture example" className="max-h-40 rounded-xl object-contain shadow-sm" style={{ border: '1px solid rgba(107,31,162,0.4)' }} />
                </div>
              )}
              <p className="text-white font-semibold text-lg">"{challenge.gesture}"</p>
              <p className="text-xs text-white/50 mt-1">Take a clear selfie performing this exact gesture</p>
            </div>
          )}

          {/* Photo upload */}
          {(status === 'none' || status === 'rejected') && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-white/70">Upload your verification selfie:</p>
              <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={pickFile} />

              {preview ? (
                <div className="relative inline-block">
                  <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded-2xl shadow-md" />
                  <button onClick={() => { setPreview(null); setFile(null) }}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-40 h-40 rounded-2xl flex flex-col items-center justify-center transition-all"
                  style={{ border: '2px dashed rgba(107,31,162,0.4)', color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,31,162,0.8)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,31,162,0.4)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)' }}>
                  <Camera size={28} className="mb-2" />
                  <span className="text-xs text-center">Tap to take selfie<br />or upload photo</span>
                </button>
              )}

              <button
                onClick={submit}
                disabled={!file || submitting}
                className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={16} />}
                Submit for Verification
              </button>
            </div>
          )}

          {status === 'pending' && (
            <div className="flex items-center gap-3 text-sm rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.25)' }}>
              <Loader2 size={18} className="animate-spin" />
              Your selfie is being reviewed. You'll get a notification when it's approved.
            </div>
          )}
        </>
      )}

      <div className="rounded-xl p-4 text-xs space-y-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <p className="font-semibold text-white/60">Tips for a successful verification:</p>
        <p className="text-white/40">• Good lighting — make sure your face is clearly visible</p>
        <p className="text-white/40">• Hold up a plain piece of paper or perform the exact gesture shown</p>
        <p className="text-white/40">• Don't wear sunglasses or cover your face</p>
        <p className="text-white/40">• Use the same photo as your profile photo for best results</p>
      </div>
    </div>
  )
}

// ── Profile Strength widget ───────────────────────────────────────────
interface StrengthItem {
  label: string
  done: boolean
  points: number
  tab: string
  hint: string
}

function ProfileStrength({
  form, photos, interests, verified, onTabChange,
}: {
  form: Record<string, string>
  photos: any[]
  interests: string[]
  verified: number
  onTabChange: (t: string) => void
}) {
  const items: StrengthItem[] = [
    { label: 'Profile photo', done: photos.length > 0, points: 20, tab: 'Photos', hint: 'Add your main photo' },
    { label: 'Write a bio', done: (form.bio || '').trim().length >= 30, points: 15, tab: 'Profile', hint: 'At least 30 characters' },
    { label: 'Add your location', done: !!(form.city || '').trim(), points: 10, tab: 'Profile', hint: 'City helps local matches' },
    { label: 'Set your birthday', done: !!(form.birthday || '').trim(), points: 10, tab: 'Profile', hint: 'Required for age display' },
    { label: 'Choose 3+ interests', done: interests.length >= 3, points: 15, tab: 'Interests', hint: 'Shows what you enjoy' },
    { label: 'Add occupation', done: !!(form.occupation || '').trim(), points: 10, tab: 'Profile', hint: 'Career attracts quality matches' },
    { label: 'Upload 2+ photos', done: photos.length >= 2, points: 10, tab: 'Photos', hint: 'More photos = more likes' },
    { label: 'Verify your identity', done: verified === 1, points: 10, tab: 'Verify', hint: 'Get the blue verified badge' },
  ]

  const score = items.filter(i => i.done).reduce((acc, i) => acc + i.points, 0)

  const barColor =
    score >= 90 ? '#16a34a' :
    score >= 70 ? '#2563eb' :
    score >= 40 ? '#d97706' : '#ef4444'

  const label =
    score >= 90 ? 'Excellent' :
    score >= 70 ? 'Strong' :
    score >= 40 ? 'Good' : 'Needs Work'

  return (
    <div className="rounded-3xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold text-white text-sm">Profile Strength</p>
          <p className="text-xs text-white/40 mt-0.5">
            {score === 100 ? 'Your profile is complete!' : `${100 - score} points left to reach 100%`}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black" style={{ color: barColor }}>{score}%</span>
          <p className="text-xs font-semibold mt-0.5" style={{ color: barColor }}>{label}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: barColor }}
        />
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {items.map(item => (
          <button
            key={item.label}
            type="button"
            onClick={() => !item.done && onTabChange(item.tab)}
            disabled={item.done}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all"
            style={item.done
              ? { background: 'rgba(255,255,255,0.03)', cursor: 'default' }
              : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
          >
            {item.done
              ? <CheckCircle2 size={15} className="text-green-400 flex-shrink-0" />
              : <Circle size={15} className="text-white/25 flex-shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate ${item.done ? 'text-white/30 line-through' : 'text-white/80'}`}>
                {item.label}
              </p>
              {!item.done && (
                <p className="text-[10px] text-white/40 truncate">{item.hint}</p>
              )}
            </div>
            {!item.done && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-[10px] font-bold text-brand-400">+{item.points}%</span>
                <ChevronRight size={12} className="text-white/25" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function SettingsPage({ user: initialUser }: Props) {
  const [tab, setTab] = useState('Profile')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: initialUser?.name || '',
    bio: initialUser?.bio?.replace(/<[^>]*>/g, '') || '',
    city: initialUser?.city || '',
    country: initialUser?.country || '',
    countryCode: initialUser?.countryCode || '',
    birthday: initialUser?.birthday || '',
    looking: String(initialUser?.looking || 1),
    occupation: initialUser?.userExtended?.occupation || '',
    education: initialUser?.userExtended?.education || '',
    height: initialUser?.userExtended?.height || '',
    bodyType: initialUser?.userExtended?.bodyType || '',
    ethnicity: initialUser?.userExtended?.ethnicity || '',
    religion: initialUser?.userExtended?.religion || '',
    smoking: initialUser?.userExtended?.smoking || '',
    drinking: initialUser?.userExtended?.drinking || '',
    children: initialUser?.userExtended?.children || '',
    relationship: initialUser?.userExtended?.relationship || '',
    languages: initialUser?.userExtended?.languages || '',
  })
  const [selectedInterests, setSelectedInterests] = useState<string[]>(() => {
    try { return JSON.parse(initialUser?.userExtended?.interests || '[]') } catch { return [] }
  })
  const [pass, setPass] = useState({ current: '', newPass: '', confirm: '' })
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState(initialUser?.photos || [])
  const { token, logout, refreshUser } = useAuth()

  function update(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }
  function toggleInterest(id: string) {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length >= 20 ? prev : [...prev, id]
    )
  }

  async function saveProfile() {
    setSaving(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) { toast.success('Profile saved!'); await refreshUser() }
      else {
        if (data.code === 'contact_info_in_bio' || data.code === 'contact_info_in_name') {
          toast.error(data.error || 'Contact info not allowed in profile', { duration: 6000 })
        } else {
          toast.error(data.error || 'Failed to save')
        }
      }
    } catch { toast.error('Error saving') }
    finally { setSaving(false) }
  }

  async function saveInterests() {
    setSaving(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, interests: JSON.stringify(selectedInterests) }),
      })
      if (res.ok) toast.success('Interests saved!')
      else toast.error('Failed to save')
    } catch { toast.error('Error saving') }
    finally { setSaving(false) }
  }

  async function changePassword() {
    if (pass.newPass !== pass.confirm) { toast.error('Passwords do not match'); return }
    if (pass.newPass.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(pass),
      })
      const data = await res.json()
      if (res.ok) { toast.success('Password changed!'); setPass({ current: '', newPass: '', confirm: '' }) }
      else toast.error(data.error || 'Failed')
    } catch { toast.error('Error') }
    finally { setSaving(false) }
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('photo', file)
    try {
      const res = await fetch('/api/photos/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (res.ok) { setPhotos((p: any[]) => [...p, data.photo]); toast.success('Photo uploaded!') }
      else toast.error(data.error || 'Upload failed')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  async function deletePhoto(photoId: number) {
    try {
      await fetch(`/api/photos/${photoId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      setPhotos((p: any[]) => p.filter((ph: any) => ph.id !== photoId))
      toast.success('Photo deleted')
    } catch { toast.error('Failed to delete') }
  }

  async function setMainPhoto(photoId: number) {
    try {
      const res = await fetch(`/api/photos/set-main/${photoId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setPhotos((p: any[]) => p.map((ph: any) => ({ ...ph, main: ph.id === photoId ? 1 : 0 })))
        toast.success('Profile photo updated!')
        await refreshUser()
      } else {
        toast.error('Failed to set profile photo')
      }
    } catch { toast.error('Failed') }
  }

  return (
    <div className="w-full min-h-screen" style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #111827 100%)' }}>
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-white tracking-tight mb-6">Settings</h1>

      <ProfileStrength
        form={form}
        photos={photos}
        interests={selectedInterests}
        verified={initialUser?.verified ?? 0}
        onTabChange={setTab}
      />

      <div className="flex gap-1 mb-6 p-1 rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
            style={tab === t
              ? { background: 'linear-gradient(135deg, #4A0072, #6B1FA2)', color: '#fff' }
              : { background: 'transparent', color: 'rgba(255,255,255,0.45)' }}>
            {t === 'Verify' ? (initialUser?.verified === 1 ? '✅ Verify' : '🔵 Verify') : t}
          </button>
        ))}
      </div>

      {tab === 'Profile' && (
        <div className="rounded-3xl p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-full">
              <label className="text-sm font-semibold text-white/60 mb-1.5 block">Full Name</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none text-white placeholder-white/25 border border-white/10 focus:border-brand-500/60 transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="col-span-full">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-white/60">Bio</label>
                <span className="text-xs text-white/30">No phone numbers, emails or social handles</span>
              </div>
              <textarea value={form.bio} onChange={e => update('bio', e.target.value)}
                rows={3} placeholder="Tell people about yourself..."
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none text-white placeholder-white/25 border border-white/10 focus:border-brand-500/60 transition-colors resize-none"
                style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div className="col-span-full">
              <LocationAutocomplete
                label="City"
                value={form.city}
                country={form.country}
                onChange={(city, country, countryCode) => {
                  setForm(p => ({ ...p, city, country: country || p.country, countryCode: countryCode || p.countryCode }))
                }}
                placeholder="Search your city..."
              />
            </div>
            {[
              { label: 'Country', key: 'country', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm font-semibold text-white/60 mb-1.5 block">{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={e => update(f.key, e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none text-white placeholder-white/25 border border-white/10 focus:border-brand-500/60 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
            ))}
            <div>
              <label className="text-sm font-semibold text-white/60 mb-1.5 block">Birthday</label>
              <input type="date" value={form.birthday} onChange={e => update('birthday', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none text-white border border-white/10 focus:border-brand-500/60 transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', colorScheme: 'dark' }}
                max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().slice(0,10)} />
            </div>
            <div>
              <label className="text-sm font-semibold text-white/60 mb-1.5 block">Looking For</label>
              <select value={form.looking} onChange={e => update('looking', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none text-white border border-white/10 focus:border-brand-500/60 transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', colorScheme: 'dark' }}>
                <option value="1">Men</option>
                <option value="2">Women</option>
                <option value="3">Everyone</option>
              </select>
            </div>
          </div>

          <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <h3 className="text-sm font-semibold text-white/60">More About You</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Occupation', key: 'occupation', placeholder: 'e.g. Entrepreneur' },
              { label: 'Education', key: 'education', placeholder: 'e.g. Masters Degree' },
              { label: 'Height', key: 'height', placeholder: "e.g. 5'10\"" },
              { label: 'Languages Spoken', key: 'languages', placeholder: 'e.g. English, Spanish', full: true },
            ].map(f => (
              <div key={f.key} className={f.full ? 'col-span-full' : ''}>
                <label className="text-sm font-semibold text-white/60 mb-1.5 block">{f.label}</label>
                <input type="text" value={(form as any)[f.key]} onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none text-white placeholder-white/25 border border-white/10 focus:border-brand-500/60 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
            ))}
            {[
              { label: 'Body Type', key: 'bodyType', opts: ['Slim', 'Athletic', 'Average', 'Curvy', 'Full figured'], placeholder: 'Select...' },
              { label: 'Ethnicity', key: 'ethnicity', opts: ['Asian', 'Black/African', 'Caucasian', 'Hispanic/Latino', 'Middle Eastern', 'Mixed', 'Native American', 'Pacific Islander', 'Other'], placeholder: 'Prefer not to say' },
              { label: 'Religion', key: 'religion', opts: ['Agnostic', 'Atheist', 'Buddhist', 'Catholic', 'Christian', 'Hindu', 'Jewish', 'Muslim', 'Spiritual', 'Other'], placeholder: 'Not specified' },
              { label: 'Smoking', key: 'smoking', opts: ['Never', 'Occasionally', 'Socially', 'Regularly'], placeholder: 'Not specified' },
              { label: 'Drinking', key: 'drinking', opts: ['Never', 'Occasionally', 'Socially', 'Regularly'], placeholder: 'Not specified' },
              { label: 'Children', key: 'children', opts: ['No children', 'Have children', 'Want children', "Don't want children", 'Open to it'], placeholder: 'Not specified' },
              { label: 'Relationship Goal', key: 'relationship', opts: ['Long-term', 'Short-term', 'Casual', 'Marriage', 'Friendship', 'Open to anything'], placeholder: 'Not specified' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm font-semibold text-white/60 mb-1.5 block">{f.label}</label>
                <select value={(form as any)[f.key]} onChange={e => update(f.key, e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none text-white border border-white/10 focus:border-brand-500/60 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', colorScheme: 'dark' }}>
                  <option value="">{f.placeholder}</option>
                  {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          <button onClick={saveProfile} disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Profile
          </button>
        </div>
      )}

      {tab === 'Interests' && (
        <div className="rounded-3xl p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <h3 className="font-semibold text-white mb-1">My Interests</h3>
            <p className="text-sm text-white/50">Select up to 20 interests that describe you. They'll appear on your profile.</p>
            <p className="text-xs text-white/35 mt-1">{selectedInterests.length}/20 selected</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(interest => (
              <InterestBadge
                key={interest.id}
                interest={interest}
                selected={selectedInterests.includes(interest.id)}
                onClick={() => toggleInterest(interest.id)}
              />
            ))}
          </div>

          <button onClick={saveInterests} disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
            Save Interests
          </button>
        </div>
      )}

      {tab === 'Verify' && (
        <VerificationTab token={token} initialUser={initialUser} />
      )}

      {tab === 'Photos' && (
        <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">My Photos</h3>
              <p className="text-sm text-white/40 mt-0.5">Upload up to 10 photos · hover to set profile photo</p>
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={uploading || photos.length >= 10}
              className="btn-primary text-sm py-2 px-4 disabled:opacity-50 flex items-center gap-1.5">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              Add Photo
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {photos.map((p: any) => (
              <div key={p.id} className="relative aspect-square rounded-2xl overflow-hidden group"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src={getPhotoUrl(p.thumb || p.photo)} alt="" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.background = '#1a1a2e' }} />
                {p.main === 1 && (
                  <div className="absolute top-1.5 left-1.5 bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                    ⭐ Profile
                  </div>
                )}
                {p.approved === 0 && p.main !== 1 && (
                  <div className="absolute top-1.5 right-1.5 bg-yellow-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                    Pending
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 px-2">
                  {p.main !== 1 && (
                    <button onClick={() => setMainPhoto(p.id)}
                      className="w-full py-1 bg-brand-500 text-white rounded-lg text-[11px] font-semibold hover:bg-brand-600 transition-colors flex items-center justify-center gap-1">
                      ⭐ Set Profile
                    </button>
                  )}
                  <button onClick={() => deletePhoto(p.id)}
                    className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors flex-shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {photos.length < 10 && (
              <button onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-2xl flex flex-col items-center justify-center transition-all"
                style={{ border: '2px dashed rgba(107,31,162,0.4)', color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,31,162,0.8)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,31,162,0.4)' }}>
                <Camera size={22} className="mb-1.5" />
                <span className="text-xs">{photos.length === 0 ? 'Add photo' : 'Add more'}</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
          <p className="text-xs text-white/30 mt-4">Photos are reviewed before being shown publicly. Supported formats: JPG, PNG, WebP</p>
        </div>
      )}

      {tab === 'Password' && (
        <div className="rounded-3xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="font-semibold text-white flex items-center gap-2"><Lock size={17} className="text-brand-400" /> Change Password</h3>
          {[
            { label: 'Current Password', key: 'current', placeholder: '••••••••' },
            { label: 'New Password', key: 'newPass', placeholder: 'Min. 6 characters' },
            { label: 'Confirm New Password', key: 'confirm', placeholder: 'Repeat new password' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-semibold text-white/60 mb-1.5 block">{f.label}</label>
              <input type="password" value={(pass as any)[f.key]} onChange={e => setPass(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none text-white placeholder-white/25 border border-white/10 focus:border-brand-500/60 transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          ))}
          <button onClick={changePassword} disabled={saving || !pass.current || !pass.newPass || !pass.confirm}
            className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            Change Password
          </button>
          <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <button onClick={logout} className="flex items-center gap-2 text-red-400 text-sm font-semibold hover:text-red-300 transition-colors">
            <LogOut size={16} /> Sign Out of Account
          </button>
        </div>
      )}

      {tab === 'Privacy' && (
        <div className="space-y-4">
          <div className="rounded-3xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="font-semibold text-white flex items-center gap-2"><Shield size={17} className="text-brand-400" /> Privacy Settings</h3>
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {[
                { label: 'Show online status', desc: 'Let others see when you are active', key: 'showOnline' },
                { label: 'Show profile visitors', desc: 'Allow others to see that you viewed their profile', key: 'showVisits' },
                { label: 'Allow messages from all members', desc: 'Let any member send you messages', key: 'openMessages' },
                { label: 'Show distance/location', desc: 'Display your city on your profile', key: 'showLocation' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-white/40">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-10 h-5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"
                      style={{ background: 'rgba(255,255,255,0.15)' }} />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="font-semibold text-white flex items-center gap-2"><Bell size={17} className="text-brand-400" /> Notifications</h3>
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {[
                { label: 'New messages', key: 'notifMessages' },
                { label: 'New likes', key: 'notifLikes' },
                { label: 'Profile visitors', key: 'notifVisits' },
                { label: 'Matches', key: 'notifMatches' },
                { label: 'Gifts received', key: 'notifGifts' },
                { label: 'Marketing emails', key: 'notifMarketing' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-2.5">
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" className="sr-only peer" defaultChecked={item.key !== 'notifMarketing'} />
                    <div className="w-10 h-5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"
                      style={{ background: 'rgba(255,255,255,0.15)' }} />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <h3 className="font-semibold text-red-400 flex items-center gap-2 mb-2"><Trash2 size={17} /> Danger Zone</h3>
            <p className="text-sm text-white/50 mb-4">Permanently delete your account. This action is irreversible.</p>
            <button onClick={async () => {
              if (!confirm('Are you sure you want to permanently delete your account?')) return
              if (!confirm('This will delete all your data, messages, and matches. Continue?')) return
              try {
                await fetch('/api/users/me', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
                logout()
                toast.success('Account deleted')
              } catch { toast.error('Failed to delete account') }
            }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
              <Trash2 size={15} /> Delete My Account
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}
