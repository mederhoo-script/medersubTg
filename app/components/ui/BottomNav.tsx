'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/airtime', icon: ShoppingBag, label: 'Buy' },
  { href: '/dashboard/transactions', icon: Clock, label: 'History' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 safe-bottom z-40">
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors min-w-[60px]',
                active ? 'text-[#059669]' : 'text-gray-400'
              )}
            >
              <Icon className={cn('w-5 h-5', active && 'text-[#059669]')} />
              <span className={cn('text-[10px] font-medium', active ? 'text-[#059669]' : 'text-gray-400')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
