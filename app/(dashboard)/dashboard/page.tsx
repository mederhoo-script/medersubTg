'use client';
import React, { useEffect, useState } from 'react';
import { 
  Zap, Smartphone, BarChart3, Tv, Lightbulb, GraduationCap, 
  ArrowUpRight, ArrowDownLeft, ChevronRight, TrendingUp 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const services = [
  { name: 'Airtime', icon: Smartphone, color: 'bg-blue-500', path: '/dashboard/airtime' },
  { name: 'Data', icon: BarChart3, color: 'bg-indigo-500', path: '/dashboard/data' },
  { name: 'Cable TV', icon: Tv, color: 'bg-purple-500', path: '/dashboard/cable' },
  { name: 'Electricity', icon: Lightbulb, color: 'bg-amber-500', path: '/dashboard/electricity' },
  { name: 'Education', icon: GraduationCap, color: 'bg-rose-500', path: '/dashboard/education' },
  { name: 'Fund', icon: ArrowUpRight, color: 'bg-emerald-500', path: '/dashboard/fund' },
];

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Load Profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          setProfile(profileData);

          // Load Transactions (limit 3)
          const { data: txData } = await supabase
            .from('transactions')
            .select('*')
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3);
          setTransactions(txData || []);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Balance Card */}
      <div className="page-section pt-4">
        <div className="balance-card animate-scale-in">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-1">Total Balance</p>
              <h2 className="text-3xl font-black text-white">
                ₦{loading ? '...' : (profile?.wallet_balance || 0).toLocaleString()}
              </h2>
            </div>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Zap className="text-white" size={24} />
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/fund" className="flex-1 bg-white text-indigo-900 h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <ArrowUpRight size={14} /> Fund Wallet
            </Link>
            <Link href="/dashboard/history" className="flex-1 bg-white/20 text-white h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 backdrop-blur-md active:scale-95 transition-transform">
              <BarChart3 size={14} /> Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="page-section mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Services</h3>
          <Link href="/dashboard/services" className="text-[11px] font-bold text-indigo-400 uppercase">View All</Link>
        </div>
        <div className="grid grid-cols-3 gap-y-6">
          {services.map((service, idx) => (
            <Link key={service.name} href={service.path} className="service-item flex flex-col items-center animate-fade-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className={`service-icon ${service.color} shadow-lg shadow-${service.color.split('-')[1]}-500/30`}>
                <service.icon className="text-white" size={24} />
              </div>
              <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">{service.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="page-section mt-8 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Recent Activity</h3>
          <Link href="/dashboard/history" className="text-[11px] font-bold text-indigo-400 uppercase">History</Link>
        </div>
        <div className="card bg-bg-surface border-none p-0 overflow-hidden">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="tx-item px-4 border-b border-border-subtle h-[72px]">
                <div className="tx-icon skeleton w-[42px] h-[42px]" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-1/2 mb-2" />
                  <div className="skeleton h-3 w-1/4" />
                </div>
              </div>
            ))
          ) : transactions.length > 0 ? (
            transactions.map((tx) => (
              <div key={tx.id} className="tx-item px-4 hover:bg-white/[0.02] active:bg-white/[0.04]">
                <div className={`tx-icon ${tx.type === 'credit' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft size={20} className="text-emerald-500" /> : <Smartphone size={20} className="text-rose-500" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-bold text-white mb-0.5">{tx.description || tx.service_type}</h4>
                  <p className="text-[11px] text-slate-500 font-semibold uppercase">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[14px] font-black ${tx.type === 'credit' ? 'text-emerald-500' : 'text-white'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                  </p>
                  <span className={`chip ${tx.status === 'success' ? 'chip-success' : 'chip-pending'} scale-[0.8] origin-right`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 flex flex-col items-center justify-center opacity-40">
              <TrendingUp size={32} className="mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">No activities yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Banner */}
      <div className="page-section mb-6">
        <div className="glass-dark border-indigo-500/20 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Upgrade Account</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Unlock VIP Prices & Features</p>
            </div>
          </div>
          <ChevronRight className="text-indigo-500" size={20} />
        </div>
      </div>
    </div>
  );
}
