import {
  BedDouble,
  Bus,
  CalendarDays,
  FileText,
  HandHeart,
  Home,
  Images,
  Info,
  Landmark,
  LifeBuoy,
  MapPin,
  Megaphone,
  Ticket,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export interface NavGroup {
  heading: string
  items: NavItem[]
}

export const publicNav: NavGroup[] = [
  {
    heading: 'Home',
    items: [{ to: '/', label: 'Home', icon: Home }],
  },
  {
    heading: 'Event',
    items: [
      { to: '/schedule', label: 'Schedule', icon: CalendarDays },
      { to: '/venue', label: 'Venue & Maps', icon: MapPin },
      { to: '/announcements', label: 'Announcements', icon: Megaphone },
    ],
  },
  {
    heading: 'Logistics',
    items: [
      { to: '/accommodation', label: 'Accommodation', icon: BedDouble },
      { to: '/transport', label: 'Transport', icon: Bus },
      { to: '/food', label: 'Food & Thaal', icon: UtensilsCrossed },
    ],
  },
  {
    heading: 'Resources',
    items: [
      { to: '/gallery', label: 'Gallery', icon: Images },
      { to: '/documents', label: 'Documents', icon: FileText },
      { to: '/about-surat', label: 'About Surat', icon: Landmark },
      { to: '/about', label: 'About', icon: Info },
    ],
  },
  {
    heading: 'Support',
    items: [
      { to: '/helpdesk', label: 'Helpdesk', icon: LifeBuoy },
      { to: '/volunteer', label: 'Volunteer', icon: HandHeart },
    ],
  },
]

export const adminNav: NavGroup[] = [
  {
    heading: 'Content',
    items: [
      { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
      { to: '/admin/schedule', label: 'Schedule', icon: CalendarDays },
      { to: '/admin/venue', label: 'Venues', icon: MapPin },
      { to: '/admin/documents', label: 'Documents', icon: FileText },
      { to: '/admin/gallery', label: 'Gallery', icon: Images },
    ],
  },
  {
    heading: 'Operations',
    items: [{ to: '/admin/tickets', label: 'Tickets', icon: Ticket }],
  },
]
