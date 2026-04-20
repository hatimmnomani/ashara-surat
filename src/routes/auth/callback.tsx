import { createFileRoute, redirect } from '@tanstack/react-router'

// Placeholder for ITS OneLogin SSO — activate when ITS_AUTH_ENABLED=true and PassKey received.
// Implementation steps (future):
//   1. Read encrypted query string params from ITS52.com redirect
//   2. Server-side: call OneLogin_Decrypt(PassKey, encryptedData) — PassKey from ITS team
//   3. Validate token, extract ITSID / Name / Jamaat / JamiaatID
//   4. Store decoded user in Supabase session
//   5. Redirect to originally requested protected route

export const Route = createFileRoute('/auth/callback')({
  loader: async () => {
    const authEnabled = import.meta.env.VITE_ITS_AUTH_ENABLED === 'true'
    if (!authEnabled) throw redirect({ to: '/' })
    return {}
  },
  component: function AuthCallbackPage() {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-gray-500 font-serif">Completing sign in...</p>
      </div>
    )
  },
})
