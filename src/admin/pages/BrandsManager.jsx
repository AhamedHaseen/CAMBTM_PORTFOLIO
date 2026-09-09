import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Pause,
  Play,
  Globe,
  RefreshCw,
  Search,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  X,
  Layers
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import MediaUploadField from '../components/MediaUploadField';

const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return url.startsWith('/') ? url : `/${url}`;
};

export default function BrandsManager() {
  const [brands, setBrands] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, hidden: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'published' | 'hidden'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [statusConfirmModal, setStatusConfirmModal] = useState(null);

  const toast = useToast();

  // Form State: Only Company Name, Logo File, Display Order, Status (NO website_url, NO description)
  const [form, setForm] = useState({
    company_name: '',
    logo_url: '',
    display_order: 1,
    status: 'published'
  });

  const fetchBrands = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await apiRequest('/api/brands?all=true');
      const data = await res.json();
      if (data.success) {
        setBrands(data.brands || []);
        if (data.stats) {
          setStats(data.stats);
        } else {
          const bList = data.brands || [];
          setStats({
            total: bList.length,
            published: bList.filter(b => b.status === 'published').length,
            hidden: bList.filter(b => b.status === 'hidden' || b.status === 'draft').length
          });
        }
      } else {
        toast.error(data.error || 'Failed to load brands');
      }
    } catch (err) {
      toast.error('Failed to load brands');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands(true);
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    const nextOrder = brands.length > 0 ? Math.max(...brands.map(b => b.display_order || 0)) + 1 : 1;
    setForm({
      company_name: '',
      logo_url: '',
      display_order: nextOrder,
      status: 'published'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingItem(b);
    setForm({
      company_name: b.company_name || '',
      logo_url: b.logo_url || '',
      display_order: b.display_order || 1,
      status: b.status || 'published'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_name.trim()) {
      toast.error('Please provide a Company / Brand Name.');
      return;
    }
    if (!form.logo_url.trim()) {
      toast.error('Please upload a Brand Logo File.');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingItem ? `/api/brands/${editingItem.id}` : '/api/brands';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await apiRequest(url, {
        method,
        body: JSON.stringify({
          company_name: form.company_name.trim(),
          logo_url: form.logo_url.trim(),
          display_order: parseInt(form.display_order, 10) || 1,
          status: form.status
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(editingItem ? 'Brand logo updated successfully!' : 'Brand logo added successfully!');
        setModalOpen(false);
        fetchBrands(false);
      } else {
        toast.error(data.error || 'Failed to save brand');
      }
    } catch (err) {
      toast.error('An error occurred while saving brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestToggleStatus = (b) => {
    const targetStatus = b.status === 'published' ? 'hidden' : 'published';
    setStatusConfirmModal({
      brand: b,
      targetStatus
    });
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusConfirmModal) return;
    const { brand, targetStatus } = statusConfirmModal;
    setStatusConfirmModal(null);

    // In-place optimistic update: no flicker / no page refresh
    setBrands(prev => prev.map(b => b.id === brand.id ? { ...b, status: targetStatus } : b));
    setStats(prev => ({
      ...prev,
      published: targetStatus === 'published' ? prev.published + 1 : prev.published - 1,
      hidden: targetStatus === 'hidden' ? prev.hidden + 1 : prev.hidden - 1
    }));

    try {
      const res = await apiRequest(`/api/brands/${brand.id}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`"${brand.company_name}" is now ${targetStatus === 'published' ? 'Published (Live)' : 'Paused'}`);
        fetchBrands(false);
      } else {
        fetchBrands(false);
        toast.error(data.error || 'Failed to toggle status');
      }
    } catch (err) {
      fetchBrands(false);
      toast.error('Error toggling status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const idToDelete = deleteId;
    setDeleteId(null);

    // In-place optimistic removal
    setBrands(prev => prev.filter(b => b.id !== idToDelete));
    try {
      const res = await apiRequest(`/api/brands/${idToDelete}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Brand removed from list.');
        fetchBrands(false);
      } else {
        fetchBrands(false);
        toast.error(data.error || 'Delete failed');
      }
    } catch (err) {
      fetchBrands(false);
      toast.error('Failed to delete brand');
    }
  };

  const handleMoveOrder = async (brand, direction) => {
    const sorted = [...brands].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    const currentIndex = sorted.findIndex(b => b.id === brand.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetBrand = sorted[targetIndex];
    const currentOrder = brand.display_order || 0;
    const targetOrder = targetBrand.display_order || 0;

    const newOrderForCurrent = targetOrder === currentOrder
      ? (direction === 'up' ? currentOrder - 1 : currentOrder + 1)
      : targetOrder;
    const newOrderForTarget = currentOrder;

    // In-place order update
    setBrands(prev => prev.map(b => {
      if (b.id === brand.id) return { ...b, display_order: newOrderForCurrent };
      if (b.id === targetBrand.id) return { ...b, display_order: newOrderForTarget };
      return b;
    }));

    try {
      await apiRequest('/api/brands/reorder/batch', {
        method: 'PUT',
        body: JSON.stringify({
          items: [
            { id: brand.id, display_order: newOrderForCurrent },
            { id: targetBrand.id, display_order: newOrderForTarget }
          ]
        })
      });
      toast.success('Display order updated');
      fetchBrands(false);
    } catch (err) {
      fetchBrands(false);
      toast.error('Failed to reorder brands');
    }
  };

  // Filtered Brands
  const filteredBrands = useMemo(() => {
    return brands.filter(b => {
      if (search && !b.company_name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (filterTab === 'published') return b.status === 'published';
      if (filterTab === 'hidden') return b.status === 'hidden' || b.status === 'draft';
      return true;
    });
  }, [brands, search, filterTab]);

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={24} style={{ color: 'var(--adm-primary)' }} />
            <span>Brands Management ("Brands that trust us")</span>
          </h1>
          <p className="adm-page-desc">
            Upload, manage, reorder, and hide/publish client logos running in the homepage "Brands that trust us" infinite marquee.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="adm-btn adm-btn-secondary"
            onClick={fetchBrands}
            disabled={loading}
            title="Refresh Brands"
          >
            <RefreshCw size={16} className={loading ? 'adm-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            onClick={handleOpenCreate}
          >
            <Plus size={16} />
            <span>Add Brand Logo</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (3 in the same line) */}
      <div className="adm-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="adm-card adm-kpi-card">
          <div>
            <div className="adm-kpi-label">Published Brand Logos</div>
            <div className="adm-kpi-value" style={{ color: 'var(--adm-success)' }}>
              {stats.published}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
              Live in homepage "Brands that trust us" marquee
            </div>
          </div>
          <div className="adm-kpi-icon" style={{ background: 'rgba(34, 197, 94, 0.12)', color: 'var(--adm-success)' }}>
            <Play size={24} />
          </div>
        </div>

        <div className="adm-card adm-kpi-card">
          <div>
            <div className="adm-kpi-label">Paused / Inactive Logos</div>
            <div className="adm-kpi-value" style={{ color: stats.hidden > 0 ? 'var(--adm-warning)' : 'var(--adm-text-muted)' }}>
              {stats.hidden}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
              Paused from homepage marquee strip
            </div>
          </div>
          <div className="adm-kpi-icon" style={{ background: 'rgba(234, 179, 8, 0.12)', color: 'var(--adm-warning)' }}>
            <Pause size={24} />
          </div>
        </div>

        <div className="adm-card adm-kpi-card">
          <div>
            <div className="adm-kpi-label">Total Brand Partners</div>
            <div className="adm-kpi-value">
              {stats.total}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
              Database records
            </div>
          </div>
          <div className="adm-kpi-icon">
            <Layers size={24} />
          </div>
        </div>
      </div>

      {/* Search & Tabs Filter Toolbar */}
      <div className="adm-card" style={{ padding: '14px 18px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className={`adm-btn ${filterTab === 'all' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '12px', height: '34px' }}
              onClick={() => setFilterTab('all')}
            >
              All Brands ({brands.length})
            </button>
            <button
              type="button"
              className={`adm-btn ${filterTab === 'published' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '12px', height: '34px' }}
              onClick={() => setFilterTab('published')}
            >
              Published ({stats.published})
            </button>
            <button
              type="button"
              className={`adm-btn ${filterTab === 'hidden' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '12px', height: '34px' }}
              onClick={() => setFilterTab('hidden')}
            >
              Paused ({stats.hidden})
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-dim)' }} />
              <input
                type="text"
                className="adm-input"
                placeholder="Search brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '32px', height: '34px', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', border: '1px solid var(--adm-border)', borderRadius: '6px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 10px',
                  background: viewMode === 'grid' ? 'var(--adm-primary)' : 'var(--adm-surface)',
                  color: viewMode === 'grid' ? '#fff' : 'var(--adm-text-dim)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  padding: '6px 10px',
                  background: viewMode === 'table' ? 'var(--adm-primary)' : 'var(--adm-surface)',
                  color: viewMode === 'table' ? '#fff' : 'var(--adm-text-dim)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Brands Content */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--adm-text-muted)' }}>
          <RefreshCw size={24} className="adm-spin" style={{ margin: '0 auto 12px' }} />
          <div>Loading brand logos from database...</div>
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="adm-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Building2 size={40} color="var(--adm-text-dim)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', color: 'var(--adm-text-main)', margin: '0 0 6px' }}>No Brand Logos Found</h3>
          <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', margin: '0 0 16px' }}>
            {search ? 'No brands match your search query.' : 'Add client logos to feature in the "Brands that trust us" marquee.'}
          </p>
          <button onClick={handleOpenCreate} className="adm-btn adm-btn-primary adm-btn-sm">
            <Plus size={14} />
            <span>Add Brand Logo</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {filteredBrands.map((b) => (
            <div
              key={b.id}
              className="adm-card"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: b.status === 'published' ? '1px solid var(--adm-border)' : '1px dashed var(--adm-border)',
                opacity: b.status === 'published' ? 1 : 0.75,
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                {/* Logo Display Box */}
                <div
                  style={{
                    width: '100%',
                    height: '80px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '8px',
                    border: '1px solid var(--adm-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    marginBottom: '12px',
                    position: 'relative'
                  }}
                >
                  <img
                    src={getMediaUrl(b.logo_url)}
                    alt={b.company_name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div style={{ position: 'absolute', top: '6px', left: '6px' }}>
                    <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      #{b.display_order}
                    </span>
                  </div>
                  <div style={{ position: 'absolute', top: '6px', right: '6px' }}>
                    <span className={`adm-badge ${b.status === 'published' ? 'adm-badge-success' : 'adm-badge-warning'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                      {b.status === 'published' ? 'Published' : 'Paused'}
                    </span>
                  </div>
                </div>

                {/* Company Name */}
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--adm-text-main)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {b.company_name}
                </h4>
              </div>

              {/* Action Buttons Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--adm-border)' }}>
                {/* Order Up / Down */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    className="adm-icon-btn"
                    onClick={() => handleMoveOrder(b, 'up')}
                    title="Move order up"
                    style={{ width: '28px', height: '28px', padding: 0 }}
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    className="adm-icon-btn"
                    onClick={() => handleMoveOrder(b, 'down')}
                    title="Move order down"
                    style={{ width: '28px', height: '28px', padding: 0 }}
                  >
                    <ArrowDown size={13} />
                  </button>
                </div>

                {/* Status Toggle, Edit, Delete */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={`adm-btn ${b.status === 'published' ? 'adm-btn-secondary' : 'adm-btn-primary'} adm-btn-xs`}
                    onClick={() => handleRequestToggleStatus(b)}
                    title={b.status === 'published' ? 'Pause Brand' : 'Publish Brand'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      padding: '3px 8px',
                      height: '28px'
                    }}
                  >
                    {b.status === 'published' ? (
                      <>
                        <Pause size={11} />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play size={11} />
                        <span>Publish</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="adm-icon-btn"
                    onClick={() => handleOpenEdit(b)}
                    title="Edit Brand"
                    style={{ width: '28px', height: '28px', padding: 0 }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    className="adm-icon-btn"
                    onClick={() => setDeleteId(b.id)}
                    title="Delete Brand"
                    style={{ width: '28px', height: '28px', padding: 0, color: 'var(--adm-danger)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Order</th>
                <th style={{ width: '100px' }}>Brand Logo</th>
                <th>Company / Brand Name</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.map(b => (
                <tr key={b.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--adm-text-dim)', minWidth: '24px' }}>#{b.display_order}</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button
                          type="button"
                          className="adm-icon-btn"
                          style={{ width: '18px', height: '14px', padding: 0 }}
                          onClick={() => handleMoveOrder(b, 'up')}
                          title="Move up"
                        >
                          <ArrowUp size={10} />
                        </button>
                        <button
                          type="button"
                          className="adm-icon-btn"
                          style={{ width: '18px', height: '14px', padding: 0 }}
                          onClick={() => handleMoveOrder(b, 'down')}
                          title="Move down"
                        >
                          <ArrowDown size={10} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{
                      width: '70px',
                      height: '42px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '6px',
                      border: '1px solid var(--adm-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}>
                      <img
                        src={getMediaUrl(b.logo_url)}
                        alt={b.company_name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--adm-text-main)', fontSize: '14px' }}>
                      {b.company_name}
                    </div>
                  </td>
                  <td>
                    <span className={`adm-badge ${b.status === 'published' ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                      {b.status === 'published' ? 'Published' : 'Paused'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleRequestToggleStatus(b)}
                        className={`adm-btn ${b.status === 'published' ? 'adm-btn-secondary' : 'adm-btn-primary'} adm-btn-xs`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '4px 10px' }}
                        title={b.status === 'published' ? 'Pause Brand (Remove from live marquee)' : 'Publish Brand (Make live in marquee)'}
                      >
                        {b.status === 'published' ? (
                          <>
                            <Pause size={12} />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play size={12} />
                            <span>Publish</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(b)}
                        className="adm-icon-btn"
                        title="Edit Brand"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(b.id)}
                        className="adm-icon-btn"
                        title="Delete Brand"
                        style={{ color: 'var(--adm-danger)' }}
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

      {/* Edit / Create Brand Modal */}
      {modalOpen && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal" style={{ maxWidth: '540px' }}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">
                {editingItem ? 'Edit Brand Logo' : 'Add Brand Logo to Marquee'}
              </h3>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="adm-modal-body">
              {/* Company Name */}
              <div className="adm-form-group">
                <label className="adm-form-label">Company / Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Myra, Hijaz, Uneeflow"
                  value={form.company_name}
                  onChange={e => setForm({ ...form, company_name: e.target.value })}
                  className="adm-input"
                />
              </div>

              {/* Logo Media Picker */}
              <MediaUploadField
                label="Brand Logo Image File *"
                value={form.logo_url}
                onChange={url => setForm({ ...form, logo_url: url })}
                accept="image/*"
                helpText="Transparent PNG or SVG logo recommended (Max 10MB)"
              />

              {/* Display Order & Visibility Status in 2-Column Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={form.display_order}
                    onChange={e => setForm({ ...form, display_order: parseInt(e.target.value, 10) || 1 })}
                    className="adm-input"
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Visibility Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="adm-select"
                  >
                    <option value="published">Published (Live in Marquee)</option>
                    <option value="hidden">Paused (Inactive in Marquee)</option>
                  </select>
                </div>
              </div>

              {/* Right-aligned Footer Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="adm-btn adm-btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="adm-btn adm-btn-primary"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Update Brand' : 'Save Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Status Change Modal */}
      {statusConfirmModal && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal" style={{ maxWidth: '440px' }}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">
                {statusConfirmModal.targetStatus === 'published' ? 'Publish Brand' : 'Pause Brand'}
              </h3>
              <button type="button" className="adm-icon-btn" onClick={() => setStatusConfirmModal(null)}>×</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize: '14px', color: 'var(--adm-text-muted)', lineHeight: '1.5', margin: 0 }}>
                Are you sure you want to <strong>{statusConfirmModal.targetStatus === 'published' ? 'Publish' : 'Pause'}</strong> the brand <strong>{statusConfirmModal.brand.company_name}</strong>? {statusConfirmModal.targetStatus === 'published' ? 'It will become active and visible on the live homepage marquee.' : 'It will be paused and hidden from the homepage marquee.'}
              </p>
            </div>
            <div className="adm-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setStatusConfirmModal(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={`adm-btn ${statusConfirmModal.targetStatus === 'published' ? 'adm-btn-primary' : 'adm-btn-warning'}`}
                onClick={handleConfirmToggleStatus}
              >
                Confirm &amp; {statusConfirmModal.targetStatus === 'published' ? 'Publish' : 'Pause'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Brand Logo"
        message="Are you sure you want to remove this brand logo from the marquee list?"
        confirmText="Confirm Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
