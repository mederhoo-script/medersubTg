'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, User, Loader2, Eye, EyeOff, Zap, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const passwordStrength = (): { label: string; color: string; width: string } => {
    if (password.length === 0) return { label: '', color: 'transparent', width: '0%' };
    if (password.length < 6) return { label: 'Weak', color: 'var(--accent-red)', width: '25%' };
    if (password.length < 8) return { label: 'Fair', color: 'var(--accent-amber)', width: '50%' };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: 'Good', color: 'var(--accent-cyan)', width: '75%' };
    return { label: 'Strong', color: 'var(--accent-green)', width: '100%' };
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    }
  };

  const strength = passwordStrength();

  if (success) {
    return (
      <div style={{ width: '100%', textAlign: 'center' }} className="animate-scale-in">
        <div style={{
          width: 80, height: 80,
          background: 'rgba(16,185,129,0.15)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          border: '2px solid var(--accent-green)',
        }}>
          <CheckCircle size={40} color="var(--accent-green)" />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Account Created!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Taking you to your dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }} className="animate-fade-up">
      {/* Brand Logo */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <div className="brand-logo">
            <Zap size={28} color="white" strokeWidth={2.5} />
          </div>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.5px' }}>
          Create Account
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Join MederSub — it takes 30 seconds
        </p>
      </div>

      {/* Form Card */}
      <div className="card-glass" style={{ padding: '28px 24px' }}>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Full Name */}
          <div>
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <div className="input-group">
              <User className="input-icon" size={18} />
              <input
                id="fullName"
                type="text"
                required
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <div className="input-group">
              <Mail className="input-icon" size={18} />
              <input
                id="reg-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                style={{ paddingRight: '48px' }}
              />
              <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', padding: '8px', color: 'var(--text-muted)' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Password strength bar */}
            {password.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ height: '4px', background: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: strength.width, background: strength.color,
                    borderRadius: '4px', transition: 'width 300ms ease, background 300ms ease',
                  }} />
                </div>
                <span style={{ fontSize: '11px', color: strength.color, marginTop: '4px', display: 'block' }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                style={{ paddingRight: '48px' }}
              />
              <button type="button" className="input-icon-right" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ background: 'none', padding: '8px', color: 'var(--text-muted)' }}>
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
            id="register-submit"
            type="submit"
            disabled={loading}
            className="btn-brand"
            style={{ marginTop: '4px', gap: '8px' }}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Creating account...</>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>

      {/* Login Link */}
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--brand-400)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  );
}
