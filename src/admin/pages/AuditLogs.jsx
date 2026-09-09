import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, Eye, X, FileJson, Clock, Download, RefreshCw, Calendar, ShieldCheck } from 'lucide-react';
import { useToast } from '../components/Toast';
import { formatLocalDateTime } from '../utils/date';

const MODULES = ['All', 'Auth', 'Security', 'User Management', 'Portfolio', 'Creatives', 'Videos', 'Brands', 'Media', 'Settings', 'Database', 'System'];
const ACTIONS = ['All', 'LOGIN', 'LOGIN_2FA', 'LOGOUT', 'FAILED_LOGIN', 'FAILED_2FA', 'ENABLE_2FA', 'DISABLE_2FA', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'EXPORT_DATABASE', 'CREATE_BACKUP', 'UPDATE_DB_CONNECTION'];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [inspectItem, setInspectItem] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const toast = useToast();

  // Keep live time updated
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (moduleFilter !== 'All') params.append('module', moduleFilter);
      if (actionFilter !== 'All') params.append('action', actionFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/audit-logs?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
          ...(localStorage.getItem('cambm_token')
            ? { 'Authorization': `Bearer ${localStorage.getItem('cambm_token')}` }
            : {})
        }
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setLogs(data.logs || []);
        }
      }
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, actionFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const formatDate = (dateStr) => {
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

  const getActionBadgeClass = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('PURGE')) return 'adm-badge-danger';
    if (act.includes('FAILED') || act.includes('LOCK')) return 'adm-badge-rose';
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('RESTORE')) return 'adm-badge-success';
    if (act.includes('PUBLISH') && !act.includes('UNPUBLISH')) return 'adm-badge-teal';
    if (act.includes('2FA') || act.includes('SECURITY')) return 'adm-badge-purple';
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('REORDER') || act.includes('STATUS')) return 'adm-badge-info';
    if (act === 'LOGIN' || act.includes('AUTH')) return 'adm-badge-primary';
    if (act.includes('EXPORT') || act.includes('BACKUP') || act.includes('UNPUBLISH') || act.includes('SET_HERO') || act.includes('DB')) return 'adm-badge-warning';
    return 'adm-badge-neutral';
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error('No logs available to export');
      return;
    }
    const headers = ['ID', 'Timestamp', 'Action', 'Module', 'Admin User', 'IP Address', 'Description'];
    const rows = logs.map(l => [
      l.id,
      `"${new Date(l.created_at || l.timestamp).toISOString()}"`,
      `"${l.action || ''}"`,
      `"${l.module || ''}"`,
      `"${l.admin_user || l.user_email || ''}"`,
      `"${formatIpAddress(l.ip_address)}"`,
      `"${(l.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit logs exported to CSV!');
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Security & Audit Logs</h1>
          <p className="adm-page-desc">
            Immutable tracking record of every administrative action, user modification, 2FA event, and data export.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Live Current Date/Time Badge */}
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

          <button onClick={handleExportCSV} className="adm-btn adm-btn-secondary">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button onClick={fetchLogs} className="adm-icon-btn" title="Refresh logs">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      <div className="adm-table-container">
        <div className="adm-table-toolbar">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search description, admin, IP..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="adm-search-input"
            />
            <button type="submit" className="adm-btn adm-btn-secondary adm-btn-sm">
              <Search size={14} />
              <span>Filter</span>
            </button>
          </form>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--adm-text-dim)' }}>Module:</span>
              <select
                value={moduleFilter}
                onChange={e => setModuleFilter(e.target.value)}
                className="adm-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
              >
                {MODULES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--adm-text-dim)' }}>Action:</span>
              <select
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value)}
                className="adm-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
              >
                {ACTIONS.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--adm-text-muted)' }}>Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <ShieldAlert size={40} color="var(--adm-text-dim)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', color: 'var(--adm-text-main)', margin: '0 0 6px' }}>No Audit Logs Found</h3>
            <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', margin: 0 }}>
              Audit events will populate automatically as actions occur.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Timestamp (Current Date & Time)</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Admin / User</th>
                  <th>Description</th>
                  <th>IP Address</th>
                  <th style={{ textAlign: 'right' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--adm-text-main)', fontWeight: '600' }}>
                        <Clock size={13} color="var(--adm-text-dim)" />
                        <span>{formatDate(log.created_at || log.timestamp)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`adm-badge ${getActionBadgeClass(log.action || '')}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--adm-text-main)' }}>
                        {log.module}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--adm-text-main)' }}>
                        {log.admin_user || log.user_email || 'System'}
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.description}
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '11px', background: 'var(--adm-surface)', padding: '2px 6px', borderRadius: '4px' }}>
                        {formatIpAddress(log.ip_address)}
                      </code>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setInspectItem(log)}
                        className="adm-icon-btn"
                        title="Inspect Record"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      {inspectItem && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal" style={{ maxWidth: '580px' }}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Audit Record Details</h3>
              <button onClick={() => setInspectItem(null)} className="adm-icon-btn">
                <X size={18} />
              </button>
            </div>
            <div className="adm-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--adm-text-dim)' }}>Action</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--adm-text-main)', marginTop: '2px' }}>
                    <span className={`adm-badge ${getActionBadgeClass(inspectItem.action || '')}`}>
                      {inspectItem.action}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--adm-text-dim)' }}>Module</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--adm-text-main)', marginTop: '2px' }}>
                    {inspectItem.module}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--adm-text-dim)' }}>Timestamp</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--adm-text-main)', marginTop: '2px' }}>
                    {formatDate(inspectItem.created_at || inspectItem.timestamp)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--adm-text-dim)' }}>IP Address</div>
                  <div style={{ fontSize: '13px', color: 'var(--adm-text-main)', marginTop: '2px' }}>
                    {formatIpAddress(inspectItem.ip_address)}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--adm-text-dim)', marginBottom: '4px' }}>Description</div>
                <div style={{ fontSize: '13px', color: 'var(--adm-text-main)', background: 'var(--adm-surface)', padding: '10px 14px', borderRadius: 'var(--adm-radius-sm)', border: '1px solid var(--adm-border)' }}>
                  {inspectItem.description}
                </div>
              </div>

              {inspectItem.metadata && (
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--adm-text-dim)', marginBottom: '4px' }}>Raw Payload / Metadata</div>
                  <pre style={{ margin: 0, padding: '12px', background: 'var(--adm-surface)', borderRadius: 'var(--adm-radius-sm)', border: '1px solid var(--adm-border)', fontSize: '11px', maxHeight: '180px', overflowY: 'auto' }}>
                    {typeof inspectItem.metadata === 'string' ? inspectItem.metadata : JSON.stringify(inspectItem.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="adm-modal-footer">
              <button onClick={() => setInspectItem(null)} className="adm-btn adm-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
