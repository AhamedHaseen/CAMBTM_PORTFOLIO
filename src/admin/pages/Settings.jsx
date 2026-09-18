import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Database,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Download,
  FileCode,
  FileJson,
  KeyRound,
  RefreshCw,
  QrCode,
  Copy,
  ExternalLink,
  Server,
  Mail,
  Send,
  Eye,
  EyeOff,
  Check,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useToast } from '../components/Toast';
import { apiRequest, parseResponseJson } from '../utils/api';

export default function Settings() {
  const { user, updateProfile, checkAuth } = useAuth();
  const toast = useToast();

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    avatar: user?.avatar || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [systemInfo, setSystemInfo] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Hostinger SMTP & Email 2FA State
  const [smtpForm, setSmtpForm] = useState({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    user: '',
    pass: '',
    fromName: 'Cambridge Marketing Security',
    fromEmail: '',
    twoFactorEnabled: false,
    twoFactorMethod: 'email'
  });
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [testTargetEmail, setTestTargetEmail] = useState('');
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState(null);

  // 2FA Setup state (Authenticator TOTP)
  const [twoFactorModal, setTwoFactorModal] = useState(false);
  const [twoFactorSetupData, setTwoFactorSetupData] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableModal, setDisableModal] = useState(false);

  // Database Connection Switcher State
  const [connectionUri, setConnectionUri] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [savingConnection, setSavingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState(null);

  useEffect(() => {
    fetchSystemInfo();
    fetchSmtpSettings();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const res = await apiRequest('/api/settings');
      const data = await parseResponseJson(res);
      if (data && data.system) {
        setSystemInfo(data.system);
      }
    } catch (e) {}
  };

  const fetchSmtpSettings = async () => {
    try {
      const res = await apiRequest('/api/settings/smtp');
      const data = await parseResponseJson(res);
      if (data && data.success && data.smtp) {
        setSmtpForm(prev => ({
          ...prev,
          ...data.smtp,
          host: data.smtp.host || 'smtp.hostinger.com',
          port: data.smtp.port || 465,
          user: data.smtp.user || '',
          fromEmail: data.smtp.fromEmail || data.smtp.user || '',
          fromName: data.smtp.fromName || 'Cambridge Marketing Security',
          twoFactorEnabled: Boolean(data.smtp.twoFactorEnabled),
          twoFactorMethod: data.smtp.twoFactorMethod || 'email'
        }));
      }
    } catch (e) {}
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile(profileForm);
      toast.success('Admin profile updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Profile update failed.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await apiRequest('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await parseResponseJson(res);
      if (data.success) {
        toast.success('Password changed successfully.');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.error || 'Password update failed.');
      }
    } catch (err) {
      toast.error('Network error while updating password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSmtpSubmit = async (e) => {
    e.preventDefault();
    setSmtpSaving(true);
    setSmtpTestResult(null);
    try {
      const res = await apiRequest('/api/settings/smtp', {
        method: 'PUT',
        body: JSON.stringify(smtpForm)
      });
      const data = await parseResponseJson(res);
      if (data.success) {
        toast.success('Hostinger SMTP & 2FA configuration saved successfully!');
        if (data.smtp) {
          setSmtpForm(prev => ({ ...prev, ...data.smtp }));
        }
        await checkAuth();
      } else {
        toast.error(data.error || 'Failed to save SMTP settings.');
      }
    } catch (err) {
      toast.error('Network error saving SMTP settings.');
    } finally {
      setSmtpSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!smtpForm.user) {
      toast.error('Please enter your complete Hostinger email username first.');
      return;
    }
    setSmtpTesting(true);
    setSmtpTestResult(null);
    try {
      const recipient = testTargetEmail.trim() || user?.email || smtpForm.user;
      const res = await apiRequest('/api/settings/smtp/test', {
        method: 'POST',
        body: JSON.stringify({
          ...smtpForm,
          targetEmail: recipient
        })
      });
      const data = await parseResponseJson(res);
      setSmtpTestResult(data);
      if (data.success) {
        toast.success(data.message || `SMTP test email delivered to ${recipient}!`);
      } else {
        toast.error(data.error || 'SMTP connection failed.');
      }
    } catch (err) {
      setSmtpTestResult({ success: false, error: err.message });
      toast.error('Network error during SMTP test.');
    } finally {
      setSmtpTesting(false);
    }
  };

  const handleStart2FASetup = async () => {
    setTwoFactorLoading(true);
    try {
      const res = await apiRequest('/api/auth/setup-2fa');
      const data = await parseResponseJson(res);
      if (data.success) {
        setTwoFactorSetupData(data);
        setTwoFactorModal(true);
      } else {
        toast.error(data.error || 'Failed to initialize 2FA');
      }
    } catch (err) {
      toast.error('Network error starting 2FA setup');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleConfirm2FA = async (e) => {
    e.preventDefault();
    setTwoFactorLoading(true);
    try {
      const res = await apiRequest('/api/auth/confirm-2fa', {
        method: 'POST',
        body: JSON.stringify({
          secret: twoFactorSetupData.secret,
          code: twoFactorCode,
          recoveryCodes: twoFactorSetupData.recoveryCodes
        })
      });
      const data = await parseResponseJson(res);
      if (data.success) {
        toast.success('Two-Factor Authentication is now active and enforced.');
        setTwoFactorModal(false);
        setTwoFactorCode('');
        await checkAuth();
      } else {
        toast.error(data.error || 'Invalid 6-digit code. Please try again.');
      }
    } catch (err) {
      toast.error('Network error during 2FA confirmation');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setTwoFactorLoading(true);
    try {
      const res = await apiRequest('/api/auth/disable-2fa', {
        method: 'POST',
        body: JSON.stringify({ password: disablePassword })
      });
      const data = await parseResponseJson(res);
      if (data.success) {
        toast.success('Two-Factor Authentication has been disabled.');
        setDisableModal(false);
        setDisablePassword('');
        await checkAuth();
      } else {
        toast.error(data.error || 'Password incorrect');
      }
    } catch (err) {
      toast.error('Failed to disable 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Database Export & Backups
  const handleDownloadDatabase = (format) => {
    const token = localStorage.getItem('cambm_token');
    window.open(`/api/database/export?format=${format}${token ? `&token=${token}` : ''}`, '_blank');
    toast.success(`Exporting database as ${format.toUpperCase()} snapshot...`);
  };

  const handleDownloadBackup = () => {
    const token = localStorage.getItem('cambm_token');
    window.open(`/api/database/backup${token ? `?token=${token}` : ''}`, '_blank');
    toast.success('Generating and downloading full database backup archive...');
  };

  // Test and Switch Connection
  const handleTestConnection = async () => {
    if (!connectionUri || !connectionUri.startsWith('postgres')) {
      toast.error('Please enter a valid PostgreSQL URI (postgresql://...)');
      return;
    }

    setTestingConnection(true);
    setConnectionTestResult(null);
    try {
      const res = await apiRequest('/api/database/test-connection', {
        method: 'POST',
        body: JSON.stringify({ connectionUri })
      });
      const data = await parseResponseJson(res);
      setConnectionTestResult(data);
      if (data.success) {
        toast.success(data.message || 'Connection test successful!');
      } else {
        toast.error(data.error || 'Connection failed.');
      }
    } catch (err) {
      setConnectionTestResult({ success: false, error: err.message });
      toast.error('Network error during connection test');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleUpdateConnection = async () => {
    if (!connectionUri || !connectionUri.startsWith('postgres')) {
      toast.error('Please enter a valid PostgreSQL URI');
      return;
    }

    if (!window.confirm('Are you sure you want to switch the database target server? Server will use the new connection.')) {
      return;
    }

    setSavingConnection(true);
    try {
      const res = await apiRequest('/api/database/update-connection', {
        method: 'POST',
        body: JSON.stringify({ connectionUri })
      });
      const data = await parseResponseJson(res);
      if (data.success) {
        toast.success('Database connection updated successfully!');
        setConnectionUri('');
        setConnectionTestResult(null);
        fetchSystemInfo();
      } else {
        toast.error(data.error || 'Could not update connection');
      }
    } catch (err) {
      toast.error('Error saving connection');
    } finally {
      setSavingConnection(false);
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Settings & System Security</h1>
          <p className="adm-page-desc">
            Manage your administrator profile, Hostinger SMTP configuration, Two-Factor Authentication, and database connections.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Profile Settings */}
        <div className="adm-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <User size={18} color="var(--adm-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--adm-text-main)' }}>
              Administrator Profile
            </h3>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="adm-form-group">
              <label className="adm-form-label">Full Name</label>
              <input
                type="text"
                required
                value={profileForm.full_name}
                onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                className="adm-input"
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="adm-input"
                style={{ opacity: 0.65, cursor: 'not-allowed' }}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Avatar URL (Optional)</label>
              <input
                type="text"
                placeholder="https://example.com/avatar.jpg"
                value={profileForm.avatar}
                onChange={e => setProfileForm({ ...profileForm, avatar: e.target.value })}
                className="adm-input"
              />
            </div>

            <button type="submit" disabled={profileSaving} className="adm-btn adm-btn-primary">
              <Save size={15} />
              <span>{profileSaving ? 'Saving...' : 'Update Profile'}</span>
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="adm-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Lock size={18} color="var(--adm-accent)" />
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--adm-text-main)' }}>
              Change Password & Encryption
            </h3>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="adm-form-group">
              <label className="adm-form-label">Current Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="adm-input"
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">New Password (min 8 chars) *</label>
              <input
                type="password"
                required
                minLength="8"
                placeholder="••••••••••••"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="adm-input"
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Confirm New Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="adm-input"
              />
            </div>

            <button type="submit" disabled={passwordSaving} className="adm-btn adm-btn-primary">
              <Lock size={15} />
              <span>{passwordSaving ? 'Updating...' : 'Change Password'}</span>
            </button>
          </form>
        </div>

        {/* SMTP & EMAIL 2FA CONFIGURATION CARD */}
        <div className="adm-card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--adm-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-primary)' }}>
                <Mail size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--adm-text-main)' }}>
                  SMTP & Email Two-Factor Authentication Settings
                </h3>
                <div style={{ fontSize: '13px', color: 'var(--adm-text-muted)', marginTop: '2px' }}>
                  Provide your SMTP server details to automatically dispatch 2FA login verification codes via email.
                </div>
              </div>
            </div>

            <div>
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                padding: '6px 14px',
                borderRadius: '20px',
                background: smtpForm.twoFactorEnabled ? 'var(--adm-success-bg)' : 'var(--adm-danger-bg)',
                color: smtpForm.twoFactorEnabled ? 'var(--adm-success)' : 'var(--adm-danger)',
                border: `1px solid ${smtpForm.twoFactorEnabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                {smtpForm.twoFactorEnabled ? '2FA VIA EMAIL: ENABLED' : '2FA VIA EMAIL: DISABLED'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSmtpSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* SMTP Host */}
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">
                  SMTP Host *
                </label>
                <input
                  type="text"
                  required
                  value={smtpForm.host}
                  onChange={e => setSmtpForm({ ...smtpForm, host: e.target.value })}
                  placeholder="smtp.hostinger.com"
                  className="adm-input"
                />
              </div>

              {/* SMTP Port */}
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">
                  Port *
                </label>
                <select
                  value={smtpForm.port}
                  onChange={e => {
                    const p = parseInt(e.target.value, 10);
                    setSmtpForm({ ...smtpForm, port: p, secure: p === 465 });
                  }}
                  className="adm-input"
                >
                  <option value="465">465 (SSL - Default)</option>
                  <option value="587">587 (TLS)</option>
                </select>
              </div>

              {/* Username */}
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">
                  Username *
                </label>
                <input
                  type="email"
                  required
                  value={smtpForm.user}
                  onChange={e => setSmtpForm({ ...smtpForm, user: e.target.value, fromEmail: e.target.value })}
                  placeholder="hello@yourdomain.com"
                  className="adm-input"
                />
              </div>

              {/* Password */}
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">
                  Password (Optional for Cloud API)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSmtpPassword ? 'text' : 'password'}
                    value={smtpForm.pass}
                    onChange={e => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                    placeholder={smtpForm.hasPassword ? '•••••••••••• (Saved)' : 'Enter password if using SMTP'}
                    className="adm-input"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--adm-text-dim)', cursor: 'pointer', padding: 0 }}
                  >
                    {showSmtpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* TWO-FACTOR AUTHENTICATION TOGGLE SECTION */}
            <div style={{
              background: 'var(--adm-surface)',
              border: '1px solid var(--adm-border)',
              borderRadius: '12px',
              padding: '18px 20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={18} color={smtpForm.twoFactorEnabled ? 'var(--adm-success)' : 'var(--adm-primary)'} />
                    <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--adm-text-main)' }}>
                      Two-Factor Authentication (2FA) via Email
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', margin: '6px 0 0', lineHeight: '1.5' }}>
                    When enabled, whenever an admin logs in, a 6-digit OTP verification code will automatically be sent to their login email address.
                  </p>
                </div>

                <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={smtpForm.twoFactorEnabled}
                    onChange={e => setSmtpForm({ ...smtpForm, twoFactorEnabled: e.target.checked, twoFactorMethod: 'email' })}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--adm-primary)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: smtpForm.twoFactorEnabled ? 'var(--adm-success)' : 'var(--adm-text-main)' }}>
                    {smtpForm.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled (Direct Login)'}
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="submit"
                disabled={smtpSaving}
                className="adm-btn adm-btn-primary"
                style={{ padding: '10px 24px' }}
              >
                <Save size={15} />
                <span>{smtpSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Database & Backup Management (Restricted to Database/System Admins) */}
        {(user?.role === 'admin' || (user?.permissions || []).includes('*') || (user?.permissions || []).some(p => ['manage_database', 'system_settings'].includes(p))) && (
          <div className="adm-card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={18} color="var(--adm-success)" />
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--adm-text-main)' }}>
                  Database Management, Backups & Server Connection
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadDatabase('json')}
                  className="adm-btn adm-btn-secondary adm-btn-sm"
                >
                  <FileJson size={14} />
                  <span>Export JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadDatabase('sql')}
                  className="adm-btn adm-btn-secondary adm-btn-sm"
                >
                  <FileCode size={14} />
                  <span>Export SQL</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="adm-btn adm-btn-primary adm-btn-sm"
                >
                  <Download size={14} />
                  <span>Download Full Backup (.cambmbak)</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--adm-surface)', padding: '16px', borderRadius: 'var(--adm-radius-md)' }}>
                <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Active DB Driver</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--adm-text-main)', marginTop: '4px' }}>
                  {systemInfo?.databaseEngine === 'postgresql' ? 'PostgreSQL (Supabase Cloud)' : 'Local Engine'}
                </div>
              </div>
              <div style={{ background: 'var(--adm-surface)', padding: '16px', borderRadius: 'var(--adm-radius-md)' }}>
                <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Server Node Environment</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--adm-text-main)', marginTop: '4px' }}>
                  {systemInfo?.nodeEnv || 'development'}
                </div>
              </div>
              <div style={{ background: 'var(--adm-surface)', padding: '16px', borderRadius: 'var(--adm-radius-md)' }}>
                <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', textTransform: 'uppercase' }}>Server UTC Time</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--adm-text-main)', marginTop: '4px' }}>
                  {systemInfo?.serverTime ? new Date(systemInfo.serverTime).toUTCString() : 'Active'}
                </div>
              </div>
            </div>

            {/* Target Connection Switcher */}
            <div style={{ borderTop: '1px solid var(--adm-border)', paddingTop: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--adm-text-main)', marginBottom: '8px' }}>
                Dynamic Target PostgreSQL Database Connection Switcher
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', marginBottom: '14px' }}>
                Switch production Supabase or remote PostgreSQL target on the fly without server restarts.
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="password"
                  placeholder="postgresql://postgres:[password]@db.[id].supabase.co:5432/postgres"
                  value={connectionUri}
                  onChange={e => setConnectionUri(e.target.value)}
                  className="adm-input"
                  style={{ flex: 1, minWidth: '300px' }}
                />
                <button
                  type="button"
                  disabled={testingConnection || !connectionUri}
                  onClick={handleTestConnection}
                  className="adm-btn adm-btn-secondary"
                >
                  <RefreshCw size={14} className={testingConnection ? 'adm-spin' : ''} />
                  <span>{testingConnection ? 'Testing...' : 'Test Connection'}</span>
                </button>
                <button
                  type="button"
                  disabled={savingConnection || !connectionUri}
                  onClick={handleUpdateConnection}
                  className="adm-btn adm-btn-primary"
                >
                  <Save size={14} />
                  <span>{savingConnection ? 'Updating...' : 'Apply Connection'}</span>
                </button>
              </div>

              {connectionTestResult && (
                <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: connectionTestResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: connectionTestResult.success ? 'var(--adm-success)' : 'var(--adm-danger)', fontSize: '13px' }}>
                  {connectionTestResult.success ? '✅ Connection string verified and operational.' : `❌ Error: ${connectionTestResult.error}`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2FA Setup Modal (TOTP QR Code) */}
      {twoFactorModal && twoFactorSetupData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ maxWidth: '460px', width: '100%', background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <QrCode size={22} color="var(--adm-primary)" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--adm-text-main)' }}>
                Setup Authenticator App
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
              Scan the QR code below using Google Authenticator, 1Password, or Apple Passwords:
            </p>

            <div style={{ textAlign: 'center', margin: '20px 0', background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', width: 'auto' }}>
              {twoFactorSetupData.qrCode ? (
                <img src={twoFactorSetupData.qrCode} alt="2FA QR Code" style={{ width: '180px', height: '180px', display: 'block' }} />
              ) : (
                <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>QR Code</div>
              )}
            </div>

            <div style={{ background: 'var(--adm-bg)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', wordBreak: 'break-all', fontFamily: 'monospace', color: 'var(--adm-primary)', marginBottom: '18px', textAlign: 'center' }}>
              Manual Key: {twoFactorSetupData.secret}
            </div>

            <form onSubmit={handleConfirm2FA}>
              <div className="adm-form-group">
                <label className="adm-form-label">Enter 6-Digit Code to verify:</label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  autoFocus
                  placeholder="123456"
                  value={twoFactorCode}
                  onChange={e => setTwoFactorCode(e.target.value)}
                  className="adm-input"
                  style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => { setTwoFactorModal(false); setTwoFactorCode(''); }}
                  className="adm-btn adm-btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={twoFactorLoading || twoFactorCode.length < 6}
                  className="adm-btn adm-btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Check size={16} />
                  <span>{twoFactorLoading ? 'Verifying...' : 'Enable 2FA'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {disableModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ maxWidth: '420px', width: '100%', background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <AlertCircle size={22} color="var(--adm-danger)" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--adm-text-main)' }}>
                Disable 2FA Protection
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
              Please enter your administrator password to confirm disabling Two-Factor Authentication on this account:
            </p>

            <form onSubmit={handleDisable2FA}>
              <div className="adm-form-group">
                <label className="adm-form-label">Password *</label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="••••••••••••"
                  value={disablePassword}
                  onChange={e => setDisablePassword(e.target.value)}
                  className="adm-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => { setDisableModal(false); setDisablePassword(''); }}
                  className="adm-btn adm-btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={twoFactorLoading || !disablePassword}
                  className="adm-btn adm-btn-danger"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <span>{twoFactorLoading ? 'Disabling...' : 'Confirm Disable'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
