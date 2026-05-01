'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, Loader2, Eye, EyeOff, Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Pre-fill if Telegram user data is available
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      if (tgUser.username) {
        setEmail(`${tgUser.username}@medersub.tg`);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      console.log('Login Success!', data.user?.email);
      router.refresh();
      router.push('/dashboard');
    }
  };

  return (
    <div style={{ width: '100%' }} className="animate-fade-up">
      {/* Brand Logo */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div className="brand-logo animate-pulse-glow">
            <Zap size={28} color="white" strokeWidth={2.5} />
          </div>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.5px' }}>
          Welcome back
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Sign in to your MederSub account
        </p>
      </div>

      {/* Form Card */}
      <div className="card-glass" style={{ padding: '28px 24px' }}>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email Field */}
          <div>
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-group">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', padding: '8px', color: 'var(--text-muted)' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div style={{ textAlign: 'right', marginTop: '-6px' }}>
            <Link
              href="/forgot-password"
              style={{ fontSize: '13px', color: 'var(--brand-400)', fontWeight: 500 }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-error animate-fade-in">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-brand"
            style={{ marginTop: '4px', gap: '8px' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>

      {/* Register Link */}
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          style={{ color: 'var(--brand-400)', fontWeight: 600 }}
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
