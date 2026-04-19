import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

interface Building { id: string; building: string; zone?: string; floor?: string; capacity?: number; contact_person?: string }

export const Route = createFileRoute('/accommodation')({
  loader: async () => {
    const { data, error } = await supabase.from('accommodation').select('*').order('zone')
    if (error) throw new Error(error.message)
    return { buildings: (data ?? []) as Building[] }
  },
  component: function AccommodationPage() {
    const { buildings } = Route.useLoaderData()
    const byZone = buildings.reduce((acc: Record<string, Building[]>, b) => {
      const zone = b.zone ?? 'General'
      acc[zone] = [...(acc[zone] ?? []), b]
      return acc
    }, {})
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Accommodation</h1>
        {Object.entries(byZone).map(([zone, bldgs]) => (
          <div key={zone} className="mb-8">
            <h2 className="font-bold text-burgundy-600 mb-3 border-b border-burgundy-100 pb-1">Zone: {zone}</h2>
            <div className="grid gap-3">
              {bldgs.map(b => (
                <div key={b.id} className="bg-white border border-burgundy-100 rounded-xl p-4">
                  <p className="font-semibold text-gray-800">{b.building}</p>
                  {b.floor && <p className="text-sm text-gray-500">Floor: {b.floor}</p>}
                  {b.capacity && <p className="text-sm text-gray-500">Capacity: {b.capacity}</p>}
                  {b.contact_person && <p className="text-sm text-burgundy-500 mt-1">Contact: {b.contact_person}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
        {buildings.length === 0 && <p className="text-gray-400">Accommodation details will be published soon.</p>}
      </div>
    )
  },
})
