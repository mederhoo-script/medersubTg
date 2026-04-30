import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: LucideIcon
  rightElement?: React.ReactNode
}

export default function Input({ label, error, icon: Icon, rightElement, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          className={cn(
            'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all',
            Icon && 'pl-10',
            rightElement && 'pr-24',
            error && 'border-red-400 focus:ring-red-400',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
