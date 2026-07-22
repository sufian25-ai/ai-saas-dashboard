import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

async function getStats(userId: string) {
  const supabase = await createClient()

  const { count: totalChats } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { count: totalMessages } = await supabase
    .from('messages')
    .select('*, chat_sessions!inner(user_id)', { count: 'exact', head: true })
    .eq('chat_sessions.user_id', userId)
    .eq('role', 'user')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: todayMessages } = await supabase
    .from('messages')
    .select('*, chat_sessions!inner(user_id)', { count: 'exact', head: true })
    .eq('chat_sessions.user_id', userId)
    .eq('role', 'user')
    .gte('created_at', today.toISOString())

  const { data: recentSessions } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(5)

  return {
    totalChats: totalChats || 0,
    totalMessages: totalMessages || 0,
    todayMessages: todayMessages || 0,
    recentSessions: recentSessions || [],
  }
}

const quickPrompts = [
  { label: '✍️ Write an email', prompt: 'Write a professional email for me' },
  { label: '🔍 Explain a concept', prompt: 'Explain a complex concept simply' },
  { label: '💡 Brainstorm ideas', prompt: 'Help me brainstorm ideas for' },
  { label: '🐛 Debug code', prompt: 'Help me debug this code:' },
  { label: '📝 Summarize text', prompt: 'Summarize this text for me:' },
  { label: '🌐 Translate text', prompt: 'Translate this text to English:' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user!.id)
    .single()

  const stats = await getStats(user!.id)
  const firstName = profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  const statCards = [
    {
      label: 'Total Chats',
      value: stats.totalChats,
      icon: '💬',
      color: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.1)',
    },
    {
      label: 'AI Queries',
      value: stats.totalMessages,
      icon: '🤖',
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
    },
    {
      label: "Today's Queries",
      value: stats.todayMessages,
      icon: '⚡',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
  ]

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header animate-fadeIn">
        <div>
          <h1 className="page-title">
            Good {getGreeting()}, <span className="gradient-text">{firstName}!</span>
          </h1>
          <p className="page-subtitle">Here&apos;s what&apos;s happening with your AI workspace</p>
        </div>
        <Link href="/dashboard/chat" className="new-chat-btn" id="new-chat-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Chat
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid animate-fadeIn">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              <span style={{ fontSize: '20px' }}>{card.icon}</span>
            </div>
            <div className="stat-info">
              <p className="stat-label">{card.label}</p>
              <p className="stat-value" style={{ color: card.color }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Prompts */}
      <div className="section animate-fadeIn">
        <h2 className="section-title">Quick Start</h2>
        <div className="quick-prompts-grid">
          {quickPrompts.map((item, i) => (
            <Link
              key={i}
              href={`/dashboard/chat?q=${encodeURIComponent(item.prompt)}`}
              className="quick-prompt-card"
              id={`quick-prompt-${i}`}
            >
              <span>{item.label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="section animate-fadeIn">
        <div className="section-header">
          <h2 className="section-title">Recent Conversations</h2>
          <Link href="/dashboard/history" className="see-all-link">See all →</Link>
        </div>
        {stats.recentSessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p className="empty-title">No conversations yet</p>
            <p className="empty-text">Start a new chat to see your history here</p>
            <Link href="/dashboard/chat" className="new-chat-btn" style={{ display: 'inline-flex', marginTop: '16px' }}>
              Start Chatting
            </Link>
          </div>
        ) : (
          <div className="sessions-list">
            {stats.recentSessions.map((session) => (
              <Link
                key={session.id}
                href={`/dashboard/chat?session=${session.id}`}
                className="session-item"
              >
                <div className="session-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div className="session-info">
                  <p className="session-title">{session.title}</p>
                  <p className="session-date">{formatRelativeTime(session.updated_at)}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="session-arrow">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .page-container {
          padding: 32px;
          max-width: 1100px;
        }
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 32px;
          gap: 16px;
        }
        .page-title {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }
        .page-subtitle { font-size: 14px; color: var(--text-secondary); }
        .new-chat-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--accent-gradient);
          color: white;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.1s;
          white-space: nowrap;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }
        .new-chat-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: border-color 0.2s, transform 0.2s;
          animation: fadeIn 0.4s ease forwards;
          opacity: 0;
        }
        .stat-card:hover {
          border-color: var(--text-muted);
          transform: translateY(-2px);
        }
        .stat-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stat-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500; }
        .stat-value { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .section { margin-bottom: 32px; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px; }
        .section-header .section-title { margin-bottom: 0; }
        .see-all-link { font-size: 13px; color: var(--accent-purple-light); text-decoration: none; }
        .see-all-link:hover { text-decoration: underline; }
        .quick-prompts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
        }
        .quick-prompt-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          transition: background 0.15s, border-color 0.15s, transform 0.1s;
        }
        .quick-prompt-card:hover {
          background: var(--bg-card-hover);
          border-color: var(--accent-purple);
          color: var(--accent-purple-light);
          transform: translateY(-1px);
        }
        .sessions-list { display: flex; flex-direction: column; gap: 8px; }
        .session-item {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s;
        }
        .session-item:hover { background: var(--bg-card-hover); border-color: var(--text-muted); }
        .session-icon {
          width: 32px; height: 32px;
          background: rgba(124, 58, 237, 0.1);
          color: var(--accent-purple-light);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .session-info { flex: 1; min-width: 0; }
        .session-title { font-size: 14px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .session-date { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .session-arrow { color: var(--text-muted); flex-shrink: 0; }
        .empty-state { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 40px; text-align: center; }
        .empty-icon { font-size: 40px; margin-bottom: 12px; }
        .empty-title { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
        .empty-text { font-size: 13px; color: var(--text-secondary); }
      `}} />
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

function formatRelativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}
