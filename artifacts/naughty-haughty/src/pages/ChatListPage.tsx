import { useState, useEffect } from 'react'
import ChatList from '../components/chat/ChatList'
import { useAuth } from '../hooks/useAuth'

export default function ChatListPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user, token } = useAuth()

  useEffect(() => {
    if (!token) return
    fetch('/api/chat/conversations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setConversations(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="w-full min-h-screen" style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #111827 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="w-12 h-12 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 rounded w-1/3" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <div className="h-3 rounded w-2/3" style={{ background: 'rgba(255,255,255,0.07)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return <ChatList userId={user?.id || 0} conversations={conversations} />
}
