import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, permission }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#090b10',
        color: '#6366f1',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Authenticating session...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/studio/login" state={{ from: location }} replace />;
  }

  // Check Granular Permissions
  if (permission && user.role !== 'admin' && user.role !== 'superadmin') {
    const perms = Array.isArray(user.permissions) ? user.permissions : (user.permissions === '*' ? ['*'] : []);
    const hasAccess = perms.includes('*') || perms.includes(permission);

    if (!hasAccess) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 20px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <ShieldAlert size={32} color="var(--adm-danger, #ef4444)" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--adm-text-main, #f8fafc)', margin: '0 0 8px' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--adm-text-muted, #94a3b8)', fontSize: '14px', maxWidth: '440px', margin: '0 0 24px', lineHeight: '1.5' }}>
            Your account role does not have permission enabled for this section. Please contact your system administrator to grant access.
          </p>
          <Link to="/studio/dashboard" className="adm-btn adm-btn-primary" style={{ display: 'inline-flex' }}>
            Return to Dashboard
          </Link>
        </div>
      );
    }
  }

  return children;
}
