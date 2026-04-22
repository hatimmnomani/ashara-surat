import { createServerFn } from '@tanstack/react-start'
import { uploadToR2 } from '../../lib/r2'
import { randomUUID } from 'node:crypto'

interface UploadInput {
  base64: string
  filename: string
  contentType: string
  folder: string
}

export const uploadFile = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as UploadInput)
  .handler(async ({ data }) => {
    const { base64, filename, contentType, folder } = data
    const buffer = Buffer.from(base64, 'base64')
    const ext = filename.split('.').pop() ?? 'bin'
    const key = `${folder}/${randomUUID()}.${ext}`
    const url = await uploadToR2(buffer, key, contentType)
    return { url, key }
  })
