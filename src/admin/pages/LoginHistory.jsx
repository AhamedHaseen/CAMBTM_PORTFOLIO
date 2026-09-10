import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, ShieldAlert, Laptop, Smartphone, Search, RefreshCw, Clock, Calendar } from 'lucide-react';
import { useToast } from '../components/Toast';
import { formatLocalDateTime } from '../utils/date';
import { apiRequest } from '../utils/api';

export default function LoginHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentTime, setCurrentTime] = useState(new Date());

  const toast = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchLogins = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const res = await apiRequest(`/api/login-history?${params.toString()}`);
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setLogs(data.logs || []);
        }
      }
    } catch (err) {
      toast.error('Failed to load login history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogins();
  }, [statusFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return formatLocalDateTime(dateStr);
  };

  const formatIpAddress = (ip) => {
    if (!ip) return '127.0.0.1';
    let cleaned = String(ip).trim();
    if (cleaned.includes(',')) cleaned = cleaned.split(',')[0].trim();
    if (cleaned.startsWith('::ffff:')) cleaned = cleaned.replace('::ffff:', '');
    if (cleaned === '::1' || cleaned === 'localhost') return '127.0.0.1';
    return cleaned;
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Login History & Session Tracking</h1>
          <p className="adm-page-desc">
            Real-time tracking of successful sign-ins, active admin sessions, and failed authentication attempts.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--adm-surface)',
            border: '1px solid var(--adm-border)',
            padding: '8px 14px',
            borderRadius: 'var(--adm-radius-md)',
            fontSize: '13px',
            color: 'var(--adm-text-main)',
            fontWeight: '600'
          }}>
            <Calendar size={15} color="var(--adm-primary)" />
            <span>{currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <Clock size={15} color="var(--adm-accent)" style={{ marginLeft: '4px' }} />
            <span style={{ fontFamily: 'monospace' }}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>

          <button onClick={fetchLogins} className="adm-icon-btn" title="Refresh list">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      <div className="adm-table-container">
        <div className="adm-table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--adm-text-dim)' }}>Status Filter:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="adm-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
            >
              <option value="All">All Events</option>
              <option value="SUCCESS">Successful Logins</option>
              <option value="FAILED">Failed Attempts</option>
              <option value="LOCKED">Locked Accounts</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--adm-text-muted)' }}>Loading authentication logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <History size={40} color="var(--adm-text-dim)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', color: 'var(--adm-text-main)', margin: '0 0 6px' }}>No Login Records</h3>
            <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', margin: 0 }}>
              Login events will be recorded automatically when users authenticate.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>User Account</th>
                  <th>Device / Browser</th>
                  <th>IP Address</th>
                  <th>Status</th>
                  <th>Login Timestamp</th>
                  <th>Logout Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const isSuccess = log.status === 'SUCCESS';
                  const isOngoing = isSuccess && !log.logout_time;
                  return (
                    <tr key={log.id}>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--adm-text-main)' }}>{log.email}</div>
                        <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)' }}>{log.admin_user || 'Admin User'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--adm-text-main)', fontSize: '13px' }}>
                          {log.device === 'Mobile' ? <Smartphone size={14} /> : <Laptop size={14} />}
                          <span>{log.device} • {log.browser}</span>
                        </div>
                      </td>
                      <td>
                        <code style={{ fontSize: '12px', background: 'var(--adm-surface)', padding: '2px 6px', borderRadius: '4px' }}>
                          {formatIpAddress(log.ip_address)}
                        </code>
                      </td>
                      <td>
                        <span className={`adm-badge ${isSuccess ? 'adm-badge-success' : 'adm-badge-danger'}`}>
                          {log.status === 'SUCCESS' ? 'Success' : log.status === 'LOCKED' ? 'Account Locked' : 'Failed'}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', whiteSpace: 'nowrap', fontWeight: '500', color: 'var(--adm-text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={13} color="var(--adm-text-dim)" />
                          <span>{formatDate(log.login_time) || '—'}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {isOngoing ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: 'var(--adm-success)',
                            padding: '3px 8px',
                            borderRadius: 'var(--adm-radius-full)',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--adm-success)', animation: 'pulse 1.5s infinite' }} />
                            Active Session
                          </span>
                        ) : log.logout_time ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--adm-text-muted)' }}>
                            <Clock size={13} color="var(--adm-text-dim)" />
                            <span>{formatDate(log.logout_time)}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--adm-text-dim)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
