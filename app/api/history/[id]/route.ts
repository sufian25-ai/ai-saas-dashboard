import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Security: only delete own sessions

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('History DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Session GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
