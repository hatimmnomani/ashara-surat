import { describe, it, expect, vi } from 'vitest'

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ choices: [{ message: { content: 'Test response' } }] }),
}))

import { buildLLMClient } from '../../src/lib/llm'

describe('buildLLMClient', () => {
  it('returns assistant response content', async () => {
    const client = buildLLMClient()
    const result = await client.chat([{ role: 'user', content: 'Hello' }])
    expect(result).toBe('Test response')
  })
  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))
    const client = buildLLMClient()
    await expect(client.chat([{ role: 'user', content: 'Hello' }])).rejects.toThrow('LLM error: 401')
  })
})
