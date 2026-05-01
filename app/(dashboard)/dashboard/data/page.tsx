'use client';
import React, { useState, useEffect } from 'react';
import { Smartphone, ChevronLeft, CreditCard, Loader2, ArrowRight, User, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const networks = [
  { id: 'mtn', name: 'MTN', color: 'bg-yellow-400', logo: 'M' },
  { id: 'glo', name: 'GLO', color: 'bg-green-600', logo: 'G' },
  { id: 'airtel', name: 'AIRTEL', color: 'bg-red-600', logo: 'A' },
  { id: '9mobile', name: '9MOBILE', color: 'bg-emerald-800', logo: '9' },
];

export default function DataPage() {
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function getBalance() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', user.id)
          .single();
        if (data) setWalletBalance(data.wallet_balance);
      }
    }
    getBalance();
  }, []);

  useEffect(() => {
    if (selectedNetwork) {
      fetchPlans();
    }
  }, [selectedNetwork]);

  const fetchPlans = async () => {
    setFetchingPlans(true);
    setError(null);
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        // Filter plans for selected network and type DATA
        const filtered = data.data.filter((s: any) => 
          s.service_type === 'DATA' && 
          s.name.toLowerCase().includes(selectedNetwork.toLowerCase())
        );
        setPlans(filtered);
      }
    } catch (err) {
      setError('Failed to fetch data plans');
    } finally {
      setFetchingPlans(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNetwork || !phoneNumber || !selectedPlan) {
      setError('Please fill in all fields');
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
          serviceType: 'DATA',
          amount: selectedPlan.price,
          mobileNumber: phoneNumber,
          serviceID: selectedPlan.serviceID, // Assuming serviceID is the identifier
          network: selectedNetwork,
          planName: selectedPlan.name,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Transaction failed');
      }

      setSuccess(true);
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } catch (err: any) {
      setError(err.message);
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-section pt-10 text-center animate-scale-in">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full border-2 border-indigo-500 flex items-center justify-center mx-auto mb-6">
          <Smartphone size={40} className="text-indigo-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Data Sent!</h2>
        <p className="text-slate-400 text-sm mb-10 px-6 leading-relaxed">
          {selectedPlan?.name} has been successfully credited to {phoneNumber}.
        </p>
        <button onClick={() => router.push('/dashboard')} className="btn-brand">
          Back to Dashboard
        </button>
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
          <h1 className="text-lg font-black text-white leading-tight">Buy Data</h1>
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Fast & Automated</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Network Selector */}
        <div className="page-section mt-4">
          <label className="form-label">Select Network</label>
          <div className="grid grid-cols-4 gap-3">
            {networks.map((net) => (
              <button
                key={net.id}
                type="button"
                onClick={() => setSelectedNetwork(net.name)}
                className={`network-chip h-20 ${selectedNetwork === net.name ? 'active' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full ${net.color} flex items-center justify-center text-white font-black text-lg mb-1`}>
                  {net.logo}
                </div>
                <span className="text-[9px] uppercase tracking-tighter">{net.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Plan Selector */}
        <div className="page-section mt-8">
          <label className="form-label">Select Data Plan</label>
          <div className="relative">
            {fetchingPlans ? (
              <div className="glass p-4 rounded-xl flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
              </div>
            ) : selectedNetwork ? (
              <div className="grid grid-cols-1 gap-3">
                {plans.length > 0 ? (
                  plans.map((plan) => (
                    <button
                      key={plan.serviceID}
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      className={`card bg-bg-surface border-none flex items-center justify-between p-4 transition-all ${
                        selectedPlan?.serviceID === plan.serviceID 
                        ? 'ring-2 ring-indigo-500 bg-indigo-500/5' 
                        : 'active:bg-white/[0.05]'
                      }`}
                    >
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-white mb-0.5">{plan.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{plan.validity || '30 Days'}</p>
                      </div>
                      <span className="text-lg font-black text-indigo-400">₦{plan.price}</span>
                    </button>
                  ))
                ) : (
                  <div className="glass p-8 rounded-xl text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase">No plans found for {selectedNetwork}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass p-8 rounded-xl text-center border-dashed">
                <p className="text-xs font-bold text-slate-500 uppercase">Please select a network first</p>
              </div>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div className="page-section mt-8">
          <label className="form-label">Recipient Number</label>
          <div className="input-group">
            <User className="input-icon" size={18} />
            <input 
              type="tel" 
              placeholder="080 1234 5678" 
              className="font-bold tracking-widest"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="page-section mt-10">
          <div className="glass-dark p-4 rounded-2xl flex items-center justify-between border-indigo-500/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <CreditCard className="text-indigo-400" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total cost</p>
                <h4 className="text-xs font-black text-white uppercase leading-tight">
                  ₦{selectedPlan ? selectedPlan.price : '0'} from Wallet
                </h4>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error mb-4 text-xs font-bold uppercase tracking-tight">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !selectedPlan}
            className="btn-brand group relative"
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                Purchase Bundle
                <ArrowRight size={18} className="absolute right-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
