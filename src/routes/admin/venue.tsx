import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { supabaseAdmin, supabase } from '../../lib/supabase'
import { useState } from 'react'

interface Venue { id: string; name: string; zone?: string; address?: string; map_url?: string; description?: string; sort_order: number }

const upsertVenue = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { id?: string; name: string; zone?: string; address?: string; map_url?: string; description?: string; sort_order: number })
  .handler(async ({ data }) => {
    const { id, ...fields } = data
    if (id) {
      await supabaseAdmin.from('venues').update(fields).eq('id', id)
    } else {
      await supabaseAdmin.from('venues').insert(fields)
    }
    return { success: true }
  })

const deleteVenue = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { id: string })
  .handler(async ({ data }) => {
    await supabaseAdmin.from('venues').delete().eq('id', data.id)
    return { success: true }
  })

const EMPTY_FORM = { name: '', zone: '', address: '', map_url: '', description: '', sort_order: 0 }

export const Route = createFileRoute('/admin/venue')({
  loader: async () => {
    const { data, error } = await supabase.from('venues').select('*').order('sort_order').order('name')
    if (error) throw new Error(error.message)
    return { venues: (data ?? []) as Venue[] }
  },
  component: function AdminVenuePage() {
    const { venues: initial } = Route.useLoaderData()
    const [items, setItems] = useState<Venue[]>(initial)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      await upsertVenue({ data: editId ? { ...form, id: editId } : form })
      setForm(EMPTY_FORM)
      setEditId(null)
      window.location.reload()
    }

    return (
      <div>
        <h1 className="text-2xl font-serif text-burgundy-700 mb-6">Venues & Maps</h1>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 mb-8 space-y-3">
          <h2 className="font-semibold text-gray-700">{editId ? 'Edit' : 'Add'} Venue</h2>
          <input placeholder="Name *" required value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Zone</label>
              <input placeholder="e.g. Central" value={form.zone}
                onChange={e => setForm(p => ({ ...p, zone: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Sort Order</label>
              <input type="number" value={form.sort_order}
                onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <input placeholder="Address" value={form.address}
            onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Map URL (Google Maps link)" value={form.map_url}
            onChange={e => setForm(p => ({ ...p, map_url: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <textarea placeholder="Description (optional)" rows={2} value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button type="submit" className="bg-burgundy-700 text-ivory px-4 py-2 rounded-lg text-sm font-semibold hover:bg-burgundy-800">
              {editId ? 'Update' : 'Add Venue'}
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
          {items.map(v => (
            <div key={v.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
              <div className="flex gap-3 items-center min-w-0">
                <span className="text-sm font-medium text-gray-800 truncate">{v.name}</span>
                {v.zone && <span className="text-xs text-gray-400 shrink-0">{v.zone}</span>}
                {v.address && <span className="text-xs text-gray-400 truncate hidden sm:block">{v.address}</span>}
              </div>
              <div className="flex gap-2 shrink-0 ml-3">
                <button onClick={() => {
                  setEditId(v.id)
                  setForm({ name: v.name, zone: v.zone ?? '', address: v.address ?? '', map_url: v.map_url ?? '', description: v.description ?? '', sort_order: v.sort_order })
                }} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Edit</button>
                <button onClick={async () => { await deleteVenue({ data: { id: v.id } }); setItems(p => p.filter(i => i.id !== v.id)) }}
                  className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-sm">No venues yet.</p>}
        </div>
      </div>
    )
  },
})
