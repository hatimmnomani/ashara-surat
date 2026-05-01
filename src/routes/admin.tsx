import { createFileRoute, Outlet, redirect, useNavigate, useRouterState } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { Sidebar } from '../components/layout/Sidebar'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    if (location.pathname === '/admin/login') return
    if (typeof window === 'undefined') return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/admin/login' })
  },
  component: AdminLayout,
})

function AdminLayout() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: s => s.location.pathname })

  async function handleSignOut() {
    await supabase.auth.signOut()
    await navigate({ to: '/admin/login' })
  }

  if (pathname === '/admin/login') {
    return <Outlet />
  }

  return (
    <>
      <Sidebar variant="admin" onSignOut={handleSignOut} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </div>
    </>
  )
}
