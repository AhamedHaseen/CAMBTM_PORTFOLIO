import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  FileText,
  Sparkles,
  LayoutGrid,
  Film,
  Building2,
  Plus,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Laptop,
  Smartphone,
  FolderArchive,
  Users,
  Settings as SettingsIcon,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';

import { formatLocalDateOnly, formatLocalTimeOnly } from '../utils/date';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    stats: {
      totalProjects: 0,
      publishedProjects: 0,
      draftProjects: 0,
      totalCreatives: 0,
      totalVideos: 0,
      totalBrands: 0
    },
    recentActivity: [],
    recentLogins: []
  });
  const [loading, setLoading] = useState(true);

  const hasPerm = (perm) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const perms = Array.isArray(user.permissions) ? user.permissions : (user.permissions === '*' ? ['*'] : []);
    if (perms.includes('*')) return true;
    return perms.includes(perm);
  };

  useEffect(() => {
    apiRequest('/api/dashboard/summary')
      .then(res => (res.headers.get('content-type')?.includes('application/json') ? res.json() : {}))
      .then(resData => {
        if (resData && resData.success) {
          setData(resData);
        }
      })
      .catch(err => console.error('Error fetching dashboard summary:', err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    return formatLocalDateOnly(dateStr);
  };

  const formatTime = (dateStr) => {
    return formatLocalTimeOnly(dateStr);
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

  return (
    <div>
      {/* Page Title & Actions */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'}</h1>
          <p className="adm-page-desc">
            Here is what is happening across your Cambridge Marketing system today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {hasPerm('manage_bento') && (
            <Link to="/studio/hero-bento" className="adm-btn adm-btn-secondary">
              <LayoutGrid size={16} />
              <span>Hero Bento</span>
            </Link>
          )}
          {hasPerm('manage_portfolio') && (
            <Link to="/studio/portfolio/add" className="adm-btn adm-btn-primary">
              <Plus size={16} />
              <span>Add Project</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="adm-grid-4">
        {/* Total Projects */}
        {hasPerm('manage_portfolio') && (
          <div className="adm-card adm-kpi-card">
            <div>
              <div className="adm-kpi-label">Total Projects</div>
              <div className="adm-kpi-value">{loading ? '...' : data.stats.totalProjects}</div>
              <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
                {data.stats.publishedProjects} published • {data.stats.draftProjects} drafts
              </div>
            </div>
            <div className="adm-kpi-icon">
              <Briefcase size={24} />
            </div>
          </div>
        )}

        {/* Hero Bento Media */}
        {hasPerm('manage_bento') && (
          <Link to="/studio/hero-bento" className="adm-card adm-kpi-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div>
              <div className="adm-kpi-label">Hero Bento Media</div>
              <div className="adm-kpi-value" style={{ color: 'var(--adm-primary)' }}>
                {loading ? '...' : (data.stats.totalHeroBento || 16)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
                {data.stats.runningHeroImages || 12} images • {data.stats.runningHeroVideos || 4} videos live
              </div>
            </div>
            <div className="adm-kpi-icon" style={{ background: 'rgba(217, 119, 6, 0.12)', color: 'var(--adm-primary)' }}>
              <LayoutGrid size={24} />
            </div>
          </Link>
        )}

        {/* Live Published Projects */}
        {hasPerm('manage_portfolio') && (
          <div className="adm-card adm-kpi-card">
            <div>
              <div className="adm-kpi-label">Live Projects</div>
              <div className="adm-kpi-value" style={{ color: 'var(--adm-success)' }}>
                {loading ? '...' : data.stats.publishedProjects}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
                Active on Portfolio page
              </div>
            </div>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-success-bg)', color: 'var(--adm-success)' }}>
              <CheckCircle2 size={24} />
            </div>
          </div>
        )}

        {/* Total Brands */}
        {hasPerm('manage_brands') && (
          <Link to="/studio/brands" className="adm-card adm-kpi-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div>
              <div className="adm-kpi-label">Client Brands</div>
              <div className="adm-kpi-value">{loading ? '...' : data.stats.totalBrands}</div>
              <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
                In "Brands that trust us"
              </div>
            </div>
            <div className="adm-kpi-icon" style={{ background: 'var(--adm-warning-bg)', color: 'var(--adm-warning)' }}>
              <Building2 size={24} />
            </div>
          </Link>
        )}
      </div>

      {/* Main 2-Column Section: Recent Activity & Recent Logins (Only if permitted) */}
      {hasPerm('view_audit_logs') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Recent Activity Stream */}
          <div className="adm-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--adm-primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--adm-text-main)' }}>
                  Recent Activity
                </h3>
              </div>
              <Link to="/studio/audit-logs" style={{ fontSize: '13px', color: 'var(--adm-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>View Audit Logs</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {data.recentActivity.length === 0 ? (
              <p style={{ color: 'var(--adm-text-dim)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
                No recent activity recorded yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.recentActivity.map(act => (
                  <div key={act.id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: 'var(--adm-radius-md)',
                    background: 'var(--adm-surface)'
                  }}>
                    <span className={`adm-badge ${getActionBadgeClass(act.action)}`} style={{ fontSize: '11px', flexShrink: 0 }}>
                      {act.action}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', color: 'var(--adm-text-main)', fontWeight: '500' }}>
                        {act.description || `${act.admin_user} performed ${act.action} in ${act.module}`}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                        {act.admin_user} • {formatDate(act.created_at)} at {formatTime(act.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Login History */}
          <div className="adm-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--adm-accent)" />
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--adm-text-main)' }}>
                  Recent Login History
                </h3>
              </div>
              <Link to="/studio/login-history" style={{ fontSize: '13px', color: 'var(--adm-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>View Full History</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {data.recentLogins.length === 0 ? (
              <p style={{ color: 'var(--adm-text-dim)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
                No recent login attempts.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.recentLogins.map(login => (
                  <div key={login.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--adm-radius-md)',
                    background: 'var(--adm-surface)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: login.status === 'SUCCESS' ? 'var(--adm-success)' : 'var(--adm-danger)'
                      }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--adm-text-main)' }}>
                          {login.admin_user || login.email}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--adm-text-dim)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <code style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '3px' }}>
                            {formatIpAddress(login.ip_address)}
                          </code>
                          <span>•</span>
                          <span>{login.device && login.browser ? `${login.device} (${login.browser})` : (login.device || login.browser || 'Desktop Browser')}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--adm-text-dim)' }}>
                      {formatDate(login.login_time || login.timestamp)} {formatTime(login.login_time || login.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
