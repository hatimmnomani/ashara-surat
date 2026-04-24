import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { supabaseAdmin } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { deleteFromR2 } from '../../lib/r2'
import { FileUpload } from '../../components/admin/FileUpload'
import { useState } from 'react'
import { TearDrop } from '../../components/ui/TearDrop'

interface GalleryImage { id: string; url: string; caption?: string; event_tag?: string; r2_key?: string }

const addGalleryImage = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { url: string; caption: string; event_tag: string; r2_key: string })
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from('gallery_images').insert({
      url: data.url,
      caption: data.caption || null,
      event_tag: data.event_tag || null,
      r2_key: data.r2_key || null,
    })
    if (error) throw new Error(error.message)
    return { success: true }
  })

const deleteGalleryImage = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { id: string; r2_key?: string })
  .handler(async ({ data }) => {
    if (data.r2_key) {
      try { await deleteFromR2(data.r2_key) } catch { /* ignore if already deleted */ }
    }
    const { error } = await supabaseAdmin.from('gallery_images').delete().eq('id', data.id)
    if (error) throw new Error(error.message)
    return { success: true }
  })

export const Route = createFileRoute('/admin/gallery')({
  loader: async () => {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('uploaded_at', { ascending: false })
    if (error) throw new Error(error.message)
    return { images: (data ?? []) as GalleryImage[] }
  },
  component: function AdminGalleryPage() {
    const { images: initial } = Route.useLoaderData()
    const [images, setImages] = useState<GalleryImage[]>(initial)
    const [pending, setPending] = useState<{ url: string; key: string } | null>(null)
    const [caption, setCaption] = useState('')
    const [eventTag, setEventTag] = useState('')

    async function handleAdd() {
      if (!pending) return
      await addGalleryImage({ data: { url: pending.url, caption, event_tag: eventTag, r2_key: pending.key } })
      setImages(prev => [{ id: crypto.randomUUID(), url: pending.url, caption, event_tag: eventTag }, ...prev])
      setPending(null)
      setCaption('')
      setEventTag('')
    }

    async function handleDelete(img: GalleryImage) {
      await deleteGalleryImage({ data: { id: img.id, r2_key: img.r2_key } })
      setImages(prev => prev.filter(i => i.id !== img.id))
    }

    return (
      <div>
        <h1 className="text-2xl font-serif text-burgundy-700 mb-6">Gallery</h1>

        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 space-y-3">
          <h2 className="font-semibold text-gray-700">Upload Image</h2>
          <FileUpload folder="gallery" accept="image/*" label="Upload image"
            onUploaded={(url, key) => setPending({ url, key })} />
          {pending && (
            <>
              <img src={pending.url} alt="preview" className="h-32 rounded-lg object-cover" />
              <input placeholder="Caption (optional)" value={caption}
                onChange={e => setCaption(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Event tag (e.g. Day 3, Masjid)" value={eventTag}
                onChange={e => setEventTag(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <button onClick={handleAdd}
                  className="bg-burgundy-700 text-ivory px-4 py-2 rounded-lg text-sm font-semibold hover:bg-burgundy-800">
                  Save to Gallery
                </button>
                <button onClick={() => setPending(null)}
                  className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map(img => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden bg-burgundy-50">
              <img src={img.url} alt={img.caption ?? ''} loading="lazy"
                className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                {img.caption && <p className="text-white text-xs text-center">{img.caption}</p>}
                <button onClick={() => handleDelete(img)}
                  className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-2 sm:col-span-3 md:col-span-4 flex flex-col items-center gap-3 py-10 text-[var(--sea-ink-soft)]">
              <TearDrop size={40} muted />
              <p className="text-sm">No images yet.</p>
            </div>
          )}
        </div>
      </div>
    )
  },
})
