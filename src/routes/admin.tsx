import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    if (location.pathname === '/admin/login') return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/admin/login' })
  },
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-burgundy-800 text-ivory px-6 py-3 flex items-center gap-6">
        <span className="font-bold font-serif">Admin Panel</span>
        <a href="/admin/announcements" className="text-sm text-burgundy-200 hover:text-ivory transition-colors">Announcements</a>
        <a href="/admin/schedule" className="text-sm text-burgundy-200 hover:text-ivory transition-colors">Schedule</a>
        <a href="/admin/tickets" className="text-sm text-burgundy-200 hover:text-ivory transition-colors">Tickets</a>
        <a href="/" className="text-sm text-burgundy-400 hover:text-ivory ml-auto transition-colors">← View Site</a>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  ),
})
