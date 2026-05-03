import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('*, messages(count)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('History GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, firstMessage } = await req.json()

    // Create new session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title: title || 'New Chat' })
      .select()
      .single()

    if (sessionError) throw sessionError

    // Save first user message
    if (firstMessage) {
      await supabase.from('messages').insert({
        session_id: session.id,
        role: 'user',
        content: firstMessage,
      })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('History POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
