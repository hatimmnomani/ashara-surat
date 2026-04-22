import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { supabaseAdmin } from '../lib/supabase'
import { useState } from 'react'

const submitVolunteer = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { name: string; its_id: string; phone: string; email: string; role: string; zone: string })
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from('volunteer_signups').insert(data)
    if (error) throw new Error(error.message)
    return { success: true }
  })

export const Route = createFileRoute('/volunteer')({
  component: function VolunteerPage() {
    const [form, setForm] = useState({ name: '', its_id: '', phone: '', email: '', role: '', zone: '' })
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      setSubmitting(true)
      try {
        await submitVolunteer({ data: form })
        setSubmitted(true)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
      } finally {
        setSubmitting(false)
      }
    }

    if (submitted) return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-3">🙏</div>
        <h2 className="font-serif text-2xl text-burgundy-700">Jazakallah Khair</h2>
        <p className="text-gray-500 mt-2">Your volunteer signup has been received.</p>
      </div>
    )

    const fields = [
      { name: 'name',   label: 'Full Name',         required: true },
      { name: 'its_id', label: 'ITS ID',             required: false },
      { name: 'phone',  label: 'Phone / WhatsApp',   required: true },
      { name: 'email',  label: 'Email',              required: false },
      { name: 'role',   label: 'Preferred Role',     required: false },
      { name: 'zone',   label: 'Preferred Zone',     required: false },
    ]

    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Volunteer Signup</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {f.label}{f.required && ' *'}
              </label>
              <input
                required={f.required}
                value={form[f.name as keyof typeof form]}
                onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
              />
            </div>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={submitting}
            className="w-full bg-burgundy-700 text-ivory py-2.5 rounded-lg font-semibold hover:bg-burgundy-800 transition-colors disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Signup'}
          </button>
        </form>
      </div>
    )
  },
})
