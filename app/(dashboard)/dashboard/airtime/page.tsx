'use client';
import React, { useState, useEffect } from 'react';
import { Smartphone, ChevronLeft, CreditCard, Loader2, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const networks = [
  { id: '1', name: 'MTN', color: 'bg-yellow-400', logo: 'M' },
  { id: '2', name: 'GLO', color: 'bg-green-600', logo: 'G' },
  { id: '3', name: 'AIRTEL', color: 'bg-red-600', logo: 'A' },
  { id: '4', name: '9MOBILE', color: 'bg-emerald-800', logo: '9' },
];

const quickAmounts = [50, 100, 200, 500, 1000, 2000, 5000];

export default function AirtimePage() {
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
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

    // Set Telegram main button
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.BackButton.show();
      tg.BackButton.onClick(() => router.back());
      return () => {
        tg.BackButton.hide();
      };
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNetwork || !phoneNumber || !amount) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) > walletBalance) {
      setError('Insufficient wallet balance');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // API call to purchase airtime
      const response = await fetch('/api/purchase/airtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network: selectedNetwork,
          phone: phoneNumber,
          amount: parseFloat(amount),
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Transaction failed');
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
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6">
          <Smartphone size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Purchase Successful!</h2>
        <p className="text-slate-400 text-sm mb-10 px-6 leading-relaxed">
          ₦{parseFloat(amount).toLocaleString()} Airtime has been sent to {phoneNumber} successfully.
        </p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="btn-brand"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header Info */}
      <div className="page-section flex items-center gap-4 py-4">
        <button onClick={() => router.back()} className="w-10 h-10 glass rounded-full flex items-center justify-center text-slate-400">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-black text-white leading-tight">Buy Airtime</h1>
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Discounted VTU Rates</p>
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
                onClick={() => {
                  setSelectedNetwork(net.name);
                  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.selectionChanged();
                  }
                }}
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

        {/* Input Fields */}
        <div className="page-section mt-8 flex flex-col gap-6">
          <div>
            <label className="form-label">Phone Number</label>
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

          <div>
            <label className="form-label">Amount (₦)</label>
            <div className="input-group">
              <CreditCard className="input-icon" size={18} />
              <input 
                type="number" 
                placeholder="0.00" 
                className="font-black text-indigo-400 text-lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            
            {/* Quick Select Amounts */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className={`amount-btn ${amount === amt.toString() ? 'active' : ''}`}
                >
                  ₦{amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wallet Hook */}
        <div className="page-section mt-10">
          <div className="glass-dark p-4 rounded-2xl flex items-center justify-between border-indigo-500/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <CreditCard className="text-indigo-400" size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment Source</p>
                <h4 className="text-xs font-black text-white uppercase leading-tight">My Wallet (₦{walletBalance.toLocaleString()})</h4>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error mb-4 animate-fade-in text-xs font-bold uppercase tracking-tight">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-brand group relative"
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                Confirm Purchase
                <ArrowRight size={18} className="absolute right-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
