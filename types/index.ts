export interface Profile {
  id: string
  name: string | null
  avatar_url: string | null
  created_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}
