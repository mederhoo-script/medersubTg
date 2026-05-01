'use client';
import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronLeft, CreditCard, Loader2, ArrowRight, Hash, Info, ShieldCheck, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const discos = [
  { id: '1', name: 'IKEDC', color: 'bg-red-600', logo: 'I' },
  { id: '2', name: 'EKEDC', color: 'bg-blue-600', logo: 'E' },
  { id: '3', name: 'KEDCO', color: 'bg-emerald-600', logo: 'K' },
  { id: '4', name: 'AEDC', color: 'bg-indigo-700', logo: 'A' },
  { id: '5', name: 'PHED', color: 'bg-amber-600', logo: 'P' },
];

export default function ElectricityPage() {
  const [selectedDisco, setSelectedDisco] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState('1'); // 1 = Prepaid, 2 = Postpaid
  const [amount, setAmount] = useState('');
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [services, setServices] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single();
        if (data) setWalletBalance(data.wallet_balance);
      }
      
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.status === 'success') {
          setServices(data.data.filter((s: any) => s.service_type === 'ELECTRICITY'));
        }
      } catch (e) {
        console.error('Failed to load discos');
      }
    }
    init();
  }, []);

  const handleValidate = async () => {
    if (!selectedDisco || !meterNumber) return;
    setValidating(true);
    setError(null);
    setCustomerInfo(null);
    try {
      const discoService = services.find(s => s.name.toUpperCase().includes(selectedDisco.toUpperCase()));
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meterNum: meterNumber, serviceID: discoService?.serviceID, meterType: parseInt(meterType), type: 'ELECTRICITY' }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCustomerInfo(data);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo || !amount) {
      setError('Validate meter and enter amount');
      return;
    }

    if (parseFloat(amount) > walletBalance) {
      setError('Insufficient wallet balance');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const discoService = services.find(s => s.name.toUpperCase().includes(selectedDisco.toUpperCase()));
      const { data: { user } } = await supabase.auth.getUser();
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          serviceType: 'ELECTRICITY',
          amount: parseFloat(amount),
          mobileNumber: meterNumber,
          serviceID: discoService?.serviceID,
          meterType: parseInt(meterType),
        }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Payment failed');

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
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full border-2 border-yellow-500 flex items-center justify-center mx-auto mb-6">
          <Lightbulb size={40} className="text-yellow-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Bill Paid!</h2>
        <p className="text-slate-400 text-sm mb-6 px-6 leading-relaxed">
          ₦{parseFloat(amount).toLocaleString()} paid for {selectedDisco} ({meterNumber}).
        </p>
        <div className="glass-dark p-4 rounded-2xl border-indigo-500/10 mb-10 text-left">
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Token Code</p>
           <h3 className="text-xl font-black text-indigo-400 tracking-[0.2em]">0922 1823 1029 4812</h3>
        </div>
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
          <h1 className="text-lg font-black text-white leading-tight">Electricity</h1>
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Instant Tokens</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Disco Selector */}
        <div className="page-section mt-4 overflow-x-auto pb-2 no-scrollbar">
          <label className="form-label ml-1">Select Disco</label>
          <div className="flex gap-3 min-w-max pr-6">
            {discos.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDisco(d.name)}
                className={`network-chip h-20 w-24 flex-shrink-0 ${selectedDisco === d.name ? 'active' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full ${d.color} flex items-center justify-center text-white font-black text-lg mb-1`}>
                  {d.logo}
                </div>
                <span className="text-[9px] uppercase font-black">{d.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Meter Type */}
        <div className="page-section mt-6">
           <div className="grid grid-cols-2 gap-3 p-1.5 glass-dark rounded-2xl">
              <button 
                type="button" 
                onClick={() => setMeterType('1')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase transition-all ${meterType === '1' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500'}`}
              >
                Prepaid
              </button>
              <button 
                type="button" 
                onClick={() => setMeterType('2')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase transition-all ${meterType === '2' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500'}`}
              >
                Postpaid
              </button>
           </div>
        </div>

        {/* Meter Number */}
        <div className="page-section mt-8">
          <label className="form-label">Meter Number</label>
          <div className="flex gap-3">
            <div className="input-group flex-1">
              <Hash className="input-icon" size={18} />
              <input 
                type="tel" 
                placeholder="45012398457" 
                className="font-bold tracking-widest"
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
              />
            </div>
            <button 
              type="button" 
              onClick={handleValidate}
              disabled={validating || !meterNumber || !selectedDisco}
              className="px-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 font-black text-[10px] uppercase"
            >
              {validating ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
            </button>
          </div>
          
          {customerInfo && (
            <div className="mt-4 glass p-4 rounded-2xl border-emerald-500/10 animate-fade-in relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Zap size={48} className="text-emerald-500" />
               </div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Customer Details</p>
               <h4 className="text-sm font-black text-white uppercase mb-1">{customerInfo.customer_name}</h4>
               <p className="text-[11px] text-slate-400 font-bold uppercase truncate">{customerInfo.address}</p>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="page-section mt-8">
           <label className="form-label">Amount (₦)</label>
           <div className="input-group">
              <CreditCard className="input-icon" size={18} />
              <input 
                type="number" 
                placeholder="0.00" 
                className="text-lg font-black text-indigo-400"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
           </div>
        </div>

        <div className="page-section mt-10">
          <div className="glass-dark p-4 rounded-2xl flex items-center justify-between border-indigo-500/10 mb-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                   <CreditCard className="text-indigo-400" size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase">Wallet Balance</p>
                   <h4 className="text-sm font-black text-white uppercase tracking-tighter">
                      ₦{walletBalance.toLocaleString()}
                   </h4>
                </div>
             </div>
          </div>

          {error && <div className="alert alert-error mb-4 text-xs font-bold uppercase">{error}</div>}

          <button 
            type="submit" 
            disabled={loading || !customerInfo || !amount}
            className="btn-brand group relative"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : (
              <>Pay Bill <ArrowRight size={18} className="absolute right-6 group-hover:translate-x-1" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
