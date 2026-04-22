import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { supabaseAdmin } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'

interface Announcement { id: string; title: string; body: string; category?: string; pinned: boolean }

const upsertAnnouncement = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { id?: string; title: string; body: string; category: string; pinned: boolean })
  .handler(async ({ data }) => {
    const { id, ...fields } = data
    if (id) {
      await supabaseAdmin.from('announcements').update(fields).eq('id', id)
    } else {
      await supabaseAdmin.from('announcements').insert(fields)
    }
    return { success: true }
  })

const deleteAnnouncement = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { id: string })
  .handler(async ({ data }) => {
    await supabaseAdmin.from('announcements').delete().eq('id', data.id)
    return { success: true }
  })

const EMPTY_FORM = { title: '', body: '', category: '', pinned: false }

export const Route = createFileRoute('/admin/announcements')({
  loader: async () => {
    const { data, error } = await supabase.from('announcements').select('*').order('published_at', { ascending: false })
    if (error) throw new Error(error.message)
    return { announcements: (data ?? []) as Announcement[] }
  },
  component: function AdminAnnouncementsPage() {
    const { announcements: initial } = Route.useLoaderData()
    const [items, setItems] = useState<Announcement[]>(initial)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      await upsertAnnouncement({ data: editId ? { ...form, id: editId } : form })
      setForm(EMPTY_FORM)
      setEditId(null)
      window.location.reload()
    }

    function startEdit(a: Announcement) {
      setEditId(a.id)
      setForm({ title: a.title, body: a.body, category: a.category ?? '', pinned: a.pinned })
    }

    return (
      <div>
        <h1 className="text-2xl font-serif text-burgundy-700 mb-6">Announcements</h1>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 mb-8 space-y-3">
          <h2 className="font-semibold text-gray-700">{editId ? 'Edit' : 'New'} Announcement</h2>
          <input placeholder="Title *" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <textarea placeholder="Body *" required rows={3} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Category (e.g. Transport, General)" value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.pinned} onChange={e => setForm(p => ({ ...p, pinned: e.target.checked }))} />
            Pin to homepage
          </label>
          <div className="flex gap-2">
            <button type="submit" className="bg-burgundy-700 text-ivory px-4 py-2 rounded-lg text-sm font-semibold hover:bg-burgundy-800">
              {editId ? 'Update' : 'Publish'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm(EMPTY_FORM) }}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-3">
          {items.map(a => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-800">{a.title}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.body}</p>
                <div className="flex gap-2 mt-1">
                  {a.pinned && <span className="text-xs bg-burgundy-50 text-burgundy-600 px-2 py-0.5 rounded-full">Pinned</span>}
                  {a.category && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{a.category}</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(a)} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Edit</button>
                <button onClick={async () => { await deleteAnnouncement({ data: { id: a.id } }); setItems(p => p.filter(i => i.id !== a.id)) }}
                  className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-sm">No announcements yet.</p>}
        </div>
      </div>
    )
  },
})
