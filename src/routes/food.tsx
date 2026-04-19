import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

interface FoodZone { id: string; zone_name: string; location?: string; serving_times?: string; capacity?: number }

export const Route = createFileRoute('/food')({
  loader: async () => {
    const { data } = await supabase.from('food_zones').select('*').order('zone_name')
    return { zones: (data ?? []) as FoodZone[] }
  },
  component: function FoodPage() {
    const { zones } = Route.useLoaderData()
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-2">Food & Thaal</h1>
        <p className="text-gray-500 mb-6">Faiz al-Mawaid al-Burhaniyah zones and serving times.</p>
        <div className="grid gap-4">
          {zones.map(z => (
            <div key={z.id} className="bg-white border border-burgundy-100 rounded-xl p-5">
              <h2 className="font-serif font-bold text-burgundy-700">{z.zone_name}</h2>
              {z.location && <p className="text-sm text-gray-500 mt-1">📍 {z.location}</p>}
              {z.serving_times && <p className="text-sm text-gray-600 mt-1">🕐 {z.serving_times}</p>}
              {z.capacity && <p className="text-sm text-gray-400 mt-1">Capacity: {z.capacity}</p>}
            </div>
          ))}
          {zones.length === 0 && <p className="text-gray-400">Food zone details will be published soon.</p>}
        </div>
      </div>
    )
  },
})
