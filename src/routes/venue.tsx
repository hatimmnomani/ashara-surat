import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

interface Venue { id: string; name: string; zone?: string; address?: string; map_url?: string; description?: string; sort_order: number }

export const Route = createFileRoute('/venue')({
  loader: async () => {
    const { data, error } = await supabase.from('venues').select('*').order('sort_order').order('name')
    if (error) throw new Error(error.message)
    return { venues: (data ?? []) as Venue[] }
  },
  component: function VenuePage() {
    const { venues } = Route.useLoaderData()
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Venue & Maps</h1>
        <div className="grid gap-4">
          {venues.map(v => (
            <div key={v.id} className="bg-white border border-burgundy-100 rounded-xl p-5">
              <h2 className="font-serif font-bold text-burgundy-700 text-lg">{v.name}</h2>
              {v.zone && <p className="text-sm text-gray-500 mt-1">Zone: {v.zone}</p>}
              {v.address && <p className="text-sm text-gray-500">{v.address}</p>}
              {v.description && <p className="text-sm text-gray-600 mt-2">{v.description}</p>}
              {v.map_url && (
                <a href={v.map_url} target="_blank" rel="noreferrer"
                  className="inline-block mt-3 text-sm bg-burgundy-700 text-ivory px-4 py-1.5 rounded-lg hover:bg-burgundy-800 transition-colors">
                  Open in Maps →
                </a>
              )}
            </div>
          ))}
          {venues.length === 0 && <p className="text-gray-400">Venue details will be published soon.</p>}
        </div>
      </div>
    )
  },
})
