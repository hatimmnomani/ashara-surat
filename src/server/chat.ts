// src/server/chat.ts
import { createServerFn } from '@tanstack/react-start'
import { supabaseAdmin } from '../lib/supabase'
import { buildLLMClient } from '../lib/llm'
import { isRateLimited, incrementMessageCount } from '../lib/rateLimit'

const SYSTEM_PROMPT = `You are a helpful assistant for Ashara Mubaraka Surat 1448H.
Help visiting mumineen with questions about schedules, accommodation, transport, food zones, and general event information.
Be warm, respectful, and concise. If you don't know something, suggest they contact the helpdesk.
Always respond in English.`

const RATE_LIMIT = parseInt(process.env.CHAT_RATE_LIMIT ?? '5', 10)

export const createChatSession = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { name: string; phone: string; email: string; whatsapp: string })
  .handler(async ({ data }) => {
    const { data: session, error } = await supabaseAdmin
      .from('chat_sessions')
      .insert({
        contact_name: data.name,
        contact_phone: data.phone,
        contact_email: data.email,
        contact_whatsapp: data.whatsapp,
        message_count: 0,
        window_started_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return { sessionId: session.id as string }
  })

export const sendChatMessage = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { sessionId: string; content: string })
  .handler(async ({ data }) => {
    const { data: session, error: sessionErr } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('id', data.sessionId)
      .single()
    if (sessionErr) throw new Error('Session not found')

    if (isRateLimited(session, RATE_LIMIT)) {
      return { rateLimited: true, reply: null as null }
    }

    const updated = incrementMessageCount(session)
    await supabaseAdmin.from('chat_sessions').update({
      message_count: updated.message_count,
      window_started_at: updated.window_started_at,
    }).eq('id', data.sessionId)

    const { data: history } = await supabaseAdmin
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', data.sessionId)
      .order('created_at')

    await supabaseAdmin.from('chat_messages').insert({
      session_id: data.sessionId, role: 'user', content: data.content,
    })

    const llm = buildLLMClient()
    const reply = await llm.chat([
      ...(history ?? []).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: data.content },
    ], SYSTEM_PROMPT)

    await supabaseAdmin.from('chat_messages').insert({
      session_id: data.sessionId, role: 'assistant', content: reply,
    })

    return { rateLimited: false, reply }
  })

export const createTicket = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { sessionId: string; escalationChannel: 'email' | 'whatsapp'; summary: string })
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from('support_tickets').insert({
      session_id: data.sessionId,
      escalation_channel: data.escalationChannel,
      summary: data.summary,
    })
    if (error) throw new Error(error.message)
    await supabaseAdmin.from('chat_sessions').update({ status: 'escalated' }).eq('id', data.sessionId)
    return { success: true }
  })
