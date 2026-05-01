'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, CreditCard, History, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Home', icon: Home, path: '/dashboard' },
  { name: 'Services', icon: Grid, path: '/dashboard/services' },
  { name: 'Fund', icon: CreditCard, path: '/dashboard/fund' },
  { name: 'History', icon: History, path: '/dashboard/history' },
  { name: 'Profile', icon: User, path: '/dashboard/profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname?.startsWith(item.path));
          
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-300 relative",
                isActive ? "text-indigo-400" : "text-slate-500"
              )}
              onClick={() => {
                if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
                  window.Telegram.WebApp.HapticFeedback.selectionChanged();
                }
              }}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                isActive && "bg-indigo-500/10"
              )}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold tracking-wide uppercase">
                {item.name}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-indigo-400 animate-pulse-glow" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
