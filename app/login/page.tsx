'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="auth-container">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-card animate-fadeIn">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="auth-logo-text gradient-text">AI Dashboard</span>
        </div>

        <h1 className="auth-title">Welcome Mahbub Sufian Ai</h1>
        <p className="auth-subtitle">Sign in to your AI workspace</p>

        {error && (
          <div className="auth-error animate-fadeIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="mahbub@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            id="login-submit-btn"
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="btn-google"
          id="google-login-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="auth-link">Create one free</Link>
        </p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 24px;
        }
        .auth-bg {
          position: fixed;
          inset: 0;
          background: var(--bg-primary);
        }
        .auth-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }
        .auth-orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, #7c3aed, transparent);
          top: -200px; left: -200px;
        }
        .auth-orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #3b82f6, transparent);
          bottom: -150px; right: -150px;
        }
        .auth-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }
        .auth-logo-icon {
          width: 40px; height: 40px;
          background: var(--accent-gradient);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-logo-text {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }
        .auth-title {
          font-size: 26px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }
        .auth-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 28px;
        }
        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .form-input {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          color: var(--text-primary);
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--accent-purple);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
        }
        .form-input::placeholder { color: var(--text-muted); }
        .btn-primary {
          background: var(--accent-gradient);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 13px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          margin-top: 4px;
          font-family: inherit;
          width: 100%;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: var(--text-muted);
          font-size: 12px;
        }
        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .btn-google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-primary);
          border-radius: 10px;
          padding: 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          width: 100%;
          font-family: inherit;
        }
        .btn-google:hover {
          background: var(--bg-card-hover);
          border-color: var(--text-muted);
        }
        .auth-footer {
          text-align: center;
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 24px;
        }
        .auth-link {
          color: var(--accent-purple-light);
          text-decoration: none;
          font-weight: 500;
        }
        .auth-link:hover { text-decoration: underline; }
      `}} />
    </div>
  )
}
