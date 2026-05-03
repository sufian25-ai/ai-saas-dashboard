import { model } from '@/lib/gemini'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, sessionId } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
    }

    // Convert OpenAI message format to Gemini format
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))
    
    const prompt = messages[messages.length - 1].content

    // Add system instructions via history hack
    const fullHistory = [
      { role: 'user', parts: [{ text: 'You are a helpful AI assistant in an AI SaaS Dashboard. Be concise, clear, and helpful.' }] },
      { role: 'model', parts: [{ text: 'Understood. I am ready to help.' }] },
      ...history
    ]

    const chat = model.startChat({
      history: fullHistory,
    })

    const streamResult = await chat.sendMessageStream(prompt)

    // Create a ReadableStream to stream the response back to client (SSE format)
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullContent = ''
        const encoder = new TextEncoder()

        try {
          for await (const chunk of streamResult.stream) {
            const text = chunk.text()
            if (text) {
              fullContent += text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }

          // Save assistant message to DB after streaming completes
          if (sessionId && fullContent) {
            const supabaseServer = await createClient()
            await supabaseServer.from('messages').insert({
              session_id: sessionId,
              role: 'assistant',
              content: fullContent,
            })
            // Update session updated_at
            await supabaseServer
              .from('chat_sessions')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', sessionId)
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          console.error('Streaming error:', err)
          controller.error(err)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
