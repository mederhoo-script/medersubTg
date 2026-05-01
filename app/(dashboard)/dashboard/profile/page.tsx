'use client';
import React, { useEffect, useState } from 'react';
import { 
  User, Shield, Settings, HelpCircle, LogOut, 
  ChevronRight, Copy, Share2, Wallet, Zap, Moon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleLogout = async () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.showConfirm('Are you sure you want to log out?', async (confirmed) => {
        if (confirmed) {
          await supabase.auth.signOut();
          router.push('/login');
        }
      });
    } else {
      if (confirm('Are you sure you want to log out?')) {
        await supabase.auth.signOut();
        router.push('/login');
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      window.Telegram.WebApp.showAlert('Copied to clipboard!');
    } else {
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-section pt-6 pb-4">
        <h1 className="text-2xl font-black text-white mb-6">Profile</h1>
        
        {/* Profile Card */}
        <div className="card-glass p-6 text-center animate-scale-in">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-3xl bg-indigo-500/20 border-2 border-indigo-500/30 flex items-center justify-center overflow-hidden mx-auto">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-indigo-400" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-bg-base flex items-center justify-center">
              <Zap size={14} className="text-white fill-current" />
            </div>
          </div>
          <h2 className="text-xl font-black text-white mb-1">
            {loading ? '...' : (profile?.full_name || 'MederSub User')}
          </h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
            {loading ? '...' : (profile?.email || 'user@example.com')}
          </p>
          <div className="flex gap-2 justify-center">
             <span className="chip chip-success uppercase text-[10px]">Active</span>
             <span className="chip border border-indigo-500/20 text-indigo-400 bg-transparent uppercase text-[10px]">Tier 1</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="page-section mt-2 grid grid-cols-2 gap-4">
        <div className="glass-dark p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Wallet className="text-amber-500" size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Balance</p>
            <h4 className="text-sm font-black text-white">₦{profile?.wallet_balance?.toLocaleString() || '0'}</h4>
          </div>
        </div>
        <div className="glass-dark p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
             <Share2 className="text-purple-500" size={20} />
          </div>
          <div>
             <p className="text-[10px] font-bold text-slate-500 uppercase">Referrals</p>
             <h4 className="text-sm font-black text-white">0 Earned</h4>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="page-section mt-8">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2">Account Settings</h3>
        <div className="card bg-bg-surface border-none p-2 space-y-1">
          <button className="w-full flex items-center justify-between p-3 hover:bg-white/[0.03] active:bg-white/[0.05] rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-indigo-400">
                <Shield size={20} />
              </div>
              <span className="text-[13px] font-bold text-white uppercase tracking-tight">Security & ID</span>
            </div>
            <ChevronRight className="text-slate-600" size={18} />
          </button>
          
          <button className="w-full flex items-center justify-between p-3 hover:bg-white/[0.03] active:bg-white/[0.05] rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-purple-400">
                <Settings size={20} />
              </div>
              <span className="text-[13px] font-bold text-white uppercase tracking-tight">App Preferences</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon size={14} className="text-slate-500" />
              <ChevronRight className="text-slate-600" size={18} />
            </div>
          </button>
        </div>
      </div>

      <div className="page-section mt-8">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2">Support</h3>
        <div className="card bg-bg-surface border-none p-2 space-y-1">
          <button className="w-full flex items-center justify-between p-3 hover:bg-white/[0.03] active:bg-white/[0.05] rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-cyan-400">
                <HelpCircle size={20} />
              </div>
              <span className="text-[13px] font-bold text-white uppercase tracking-tight">Help Center</span>
            </div>
            <ChevronRight className="text-slate-600" size={18} />
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-3 hover:bg-rose-500/10 active:bg-rose-500/20 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <LogOut size={20} />
              </div>
              <span className="text-[13px] font-bold text-rose-500 uppercase tracking-tight">Secure Logout</span>
            </div>
          </button>
        </div>
      </div>

      <div className="page-section py-10 text-center opacity-30">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">MederSub VTU v2.4.0</p>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Built with precision for Telegram</p>
      </div>
    </div>
  );
}
