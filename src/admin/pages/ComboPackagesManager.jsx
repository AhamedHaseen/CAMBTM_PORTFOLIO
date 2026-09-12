import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  X,
  Star,
  Check,
  LayoutGrid,
  List
} from 'lucide-react';
import { apiRequest, parseResponseJson } from '../utils/api';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const DEFAULT_COMBOS = [
  {
    id: 'video',
    title: 'Videography Package',
    description: 'For brands that need recurring content, social execution and a consistent monthly video pipeline.',
    engagement: 'MONTHLY PLAN',
    items: [
      '12 Static Creatives',
      'Social Media Management',
      'Basic Campaign Management',
      '1 Video Shoot',
      'Monthly Reporting'
    ],
    featured: false,
    display_order: 1,
    status: 'active'
  },
  {
    id: 'web',
    title: 'Website Package',
    description: 'For businesses that need ongoing marketing supported by a professionally built and maintained website.',
    engagement: '6-MONTH PLAN',
    items: [
      'Free Custom Website',
      'Free Hosting',
      '12 Static Creatives',
      'Social Media Management',
      'Basic Campaign Management',
      'Monthly Maintenance & Technical Support',
      'Monthly Reporting'
    ],
    featured: true,
    display_order: 2,
    status: 'active'
  },
  {
    id: 'pos',
    title: 'POS Package',
    description: 'For retail, restaurant and service businesses that need marketing and an operational POS system together.',
    engagement: 'ANNUAL PLAN',
    items: [
      'Free Custom Cloud POS Software',
      'Free Hosting',
      '12 Static Creatives',
      'Social Media Management',
      'Basic Campaign Management',
      'Monthly Maintenance & Technical Support',
      'Monthly Reporting'
    ],
    featured: false,
    display_order: 3,
    status: 'active'
  }
];

const ENGAGEMENT_OPTIONS = [
  'MONTHLY PLAN',
  '3-MONTH PLAN',
  '6-MONTH PLAN',
  'ANNUAL PLAN',
  'CUSTOM PLAN'
];

export default function ComboPackagesManager() {
  const [combos, setCombos] = useState(DEFAULT_COMBOS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals & Confirmations
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const toast = useToast();

  // Form state
  const [form, setForm] = useState({
    id: '',
    title: '',
    description: '',
    engagement: 'MONTHLY ENGAGEMENT',
    itemsText: '',
    featured: false,
    display_order: 1,
    status: 'active'
  });

  const syncCombosStorage = (list) => {
    try {
      localStorage.setItem('cambm_admin_combos', JSON.stringify(list));
      localStorage.setItem('cambm_combos', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('cambm_combos_updated'));
    } catch { }
  };

  const fetchCombos = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await apiRequest('/api/combos?all=true');
      const data = await parseResponseJson(res);
      if (data && data.success && Array.isArray(data.combos) && data.combos.length > 0) {
        setCombos(data.combos);
        syncCombosStorage(data.combos);
      } else {
        const cached = localStorage.getItem('cambm_combos') || localStorage.getItem('cambm_admin_combos');
        if (cached) setCombos(JSON.parse(cached));
      }
    } catch {
      const cached = localStorage.getItem('cambm_combos') || localStorage.getItem('cambm_admin_combos');
      if (cached) setCombos(JSON.parse(cached));
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos(true);
  }, []);

  // Filtered combos
  const filteredCombos = useMemo(() => {
    return combos
      .filter(item => {
        if (statusFilter !== 'all' && item.status !== statusFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            item.title?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q) ||
            item.engagement?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
  }, [combos, statusFilter, search]);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      id: '',
      title: '',
      description: '',
      engagement: 'MONTHLY PLAN',
      itemsText: '12 Static Creatives\nSocial Media Management\nBasic Campaign Management\nMonthly Reporting',
      featured: false,
      display_order: combos.length + 1,
      status: 'active'
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    let itemsArr = [];
    if (Array.isArray(item.items)) {
      itemsArr = item.items.map(it => typeof it === 'object' && it !== null ? (it.text || it.name || JSON.stringify(it)) : String(it));
    } else if (typeof item.items === 'string') {
      try {
        const parsed = JSON.parse(item.items);
        if (Array.isArray(parsed)) itemsArr = parsed.map(String);
        else itemsArr = item.items.split('\n');
      } catch {
        itemsArr = item.items.split('\n');
      }
    }
    setForm({
      id: item.id || '',
      title: item.title || '',
      description: item.description || item.desc || '',
      engagement: item.engagement || 'MONTHLY PLAN',
      itemsText: itemsArr.join('\n'),
      featured: Boolean(item.featured),
      display_order: item.display_order || 1,
      status: item.status || 'active'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Package title is required.');
      return;
    }

    const items = form.itemsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (items.length === 0) {
      toast.error('Please enter at least one feature item.');
      return;
    }

    setSubmitting(true);
    const newId = form.id.trim()
      ? form.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
      : (editingItem ? editingItem.id : 'pkg_' + Date.now());

    const payload = {
      id: newId,
      title: form.title.trim(),
      description: form.description.trim(),
      engagement: form.engagement.trim(),
      items,
      featured: form.featured,
      display_order: Number(form.display_order) || (combos.length + 1),
      status: form.status
    };

    try {
      let savedCombo = null;
      if (editingItem) {
        const res = await apiRequest(`/api/combos/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        const data = await parseResponseJson(res);
        if (data && (data.success || data.combo)) {
          savedCombo = data.combo || { ...editingItem, ...payload };
        }
      } else {
        const res = await apiRequest('/api/combos', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const data = await parseResponseJson(res);
        if (data && (data.success || data.combo)) {
          savedCombo = data.combo || payload;
        }
      }

      setCombos(prev => {
        let updated;
        if (editingItem) {
          updated = prev.map(c => c.id === editingItem.id ? (savedCombo || { ...c, ...payload }) : c);
        } else {
          updated = [...prev, savedCombo || payload];
        }
        syncCombosStorage(updated);
        return updated;
      });

      toast.success(editingItem ? `"${form.title}" updated successfully.` : `"${form.title}" created successfully.`);
      setModalOpen(false);
      fetchCombos();
    } catch (err) {
      // Offline fallback: save locally so user changes reflect immediately
      const fallbackItem = { ...payload, id: editingItem ? editingItem.id : (payload.id || 'pkg_' + Date.now()) };
      setCombos(prev => {
        const updated = editingItem ? prev.map(c => c.id === editingItem.id ? fallbackItem : c) : [...prev, fallbackItem];
        syncCombosStorage(updated);
        return updated;
      });
      toast.success(`"${form.title}" saved.`);
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await apiRequest(`/api/combos/${deleteItem.id}`, {
        method: 'DELETE'
      });
    } catch { }

    setCombos(prev => {
      const updated = prev.filter(c => c.id !== deleteItem.id);
      syncCombosStorage(updated);
      return updated;
    });
    toast.success(`"${deleteItem.title}" deleted.`);
    setDeleteItem(null);
    fetchCombos();
  };

  const toggleStatus = async (item) => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await apiRequest(`/api/combos/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
    } catch { }

    setCombos(prev => {
      const updated = prev.map(c => c.id === item.id ? { ...c, status: nextStatus } : c);
      syncCombosStorage(updated);
      return updated;
    });
    toast.success(`Package marked as ${nextStatus}.`);
  };

  const changeOrder = async (item, delta) => {
    const currentOrder = item.display_order || 1;
    const targetOrder = currentOrder + delta;
    if (targetOrder < 1) return;

    try {
      await apiRequest(`/api/combos/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ display_order: targetOrder })
      });
    } catch { }

    setCombos(prev => {
      const updated = prev.map(c => c.id === item.id ? { ...c, display_order: targetOrder } : c);
      syncCombosStorage(updated);
      return updated;
    });
  };

  return (
    <div>
      {/* Top Header */}
      <div className="adm-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="adm-page-title">Combo Packages</h1>
            <span className="adm-logo-badge">{combos.length}</span>
          </div>
          <p className="adm-page-desc">
            Manage bundled packages shown on the live site. Edit included features, engagement terms, and active cards.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="adm-btn adm-btn-secondary"
            onClick={() => fetchCombos(true)}
            disabled={loading}
            title="Refresh packages"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button type="button" className="adm-btn adm-btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            <span>Add Combo Package</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Status, View Switcher */}
      <div className="adm-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flex: '1 1 320px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search packages by title, terms or included features..."
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

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="adm-icon-btn"
              style={{ background: viewMode === 'grid' ? 'var(--adm-surface-hover)' : 'var(--adm-surface)' }}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className="adm-icon-btn"
              style={{ background: viewMode === 'table' ? 'var(--adm-surface-hover)' : 'var(--adm-surface)' }}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
          alignItems: 'stretch'
        }}>
          {filteredCombos.map(item => (
            <div
              key={item.id}
              className="adm-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                border: item.featured ? '1.5px solid var(--adm-text-main)' : '1px solid var(--adm-border)',
                padding: '24px',
                borderRadius: 'var(--adm-radius-lg)',
                background: 'var(--adm-surface-card)',
                boxSizing: 'border-box'
              }}
            >
              {/* Header row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                minHeight: '44px',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--adm-text-main)' }}>
                      {item.title}
                    </h3>
                    {item.featured && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '10px',
                        fontWeight: '800',
                        color: 'var(--adm-bg)',
                        background: 'var(--adm-text-main)',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        letterSpacing: '0.04em'
                      }}>
                        <Star size={10} fill="currentColor" /> FEATURED
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--adm-text-dim)' }}>
                    Order: #{item.display_order || 1} • ID: {item.id}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    className="adm-icon-btn"
                    onClick={() => changeOrder(item, -1)}
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    className="adm-icon-btn"
                    onClick={() => changeOrder(item, 1)}
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p style={{
                fontSize: '13px',
                color: 'var(--adm-text-muted)',
                lineHeight: 1.5,
                margin: '0 0 16px 0',
                minHeight: '44px'
              }}>
                {item.description}
              </p>

              {/* What is included list */}
              <div style={{
                flex: '1 1 auto',
                borderTop: '1px solid var(--adm-border)',
                paddingTop: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--adm-text-main)',
                  marginBottom: '8px'
                }}>
                  What is included ({item.items?.length || 0}):
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {(item.items || []).map((feature, fIdx) => (
                    <li key={fIdx} style={{
                      fontSize: '12.5px',
                      color: 'var(--adm-text-main)',
                      padding: '4px 0 4px 22px',
                      position: 'relative',
                      lineHeight: '1.4'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        top: '5px',
                        width: '15px',
                        height: '15px',
                        borderRadius: '50%',
                        background: 'var(--adm-surface-hover)',
                        border: '1px solid var(--adm-border)',
                        color: 'var(--adm-text-main)',
                        fontSize: '9px',
                        fontWeight: '900',
                        display: 'grid',
                        placeItems: 'center'
                      }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer row: Engagement Badge & Actions */}
              <div style={{
                borderTop: '1px solid var(--adm-border)',
                paddingTop: '14px',
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  color: 'var(--adm-text-main)',
                  background: 'var(--adm-surface-hover)',
                  border: '1px solid var(--adm-border)',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}>
                  {item.engagement}
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    onClick={() => openEditModal(item)}
                    title="Edit package"
                    style={{ color: 'var(--adm-text-main)', borderColor: 'var(--adm-border)' }}
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn-danger adm-btn-sm"
                    onClick={() => setDeleteItem(item)}
                    title="Delete package"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Big Button Without Icon: Add Included below Edit & Delete */}
              <button
                type="button"
                onClick={() => openEditModal(item)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  marginTop: '12px',
                  background: 'var(--adm-surface-hover)',
                  border: '1px solid var(--adm-border)',
                  borderRadius: 'var(--adm-radius-md, 8px)',
                  color: 'var(--adm-text-main)',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--adm-text-main)';
                  e.currentTarget.style.background = 'var(--adm-surface)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--adm-border)';
                  e.currentTarget.style.background = 'var(--adm-surface-hover)';
                }}
              >
                Add Included
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Order</th>
                <th>Title</th>
                <th>Engagement Term</th>
                <th>Features Included</th>
                <th>Status</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCombos.map(item => (
                <tr key={item.id}>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'var(--adm-surface)',
                      border: '1px solid var(--adm-border)',
                      color: 'var(--adm-text-muted)'
                    }}>
                      #{item.display_order}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--adm-text-main)' }}>{item.title}</strong>
                    {item.featured && (
                      <span style={{
                        marginLeft: '8px',
                        color: 'var(--adm-bg)',
                        background: 'var(--adm-text-main)',
                        fontSize: '9.5px',
                        fontWeight: '800',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        letterSpacing: '0.04em'
                      }}>★ FEATURED</span>
                    )}
                    <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)', marginTop: '2px' }}>{item.description}</div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      color: 'var(--adm-text-main)',
                      background: 'var(--adm-surface-hover)',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      border: '1px solid var(--adm-border)',
                      letterSpacing: '0.04em'
                    }}>
                      {item.engagement}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--adm-text-main)' }}>
                      {item.items?.length || 0} features
                    </span>
                  </td>
                  <td>
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
                        background: item.status === 'active' ? 'var(--adm-success-bg)' : 'rgba(100, 116, 139, 0.12)',
                        color: item.status === 'active' ? 'var(--adm-success)' : 'var(--adm-text-dim)'
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
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="adm-icon-btn"
                        onClick={() => openEditModal(item)}
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className="adm-icon-btn"
                        onClick={() => setDeleteItem(item)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
            maxWidth: '600px',
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
                {editingItem ? 'Edit Combo Package' : 'Add New Combo Package'}
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
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                      Package Title *
                    </label>
                    <input
                      type="text"
                      className="adm-search-input"
                      placeholder="e.g. Videography Package"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      required
                    />
                  </div>

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
                </div>

                {!editingItem && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                      Package ID (Optional Unique Slug)
                    </label>
                    <input
                      type="text"
                      className="adm-search-input"
                      placeholder="e.g. video, web, pos"
                      value={form.id}
                      onChange={e => setForm({ ...form, id: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                    Description / Best For
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Short summary of what this package is best suited for..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
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
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                    Engagement Badge Text *
                  </label>
                  <input
                    type="text"
                    className="adm-search-input"
                    placeholder="e.g. MONTHLY ENGAGEMENT, 6-MONTH ENGAGEMENT"
                    value={form.engagement}
                    onChange={e => setForm({ ...form, engagement: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', marginBottom: '8px' }}
                    required
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {ENGAGEMENT_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setForm({ ...form, engagement: opt })}
                        style={{
                          fontSize: '10px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--adm-border)',
                          background: form.engagement === opt ? 'var(--adm-text-main)' : 'var(--adm-surface)',
                          color: form.engagement === opt ? 'var(--adm-bg)' : 'var(--adm-text-muted)',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                    What is Included (One feature per line) *
                  </label>
                  <textarea
                    rows="5"
                    placeholder="12 Static Creatives&#10;Social Media Management&#10;Basic Campaign Management&#10;1 Video Shoot&#10;Monthly Reporting"
                    value={form.itemsText}
                    onChange={e => setForm({ ...form, itemsText: e.target.value })}
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
                      lineHeight: '1.5'
                    }}
                    required
                  />
                  <span style={{ fontSize: '11.5px', color: 'var(--adm-text-dim)', marginTop: '4px', display: 'block' }}>
                    Each line becomes an item with a checkmark in the live website card.
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      style={{
                        width: '100%',
                        background: 'var(--adm-surface-card)',
                        border: '1px solid var(--adm-border)',
                        borderRadius: 'var(--adm-radius-md)',
                        color: 'var(--adm-text-main)',
                        padding: '9px 12px',
                        fontSize: '13px'
                      }}
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="inactive">Inactive (Hidden)</option>
                    </select>
                  </div>

                  <div style={{ paddingTop: '22px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={e => setForm({ ...form, featured: e.target.checked })}
                      />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--adm-text-main)' }}>
                        Featured Package (e.g. Website Combo)
                      </span>
                    </label>
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
                  {submitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Create Package')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteItem)}
        title="Delete Combo Package"
        message={`Are you sure you want to delete "${deleteItem?.title}"? This action cannot be undone.`}
        confirmText="Delete Package"
        danger={true}
        onConfirm={handleDelete}
        onClose={() => setDeleteItem(null)}
      />
    </div>
  );
}
