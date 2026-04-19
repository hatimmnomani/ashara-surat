import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

interface TransportRoute { id: string; route_name: string; stops?: string[]; timings?: string; notes?: string }

export const Route = createFileRoute('/transport')({
  loader: async () => {
    const { data, error } = await supabase.from('transport_routes').select('*').order('route_name')
    if (error) throw new Error(error.message)
    return { routes: (data ?? []) as TransportRoute[] }
  },
  component: function TransportPage() {
    const { routes } = Route.useLoaderData()
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Transport & Routes</h1>
        <div className="grid gap-4">
          {routes.map(r => (
            <div key={r.id} className="bg-white border border-burgundy-100 rounded-xl p-5">
              <h2 className="font-serif font-bold text-burgundy-700">{r.route_name}</h2>
              {r.stops?.length && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Stops</p>
                  <div className="flex flex-wrap gap-1">
                    {r.stops.map(s => (
                      <span key={s} className="bg-burgundy-50 text-burgundy-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {r.timings && <p className="text-sm text-gray-600 mt-2">🕐 {r.timings}</p>}
              {r.notes && <p className="text-sm text-gray-400 mt-1 italic">{r.notes}</p>}
            </div>
          ))}
          {routes.length === 0 && <p className="text-gray-400">Transport details will be published soon.</p>}
        </div>
      </div>
    )
  },
})
