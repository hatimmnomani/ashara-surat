import { Link } from '@tanstack/react-router'

const links = [
  { to: '/schedule', label: 'Schedule' },
  { to: '/venue', label: 'Venue' },
  { to: '/accommodation', label: 'Stay' },
  { to: '/transport', label: 'Travel' },
  { to: '/food', label: 'Food' },
  { to: '/announcements', label: 'News' },
  { to: '/helpdesk', label: 'Help' },
]

export function Nav() {
  return (
    <nav className="bg-burgundy-700 text-ivory px-6 py-3 flex items-center justify-between flex-wrap gap-3">
      <Link to="/" className="font-serif font-bold text-lg text-ivory hover:text-burgundy-100">
        🕌 Ashara Surat 1447H
      </Link>
      <div className="flex flex-wrap gap-4 text-sm">
        {links.map(l => (
          <Link key={l.to} to={l.to} className="text-burgundy-100 hover:text-ivory transition-colors">
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
