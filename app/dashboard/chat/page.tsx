'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChatMessage } from '@/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function ChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session')
  const quickQuery = searchParams.get('q')

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const initialized = useRef(false)

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  // Load existing session
  useEffect(() => {
    if (sessionId && !initialized.current) {
      initialized.current = true
      loadSession(sessionId)
    }
  }, [sessionId])

  // Handle quick query from dashboard
  useEffect(() => {
    if (quickQuery && !initialized.current && !sessionId) {
      initialized.current = true
      setInput(quickQuery)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [quickQuery, sessionId])

  const loadSession = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`)
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages.map((m: Message) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })))
      }
    } catch (err) {
      console.error('Failed to load session', err)
    }
  }

  const createSession = async (firstMessage: string): Promise<string> => {
    const title = firstMessage.length > 50
      ? firstMessage.substring(0, 50) + '...'
      : firstMessage
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, firstMessage }),
    })
    const data = await res.json()
    return data.session.id
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    setInput('')
    setIsLoading(true)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }
    setMessages(prev => [...prev, userMessage])

    try {
      // Create session if not exists
      let sid = currentSessionId
      if (!sid) {
        sid = await createSession(text)
        setCurrentSessionId(sid)
        router.replace(`/dashboard/chat?session=${sid}`, { scroll: false })
      }

      // Build message history for API
      const history: ChatMessage[] = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: text },
      ]

      // Stream response
      setIsTyping(true)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, sessionId: sid }),
      })

      if (!response.ok) throw new Error('API error')
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      const assistantId = 'assistant-' + Date.now()

      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])
      setIsTyping(false)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                assistantContent += parsed.text
                setMessages(prev => prev.map(m =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                ))
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: '❌ Something went wrong. Please try again.',
      }])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setCurrentSessionId(null)
    setInput('')
    initialized.current = false
    router.push('/dashboard/chat')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const adjustTextareaHeight = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="chat-wrapper">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-model-badge">
            <span className="chat-model-dot" />
            Gemini 2.5 Flash
          </div>
          <p className="chat-session-label">
            {currentSessionId ? 'Active Session' : 'New Conversation'}
          </p>
        </div>
        <button onClick={handleNewChat} className="new-chat-header-btn" id="new-chat-header-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-screen animate-fadeIn">
            <div className="welcome-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#grad)" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="url(#grad)" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="url(#grad)" strokeWidth="2" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7c3aed"/>
                    <stop offset="100%" stopColor="#3b82f6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2 className="welcome-title">How can I help you today?</h2>
            <p className="welcome-subtitle">I&apos;m powered by Gemini 2.5 Flash. Ask me anything!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'} animate-fadeIn`}
              >
                {message.role === 'assistant' && (
                  <div className="message-avatar assistant-avatar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <div className={`message-bubble ${message.role === 'user' ? 'bubble-user' : 'bubble-assistant'}`}>
                  <p className="message-text">{message.content || ' '}</p>
                </div>
                {message.role === 'user' && (
                  <div className="message-avatar user-avatar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message message-assistant animate-fadeIn">
                <div className="message-avatar assistant-avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="bubble-assistant typing-bubble">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              adjustTextareaHeight(e.target)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Message AI... (Enter to send, Shift+Enter for new line)"
            className="chat-input"
            rows={1}
            disabled={isLoading}
            id="chat-input"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="send-btn"
            id="send-btn"
          >
            {isLoading ? (
              <span className="spinner" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </div>
        <p className="input-hint">Gemini 2.5 Flash · Conversations are saved automatically</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .chat-wrapper {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-secondary);
        }
        .chat-header-left { display: flex; align-items: center; gap: 12px; }
        .chat-model-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(124, 58, 237, 0.1);
          border: 1px solid rgba(124, 58, 237, 0.3);
          color: var(--accent-purple-light);
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .chat-model-dot {
          width: 6px; height: 6px;
          background: var(--success);
          border-radius: 50%;
          box-shadow: 0 0 5px var(--success);
        }
        .chat-session-label { font-size: 13px; color: var(--text-muted); }
        .new-chat-header-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 500;
          padding: 7px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, border-color 0.15s;
        }
        .new-chat-header-btn:hover { background: var(--bg-card-hover); border-color: var(--text-muted); }
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        .welcome-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          gap: 16px;
        }
        .welcome-icon {
          width: 72px; height: 72px;
          background: rgba(124, 58, 237, 0.1);
          border: 1px solid rgba(124, 58, 237, 0.2);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
        }
        .welcome-title { font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
        .welcome-subtitle { font-size: 14px; color: var(--text-secondary); }
        .messages-list { display: flex; flex-direction: column; gap: 20px; max-width: 780px; margin: 0 auto; }
        .message { display: flex; align-items: flex-start; gap: 10px; }
        .message-user { flex-direction: row-reverse; }
        .message-avatar {
          width: 30px; height: 30px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .assistant-avatar { background: var(--accent-gradient); }
        .user-avatar { background: rgba(59, 130, 246, 0.3); border: 1px solid rgba(59, 130, 246, 0.4); }
        .message-bubble { max-width: calc(100% - 50px); border-radius: 14px; padding: 12px 16px; }
        .bubble-user {
          background: var(--accent-gradient);
          color: white;
          border-radius: 14px 14px 4px 14px;
        }
        .bubble-assistant {
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          border-radius: 14px 14px 14px 4px;
        }
        .message-text {
          font-size: 14px;
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .typing-bubble {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 14px 18px;
        }
        .input-container {
          padding: 16px 24px 20px;
          border-top: 1px solid var(--border);
          background: var(--bg-secondary);
        }
        .input-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 10px 10px 10px 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-wrapper:focus-within {
          border-color: var(--accent-purple);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
        }
        .chat-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 14px;
          line-height: 1.6;
          resize: none;
          max-height: 120px;
          overflow-y: auto;
        }
        .chat-input::placeholder { color: var(--text-muted); }
        .chat-input:disabled { opacity: 0.5; }
        .send-btn {
          width: 36px; height: 36px;
          background: var(--accent-gradient);
          border: none;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: opacity 0.2s, transform 0.1s;
        }
        .send-btn:hover:not(:disabled) { opacity: 0.9; transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .input-hint { font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 8px; }
      `}} />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  )
}
