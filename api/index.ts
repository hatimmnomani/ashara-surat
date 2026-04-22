import { createServerEntry } from '../dist/server/server.js'

export const config = {
  runtime: 'nodejs20.x',
}

export default async function handler(req: any, res: any) {
  try {
    // Convert Vercel request to Web API Request
    const url = new URL(req.url, `http://${req.headers.host}`)
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
    })

    const response = await createServerEntry(request, { env: process.env })

    // Convert Web API Response back to Vercel response
    const body = await response.arrayBuffer()
    const headers: Record<string, string> = {}
    response.headers.forEach((value: any, key: any) => {
      headers[key] = value
    })

    res.status(response.status)
    Object.entries(headers).forEach(([key, value]) => {
      if (!['content-length'].includes(key.toLowerCase())) {
        res.setHeader(key, value)
      }
    })
    return res.end(Buffer.from(body))
  } catch (error) {
    console.error('Server error:', error)
    res.status(500)
    res.end('Internal Server Error')
  }
}
