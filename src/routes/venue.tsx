import { createFileRoute } from '@tanstack/react-router'

const VENUES = [
  { name: 'Saifee Masjid', zone: 'Central', address: 'Salabatpura, Surat', mapUrl: 'https://maps.google.com/?q=Saifee+Masjid+Surat' },
  { name: 'Burhani Masjid', zone: 'North', address: 'Nanpura, Surat', mapUrl: 'https://maps.google.com/?q=Burhani+Masjid+Surat' },
]

export const Route = createFileRoute('/venue')({
  component: function VenuePage() {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Venue & Maps</h1>
        <div className="grid gap-4">
          {VENUES.map(v => (
            <div key={v.name} className="bg-white border border-burgundy-100 rounded-xl p-5">
              <h2 className="font-serif font-bold text-burgundy-700 text-lg">{v.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Zone: {v.zone}</p>
              <p className="text-sm text-gray-500">{v.address}</p>
              <a href={v.mapUrl} target="_blank" rel="noreferrer"
                className="inline-block mt-3 text-sm bg-burgundy-700 text-ivory px-4 py-1.5 rounded-lg hover:bg-burgundy-800 transition-colors">
                Open in Maps →
              </a>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-6">Full interactive zone map will be added closer to the event.</p>
      </div>
    )
  },
})
