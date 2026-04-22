import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { supabaseAdmin } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'

interface Ticket {
  id: string
  escalation_channel: 'email' | 'whatsapp'
  summary?: string
  escalated_at: string
  resolved_at: string | null
  chat_sessions: { contact_name: string; contact_phone?: string; contact_whatsapp?: string; contact_email?: string } | null
}

const resolveTicket = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { id: string })
  .handler(async ({ data }) => {
    await supabaseAdmin
      .from('support_tickets')
      .update({ resolved_at: new Date().toISOString() })
      .eq('id', data.id)
    return { success: true }
  })

export const Route = createFileRoute('/admin/tickets')({
  loader: async () => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, chat_sessions(contact_name, contact_phone, contact_whatsapp, contact_email)')
      .order('escalated_at', { ascending: false })
    if (error) throw new Error(error.message)
    return { tickets: (data ?? []) as Ticket[] }
  },
  component: function AdminTicketsPage() {
    const { tickets: initial } = Route.useLoaderData()
    const [tickets, setTickets] = useState<Ticket[]>(initial)

    async function handleResolve(id: string) {
      await resolveTicket({ data: { id } })
      setTickets(p => p.map(t => t.id === id ? { ...t, resolved_at: new Date().toISOString() } : t))
    }

    const open     = tickets.filter(t => !t.resolved_at)
    const resolved = tickets.filter(t => t.resolved_at)

    return (
      <div>
        <h1 className="text-2xl font-serif text-burgundy-700 mb-6">Support Tickets</h1>

        <h2 className="font-semibold text-gray-700 mb-3">Open ({open.length})</h2>
        <div className="space-y-3 mb-8">
          {open.map(t => (
            <div key={t.id} className="bg-white border border-orange-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800">{t.chat_sessions?.contact_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {t.escalation_channel === 'whatsapp'
                      ? `${t.chat_sessions?.contact_whatsapp ?? t.chat_sessions?.contact_phone}`
                      : `${t.chat_sessions?.contact_email}`}
                  </p>
                  {t.summary && <p className="text-sm text-gray-400 mt-2 italic line-clamp-2">"{t.summary}"</p>}
                  <p className="text-xs text-gray-300 mt-1">{new Date(t.escalated_at).toLocaleString()}</p>
                </div>
                <button onClick={() => handleResolve(t.id)}
                  className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 shrink-0 transition-colors">
                  Mark Resolved
                </button>
              </div>
            </div>
          ))}
          {open.length === 0 && <p className="text-gray-400 text-sm">No open tickets.</p>}
        </div>

        <h2 className="font-semibold text-gray-400 mb-3">Recently Resolved ({resolved.length})</h2>
        <div className="space-y-2">
          {resolved.slice(0, 10).map(t => (
            <div key={t.id} className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">{t.chat_sessions?.contact_name}</span>
              <span className="text-xs text-gray-300">{t.resolved_at ? new Date(t.resolved_at).toLocaleDateString() : ''}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
})
