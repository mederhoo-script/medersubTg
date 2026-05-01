'use client';
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, CreditCard, Landmark, ArrowRight, 
  Copy, CheckCircle, Info, Loader2, Zap, Smartphone,
  ShieldCheck, Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function FundPage() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) {
          setProfile(data);
          setWalletBalance(data.wallet_balance);
        }
      }
    }
    loadData();
  }, []);

  const handleMonnify = async () => {
    if (!amount || parseFloat(amount) < 100) {
      alert('Minimum funding amount is ₦100');
      return;
    }
    
    setLoading(true);
    // Here we would integrate Monnify SDK or redirect to a checkout page
    // For now, let's simulate a success or redirect to the checkout handler
    setTimeout(() => {
      setLoading(false);
      alert('Integrate Monnify payment SDK here');
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      window.Telegram.WebApp.showAlert('Account Number Copied!');
    } else {
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-section flex items-center gap-4 py-4">
        <button onClick={() => router.back()} className="w-10 h-10 glass rounded-full flex items-center justify-center text-slate-400">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-black text-white leading-tight">Fund Wallet</h1>
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Instant Credits</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="page-section mt-4">
        <div className="glass-dark p-6 rounded-2xl border-indigo-500/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Current Balance</p>
            <h2 className="text-3xl font-black text-white">₦{walletBalance.toLocaleString()}</h2>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Zap className="text-indigo-400 fill-indigo-400/20" size={28} />
          </div>
        </div>
      </div>

      {/* Online Payment Section */}
      <div className="page-section mt-8">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Pay via Card/Bank Selection</h3>
        <div className="card-glass p-6">
          <label className="form-label mb-2">Funding Amount (₦)</label>
          <div className="input-group mb-4">
            <CreditCard className="input-icon" size={18} />
            <input 
              type="number" 
              placeholder="Min ₦100" 
              className="text-lg font-black text-indigo-400"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <button 
            onClick={handleMonnify}
            disabled={loading || !amount}
            className="btn-brand group relative h-14"
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin text-white" />
            ) : (
              <>
                Initialize Secure Payment
                <ArrowRight size={18} className="absolute right-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
             <ShieldCheck size={14} className="text-emerald-500" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secured by Monnify</span>
          </div>
        </div>
      </div>

      {/* Bank Transfer Section */}
      <div className="page-section mt-10 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Manual Bank Transfer</h3>
          <span className="chip chip-success text-[9px] uppercase font-black px-2">Autobank</span>
        </div>
        <div className="space-y-4">
          {/* Virtual Accounts (Mocking based on typical NG VTU app) */}
          {[
            { bank: 'WEMA BANK', acc: '8223401928', name: profile?.full_name || 'MEDERSUB-USER' },
            { bank: 'MONIEPOINT', acc: '9012345678', name: profile?.full_name || 'MEDERSUB-USER' }
          ].map((acc, idx) => (
            <div key={idx} className="glass-dark p-5 rounded-2xl border-indigo-500/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Landmark size={64} />
               </div>
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-sm font-black text-white">{acc.bank}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{acc.name}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(acc.acc)}
                    className="w-10 h-10 glass rounded-xl flex items-center justify-center text-indigo-400 active:scale-90 transition-transform"
                  >
                    <Copy size={18} />
                  </button>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-indigo-400 tracking-[0.1em]">{acc.acc}</span>
                  <CheckCircle size={14} className="text-emerald-500" />
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Notice */}
      <div className="page-section mb-10">
        <div className="alert alert-info border-indigo-500/10 p-4 flex gap-4">
          <Info className="flex-shrink-0" size={20} />
          <div>
             <h5 className="text-xs font-black text-white uppercase tracking-tight mb-1">Fee Notice</h5>
             <p className="text-[11px] text-indigo-200/60 font-medium leading-relaxed">
               A processing fee of ₦50 may apply to bank transfers. Automated funding is instant.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
