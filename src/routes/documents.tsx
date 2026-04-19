import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

interface Doc { id: string; name: string; category?: string; file_url: string }

export const Route = createFileRoute('/documents')({
  loader: async () => {
    const { data, error } = await supabase.from('documents').select('*').order('category').order('name')
    if (error) throw new Error(error.message)
    return { docs: (data ?? []) as Doc[] }
  },
  component: function DocumentsPage() {
    const { docs } = Route.useLoaderData()
    const byCategory = docs.reduce((acc: Record<string, Doc[]>, d) => {
      const cat = d.category ?? 'General'
      acc[cat] = [...(acc[cat] ?? []), d]
      return acc
    }, {})
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Documents & Resources</h1>
        {Object.entries(byCategory).map(([cat, catDocs]) => (
          <div key={cat} className="mb-6">
            <h2 className="font-bold text-burgundy-600 mb-3">{cat}</h2>
            <div className="space-y-2">
              {catDocs.map(d => (
                <a key={d.id} href={d.file_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 bg-white border border-burgundy-100 rounded-lg px-4 py-3 hover:border-burgundy-300 transition-colors">
                  <span className="text-xl">📄</span>
                  <span className="text-sm font-medium text-gray-700">{d.name}</span>
                  <span className="ml-auto text-xs text-burgundy-400">Download →</span>
                </a>
              ))}
            </div>
          </div>
        ))}
        {docs.length === 0 && <p className="text-gray-400">Documents will be uploaded soon.</p>}
      </div>
    )
  },
})
