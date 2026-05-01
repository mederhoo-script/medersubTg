'use client';
import React, { useState, useEffect } from 'react';
import { Tv, ChevronLeft, CreditCard, Loader2, ArrowRight, User, Hash, Info, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const providers = [
  { id: '1', name: 'DSTV', color: 'bg-blue-700', logo: 'D' },
  { id: '2', name: 'GOTV', color: 'bg-emerald-600', logo: 'G' },
  { id: '3', name: 'STARTIMES', color: 'bg-orange-600', logo: 'S' },
];

export default function CablePage() {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [iucNumber, setIucNumber] = useState('');
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function getBalance() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single();
        if (data) setWalletBalance(data.wallet_balance);
      }
    }
    getBalance();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetchPlans();
    }
  }, [selectedProvider]);

  const fetchPlans = async () => {
    setFetchingPlans(true);
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        const filtered = data.data.filter((s: any) => 
          s.service_type === 'CABLE' && s.name.toUpperCase().includes(selectedProvider.toUpperCase())
        );
        setPlans(filtered);
      }
    } catch (err) {
      setError('Failed to fetch cable plans');
    } finally {
      setFetchingPlans(false);
    }
  };

  const handleValidate = async () => {
    if (!selectedProvider || !iucNumber) return;
    setValidating(true);
    setError(null);
    setCustomerName('');
    try {
      // Find a plan to get the serviceID for validation if needed, or use a hardcoded one
      const serviceID = selectedProvider === 'DSTV' ? '19' : selectedProvider === 'GOTV' ? '18' : '17';
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iucNum: iucNumber, serviceID, type: 'CABLE' }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCustomerName(data.customer_name);
      } else {
        setError(data.message || 'Invalid IUC number');
      }
    } catch (err) {
      setError('Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !iucNumber || !customerName) {
      setError('Please validate IUC and select a plan');
      return;
    }

    if (selectedPlan.price > walletBalance) {
      setError('Insufficient wallet balance');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          serviceType: 'CABLE',
          amount: selectedPlan.price,
          mobileNumber: iucNumber, // Used as IUC here
          serviceID: selectedPlan.serviceID,
          network: selectedProvider,
        }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Transaction failed');

      setSuccess(true);
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-section pt-10 text-center animate-scale-in">
        <div className="w-20 h-20 bg-purple-500/10 rounded-full border-2 border-purple-500 flex items-center justify-center mx-auto mb-6">
          <Tv size={40} className="text-purple-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Cable Recharged!</h2>
        <p className="text-slate-400 text-sm mb-10 px-6 leading-relaxed">
          {selectedPlan?.name} has been activated for {customerName} ({iucNumber}).
        </p>
        <button onClick={() => router.push('/dashboard')} className="btn-brand">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-section flex items-center gap-4 py-4">
        <button onClick={() => router.back()} className="w-10 h-10 glass rounded-full flex items-center justify-center text-slate-400">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-black text-white leading-tight">Cable TV</h1>
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Fast Activation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Provider Selector */}
        <div className="page-section mt-4">
          <label className="form-label">Select Provider</label>
          <div className="grid grid-cols-3 gap-3">
            {providers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProvider(p.name)}
                className={`network-chip h-20 ${selectedProvider === p.name ? 'active' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full ${p.color} flex items-center justify-center text-white font-black text-lg mb-1`}>
                  {p.logo}
                </div>
                <span className="text-[9px] uppercase tracking-tighter">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* IUC Input */}
        <div className="page-section mt-8">
          <label className="form-label">Smartcard / IUC Number</label>
          <div className="flex gap-3">
            <div className="input-group flex-1">
              <Hash className="input-icon" size={18} />
              <input 
                type="text" 
                placeholder="1029384756" 
                className="font-bold tracking-widest"
                value={iucNumber}
                onChange={(e) => setIucNumber(e.target.value)}
              />
            </div>
            <button 
              type="button" 
              onClick={handleValidate}
              disabled={validating || !iucNumber || !selectedProvider}
              className="px-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 font-black text-[10px] uppercase active:scale-95 transition-all"
            >
              {validating ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
            </button>
          </div>
          
          {customerName && (
            <div className="mt-3 glass-dark p-3 rounded-xl border-emerald-500/10 flex items-center gap-3 animate-fade-in">
               <ShieldCheck className="text-emerald-500" size={16} />
               <p className="text-xs font-black text-white uppercase truncate">{customerName}</p>
            </div>
          )}
        </div>

        {/* Plan Selector */}
        {selectedProvider && (
          <div className="page-section mt-8">
            <label className="form-label">Select Subscription Plan</label>
            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {fetchingPlans ? (
                <div className="glass p-8 rounded-xl flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
              ) : (
                plans.map((plan) => (
                  <button
                    key={plan.serviceID}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`card bg-bg-surface border-none flex items-center justify-between p-4 transition-all ${
                      selectedPlan?.serviceID === plan.serviceID ? 'ring-2 ring-indigo-500 bg-indigo-500/5' : 'active:bg-white/[0.05]'
                    }`}
                  >
                    <div className="text-left">
                      <h4 className="text-[13px] font-bold text-white mb-0.5">{plan.name}</h4>
                      <span className="text-[10px] text-slate-500 font-black uppercase">Instant Activation</span>
                    </div>
                    <span className="text-sm font-black text-indigo-400">₦{plan.price}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div className="page-section mt-10">
          <div className="glass-dark p-4 rounded-2xl flex items-center justify-between border-indigo-500/10 mb-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                   <CreditCard className="text-indigo-400" size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase">Amount Due</p>
                   <h4 className="text-xs font-black text-white uppercase tracking-tighter">
                      ₦{selectedPlan ? selectedPlan.price.toLocaleString() : '0'} from Wallet
                   </h4>
                </div>
             </div>
          </div>

          {error && <div className="alert alert-error mb-4 text-xs font-bold uppercase">{error}</div>}

          <button 
            type="submit" 
            disabled={loading || !selectedPlan || !customerName}
            className="btn-brand group relative"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : (
              <>Pay Subscription <ArrowRight size={18} className="absolute right-6 group-hover:translate-x-1" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
