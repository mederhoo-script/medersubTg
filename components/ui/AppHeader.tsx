'use client';
import React, { useEffect, useState } from 'react';
import { Bell, Wallet, User as UserIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AppHeader() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (data) setProfile(data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }
    getProfile();
  }, []);

  return (
    <header className="app-header">
      <div className="flex items-center justify-between h-full px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden">
             {profile?.avatar_url ? (
               <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <UserIcon className="text-indigo-400" size={20} />
             )}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hello,</span>
            <span className="text-sm font-bold text-white truncate max-w-[120px]">
              {loading ? '...' : (profile?.full_name?.split(' ')[0] || 'User')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2 border border-indigo-500/20">
            <Wallet className="text-indigo-400" size={14} />
            <span className="text-[13px] font-black text-white">
              ₦{loading ? '...' : (profile?.wallet_balance || 0).toLocaleString()}
            </span>
          </div>
          <button className="w-9 h-9 rounded-full glass flex items-center justify-center border border-indigo-500/10">
            <Bell size={18} className="text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
