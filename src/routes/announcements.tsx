import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

interface Announcement {
  id: string; title: string; body: string; category?: string; pinned: boolean; published_at: string
}

export function formatAnnouncementLabel(a: Pick<Announcement, 'pinned' | 'category'>): string {
  if (a.pinned) return '📌 Pinned'
  return a.category ?? 'General'
}

export const Route = createFileRoute('/announcements')({
  loader: async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('pinned', { ascending: false })
      .order('published_at', { ascending: false })
    if (error) throw new Error(error.message)
    return { initial: (data ?? []) as Announcement[] }
  },
  component: function AnnouncementsPage() {
    const { initial } = Route.useLoaderData()
    const [announcements, setAnnouncements] = useState<Announcement[]>(initial)

    useEffect(() => {
      const channel = supabase
        .channel('announcements-feed')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
          setAnnouncements(prev => [payload.new as Announcement, ...prev])
        })
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }, [])

    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Announcements</h1>
        <div className="space-y-4">
          {announcements.map(a => (
            <div key={a.id} className={`bg-white border rounded-xl p-5 ${a.pinned ? 'border-burgundy-300' : 'border-burgundy-100'}`}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-serif font-bold text-burgundy-700">{a.title}</h2>
                <span className="text-xs bg-burgundy-50 text-burgundy-600 px-2 py-0.5 rounded-full shrink-0">
                  {formatAnnouncementLabel(a)}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-2">{a.body}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(a.published_at).toLocaleDateString()}</p>
            </div>
          ))}
          {announcements.length === 0 && <p className="text-gray-400">No announcements yet.</p>}
        </div>
      </div>
    )
  },
})
