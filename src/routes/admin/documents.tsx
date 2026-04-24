import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { supabaseAdmin } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { deleteFromR2 } from '../../lib/r2'
import { FileUpload } from '../../components/admin/FileUpload'
import { useState } from 'react'
import { TearDrop } from '../../components/ui/TearDrop'

interface Doc { id: string; name: string; category?: string; file_url: string; r2_key?: string }

const addDocument = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { name: string; category: string; file_url: string; r2_key: string })
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from('documents').insert({
      name: data.name,
      category: data.category || null,
      file_url: data.file_url,
      r2_key: data.r2_key || null,
    })
    if (error) throw new Error(error.message)
    return { success: true }
  })

const deleteDocument = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { id: string; r2_key?: string })
  .handler(async ({ data }) => {
    if (data.r2_key) {
      try { await deleteFromR2(data.r2_key) } catch { /* ignore */ }
    }
    const { error } = await supabaseAdmin.from('documents').delete().eq('id', data.id)
    if (error) throw new Error(error.message)
    return { success: true }
  })

export const Route = createFileRoute('/admin/documents')({
  loader: async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false })
    if (error) throw new Error(error.message)
    return { docs: (data ?? []) as Doc[] }
  },
  component: function AdminDocumentsPage() {
    const { docs: initial } = Route.useLoaderData()
    const [docs, setDocs] = useState<Doc[]>(initial)
    const [pending, setPending] = useState<{ url: string; key: string; name: string } | null>(null)
    const [docName, setDocName] = useState('')
    const [category, setCategory] = useState('')

    async function handleAdd() {
      if (!pending) return
      const name = docName || pending.name
      await addDocument({ data: { name, category, file_url: pending.url, r2_key: pending.key } })
      setDocs(prev => [{ id: crypto.randomUUID(), name, category, file_url: pending.url }, ...prev])
      setPending(null)
      setDocName('')
      setCategory('')
    }

    async function handleDelete(doc: Doc) {
      await deleteDocument({ data: { id: doc.id, r2_key: doc.r2_key } })
      setDocs(prev => prev.filter(d => d.id !== doc.id))
    }

    return (
      <div>
        <h1 className="text-2xl font-serif text-burgundy-700 mb-6">Documents</h1>

        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 space-y-3">
          <h2 className="font-semibold text-gray-700">Upload Document</h2>
          <FileUpload folder="documents" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            label="Upload PDF, image, or Office file"
            onUploaded={(url, key) => {
              const name = key.split('/').pop() ?? key
              setPending({ url, key, name })
              setDocName(name)
            }} />
          {pending && (
            <>
              <p className="text-sm text-gray-500">Uploaded: <a href={pending.url} target="_blank" rel="noreferrer" className="text-burgundy-600 underline">{pending.name}</a></p>
              <input placeholder="Document name *" required value={docName}
                onChange={e => setDocName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Category (e.g. Maps, Guides, Forms)" value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={!docName}
                  className="bg-burgundy-700 text-ivory px-4 py-2 rounded-lg text-sm font-semibold hover:bg-burgundy-800 disabled:opacity-50">
                  Save Document
                </button>
                <button onClick={() => setPending(null)}
                  className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        <div className="space-y-2">
          {docs.map(d => (
            <div key={d.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <a href={d.file_url} target="_blank" rel="noreferrer"
                  className="text-sm font-medium text-burgundy-700 hover:underline">📄 {d.name}</a>
                {d.category && <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{d.category}</span>}
              </div>
              <button onClick={() => handleDelete(d)}
                className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Delete</button>
            </div>
          ))}
          {docs.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-10 text-[var(--sea-ink-soft)]">
              <TearDrop size={40} muted />
              <p className="text-sm">No documents yet.</p>
            </div>
          )}
        </div>
      </div>
    )
  },
})
