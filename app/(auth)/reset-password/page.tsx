'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Loader2, Eye, EyeOff, Zap, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    }
  };

  if (success) {
    return (
      <div style={{ width: '100%', textAlign: 'center' }} className="animate-scale-in">
        <div style={{
          width: 80, height: 80,
          background: 'rgba(16,185,129,0.12)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          border: '1.5px solid rgba(16,185,129,0.3)',
        }}>
          <CheckCircle size={40} color="var(--accent-green)" />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Password Updated!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }} className="animate-fade-up">
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <div className="brand-logo">
            <Zap size={28} color="white" strokeWidth={2.5} />
          </div>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>New Password</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Choose a strong password for your account</p>
      </div>

      <div className="card-glass" style={{ padding: '28px 24px' }}>
        <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label" htmlFor="new-password">New Password</label>
            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input
                id="new-password"
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
          </div>

          <div>
            <label className="form-label" htmlFor="confirm-new-password">Confirm New Password</label>
            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input
                id="confirm-new-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Repeat new password"
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

          {error && (
            <div className="alert alert-error animate-fade-in">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button
            id="update-password-submit"
            type="submit"
            disabled={loading}
            className="btn-brand"
            style={{ gap: '8px' }}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Updating...</>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
