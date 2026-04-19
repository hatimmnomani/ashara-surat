import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

interface ScheduleEvent {
  id: string; day: number; event_time: string; title: string; description?: string; location?: string
}

export const Route = createFileRoute('/schedule')({
  loader: async () => {
    const { data } = await supabase
      .from('schedule_events')
      .select('*')
      .order('day', { ascending: true })
      .order('event_time', { ascending: true })
    return { events: (data ?? []) as ScheduleEvent[] }
  },
  component: function SchedulePage() {
    const { events } = Route.useLoaderData()
    const byDay = events.reduce((acc: Record<number, ScheduleEvent[]>, e) => {
      acc[e.day] = [...(acc[e.day] ?? []), e]
      return acc
    }, {})
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Schedule</h1>
        {Object.entries(byDay).map(([day, dayEvents]) => (
          <div key={day} className="mb-8">
            <h2 className="text-lg font-bold text-burgundy-600 mb-3 border-b border-burgundy-100 pb-1">Day {day}</h2>
            <div className="space-y-3">
              {dayEvents.map(e => (
                <div key={e.id} className="flex gap-4 items-start">
                  <span className="text-sm font-mono text-burgundy-400 w-16 shrink-0">{e.event_time.slice(0, 5)}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{e.title}</p>
                    {e.description && <p className="text-sm text-gray-500">{e.description}</p>}
                    {e.location && <p className="text-xs text-burgundy-400 mt-0.5">📍 {e.location}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-gray-400">Schedule will be published soon.</p>}
      </div>
    )
  },
})
