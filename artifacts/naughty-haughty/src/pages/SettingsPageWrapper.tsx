import { useState, useEffect } from 'react'
import SettingsPage from '../components/settings/SettingsPage'
import { useAuth } from '../hooks/useAuth'

export default function SettingsPageWrapper() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    if (!token) return
    fetch('/api/users/me/full', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setUserData(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="w-full min-h-screen" style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #111827 100%)' }}>
      <div className="max-w-3xl mx-auto px-4 py-6 animate-pulse space-y-4">
        <div className="h-8 rounded w-1/3" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className="h-64 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
    </div>
  )

  return <SettingsPage user={userData} />
}
