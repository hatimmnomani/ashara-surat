export interface SessionWindow {
  message_count: number
  window_started_at: string
}

const WINDOW_MS = 60 * 60 * 1000

export function isRateLimited(session: SessionWindow, limit: number): boolean {
  const age = Date.now() - new Date(session.window_started_at).getTime()
  if (age > WINDOW_MS) return false
  return session.message_count >= limit
}

export function incrementMessageCount(session: SessionWindow): SessionWindow {
  const age = Date.now() - new Date(session.window_started_at).getTime()
  if (age > WINDOW_MS) {
    return { message_count: 1, window_started_at: new Date().toISOString() }
  }
  return { ...session, message_count: session.message_count + 1 }
}
