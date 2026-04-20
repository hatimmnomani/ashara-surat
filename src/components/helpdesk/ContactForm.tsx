import { useState } from 'react'

interface Contact { name: string; phone: string; email: string; whatsapp: string }
interface Props { onSubmit: (contact: Contact) => void }

export function ContactForm({ onSubmit }: Props) {
  const [form, setForm] = useState<Contact>({ name: '', phone: '', email: '', whatsapp: '' })
  const fields = [
    { name: 'name',     placeholder: 'Full Name *',              required: true },
    { name: 'phone',    placeholder: 'Phone *',                  required: true },
    { name: 'whatsapp', placeholder: 'WhatsApp (if different)',  required: false },
    { name: 'email',    placeholder: 'Email',                    required: false },
  ]
  return (
    <div className="p-4 space-y-3">
      <p className="text-sm text-gray-600 font-medium">Please share your contact details to begin:</p>
      {fields.map(f => (
        <input key={f.name} placeholder={f.placeholder} required={f.required}
          value={form[f.name as keyof Contact]}
          onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
        />
      ))}
      <button disabled={!form.name || !form.phone} onClick={() => onSubmit(form)}
        className="w-full bg-burgundy-700 text-ivory py-2 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-burgundy-800 transition-colors">
        Start Chat
      </button>
    </div>
  )
}
