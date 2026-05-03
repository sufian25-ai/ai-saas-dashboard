import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    // Get usage stats
    const { count: totalChats } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: todayMessages } = await supabase
      .from('messages')
      .select('*, chat_sessions!inner(user_id)', { count: 'exact', head: true })
      .eq('chat_sessions.user_id', user.id)
      .eq('role', 'user')
      .gte('created_at', today.toISOString())

    return NextResponse.json({
      profile,
      stats: {
        totalChats: totalChats || 0,
        todayMessages: todayMessages || 0,
      },
    })
  } catch (error) {
    console.error('User GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await req.json()

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('User PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
