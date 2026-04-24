import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { TearDrop } from '../ui/TearDrop'

interface SidebarNavLinkProps {
  to: string
  label: string
  icon: LucideIcon
  active: boolean
  collapsed: boolean
  onNavigate?: () => void
}

export function SidebarNavLink({
  to,
  label,
  icon: Icon,
  active,
  collapsed,
  onNavigate,
}: SidebarNavLinkProps) {
  const base =
    'group relative flex items-center rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-burgundy-400'
  const spacing = collapsed ? 'justify-center h-11 w-11 mx-auto' : 'gap-3 px-3 py-2'
  const tone = active
    ? 'text-[var(--sea-ink)] bg-[var(--link-bg-hover)]'
    : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)]'

  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? label : undefined}
      className={[base, spacing, tone].join(' ')}
    >
      {active && !collapsed && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 flex items-center"
        >
          <TearDrop size={12} />
        </span>
      )}
      <Icon
        size={collapsed ? 20 : 18}
        strokeWidth={active ? 2.25 : 1.8}
        className={active ? 'text-[var(--tear)]' : ''}
        aria-hidden="true"
      />
      <span className={collapsed ? 'sr-only' : 'truncate'}>{label}</span>
    </Link>
  )
}
