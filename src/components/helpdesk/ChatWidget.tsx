import { useState, useRef, useEffect } from 'react'
import { ContactForm } from './ContactForm'
import { ChatMessage } from './ChatMessage'
import { EscalationModal } from './EscalationModal'
import { createChatSession, sendChatMessage, createTicket } from '../../server/chat'

interface Message { role: 'user' | 'assistant'; content: string }

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [showEscalation, setShowEscalation] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function handleContactSubmit(contact: { name: string; phone: string; email: string; whatsapp: string }) {
    const { sessionId: id } = await createChatSession({ data: contact })
    setSessionId(id)
    setMessages([{ role: 'assistant', content: `Wa'alaikum salaam ${contact.name}! How can I help you with Ashara Surat 1448H?` }])
  }

  async function handleSend() {
    if (!input.trim() || !sessionId || loading || rateLimited) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    const result = await sendChatMessage({ data: { sessionId, content: userMsg } })
    setLoading(false)
    if (result.rateLimited) { setRateLimited(true); return }
    if (result.reply) setMessages(prev => [...prev, { role: 'assistant', content: result.reply! }])
  }

  async function handleEscalate(channel: 'email' | 'whatsapp') {
    if (!sessionId) return
    const summary = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')
    await createTicket({ data: { sessionId, escalationChannel: channel, summary } })
    setShowEscalation(false)
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Thank you! Our team will reach out via ${channel} shortly. Jazakallah Khair.`,
    }])
  }

  return (
    <>
      {showEscalation && <EscalationModal onEscalate={handleEscalate} onClose={() => setShowEscalation(false)} />}

      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 bg-burgundy-700 text-ivory w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl hover:bg-burgundy-800 transition-colors z-40">
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-burgundy-100 flex flex-col overflow-hidden z-40"
          style={{ height: '460px' }}>
          <div className="bg-burgundy-700 text-ivory px-4 py-3 flex items-center justify-between shrink-0">
            <div>
              <p className="font-semibold text-sm">Ashara Surat Helpdesk</p>
              <p className="text-xs text-burgundy-200">AI assistant • 24/7</p>
            </div>
            <button onClick={() => setShowEscalation(true)}
              className="text-xs bg-burgundy-600 hover:bg-burgundy-500 px-2 py-1 rounded-lg transition-colors">
              📞 Helpdesk
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {!sessionId
              ? <ContactForm onSubmit={handleContactSubmit} />
              : (
                <>
                  {messages.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content} />)}
                  {loading && <ChatMessage role="assistant" content="..." />}
                  {rateLimited && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center mt-2">
                      <p className="text-xs text-red-600 mb-2">You've reached the 5 message limit for this hour.</p>
                      <button onClick={() => setShowEscalation(true)}
                        className="text-xs bg-burgundy-700 text-ivory px-3 py-1.5 rounded-lg hover:bg-burgundy-800">
                        Contact Helpdesk
                      </button>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </>
              )
            }
          </div>

          {sessionId && !rateLimited && (
            <div className="border-t border-gray-100 p-3 flex gap-2 shrink-0">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type your question..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
              />
              <button onClick={handleSend} disabled={loading || !input.trim()}
                className="bg-burgundy-700 text-ivory px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 hover:bg-burgundy-800">
                →
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
