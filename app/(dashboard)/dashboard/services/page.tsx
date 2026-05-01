'use client';
import React from 'react';
import { 
  ChevronLeft, Smartphone, BarChart3, Tv, Lightbulb, 
  GraduationCap, Globe, ShieldCheck, Mail, Send,
  ArrowRight, Sparkles, Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const mainServices = [
  { name: 'Airtime', icon: Smartphone, color: 'bg-blue-500', path: '/dashboard/airtime', desc: 'Instant VTU recharge' },
  { name: 'Data', icon: BarChart3, color: 'bg-indigo-500', path: '/dashboard/data', desc: 'Cheap data bundles' },
  { name: 'Cable TV', icon: Tv, color: 'bg-purple-500', path: '/dashboard/cable', desc: 'DSTV, Gotv, StarTimes' },
  { name: 'Electricity', icon: Lightbulb, color: 'bg-amber-500', path: '/dashboard/electricity', desc: 'Prepaid & Postpaid' },
];

const otherServices = [
  { name: 'Education', icon: GraduationCap, color: 'bg-rose-500', path: '/dashboard/education', desc: 'WAEC/NECO pins' },
  { name: 'Data PIN', icon: ShieldCheck, color: 'bg-emerald-500', path: '/dashboard/datapin', desc: 'Direct recharge pins' },
  { name: 'Bulk SMS', icon: Mail, color: 'bg-cyan-500', path: '/dashboard/bulksms', desc: 'Send mass messages' },
  { name: 'Internet', icon: Globe, color: 'bg-blue-600', path: '/dashboard/internet', desc: 'Smiles, Spectranet' },
];

export default function ServicesPage() {
  const router = useRouter();

  return (
    <div className="animate-fade-in">
      <div className="page-section flex items-center gap-4 py-4">
        <button onClick={() => router.back()} className="w-10 h-10 glass rounded-full flex items-center justify-center text-slate-400">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-black text-white leading-tight">All Services</h1>
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Fast & Automated</p>
        </div>
      </div>

      {/* Featured Service Card */}
      <div className="page-section mt-4">
        <div className="relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl" />
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
           <div className="relative p-6 flex items-center justify-between">
              <div>
                 <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-yellow-400 animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Special Offer</span>
                 </div>
                 <h3 className="text-xl font-black text-white mb-1">MTN Data Promo</h3>
                 <p className="text-xs text-indigo-100 font-bold opacity-80 uppercase tracking-tighter">Get 1GB SME @ ₦245 only</p>
              </div>
              <button onClick={() => router.push('/dashboard/data')} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white active:scale-90 transition-transform">
                 <ArrowRight size={24} />
              </button>
           </div>
        </div>
      </div>

      {/* Main Categories */}
      <div className="page-section mt-8">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2">Main Utility</h3>
        <div className="grid grid-cols-1 gap-3">
          {mainServices.map((service, idx) => (
            <Link 
              key={service.name} 
              href={service.path}
              className="glass-dark p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-transform animate-fade-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-2xl ${service.color} flex items-center justify-center text-white shadow-lg shadow-${service.color.split('-')[1]}-500/20`}>
                    <service.icon size={24} />
                 </div>
                 <div>
                    <h4 className="text-[14px] font-black text-white uppercase tracking-tight">{service.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{service.desc}</p>
                 </div>
              </div>
              <div className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-600 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                 <ChevronRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* More Services */}
      <div className="page-section mt-8 mb-10">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2">More Services</h3>
        <div className="grid grid-cols-2 gap-3">
          {otherServices.map((service, idx) => (
            <Link 
              key={service.name} 
              href={service.path}
              className="glass-dark p-5 rounded-2xl text-center group active:scale-[0.97] transition-transform animate-fade-up"
              style={{ animationDelay: `${(idx + 4) * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-2xl ${service.color} flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-${service.color.split('-')[1]}-500/10 transition-transform group-hover:scale-110`}>
                 <service.icon size={22} />
              </div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-1">{service.name}</h4>
              <p className="text-[9px] text-slate-500 font-bold uppercase truncate">{service.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Support Card */}
      <div className="page-section mb-6">
        <div className="card-glass p-6 text-center border-emerald-500/10">
           <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <Zap className="text-emerald-500 fill-emerald-500/20" size={24} />
           </div>
           <h3 className="text-sm font-black text-white uppercase mb-2 tracking-tight">Need Support?</h3>
           <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-6 leading-relaxed">
             Facing any issues with your transactions? Our support team is active 24/7.
           </p>
           <button className="btn-ghost w-full flex items-center justify-center gap-2 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500">
              <Send size={16} /> Contact Support
           </button>
        </div>
      </div>
    </div>
  );
}
