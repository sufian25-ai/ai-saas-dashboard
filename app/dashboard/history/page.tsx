'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { ChatSession } from '@/types'

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/history')
      const data = await res.json()
      setSessions(data.sessions || [])
    } catch (err) {
      console.error('Failed to fetch sessions', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this conversation?')) return

    setDeletingId(id)
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' })
      setSessions(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      console.error('Failed to delete', err)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="page-container">
      <div className="page-header animate-fadeIn">
        <div>
          <h1 className="page-title">Chat History</h1>
          <p className="page-subtitle">{sessions.length} conversation{sessions.length !== 1 ? 's' : ''} saved</p>
        </div>
        <button onClick={() => router.push('/dashboard/chat')} className="new-chat-btn" id="history-new-chat-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="search-wrapper animate-fadeIn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          id="history-search"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="search-clear">×</button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="loading-grid">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '72px' }} />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="empty-state animate-fadeIn">
          <div className="empty-icon">{searchQuery ? '🔍' : '💬'}</div>
          <p className="empty-title">{searchQuery ? 'No results found' : 'No conversations yet'}</p>
          <p className="empty-text">
            {searchQuery ? `No conversations matching "${searchQuery}"` : 'Start chatting to see your history here'}
          </p>
          {!searchQuery && (
            <button onClick={() => router.push('/dashboard/chat')} className="new-chat-btn" style={{ marginTop: '16px', border: 'none', cursor: 'pointer', display: 'flex' }}>
              Start Chatting
            </button>
          )}
        </div>
      ) : (
        <div className="sessions-list animate-fadeIn">
          {filteredSessions.map((session, i) => (
            <div
              key={session.id}
              className="session-card"
              onClick={() => router.push(`/dashboard/chat?session=${session.id}`)}
              style={{ animationDelay: `${i * 0.03}s` }}
              id={`session-card-${session.id}`}
            >
              <div className="session-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className="session-content">
                <p className="session-title">{session.title}</p>
                <p className="session-date">{formatDate(session.updated_at)}</p>
              </div>
              <div className="session-actions">
                <span className="session-open-hint">Open →</span>
                <button
                  onClick={(e) => handleDelete(session.id, e)}
                  className="delete-btn"
                  disabled={deletingId === session.id}
                  id={`delete-session-${session.id}`}
                >
                  {deletingId === session.id ? (
                    <span className="spinner-sm" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .page-container { padding: 32px; max-width: 800px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 16px; }
        .page-title { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 4px; }
        .page-subtitle { font-size: 14px; color: var(--text-secondary); }
        .new-chat-btn { display: flex; align-items: center; gap: 8px; background: var(--accent-gradient); color: white; padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none; transition: opacity 0.2s, transform 0.1s; white-space: nowrap; border: none; cursor: pointer; font-family: inherit; }
        .new-chat-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .search-wrapper { display: flex; align-items: center; gap: 10px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; margin-bottom: 20px; color: var(--text-muted); transition: border-color 0.2s; }
        .search-wrapper:focus-within { border-color: var(--accent-purple); }
        .search-input { flex: 1; background: none; border: none; outline: none; color: var(--text-primary); font-family: inherit; font-size: 14px; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-clear { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 18px; padding: 0; line-height: 1; }
        .loading-grid { display: flex; flex-direction: column; gap: 10px; }
        .sessions-list { display: flex; flex-direction: column; gap: 8px; }
        .session-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: background 0.15s, border-color 0.15s, transform 0.1s; animation: fadeIn 0.3s ease forwards; opacity: 0; }
        .session-card:hover { background: var(--bg-card-hover); border-color: var(--text-muted); transform: translateX(3px); }
        .session-icon { width: 36px; height: 36px; background: rgba(124, 58, 237, 0.1); color: var(--accent-purple-light); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .session-content { flex: 1; min-width: 0; }
        .session-title { font-size: 14px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
        .session-date { font-size: 12px; color: var(--text-muted); }
        .session-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .session-open-hint { font-size: 12px; color: var(--text-muted); }
        .session-card:hover .session-open-hint { color: var(--accent-purple-light); }
        .delete-btn { width: 30px; height: 30px; background: none; border: 1px solid transparent; border-radius: 7px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s, color 0.15s, border-color 0.15s; }
        .delete-btn:hover:not(:disabled) { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #fca5a5; }
        .delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .spinner-sm { width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.2); border-top-color: var(--text-muted); border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .empty-state { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 48px; text-align: center; }
        .empty-icon { font-size: 40px; margin-bottom: 12px; }
        .empty-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
        .empty-text { font-size: 13px; color: var(--text-secondary); }
      `}} />
    </div>
  )
}
