interface Props { onEscalate: (channel: 'email' | 'whatsapp') => void; onClose: () => void }

export function EscalationModal({ onEscalate, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="font-serif font-bold text-burgundy-700 text-lg mb-2">Contact Helpdesk</h3>
        <p className="text-sm text-gray-500 mb-4">How would you like our team to follow up?</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => onEscalate('whatsapp')}
            className="bg-green-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors">
            💬 WhatsApp
          </button>
          <button onClick={() => onEscalate('email')}
            className="bg-burgundy-700 text-ivory py-3 rounded-xl font-semibold text-sm hover:bg-burgundy-800 transition-colors">
            ✉️ Email
          </button>
        </div>
        <button onClick={onClose} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}
