'use client';
import React, { useEffect } from 'react';
import AppHeader from '@/components/ui/AppHeader';
import BottomNav from '@/components/ui/BottomNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Reveal Telegram WebApp UI components in dashboard
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.setBackgroundColor('#0a0e1a');
      window.Telegram.WebApp.setHeaderColor('#0a0e1a');
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.ready();
    }
  }, []);

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-content">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
