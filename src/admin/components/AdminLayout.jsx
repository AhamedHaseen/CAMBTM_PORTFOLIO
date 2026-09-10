import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  LayoutGrid,
  Building2,
  FolderArchive,
  ShieldAlert,
  History,
  Settings as SettingsIcon,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sun,
  Moon,
  Database,
  Users,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { apiRequest } from '../utils/api';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('adm_theme') || 'dark');
  const [dbStatus, setDbStatus] = useState({ isSupabase: false, engine: 'local' });

  useEffect(() => {
    document.documentElement.setAttribute('data-admin-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('adm_theme', theme);
  }, [theme]);

  // Fetch health / database status
  useEffect(() => {
    apiRequest('/api/settings')
      .then(res => (res.headers.get('content-type')?.includes('application/json') ? res.json() : {}))
      .then(data => {
        if (data && data.system) {
          setDbStatus({
            isSupabase: Boolean(data.system.supabaseConnected),
            engine: data.system.databaseEngine || 'ready'
          });
        }
      })
      .catch(() => { });
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out.');
    navigate('/studio/login');
  };

  // Format breadcrumbs from pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentTitle = pathParts[1] ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1).replace(/-/g, ' ') : 'Dashboard';

  return (
    <div className="adm-app">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`adm-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="adm-sidebar-header">
          <Link to="/studio/dashboard" className="adm-logo-wrap">
            <img
              src="/images/cambridge-logo.png"
              alt="Cambridge Marketing"
              className="adm-theme-logo theme-logo"
              style={{ height: '30px', width: 'auto' }}
            />
            <span className="adm-logo-badge">ADMIN</span>
          </Link>
          <button
            className="adm-icon-btn"
            style={{ display: mobileOpen ? 'flex' : 'none' }}
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="adm-nav">
          <div className="adm-nav-group-title">Main</div>
          <NavLink
            to="/studio/dashboard"
            end
            className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          {/* Content & Media Group */}
          {(user?.role === 'admin' || user?.role === 'superadmin' || (user?.permissions || []).includes('*') || (user?.permissions || []).some(p => ['manage_portfolio', 'manage_bento', 'manage_brands', 'manage_media'].includes(p))) && (
            <>
              <div className="adm-nav-group-title">Content & Media</div>
              {(user?.role === 'admin' || user?.role === 'superadmin' || (user?.permissions || []).includes('*') || (user?.permissions || []).includes('manage_portfolio')) && (
                <NavLink
                  to="/studio/portfolio"
                  className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Briefcase size={18} />
                  <span>Portfolio</span>
                </NavLink>
              )}

              {(user?.role === 'admin' || user?.role === 'superadmin' || (user?.permissions || []).includes('*') || (user?.permissions || []).includes('manage_bento')) && (
                <NavLink
                  to="/studio/hero-bento"
                  className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutGrid size={18} />
                  <span>Hero Bento</span>
                </NavLink>
              )}

              <NavLink
                to="/studio/services"
                className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Layers size={18} />
                <span>Services & Packages</span>
              </NavLink>

              {(user?.role === 'admin' || user?.role === 'superadmin' || (user?.permissions || []).includes('*') || (user?.permissions || []).includes('manage_brands')) && (
                <NavLink
                  to="/studio/brands"
                  className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Building2 size={18} />
                  <span>Brands</span>
                </NavLink>
              )}

              {(user?.role === 'admin' || user?.role === 'superadmin' || (user?.permissions || []).includes('*') || (user?.permissions || []).includes('manage_media')) && (
                <NavLink
                  to="/studio/media"
                  className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <FolderArchive size={18} />
                  <span>Media Library</span>
                </NavLink>
              )}
            </>
          )}

          {/* System & Security Group */}
          {(user?.role === 'admin' || user?.role === 'superadmin' || (user?.permissions || []).includes('*') || (user?.permissions || []).some(p => ['view_audit_logs', 'system_settings', 'manage_database'].includes(p))) && (
            <>
              <div className="adm-nav-group-title">System & Security</div>
              {(user?.role === 'admin' || user?.role === 'superadmin' || (user?.permissions || []).includes('*') || (user?.permissions || []).includes('view_audit_logs')) && (
                <>
                  <NavLink
                    to="/studio/audit-logs"
                    className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <ShieldAlert size={18} />
                    <span>Audit Logs</span>
                  </NavLink>

                  <NavLink
                    to="/studio/login-history"
                    className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <History size={18} />
                    <span>Login History</span>
                  </NavLink>
                </>
              )}

              <NavLink
                to="/studio/settings"
                className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <SettingsIcon size={18} />
                <span>Settings & 2FA</span>
              </NavLink>
            </>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="adm-nav-link"
              style={{ color: 'var(--adm-text-dim)' }}
            >
              <ExternalLink size={16} />
              <span>Live Website</span>
            </a>
          </div>
        </nav>

        <div className="adm-sidebar-footer">
          <div className="adm-user-profile-mini">
            <div className="adm-avatar">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="adm-user-meta">
              <div className="adm-user-name">{user?.full_name || 'Admin'}</div>
              <div className="adm-user-role">{user?.role || 'Administrator'}</div>
            </div>
            <button
              onClick={handleLogout}
              className="adm-icon-btn"
              title="Log out"
              style={{ width: '32px', height: '32px', border: 'none', background: 'transparent' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="adm-main-wrapper">
        {/* Top Header */}
        <header className="adm-header">
          <div className="adm-header-left">
            <button
              className="adm-icon-btn"
              style={{ display: 'none' }}
              onClick={() => setMobileOpen(true)}
              id="admMobileMenuToggle"
            >
              <Menu size={20} />
            </button>
            <div className="adm-breadcrumbs">
              <span>Admin</span>
              <span>/</span>
              <span className="current">{currentTitle}</span>
            </div>
          </div>

          <div className="adm-header-right">
            {/* Database indicator */}
            <div className={`adm-badge-db ${dbStatus.isSupabase ? 'supabase' : ''}`}>
              <span className="dot"></span>
              <Database size={13} />
              <span>{dbStatus.isSupabase ? 'Supabase PG' : 'Database Ready'}</span>
            </div>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="adm-icon-btn"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* View website button */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="adm-btn adm-btn-secondary adm-btn-sm"
              style={{ display: 'inline-flex' }}
            >
              <ExternalLink size={14} />
              <span>Preview Site</span>
            </a>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="adm-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #admMobileMenuToggle {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
