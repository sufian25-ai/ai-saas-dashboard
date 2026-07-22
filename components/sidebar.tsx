'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/chat',
    label: 'AI Chat',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    badge: 'AI',
  },
  {
    href: '/dashboard/history',
    label: 'History',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="logo-text gradient-text">Mahbub Sufian Ai</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <p className="nav-section-label">MENU</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('nav-item', isActive && 'nav-item-active')}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
              {isActive && <span className="nav-indicator" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <div className="ai-status">
          <div className="ai-status-dot" />
          <span>Gemini 2.5 Flash Connected</span>
        </div>
        <button onClick={handleLogout} className="logout-btn" id="logout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar {
          width: 240px;
          min-height: 100vh;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 20px 12px;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 50;
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px 24px;
        }
        .logo-icon {
          width: 36px; height: 36px;
          background: var(--accent-gradient);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .logo-text { font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
        .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .nav-section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1px;
          color: var(--text-muted);
          padding: 0 12px;
          margin-bottom: 8px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          transition: background 0.15s, color 0.15s;
          position: relative;
          cursor: pointer;
        }
        .nav-item:hover {
          background: var(--bg-card);
          color: var(--text-primary);
        }
        .nav-item-active {
          background: rgba(124, 58, 237, 0.12);
          color: var(--accent-purple-light);
        }
        .nav-item-active:hover {
          background: rgba(124, 58, 237, 0.18);
          color: var(--accent-purple-light);
        }
        .nav-icon { flex-shrink: 0; }
        .nav-label { flex: 1; }
        .nav-badge {
          font-size: 10px;
          font-weight: 700;
          background: var(--accent-gradient);
          color: white;
          padding: 2px 6px;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }
        .nav-indicator {
          position: absolute;
          right: -12px;
          width: 3px; height: 20px;
          background: var(--accent-gradient);
          border-radius: 2px 0 0 2px;
        }
        .sidebar-bottom {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid var(--border-subtle);
        }
        .ai-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .ai-status-dot {
          width: 7px; height: 7px;
          background: var(--success);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--success);
          animation: pulse-glow 2s infinite;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 10px;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          font-family: inherit;
          width: 100%;
          text-align: left;
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #fca5a5;
        }
      `}} />
    </aside>
  )
}
