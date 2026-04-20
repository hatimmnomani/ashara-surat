interface Props { role: 'user' | 'assistant'; content: string }

export function ChatMessage({ role, content }: Props) {
  const isBot = role === 'assistant'
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-2`}>
      <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
        isBot ? 'bg-burgundy-50 text-gray-700' : 'bg-burgundy-700 text-ivory'
      }`}>
        {content}
      </div>
    </div>
  )
}
