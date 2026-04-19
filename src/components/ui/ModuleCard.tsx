import { Link } from '@tanstack/react-router'

interface ModuleCardProps {
  icon: string
  title: string
  description: string
  to: string
}

export function ModuleCard({ icon, title, description, to }: ModuleCardProps) {
  return (
    <Link to={to} className="block bg-white border border-burgundy-100 rounded-xl p-5 hover:border-burgundy-300 hover:shadow-md transition-all group">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-serif font-bold text-burgundy-700 group-hover:text-burgundy-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  )
}
