'use client';
import React, { useEffect, useState } from 'react';
import { 
  ChevronLeft, Smartphone, BarChart3, Tv, Lightbulb, GraduationCap, 
  ArrowUpRight, ArrowDownLeft, Search, Filter, History as HistoryIcon,
  Calendar, CreditCard, ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const typeIcons: any = {
  'AIRTIME': Smartphone,
  'DATA': BarChart3,
  'CABLE': Tv,
  'ELECTRICITY': Lightbulb,
  'EDUCATION': GraduationCap,
  'FUNDING': CreditCard,
  'purchase': Smartphone,
};

const typeColors: any = {
  'AIRTIME': 'text-blue-500 bg-blue-500/10',
  'DATA': 'text-indigo-500 bg-indigo-500/10',
  'CABLE': 'text-purple-500 bg-purple-500/10',
  'ELECTRICITY': 'text-amber-500 bg-amber-500/10',
  'EDUCATION': 'text-rose-500 bg-rose-500/10',
  'FUNDING': 'text-emerald-500 bg-emerald-500/10',
  'purchase': 'text-indigo-500 bg-indigo-500/10',
};

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false });
          
          if (data) setTransactions(data);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const filteredTransactions = transactions.filter(tx => 
    (tx.description?.toLowerCase() || tx.service_type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (tx.meta?.mobile || '').includes(searchTerm)
  );

  return (
    <div className="animate-fade-in">
      <div className="page-section flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 glass rounded-full flex items-center justify-center text-slate-400">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-black text-white leading-tight">History</h1>
            <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">All Activities</p>
          </div>
        </div>
        <button className="w-10 h-10 glass rounded-full flex items-center justify-center text-slate-400">
          <Filter size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="page-section mt-2">
        <div className="input-group">
          <Search className="input-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="bg-bg-surface border-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="page-section mt-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-dark p-4 rounded-2xl border-indigo-500/10">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Spent total</p>
            <h4 className="text-lg font-black text-white">₦{transactions.filter(tx => tx.type === 'purchase').reduce((acc, tx) => acc + (tx.charged_amount || tx.amount), 0).toLocaleString()}</h4>
          </div>
          <div className="glass-dark p-4 rounded-2xl border-emerald-500/10">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total funded</p>
            <h4 className="text-lg font-black text-white">₦{transactions.filter(tx => tx.type === 'credit').reduce((acc, tx) => acc + tx.amount, 0).toLocaleString()}</h4>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="page-section mt-8 mb-6">
        <div className="card bg-bg-surface border-none p-0 overflow-hidden">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="tx-item px-4 h-[72px]">
                <div className="tx-icon skeleton w-[42px] h-[42px]" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-1/2 mb-2" />
                  <div className="skeleton h-3 w-1/4" />
                </div>
              </div>
            ))
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => {
              const serviceType = tx.meta?.service_type || tx.type;
              const Icon = typeIcons[serviceType] || HistoryIcon;
              const colorClass = typeColors[serviceType] || 'text-slate-500 bg-slate-500/10';
              
              return (
                <div key={tx.id} className="tx-item px-4 hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors border-b border-white/[0.02]">
                  <div className={`tx-icon ${colorClass}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-white mb-0.5 truncate uppercase tracking-tight">
                      {tx.description || tx.service_type || tx.type}
                    </h4>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-slate-500 font-bold uppercase">{new Date(tx.created_at).toLocaleDateString()}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-700" />
                       <span className="text-[10px] text-slate-500 font-bold uppercase">{tx.meta?.mobile || tx.reference?.slice(0, 8)}</span>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className={`text-[14px] font-black ${tx.type === 'credit' ? 'text-emerald-500' : 'text-white'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₦{(tx.charged_amount || tx.amount).toLocaleString()}
                    </p>
                    <span className={`chip ${tx.status === 'success' ? 'chip-success' : 'chip-pending'} scale-[0.7] origin-right uppercase`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 flex flex-col items-center justify-center opacity-30">
              <HistoryIcon size={48} className="mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-center">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
