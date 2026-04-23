import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'
import { AlamMark } from '../../components/ui/AlamMark'

export const Route = createFileRoute('/admin/login')({
  component: function AdminLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleLogin(e: React.FormEvent) {
      e.preventDefault()
      setError('')
      setLoading(true)
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
        if (authError) {
          setError(authError.message)
          return
        }
        if (!data.session) {
          setError('Could not establish a session. Please try again.')
          return
        }
        await navigate({ to: '/admin/announcements' })
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="island-shell rounded-2xl p-8 w-full max-w-sm space-y-4"
        >
          <div className="flex flex-col items-center gap-3 pb-2">
            <AlamMark size="sm" />
            <h1 className="font-serif text-2xl text-[var(--sea-ink)] text-center">Admin Login</h1>
          </div>
          <input
            type="email"
            placeholder="Email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            className="w-full border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300 disabled:opacity-60"
          />
          <input
            type="password"
            placeholder="Password"
            required
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            className="w-full border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300 disabled:opacity-60"
          />
          {error && (
            <p role="alert" className="text-sm text-[var(--color-tear-red-600)]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-burgundy-700 text-ivory py-2.5 rounded-lg font-semibold hover:bg-burgundy-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    )
  },
})
