import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { supabaseAdmin } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'

interface ScheduleEvent { id: string; day: number; event_time: string; title: string; description?: string; location?: string }

const upsertEvent = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { id?: string; day: number; event_time: string; title: string; description?: string; location?: string })
  .handler(async ({ data }) => {
    const { id, ...fields } = data
    if (id) {
      await supabaseAdmin.from('schedule_events').update(fields).eq('id', id)
    } else {
      await supabaseAdmin.from('schedule_events').insert(fields)
    }
    return { success: true }
  })

const deleteEvent = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { id: string })
  .handler(async ({ data }) => {
    await supabaseAdmin.from('schedule_events').delete().eq('id', data.id)
    return { success: true }
  })

const EMPTY_FORM = { day: 1, event_time: '', title: '', description: '', location: '' }

export const Route = createFileRoute('/admin/schedule')({
  loader: async () => {
    const { data, error } = await supabase.from('schedule_events').select('*').order('day').order('event_time')
    if (error) throw new Error(error.message)
    return { events: (data ?? []) as ScheduleEvent[] }
  },
  component: function AdminSchedulePage() {
    const { events: initial } = Route.useLoaderData()
    const [items, setItems] = useState<ScheduleEvent[]>(initial)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState<string | null>(null)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      await upsertEvent({ data: editId ? { ...form, id: editId } : form })
      setForm(EMPTY_FORM)
      setEditId(null)
      await router.invalidate()
    }

    return (
      <div>
        <h1 className="text-2xl font-serif text-burgundy-700 mb-6">Schedule</h1>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 mb-8 space-y-3">
          <h2 className="font-semibold text-gray-700">{editId ? 'Edit' : 'Add'} Event</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Day *</label>
              <input type="number" min={1} max={10} required value={form.day}
                onChange={e => setForm(p => ({ ...p, day: parseInt(e.target.value) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Time *</label>
              <input type="time" required value={form.event_time}
                onChange={e => setForm(p => ({ ...p, event_time: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <input placeholder="Title *" required value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Location" value={form.location}
            onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <textarea placeholder="Description" rows={2} value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button type="submit" className="bg-burgundy-700 text-ivory px-4 py-2 rounded-lg text-sm font-semibold hover:bg-burgundy-800">
              {editId ? 'Update' : 'Add Event'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm(EMPTY_FORM) }}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-2">
          {items.map(e => (
            <div key={e.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <span className="text-xs text-gray-400 w-10 shrink-0">Day {e.day}</span>
                <span className="text-xs font-mono text-burgundy-400 w-10 shrink-0">{e.event_time?.slice(0, 5)}</span>
                <span className="text-sm font-medium text-gray-800">{e.title}</span>
                {e.location && <span className="text-xs text-gray-400">{e.location}</span>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setEditId(e.id); setForm({ day: e.day, event_time: e.event_time, title: e.title, description: e.description ?? '', location: e.location ?? '' }) }}
                  className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Edit</button>
                <button onClick={async () => { await deleteEvent({ data: { id: e.id } }); setItems(p => p.filter(i => i.id !== e.id)) }}
                  className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-sm">No events yet.</p>}
        </div>
      </div>
    )
  },
})
