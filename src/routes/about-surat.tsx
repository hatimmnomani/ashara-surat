import { createFileRoute } from '@tanstack/react-router'

const INFO = [
  { category: 'Emergency',  items: ['Police: 100', 'Ambulance: 108', 'Fire: 101'] },
  { category: 'Hospitals',  items: ['New Civil Hospital: +91 261 244 0000', 'Kiran Hospital: +91 261 267 3000', 'SMIMER Hospital: +91 261 231 2891'] },
  { category: 'Pharmacies', items: ['Apollo Pharmacy (24hr): +91 261 246 0000', 'MedPlus Nanpura: +91 261 326 0000'] },
  { category: 'Transport',  items: ['Surat Airport: +91 261 268 5000', 'Surat Railway: 139', 'GSRTC City Bus: +91 261 425 0000'] },
]

export const Route = createFileRoute('/about-surat')({
  component: function AboutSuratPage() {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-2">About Surat</h1>
        <p className="text-gray-500 mb-8">Essential information for visiting mumineen.</p>
        <div className="grid gap-5">
          {INFO.map(c => (
            <div key={c.category} className="bg-white border border-burgundy-100 rounded-xl p-5">
              <h2 className="font-bold text-burgundy-700 mb-3">{c.category}</h2>
              <ul className="space-y-1">
                {c.items.map(item => <li key={item} className="text-sm text-gray-600">• {item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    )
  },
})
