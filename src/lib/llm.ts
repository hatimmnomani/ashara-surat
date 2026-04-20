interface Message { role: 'user' | 'assistant' | 'system'; content: string }

interface LLMClient {
  chat(messages: Message[], systemPrompt?: string): Promise<string>
}

export function buildLLMClient(): LLMClient {
  const baseUrl = process.env.LLM_BASE_URL ?? 'https://openrouter.ai/api/v1'
  const apiKey  = process.env.LLM_API_KEY ?? ''
  const model   = process.env.LLM_MODEL ?? 'anthropic/claude-3-haiku'

  return {
    async chat(messages, systemPrompt) {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [
            ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
            ...messages,
          ],
        }),
      })
      if (!res.ok) throw new Error(`LLM error: ${res.status}`)
      const data = await res.json()
      return data.choices[0].message.content as string
    },
  }
}
