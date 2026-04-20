import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'

export const Route = createFileRoute('/admin/login')({
  component: function AdminLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    async function handleLogin(e: React.FormEvent) {
      e.preventDefault()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) { setError('Invalid credentials'); return }
      navigate({ to: '/admin/announcements' })
    }

    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white border border-burgundy-100 rounded-2xl p-8 w-full max-w-sm space-y-4 shadow-md">
          <h1 className="font-serif text-2xl text-burgundy-700 text-center mb-2">Admin Login</h1>
          <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300" />
          <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit"
            className="w-full bg-burgundy-700 text-ivory py-2.5 rounded-lg font-semibold hover:bg-burgundy-800 transition-colors">
            Sign In
          </button>
        </form>
      </div>
    )
  },
})
