'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Mail, Loader2, ArrowLeft, Zap, CheckCircle, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
      : `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }} className="animate-fade-up">
      {/* Brand Logo */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <div className="brand-logo">
            <Zap size={28} color="white" strokeWidth={2.5} />
          </div>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>
          Forgot Password?
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '260px', margin: '0 auto' }}>
          Enter your email and we&apos;ll send a reset link
        </p>
      </div>

      {success ? (
        <div className="card-glass animate-scale-in" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72,
            background: 'rgba(16,185,129,0.12)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            border: '1.5px solid rgba(16,185,129,0.3)',
          }}>
            <CheckCircle size={36} color="var(--accent-green)" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Email Sent!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            We sent a password reset link to{' '}
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{email}</span>.
            Check your inbox and spam folder.
          </p>
          <Link
            href="/login"
            className="btn-brand"
            style={{ marginTop: '24px', display: 'flex', gap: '8px', textDecoration: 'none' }}
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <div className="card-glass" style={{ padding: '28px 24px' }}>
          <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label" htmlFor="reset-email">Email Address</label>
              <div className="input-group">
                <Mail className="input-icon" size={18} />
                <input
                  id="reset-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-error animate-fade-in">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              id="reset-submit"
              type="submit"
              disabled={loading}
              className="btn-brand"
              style={{ gap: '8px' }}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Sending...</>
              ) : (
                <><Send size={16} /> Send Reset Link</>
              )}
            </button>
          </form>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link
          href="/login"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    </div>
  );
}
