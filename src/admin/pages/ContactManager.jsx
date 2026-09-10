import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  X,
  Star,
  Building2,
  Globe,
  ExternalLink
} from 'lucide-react';
import { apiRequest, parseResponseJson } from '../utils/api';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const DEFAULT_CONTACTS = [
  {
    id: 1,
    location_name: 'Cambridge Marketing - Sri Lanka',
    phone: '+94 76 649 0522',
    address: '328/3 Temple Road, Kaduwela Road, Battaramulla, Colombo, Sri Lanka 10120',
    email: 'marketing@cambt.com',
    country_code: 'LK',
    is_primary: true,
    display_order: 1,
    status: 'active'
  },
  {
    id: 2,
    location_name: 'Cambridge Marketing - Saudi Arabia',
    phone: '+966 50 123 4567',
    address: 'City Centre, Mishrifah, Jeddah, Saudi Arabia',
    email: 'marketing@cambt.com',
    country_code: 'SA',
    is_primary: false,
    display_order: 2,
    status: 'active'
  }
];

export default function ContactManager() {
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Confirmations
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const toast = useToast();

  // Form state
  const [form, setForm] = useState({
    location_name: '',
    phone: '',
    address: '',
    email: '',
    country_code: 'LK',
    is_primary: false,
    display_order: 1,
    status: 'active',
    social_links: {
      whatsapp: '',
      instagram: '',
      facebook: '',
      linkedin: ''
    }
  });

  const syncContactsStorage = (list) => {
    try {
      localStorage.setItem('cambm_admin_contacts', JSON.stringify(list));
      localStorage.setItem('cambm_contacts', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('cambm_contacts_updated'));
    } catch {}
  };

  const fetchContacts = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await apiRequest('/api/contacts?all=true');
      const data = await parseResponseJson(res);
      if (data && data.success && Array.isArray(data.contacts) && data.contacts.length > 0) {
        setContacts(data.contacts);
        syncContactsStorage(data.contacts);
      } else {
        const cached = localStorage.getItem('cambm_contacts') || localStorage.getItem('cambm_admin_contacts');
        if (cached) setContacts(JSON.parse(cached));
      }
    } catch {
      const cached = localStorage.getItem('cambm_contacts') || localStorage.getItem('cambm_admin_contacts');
      if (cached) setContacts(JSON.parse(cached));
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(true);
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.location_name?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.country_code?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [contacts, statusFilter, search]);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      location_name: '',
      phone: '+94 76 649 0522',
      address: '',
      email: 'marketing@cambt.com',
      country_code: 'LK',
      is_primary: contacts.length === 0,
      display_order: contacts.length + 1,
      status: 'active',
      social_links: {
        whatsapp: '',
        instagram: '',
        facebook: '',
        linkedin: ''
      }
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    const sl = item.social_links || {};
    setForm({
      location_name: item.location_name || '',
      phone: item.phone || '',
      address: item.address || '',
      email: item.email || '',
      country_code: item.country_code || 'LK',
      is_primary: Boolean(item.is_primary),
      display_order: item.display_order || 1,
      status: item.status || 'active',
      social_links: {
        whatsapp: sl.whatsapp || '',
        instagram: sl.instagram || '',
        facebook: sl.facebook || '',
        linkedin: sl.linkedin || ''
      }
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location_name.trim()) {
      toast.error('Location name is required.');
      return;
    }
    if (!form.phone.trim()) {
      toast.error('Contact phone number is required.');
      return;
    }
    if (!form.address.trim()) {
      toast.error('Address is required.');
      return;
    }

    setSubmitting(true);
    const payload = {
      location_name: form.location_name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      email: form.email.trim() || 'marketing@cambt.com',
      country_code: form.country_code.trim().toUpperCase() || 'LK',
      is_primary: form.is_primary,
      display_order: Number(form.display_order) || (contacts.length + 1),
      status: form.status,
      social_links: {
        whatsapp: (form.social_links?.whatsapp || '').trim(),
        instagram: (form.social_links?.instagram || '').trim(),
        facebook: (form.social_links?.facebook || '').trim(),
        linkedin: (form.social_links?.linkedin || '').trim()
      }
    };

    try {
      let savedContact = null;
      if (editingItem) {
        const res = await apiRequest(`/api/contacts/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        const data = await parseResponseJson(res);
        if (data && (data.success || data.contact)) {
          savedContact = data.contact || { ...editingItem, ...payload };
        }
      } else {
        const res = await apiRequest('/api/contacts', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const data = await parseResponseJson(res);
        if (data && (data.success || data.contact)) {
          savedContact = data.contact || { ...payload, id: Date.now() };
        }
      }

      setContacts(prev => {
        let updated;
        if (editingItem) {
          updated = prev.map(c => c.id === editingItem.id ? (savedContact || { ...c, ...payload }) : c);
        } else {
          updated = [...prev, savedContact || { ...payload, id: Date.now() }];
        }
        if (payload.is_primary) {
          const primId = editingItem ? editingItem.id : (savedContact?.id);
          updated = updated.map(c => ({ ...c, is_primary: c.id === primId }));
        }
        syncContactsStorage(updated);
        return updated;
      });

      toast.success(editingItem ? `"${form.location_name}" updated.` : `"${form.location_name}" added.`);
      setModalOpen(false);
      fetchContacts();
    } catch (err) {
      const fallbackItem = { ...payload, id: editingItem ? editingItem.id : Date.now() };
      setContacts(prev => {
        let updated = editingItem ? prev.map(c => c.id === editingItem.id ? fallbackItem : c) : [...prev, fallbackItem];
        if (payload.is_primary) {
          updated = updated.map(c => ({ ...c, is_primary: c.id === fallbackItem.id }));
        }
        syncContactsStorage(updated);
        return updated;
      });
      toast.success(`"${form.location_name}" saved.`);
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await apiRequest(`/api/contacts/${deleteItem.id}`, {
        method: 'DELETE'
      });
    } catch {}

    setContacts(prev => {
      const updated = prev.filter(c => c.id !== deleteItem.id);
      syncContactsStorage(updated);
      return updated;
    });
    toast.success(`"${deleteItem.location_name}" deleted.`);
    setDeleteItem(null);
    fetchContacts();
  };

  const toggleStatus = async (item) => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await apiRequest(`/api/contacts/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
    } catch {}

    setContacts(prev => {
      const updated = prev.map(c => c.id === item.id ? { ...c, status: nextStatus } : c);
      syncContactsStorage(updated);
      return updated;
    });
    toast.success(`Contact marked as ${nextStatus}.`);
  };

  const setPrimary = async (item) => {
    try {
      await apiRequest(`/api/contacts/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_primary: true })
      });
    } catch {}

    setContacts(prev => {
      const updated = prev.map(c => ({ ...c, is_primary: c.id === item.id }));
      syncContactsStorage(updated);
      return updated;
    });
    toast.success(`"${item.location_name}" set as primary office.`);
  };

  return (
    <div>
      {/* Top Header */}
      <div className="adm-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="adm-page-title">Contact &amp; Offices</h1>
            <span className="adm-logo-badge">{contacts.length}</span>
          </div>
          <p className="adm-page-desc">
            Manage company branches, phone numbers, email addresses, and physical office locations displayed across the site.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="adm-btn adm-btn-secondary"
            onClick={() => fetchContacts(true)}
            disabled={loading}
            title="Refresh contacts"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button type="button" className="adm-btn adm-btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            <span>Add New Contact</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Status */}
      <div className="adm-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flex: '1 1 340px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search locations by city, phone, address, or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="adm-search-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--adm-text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                background: 'var(--adm-surface)',
                border: '1px solid var(--adm-border)',
                borderRadius: 'var(--adm-radius-md)',
                color: 'var(--adm-text-main)',
                padding: '8px 12px',
                fontSize: '13px'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Locations Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        {filteredContacts.map(item => (
          <div
            key={item.id}
            className="adm-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              padding: '24px',
              borderRadius: 'var(--adm-radius-lg)',
              border: item.is_primary ? '1.5px solid var(--adm-text-main)' : '1px solid var(--adm-border)',
              background: 'var(--adm-surface-card)',
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            {/* Country code / Office badge - fixed min-height for perfect vertical alignment */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '12px',
              minHeight: '44px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--adm-surface-hover)',
                  border: '1px solid var(--adm-border)',
                  color: 'var(--adm-text-main)',
                  fontWeight: '800',
                  fontSize: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}>
                  {item.country_code || 'LK'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'var(--adm-text-main)',
                    lineHeight: '1.3'
                  }}>
                    {item.location_name}
                  </h3>
                </div>
              </div>

              {item.is_primary ? (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  fontWeight: '800',
                  color: 'var(--adm-bg)',
                  background: 'var(--adm-text-main)',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  flexShrink: 0,
                  letterSpacing: '0.04em'
                }}>
                  <Star size={10} fill="currentColor" /> PRIMARY
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setPrimary(item)}
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '3px 9px',
                    borderRadius: '4px',
                    background: 'var(--adm-surface)',
                    border: '1px solid var(--adm-border)',
                    color: 'var(--adm-text-muted)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--adm-text-main)';
                    e.currentTarget.style.borderColor = 'var(--adm-text-main)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--adm-text-muted)';
                    e.currentTarget.style.borderColor = 'var(--adm-border)';
                  }}
                >
                  Set Primary
                </button>
              )}
            </div>

            {/* Details List with fixed vertical grid alignment */}
            <div style={{
              flex: '1 1 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              borderTop: '1px solid var(--adm-border)',
              paddingTop: '14px',
              marginBottom: '18px'
            }}>
              {/* Phone Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '22px' }}>
                <Phone size={14} style={{ color: 'var(--adm-text-main)', flexShrink: 0 }} />
                <a
                  href={`tel:${item.phone.replace(/[^+\d]/g, '')}`}
                  style={{
                    fontSize: '13.5px',
                    fontWeight: '600',
                    color: 'var(--adm-text-main)',
                    textDecoration: 'none'
                  }}
                >
                  {item.phone}
                </a>
              </div>

              {/* Address Row - minHeight: 42px guarantees both 1-line and 2-line addresses take identical vertical space */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minHeight: '42px' }}>
                <MapPin size={14} style={{ color: 'var(--adm-text-main)', flexShrink: 0, marginTop: '2px' }} />
                <span style={{
                  fontSize: '13px',
                  color: 'var(--adm-text-muted)',
                  lineHeight: '1.45'
                }}>
                  {item.address}
                </span>
              </div>

              {/* Email Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '22px' }}>
                <Mail size={14} style={{ color: 'var(--adm-text-main)', flexShrink: 0 }} />
                <a
                  href={`mailto:${item.email}`}
                  style={{
                    fontSize: '13px',
                    color: 'var(--adm-text-main)',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
                  {item.email}
                </a>
              </div>
            </div>

            {/* Social Links Row */}
            {(item.social_links?.whatsapp || item.social_links?.instagram || item.social_links?.facebook || item.social_links?.linkedin) && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                {item.social_links?.whatsapp && (
                  <a href={item.social_links.whatsapp} target="_blank" rel="noopener noreferrer" title="WhatsApp"
                    style={{ color: 'var(--adm-text-muted)', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#25D366'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--adm-text-muted)'}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </a>
                )}
                {item.social_links?.instagram && (
                  <a href={item.social_links.instagram} target="_blank" rel="noopener noreferrer" title="Instagram"
                    style={{ color: 'var(--adm-text-muted)', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#E4405F'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--adm-text-muted)'}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
                {item.social_links?.facebook && (
                  <a href={item.social_links.facebook} target="_blank" rel="noopener noreferrer" title="Facebook"
                    style={{ color: 'var(--adm-text-muted)', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#1877F2'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--adm-text-muted)'}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                  </a>
                )}
                {item.social_links?.linkedin && (
                  <a href={item.social_links.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                    style={{ color: 'var(--adm-text-muted)', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#0A66C2'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--adm-text-muted)'}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667h-3.554V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                )}
              </div>
            )}

            {/* Footer actions - always pinned to bottom */}
            <div style={{
              borderTop: '1px solid var(--adm-border)',
              paddingTop: '14px',
              marginTop: 'auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={() => toggleStatus(item)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  background: item.status === 'active' ? 'var(--adm-surface-hover)' : 'rgba(100, 116, 139, 0.12)',
                  color: item.status === 'active' ? 'var(--adm-text-main)' : 'var(--adm-text-dim)'
                }}
              >
                {item.status === 'active' ? (
                  <>
                    <CheckCircle2 size={12} /> Active
                  </>
                ) : (
                  <>
                    <XCircle size={12} /> Inactive
                  </>
                )}
              </button>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary adm-btn-sm"
                  onClick={() => openEditModal(item)}
                  title="Edit contact"
                  style={{ color: 'var(--adm-text-main)', borderColor: 'var(--adm-border)' }}
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-danger adm-btn-sm"
                  onClick={() => setDeleteItem(item)}
                  title="Delete contact"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--adm-surface)',
            border: '1px solid var(--adm-border)',
            borderRadius: 'var(--adm-radius-lg)',
            width: '100%',
            maxWidth: '560px',
            boxShadow: 'var(--adm-shadow-lg)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--adm-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--adm-text-main)' }}>
                {editingItem ? 'Edit Contact Location' : 'Add New Contact Location'}
              </h3>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => setModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                      Location / Office Name *
                    </label>
                    <input
                      type="text"
                      className="adm-search-input"
                      placeholder="e.g. Cambridge Marketing - Sri Lanka"
                      value={form.location_name}
                      onChange={e => setForm({ ...form, location_name: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                      Country Code
                    </label>
                    <input
                      type="text"
                      className="adm-search-input"
                      placeholder="e.g. LK, SA"
                      value={form.country_code}
                      onChange={e => setForm({ ...form, country_code: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      maxLength="5"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                      Contact Phone Number *
                    </label>
                    <input
                      type="text"
                      className="adm-search-input"
                      placeholder="e.g. +94 76 649 0522"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="adm-search-input"
                      placeholder="e.g. marketing@cambt.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                    Physical Address *
                  </label>
                  <textarea
                    rows="3"
                    placeholder="328/3 Temple Road, Kaduwela Road, Battaramulla, Colombo, Sri Lanka 10120"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'var(--adm-surface-card)',
                      border: '1px solid var(--adm-border)',
                      borderRadius: 'var(--adm-radius-md)',
                      color: 'var(--adm-text-main)',
                      padding: '10px 14px',
                      fontSize: '13px',
                      outline: 'none',
                      fontFamily: 'inherit',
                      lineHeight: '1.45'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                      Display Order
                    </label>
                    <input
                      type="number"
                      className="adm-search-input"
                      value={form.display_order}
                      onChange={e => setForm({ ...form, display_order: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      min="1"
                    />
                  </div>

                  <div style={{ paddingTop: '22px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.is_primary}
                        onChange={e => setForm({ ...form, is_primary: e.target.checked })}
                      />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--adm-text-main)' }}>
                        Primary Office Location
                      </span>
                    </label>
                  </div>
                </div>
                {/* Social Media Links Section */}
                <div style={{ borderTop: '1px solid var(--adm-border)', paddingTop: '16px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Globe size={15} style={{ color: 'var(--adm-text-main)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--adm-text-main)', letterSpacing: '0.02em' }}>
                      Social Media Links
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp URL
                      </label>
                      <input
                        type="url"
                        className="adm-search-input"
                        placeholder="https://wa.me/94766490522?text=..."
                        value={form.social_links?.whatsapp || ''}
                        onChange={e => setForm({ ...form, social_links: { ...form.social_links, whatsapp: e.target.value } })}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="#E4405F"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        className="adm-search-input"
                        placeholder="https://www.instagram.com/cambm.lk/"
                        value={form.social_links?.instagram || ''}
                        onChange={e => setForm({ ...form, social_links: { ...form.social_links, instagram: e.target.value } })}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="#1877F2"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        className="adm-search-input"
                        placeholder="https://web.facebook.com/..."
                        value={form.social_links?.facebook || ''}
                        onChange={e => setForm({ ...form, social_links: { ...form.social_links, facebook: e.target.value } })}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667h-3.554V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        className="adm-search-input"
                        placeholder="https://www.linkedin.com/company/..."
                        value={form.social_links?.linkedin || ''}
                        onChange={e => setForm({ ...form, social_links: { ...form.social_links, linkedin: e.target.value } })}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--adm-border)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-btn adm-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Create Contact')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteItem)}
        title="Delete Contact Location"
        message={`Are you sure you want to delete "${deleteItem?.location_name}"? This action cannot be undone.`}
        confirmText="Delete Contact"
        danger={true}
        onConfirm={handleDelete}
        onClose={() => setDeleteItem(null)}
      />
    </div>
  );
}
