'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserStats {
  totalChats: number
  todayMessages: number
}

interface Profile {
  name: string | null
  avatar_url: string | null
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({ name: '', avatar_url: null })
  const [email, setEmail] = useState('')
  const [stats, setStats] = useState<UserStats>({ totalChats: 0, todayMessages: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setEmail(user.email || '')
    }

    const res = await fetch('/api/user')
    const data = await res.json()
    if (data.profile) setProfile(data.profile)
    if (data.stats) setStats(data.stats)
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: profile.name }),
    })

    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    return email.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '80px' }} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header animate-fadeIn">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="settings-card animate-fadeIn">
        <div className="card-header">
          <h2 className="card-title">Profile</h2>
        </div>

        <div className="avatar-section">
          <div className="avatar">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Avatar" className="avatar-img" />
            ) : (
              <span className="avatar-initials">
                {getInitials(profile.name, email)}
              </span>
            )}
          </div>
          <div>
            <p className="avatar-name">{profile.name || 'No name set'}</p>
            <p className="avatar-email">{email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="settings-form">
          <div className="form-group">
            <label htmlFor="settings-name" className="form-label">Display Name</label>
            <input
              id="settings-name"
              type="text"
              value={profile.name || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              className="form-input"
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="settings-email" className="form-label">Email Address</label>
            <input
              id="settings-email"
              type="email"
              value={email}
              className="form-input"
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            />
            <p className="form-hint">Email cannot be changed from here</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="save-btn"
            id="settings-save-btn"
          >
            {saving ? (
              <span className="btn-loading">
                <span className="spinner" />Saving...
              </span>
            ) : saved ? (
              <span>✅ Saved!</span>
            ) : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Stats Card */}
      <div className="settings-card animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <div className="card-header">
          <h2 className="card-title">Usage Statistics</h2>
        </div>
        <div className="stats-row">
          <div className="stat-item">
            <p className="stat-number" style={{ color: 'var(--accent-purple-light)' }}>{stats.totalChats}</p>
            <p className="stat-label-text">Total Conversations</p>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <p className="stat-number" style={{ color: 'var(--accent-blue)' }}>{stats.todayMessages}</p>
            <p className="stat-label-text">Queries Today</p>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <p className="stat-number" style={{ color: 'var(--success)' }}>Gemini 2.5 Flash</p>
            <p className="stat-label-text">AI Model</p>
          </div>
        </div>
      </div>

      {/* AI Config Card */}
      <div className="settings-card animate-fadeIn" style={{ animationDelay: '0.15s' }}>
        <div className="card-header">
          <h2 className="card-title">AI Configuration</h2>
        </div>
        <div className="config-list">
          <div className="config-item">
            <div>
              <p className="config-label">Model</p>
              <p className="config-value">Gemini 2.5 Flash (Google)</p>
            </div>
            <span className="badge-active">Active</span>
          </div>
          <div className="config-item">
            <div>
              <p className="config-label">Max Tokens</p>
              <p className="config-value">1,000 per response</p>
            </div>
          </div>
          <div className="config-item">
            <div>
              <p className="config-label">Temperature</p>
              <p className="config-value">0.7 (Balanced)</p>
            </div>
          </div>
          <div className="config-item">
            <div>
              <p className="config-label">Streaming</p>
              <p className="config-value">Enabled (real-time)</p>
            </div>
            <span className="badge-active">On</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .page-container { padding: 32px; max-width: 680px; }
        .page-header { margin-bottom: 28px; }
        .page-title { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 4px; }
        .page-subtitle { font-size: 14px; color: var(--text-secondary); }
        .settings-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 24px; margin-bottom: 16px; animation: fadeIn 0.4s ease forwards; opacity: 0; }
        .card-header { margin-bottom: 20px; }
        .card-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .avatar-section { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--border-subtle); }
        .avatar { width: 56px; height: 56px; border-radius: 14px; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-initials { color: white; font-size: 18px; font-weight: 700; }
        .avatar-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .avatar-email { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
        .settings-form { display: flex; flex-direction: column; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
        .form-input { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 10px; padding: 11px 14px; font-size: 14px; color: var(--text-primary); font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s; width: 100%; }
        .form-input:focus { outline: none; border-color: var(--accent-purple); box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15); }
        .form-hint { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .save-btn { background: var(--accent-gradient); color: white; border: none; border-radius: 10px; padding: 11px 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; font-family: inherit; width: fit-content; }
        .save-btn:hover:not(:disabled) { opacity: 0.9; }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-loading { display: flex; align-items: center; gap: 8px; }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .stats-row { display: flex; align-items: center; gap: 0; }
        .stat-item { flex: 1; text-align: center; padding: 8px 0; }
        .stat-divider { width: 1px; height: 50px; background: var(--border); }
        .stat-number { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 4px; }
        .stat-label-text { font-size: 12px; color: var(--text-secondary); }
        .config-list { display: flex; flex-direction: column; gap: 0; }
        .config-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-subtle); }
        .config-item:last-child { border-bottom: none; }
        .config-label { font-size: 13px; color: var(--text-secondary); margin-bottom: 2px; }
        .config-value { font-size: 14px; font-weight: 500; color: var(--text-primary); }
        .badge-active { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: var(--success); font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; }
      `}} />
    </div>
  )
}
