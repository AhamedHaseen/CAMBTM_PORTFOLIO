import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  KeyRound,
  Lock,
  Search,
  Check,
  ShieldAlert,
  AlertCircle,
  Mail,
  Send,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { formatLocalDateTime } from '../utils/date';
import { apiRequest } from '../utils/api';

const ALL_PERMISSIONS = [
  { id: 'manage_portfolio', label: 'Portfolio Management', desc: 'Create, edit, publish and delete portfolio case studies' },
  { id: 'manage_brands', label: 'Brands & Logos', desc: 'Add, edit, hide and reorder brand partners' },
  { id: 'manage_bento', label: 'Hero Bento Grid', desc: 'Upload videos, edit creatives and bento slots' },
  { id: 'manage_media', label: 'Media Library', desc: 'Upload, manage and organize media assets' },
  { id: 'manage_users', label: 'User & Permissions', desc: 'Create, update and manage admin profiles & permissions' },
  { id: 'manage_database', label: 'Database & Backups', desc: 'Export snapshots, create backups and switch connections' },
  { id: 'view_audit_logs', label: 'Audit Logs & Login History', desc: 'Inspect security logs, login attempts and actions' },
  { id: 'system_settings', label: 'System Settings', desc: 'Configure system settings and security controls' }
];

export default function UsersManager() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formSaving, setFormSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'editor',
    status: 'active',
    password: '',
    permissions: ['manage_portfolio', 'manage_brands', 'manage_bento', 'manage_media']
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Admin Reset Password Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiRequest('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        toast.error(data.error || 'Failed to load users');
      }
    } catch (err) {
      toast.error('Network error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      full_name: '',
      email: '',
      role: 'editor',
      status: 'active',
      password: '',
      permissions: ['manage_portfolio', 'manage_brands', 'manage_bento', 'manage_media']
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setIsEditing(true);
    setEditId(user.id);
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      role: user.role || 'editor',
      status: user.status || 'active',
      password: '',
      permissions: Array.isArray(user.permissions) ? user.permissions : ['*']
    });
    setModalOpen(true);
  };

  const handleOpenReset = (user) => {
    setUserToReset(user);
    // Generate secure default password (e.g. Cambm@2026! + random 3 digits)
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setNewResetPassword(`Cambm@${randomSuffix}!`);
    setResetModalOpen(true);
  };

  const handleTogglePermission = (permId) => {
    setFormData(prev => {
      let current = [...prev.permissions];
      if (current.includes('*')) {
        current = ALL_PERMISSIONS.map(p => p.id);
      }
      if (current.includes(permId)) {
        current = current.filter(id => id !== permId);
      } else {
        current.push(permId);
      }
      return { ...prev, permissions: current };
    });
  };

  const handleSelectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: ALL_PERMISSIONS.map(p => p.id)
    }));
  };

  const handleDeselectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: []
    }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Email is required');
      return;
    }
    if (!isEditing && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }
    if (formData.password && formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setFormSaving(true);
    try {
      const url = isEditing ? `/api/users/${editId}` : '/api/users';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await apiRequest(url, {
        method,
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEditing ? 'User profile updated successfully.' : 'New user created successfully.');
        setModalOpen(false);
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to save user');
      }
    } catch (err) {
      toast.error('Network error saving user');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await apiRequest(`/api/users/${userToDelete.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('User deleted successfully.');
        setDeleteModalOpen(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (err) {
      toast.error('Network error deleting user');
    }
  };

  const handleAdminResetPassword = async (e) => {
    e.preventDefault();
    if (!userToReset || !newResetPassword || newResetPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setResettingPassword(true);
    try {
      const res = await apiRequest('/api/auth/admin-reset-password', {
        method: 'POST',
        body: JSON.stringify({
          userId: userToReset.id,
          newPassword: newResetPassword,
          sendEmail: true
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Password updated and email dispatched.');
        setResetModalOpen(false);
        setUserToReset(null);
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (err) {
      toast.error('Error updating password');
    } finally {
      setResettingPassword(false);
    }
  };

  const filteredUsers = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">User Profiles & Permissions</h1>
          <p className="adm-page-desc">
            Manage administrator and staff accounts, assign roles, enforce 2FA, and configure granular permissions.
          </p>
        </div>
        <button onClick={handleOpenCreate} className="adm-btn adm-btn-primary">
          <UserPlus size={16} />
          <span>Add New User</span>
        </button>
      </div>

      <div className="adm-table-container">
        <div className="adm-table-toolbar">
          <div className="adm-search-wrap">
            <Search size={16} className="adm-search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="adm-input adm-search-input"
            />
          </div>
        </div>

        <table className="adm-table">
          <thead>
            <tr>
              <th>User & Profile</th>
              <th>Role</th>
              <th>Status</th>
              <th>Two-Factor (2FA)</th>
              <th>Permissions</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading user profiles...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--adm-text-dim)' }}>
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="adm-avatar" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                        {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--adm-text-main)' }}>{u.full_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="adm-badge adm-badge-neutral" style={{ textTransform: 'uppercase', fontSize: '11px' }}>
                      {u.role || 'Admin'}
                    </span>
                  </td>
                  <td>
                    <span className={`adm-badge ${u.status === 'active' ? 'adm-badge-success' : 'adm-badge-danger'}`}>
                      {u.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td>
                    <span className={`adm-badge ${u.two_factor_enabled ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                      {u.two_factor_enabled ? '2FA Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                      {Array.isArray(u.permissions) && u.permissions.includes('*')
                        ? 'Full System Access (All)'
                        : `${(u.permissions || []).length} Granted`}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenReset(u)}
                        className="adm-icon-btn"
                        title="Reset User Password & Dispatch Email"
                        style={{ color: 'var(--adm-warning)' }}
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        className="adm-icon-btn"
                        title="Edit User"
                      >
                        <Edit2 size={15} />
                      </button>
                      {currentUser?.id !== u.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserToDelete(u);
                            setDeleteModalOpen(true);
                          }}
                          className="adm-icon-btn danger"
                          title="Delete User"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Create / Edit Modal (Cancel Button Right-Aligned) */}
      {modalOpen && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal" style={{ maxWidth: '640px' }}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">{isEditing ? 'Edit User Profile & Permissions' : 'Create New User Profile'}</h3>
              <button type="button" className="adm-icon-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveUser} className="adm-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="adm-input"
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@cambm.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="adm-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="adm-select"
                  >
                    <option value="admin">Administrator</option>
                    <option value="editor">Content Editor</option>
                    <option value="manager">Marketing Manager</option>
                    <option value="viewer">Auditor / Viewer</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="adm-select"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">
                  {isEditing ? 'New Password (leave empty to keep existing)' : 'Initial Password * (min 8 characters)'}
                </label>
                <input
                  type="password"
                  required={!isEditing}
                  minLength={formData.password ? 8 : undefined}
                  placeholder={isEditing ? '••••••••••••' : 'Enter strong password'}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="adm-input"
                />
              </div>

              {/* Granular Permissions */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label className="adm-form-label" style={{ margin: 0 }}>Granular Access Permissions</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={handleSelectAllPermissions} className="adm-btn adm-btn-secondary adm-btn-sm" style={{ padding: '2px 8px', fontSize: '11px' }}>
                      Select All
                    </button>
                    <button type="button" onClick={handleDeselectAllPermissions} className="adm-btn adm-btn-secondary adm-btn-sm" style={{ padding: '2px 8px', fontSize: '11px' }}>
                      Deselect All
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', background: 'var(--adm-surface)', padding: '14px', borderRadius: 'var(--adm-radius-md)', border: '1px solid var(--adm-border)' }}>
                  {ALL_PERMISSIONS.map(perm => {
                    const isChecked = formData.permissions.includes('*') || formData.permissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '8px',
                          borderRadius: 'var(--adm-radius-sm)',
                          cursor: 'pointer',
                          background: isChecked ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                          border: `1px solid ${isChecked ? 'rgba(99, 102, 241, 0.25)' : 'transparent'}`
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm.id)}
                          style={{ marginTop: '3px' }}
                        />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--adm-text-main)' }}>
                            {perm.label}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--adm-text-dim)', lineHeight: '1.3' }}>
                            {perm.desc}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons Right-Aligned */}
              <div className="adm-modal-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={formSaving} className="adm-btn adm-btn-primary">
                  {formSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reset Password Modal */}
      {resetModalOpen && userToReset && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal" style={{ maxWidth: '500px' }}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Reset User Password & Send Mail</h3>
              <button type="button" className="adm-icon-btn" onClick={() => setResetModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAdminResetPassword} className="adm-modal-body">
              <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', lineHeight: '1.5', margin: '0 0 16px' }}>
                Set a new password for <strong>{userToReset.full_name}</strong>. An automated credentials email will be dispatched.
              </p>

              <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '10px', padding: '12px 14px', marginBottom: '18px', fontSize: '12px', color: 'var(--adm-text-muted)', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', color: '#818cf8', marginBottom: '4px' }}>📧 Dispatch Destination:</div>
                <div>&bull; <strong>Recipient:</strong> <span style={{ color: '#fff' }}>{userToReset.email}</span></div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">New Password (min 8 chars) *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    minLength="8"
                    value={newResetPassword}
                    onChange={e => setNewResetPassword(e.target.value)}
                    className="adm-input"
                    style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: '600', paddingRight: '80px' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(newResetPassword);
                      toast.success('Password copied to clipboard!');
                    }}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="adm-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setResetModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={resettingPassword || newResetPassword.length < 8} className="adm-btn adm-btn-primary">
                  <Send size={14} />
                  <span>{resettingPassword ? 'Updating...' : 'Update & Dispatch Mail'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteModalOpen && userToDelete && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal" style={{ maxWidth: '420px' }}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Delete User Account</h3>
              <button type="button" className="adm-icon-btn" onClick={() => setDeleteModalOpen(false)}>×</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize: '14px', color: 'var(--adm-text-muted)', lineHeight: '1.5', margin: 0 }}>
                Are you sure you want to permanently delete user profile <strong>{userToDelete.full_name}</strong> ({userToDelete.email})?
              </p>
            </div>
            <div className="adm-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </button>
              <button type="button" onClick={handleDeleteUser} className="adm-btn adm-btn-danger">
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
