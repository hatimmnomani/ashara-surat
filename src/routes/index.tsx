import { createFileRoute } from '@tanstack/react-router'
import { CountdownTimer } from '../components/ui/CountdownTimer'
import { ModuleCard } from '../components/ui/ModuleCard'
import { AlamMark } from '../components/ui/AlamMark'
import { HeroCarousel, type HeroSlide } from '../components/ui/HeroCarousel'
import { TeardropFrieze } from '../components/ui/TeardropFrieze'
import { supabase } from '../lib/supabase'

const MODULES = [
  { icon: '📅', title: 'Schedule',      description: 'Waaz timings & daily Majlis',    to: '/schedule' },
  { icon: '🕌', title: 'Venue & Maps',  description: 'Locations & zone layouts',        to: '/venue' },
  { icon: '🏠', title: 'Accommodation', description: 'Buildings & zone info',           to: '/accommodation' },
  { icon: '🚌', title: 'Transport',     description: 'Bus routes & shuttles',           to: '/transport' },
  { icon: '🍽️', title: 'Food & Thaal', description: 'FMB zones & timings',            to: '/food' },
  { icon: '🙋', title: 'Volunteer',     description: 'Sign up to serve',                to: '/volunteer' },
  { icon: '📢', title: 'Announcements', description: 'Latest news & notices',           to: '/announcements' },
  { icon: '📸', title: 'Gallery',       description: 'Photos & memories',               to: '/gallery' },
  { icon: '📄', title: 'Documents',     description: 'Guides & downloadable forms',     to: '/documents' },
  { icon: 'ℹ️', title: 'About Surat',  description: 'City guide for visitors',          to: '/about-surat' },
  { icon: '💬', title: 'Helpdesk',      description: 'AI chat support',                 to: '/helpdesk' },
]

const HERO_SLIDES: HeroSlide[] = [
  {
    src: '/d.webp',
    alt: 'Mumineen gathered for waaz inside the masjid',
    caption: 'Ashara Mubaraka 1448H · Surat',
  },
  {
    src: '/1447-logo-320x320.webp',
    alt: 'Official Ashara Mubaraka 1448H emblem',
    caption: 'Niyaaz · 1448H',
  },
  {
    src: '/1446-640x364.webp',
    alt: 'Ashara Mubaraka 1446H Karachi commemorative panel',
    caption: 'In remembrance · 1446H',
  },
]

export const Route = createFileRoute('/')({
  loader: async () => {
    const { data } = await supabase
      .from('announcements')
      .select('id, title, body')
      .eq('pinned', true)
      .order('published_at', { ascending: false })
      .limit(3)
    return { pinned: data ?? [] }
  },
  component: function HomePage() {
    const { pinned } = Route.useLoaderData()
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col items-center text-center mb-8">
          <AlamMark size="lg" className="mb-5" />
          <h1 className="text-4xl font-serif font-bold text-burgundy-700">Ashara Mubaraka</h1>
          <p className="text-burgundy-400 uppercase tracking-widest text-sm mt-1">Surat • 1448H</p>
        </div>

        <TeardropFrieze className="mb-8 -mx-4 sm:mx-0 sm:rounded-lg overflow-hidden" height={48} />

        <HeroCarousel slides={HERO_SLIDES} className="mb-10" />

        <div className="flex justify-center mb-10">
          <CountdownTimer />
        </div>

        {pinned.length > 0 && (
          <div className="mb-8 space-y-2">
            {(pinned as { id: string; title: string; body: string }[]).map(a => (
              <div key={a.id} className="bg-burgundy-50 border-l-4 border-burgundy-400 px-4 py-3 rounded-r-lg">
                <p className="font-semibold text-burgundy-700 text-sm">{a.title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{a.body}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {MODULES.map(m => <ModuleCard key={m.to} {...m} />)}
        </div>

        <TeardropFrieze className="mt-12 -mx-4 sm:mx-0 sm:rounded-lg overflow-hidden" height={36} />
      </div>
    )
  },
})
