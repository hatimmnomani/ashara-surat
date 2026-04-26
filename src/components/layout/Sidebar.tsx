import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useMemo, useRef } from 'react'
import { ChevronsLeft, ChevronsRight, LogOut, Menu, X } from 'lucide-react'
import ThemeToggle from '../ThemeToggle'
import { AlamMark } from '../ui/AlamMark'
import { TearDrop } from '../ui/TearDrop'
import { SidebarNavLink } from './SidebarNavLink'
import { adminNav, publicNav, type NavGroup } from './sidebarConfig'
import { useSidebarState } from '../../hooks/useSidebarState'

type Variant = 'public' | 'admin'

interface SidebarProps {
  variant: Variant
  onSignOut?: () => void | Promise<void>
}

function isRouteActive(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/'
  return pathname === to || pathname.startsWith(to + '/')
}

export function Sidebar({ variant, onSignOut }: SidebarProps) {
  const pathname = useRouterState({ select: s => s.location.pathname })
  const enabled =
    variant === 'admin'
      ? pathname.startsWith('/admin') && pathname !== '/admin/login'
      : !pathname.startsWith('/admin')
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen, isDesktop } = useSidebarState(enabled)
  const drawerRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  const groups: NavGroup[] = useMemo(
    () => (variant === 'admin' ? adminNav : publicNav),
    [variant],
  )

  // Close mobile drawer on route change.
  useEffect(() => {
    if (mobileOpen) setMobileOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Escape closes drawer; focus trap when open.
  useEffect(() => {
    if (!mobileOpen) return
    const prevFocus = document.activeElement as HTMLElement | null
    const node = drawerRef.current
    const firstLink = node?.querySelector<HTMLElement>('a,button')
    firstLink?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      prevFocus?.focus?.()
    }
  }, [mobileOpen, setMobileOpen])

  if (!enabled) return null

  const isAdmin = variant === 'admin'
  const drawerWidthClass = collapsed ? 'lg:w-16' : 'lg:w-64'

  const brandBlock = (
    <div className="flex flex-col items-center gap-2 px-3 py-5">
      {collapsed && isDesktop ? (
        <TearDrop size={26} glow title="Ashara Surat emblem" />
      ) : (
        <>
          <AlamMark size="md" />
          <div className="text-center leading-tight">
            <p className="font-serif text-sm text-[var(--sea-ink)]">Ashara Surat</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
              1447H
            </p>
          </div>
          {isAdmin && (
            <span className="mt-1 rounded-full bg-[var(--tear)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ivory">
              Admin
            </span>
          )}
        </>
      )}
    </div>
  )

  const navSections = (
    <nav aria-label={isAdmin ? 'Admin' : 'Main'} className="flex-1 overflow-y-auto px-2 pb-4">
      {groups.map(group => (
        <div key={group.heading} className="mt-4 first:mt-0">
          <h2
            className={[
              'px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]',
              collapsed && isDesktop ? 'sr-only' : '',
            ].join(' ')}
          >
            {group.heading}
          </h2>
          <ul className="space-y-0.5">
            {group.items.map(item => (
              <li key={item.to}>
                <SidebarNavLink
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  active={isRouteActive(pathname, item.to)}
                  collapsed={collapsed && isDesktop}
                  onNavigate={() => {
                    if (!isDesktop) setMobileOpen(false)
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )

  const footer = (
    <div
      className={[
        'flex shrink-0 border-t border-[var(--line)] px-3 py-3',
        collapsed && isDesktop ? 'flex-col items-center gap-2' : 'items-center gap-2',
      ].join(' ')}
    >
      {!(collapsed && isDesktop) && (
        <>
          <ThemeToggle />
          {isAdmin ? (
            <button
              type="button"
              onClick={onSignOut}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] hover:-translate-y-0.5 transition"
            >
              <LogOut size={14} aria-hidden="true" />
              Sign out
            </button>
          ) : (
            <Link
              to="/admin/login"
              className="ml-auto text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
            >
              Admin
            </Link>
          )}
        </>
      )}
      {isDesktop && (
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-controls="site-sidebar"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={[
            'rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] p-1.5 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] transition',
            collapsed ? '' : 'ml-auto',
          ].join(' ')}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      )}
      {isAdmin && collapsed && isDesktop && (
        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out"
          title="Sign out"
          className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] p-1.5 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] transition"
        >
          <LogOut size={14} />
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg lg:hidden">
        <button
          ref={hamburgerRef}
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          aria-controls="site-sidebar"
          aria-expanded={mobileOpen}
          className="rounded-lg p-2 text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)]"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <Link to="/" className="flex items-center gap-2 text-[var(--sea-ink)] no-underline">
          <TearDrop size={20} />
          <span className="font-serif text-sm">Ashara Surat {isAdmin ? '· Admin' : ''}</span>
        </Link>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && !isDesktop && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        id="site-sidebar"
        ref={drawerRef}
        role={mobileOpen && !isDesktop ? 'dialog' : undefined}
        aria-modal={mobileOpen && !isDesktop ? true : undefined}
        aria-label={isAdmin ? 'Admin navigation' : 'Site navigation'}
        className={[
          'fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--line)] bg-[var(--surface-strong)] backdrop-blur-lg transition-all duration-220 ease-out',
          // Desktop
          'lg:flex',
          drawerWidthClass,
          // Mobile: slide in/out
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between lg:justify-center">
          {brandBlock}
          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="mr-3 rounded-lg p-2 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)] lg:hidden"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {navSections}
        {footer}
      </aside>
    </>
  )
}
