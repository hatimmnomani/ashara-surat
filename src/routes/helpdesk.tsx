import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/helpdesk')({
  component: function HelpdeskPage() {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <div className="text-5xl mb-4">💬</div>
        <h1 className="text-3xl font-serif text-burgundy-700 mb-3">Helpdesk</h1>
        <p className="text-gray-500 mb-4">
          Our AI assistant is available 24/7 for questions about Ashara Surat 1447H.
        </p>
        <p className="text-sm text-gray-400">
          Use the chat button in the bottom-right corner to get started.
          If the AI cannot resolve your query, a volunteer will follow up via WhatsApp or Email.
        </p>
      </div>
    )
  },
})
