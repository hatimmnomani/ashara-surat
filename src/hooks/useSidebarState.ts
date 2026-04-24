import { useCallback, useEffect, useState } from 'react'

const COLLAPSED_KEY = 'sidebar:collapsed'
const DESKTOP_QUERY = '(min-width: 1024px)'
const WIDTH_EXPANDED = '16rem'
const WIDTH_COLLAPSED = '4rem'
const MOBILE_TOP_BAR = '3.5rem'

function readStoredCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(COLLAPSED_KEY) === '1'
}

export interface SidebarState {
  collapsed: boolean
  toggleCollapsed: () => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  isDesktop: boolean
}

/**
 * Tracks sidebar expanded/collapsed + mobile drawer state, persists collapsed
 * preference, and writes `--sidebar-w` / `--sidebar-top` CSS variables on the
 * document root so the app shell can reserve space without prop-drilling.
 *
 * Pass `enabled: false` on routes that shouldn't render a sidebar — the hook
 * will clear the CSS variables so the main content reclaims the full width.
 */
export function useSidebarState(enabled: boolean = true): SidebarState {
  const [collapsed, setCollapsed] = useState<boolean>(() => readStoredCollapsed())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia(DESKTOP_QUERY).matches
  })

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY)
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    setIsDesktop(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    // Only the enabled sidebar writes CSS vars — avoids a race when the other
    // variant is mounted briefly during route transitions. The defaults in
    // :root keep layout sane if no sidebar is enabled.
    if (!enabled) return
    const root = document.documentElement
    if (isDesktop) {
      root.style.setProperty('--sidebar-w', collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED)
      root.style.setProperty('--sidebar-top', '0px')
    } else {
      root.style.setProperty('--sidebar-w', '0px')
      root.style.setProperty('--sidebar-top', MOBILE_TOP_BAR)
    }
  }, [collapsed, isDesktop, enabled])

  useEffect(() => {
    if (isDesktop && mobileOpen) setMobileOpen(false)
  }, [isDesktop, mobileOpen])

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev
      try {
        window.localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return { collapsed, toggleCollapsed, mobileOpen, setMobileOpen, isDesktop }
}
