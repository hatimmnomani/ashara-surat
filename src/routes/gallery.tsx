import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

interface GalleryImage { id: string; url: string; caption?: string }

export const Route = createFileRoute('/gallery')({
  loader: async () => {
    const { data, error } = await supabase.from('gallery_images').select('*').order('uploaded_at', { ascending: false })
    if (error) throw new Error(error.message)
    return { images: (data ?? []) as GalleryImage[] }
  },
  component: function GalleryPage() {
    const { images } = Route.useLoaderData()
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Gallery</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map(img => (
            <div key={img.id} className="aspect-square overflow-hidden rounded-xl bg-burgundy-50">
              <img src={img.url} alt={img.caption ?? ''} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform" />
            </div>
          ))}
        </div>
        {images.length === 0 && <p className="text-gray-400">Photos will be added soon.</p>}
      </div>
    )
  },
})
