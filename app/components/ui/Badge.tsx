import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'pending' | 'failed' | 'info'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant, children, className }: BadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-700',
  }

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
