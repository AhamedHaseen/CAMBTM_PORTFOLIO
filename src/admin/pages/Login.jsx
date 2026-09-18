import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Shield, ArrowRight, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { apiRequest, parseResponseJson } from '../utils/api';

export default function Login() {
  const { login, verify2FA } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2FA Step State
  const [step2FA, setStep2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorMethod, setTwoFactorMethod] = useState('email');
  const [twoFactorEmail, setTwoFactorEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot password modal
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const from = (location.state?.from?.pathname && !['/studio', '/STUDIO', '/studio/login', '/STUDIO/login', '/admin', '/admin/login'].includes(location.state.from.pathname))
    ? location.state.from.pathname
    : '/studio/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(email, password, rememberMe);
      if (res && res.requires2FA) {
        setTempToken(res.tempToken);
        setTwoFactorMethod(res.method || 'email');
        setTwoFactorEmail(res.email || email);
        setStep2FA(true);
        if (res.method === 'email') {
          toast.info(`A 6-digit verification code has been sent to ${res.email || email}.`);
        } else {
          toast.info('Two-Factor Authentication is required. Please enter your code.');
        }
      } else {
        toast.success('Welcome back to Cambridge Marketing Admin!');
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FASubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!twoFactorCode || twoFactorCode.length < 6) {
      setError('Please enter a valid 6-digit authentication code.');
      return;
    }

    setLoading(true);
    try {
      await verify2FA(tempToken, twoFactorCode);
      toast.success('2FA Verified! Welcome to Cambridge Marketing Admin.');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid 2FA code.');
      toast.error(err.message || '2FA Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend2FA = async () => {
    if (resendCooldown > 0 || resendLoading || !tempToken) return;
    setResendLoading(true);
    setError('');
    try {
      const res = await apiRequest('/api/auth/resend-2fa-email', {
        method: 'POST',
        body: JSON.stringify({ tempToken })
      });
      const data = await parseResponseJson(res);
      if (data.success) {
        toast.success(data.message || 'Verification code resent successfully.');
        setResendCooldown(30);
        const timer = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.error || 'Failed to resend code.');
        toast.error(data.error || 'Could not resend code.');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;

    try {
      const res = await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await parseResponseJson(res);
      if (data.success) {
        setForgotSent(true);
        toast.success(data.message || 'Password reset instructions sent.');
      } else {
        toast.error(data.error || 'Failed to send reset link.');
      }
    } catch (err) {
      toast.error('Failed to send reset link.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #090b10 70%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#11141c',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '36px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="/images/cambridge-logo.png"
            alt="Cambridge Marketing"
            className="adm-login-logo"
            style={{ height: '36px', width: 'auto', marginBottom: '16px', filter: 'none' }}
          />
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#f8fafc', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {step2FA ? 'Two-Factor Authentication' : 'ADMIN PORTAL'}
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            {step2FA
              ? (twoFactorMethod === 'email' ? 'Enter the 6-digit code sent to your email' : 'Enter your 6-digit code or backup recovery code')
              : 'Sign in to access Cambridge Marketing Admin'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            color: '#ef4444',
            fontSize: '13px',
            marginBottom: '20px',
            lineHeight: '1.4'
          }}>
            {error}
          </div>
        )}

        {/* STEP 1: Standard Password Form */}
        {!step2FA ? (
          <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 36px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 36px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#94a3b8' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#6366f1' }}
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px',
                background: '#6366f1',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontWeight: '600',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                marginTop: '6px'
              }}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* STEP 2: 2FA Verification Form */
          <form onSubmit={handleVerify2FASubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              {twoFactorMethod === 'email' ? (
                <>
                  <Mail size={24} color="#818cf8" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>
                    Email Verification Code
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
                    We sent a 6-digit OTP security code to<br />
                    <strong style={{ color: '#38bdf8' }}>{twoFactorEmail || email}</strong>
                  </div>
                </>
              ) : (
                <>
                  <KeyRound size={24} color="#818cf8" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.4' }}>
                    Open your authenticator app (Google Authenticator, 1Password, Apple Passwords) and enter the 6-digit code.
                  </div>
                </>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px', textAlign: 'center' }}>
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                autoFocus
                required
                maxLength="9"
                value={twoFactorCode}
                onChange={e => setTwoFactorCode(e.target.value)}
                placeholder="123456"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '24px',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  fontWeight: '700',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {twoFactorMethod === 'email' && (
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || resendLoading}
                  onClick={handleResend2FA}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? '#64748b' : '#818cf8',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    padding: '4px'
                  }}
                >
                  {resendLoading ? 'Sending new code...' : resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive email? Resend Code"}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !twoFactorCode}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px',
                background: '#6366f1',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontWeight: '600',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
              }}
            >
              <span>{loading ? 'Verifying 2FA...' : 'Verify & Enter CMS'}</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                setStep2FA(false);
                setTempToken('');
                setTwoFactorCode('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '13px',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to standard login</span>
            </button>
          </form>
        )}

        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
          Protected by HTTPS Strict Transport Security (HSTS) & Rate Limiting
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ maxWidth: '420px', width: '100%', background: '#11141c', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: '0 0 10px' }}>
              Reset Password Request
            </h3>
            {forgotSent ? (
              <div>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: '#34d399', margin: 0, lineHeight: '1.5' }}>
                    <strong>✓ Alert Dispatched:</strong> A security notification with your account details has been sent to the administrator. The administrator will verify and issue your new credentials.
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => { setForgotModal(false); setForgotSent(false); }}
                    className="adm-btn adm-btn-primary"
                  >
                    Got It, Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px', lineHeight: '1.5' }}>
                  Enter your registered email address. An automated security alert with your request details will be sent directly to the primary administrator for verification.
                </p>
                <input
                  type="email"
                  required
                  placeholder="admin@cambm.com"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  className="adm-input"
                  style={{ marginBottom: '20px' }}
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setForgotModal(false)} className="adm-btn adm-btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="adm-btn adm-btn-primary">
                    Send Request to Admin
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
