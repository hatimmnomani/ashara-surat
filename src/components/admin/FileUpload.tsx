import { useState, useRef } from 'react'
import { uploadFile } from '../../routes/api/-upload'

interface Props {
  folder: string
  accept?: string
  onUploaded: (url: string, key: string) => void
  label?: string
}

export function FileUpload({ folder, accept = 'image/*', onUploaded, label = 'Upload File' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError('')
    try {
      // Read file as base64 for server function transport
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // Strip the data URL prefix (e.g. "data:image/png;base64,")
          resolve(result.split(',')[1] ?? result)
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })

      const { url, key } = await uploadFile({
        data: {
          base64,
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          folder,
        },
      })
      onUploaded(url, key)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-burgundy-200 rounded-xl p-6 text-center cursor-pointer hover:border-burgundy-400 transition-colors"
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      {uploading
        ? <p className="text-sm text-burgundy-500 animate-pulse">Uploading...</p>
        : <p className="text-sm text-gray-400">{label} — drag & drop or click</p>
      }
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
