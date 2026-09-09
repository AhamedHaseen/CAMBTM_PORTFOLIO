import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutGrid,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Film,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Play,
  X
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../components/Toast';
import MediaUploadField from '../components/MediaUploadField';

const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return url.startsWith('/') ? url : `/${url}`;
};

export default function HeroBentoManager() {
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    runningImagesCount: 0,
    runningVideosCount: 0,
    totalPublished: 0,
    hiddenCount: 0,
    col1Count: 0,
    col2Count: 0,
    col3Count: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'col1' | 'col2' | 'col3' | 'images' | 'videos' | 'published' | 'hidden'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal State
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status Change Confirmation Modal
  const [statusConfirmModal, setStatusConfirmModal] = useState(null);

  // Form State (NO website_url as requested)
  const [formData, setFormData] = useState({
    name: '',
    media_type: 'image', // 'image' | 'video'
    media_url: '',
    poster_url: '',
    column_index: 1,
    display_order: 1,
    status: 'published'
  });

  const fetchItems = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await apiRequest('/api/hero-bento/admin/all');
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        if (data.stats) setStats(data.stats);
      } else {
        toast.error(data.error || 'Failed to load hero bento media');
      }
    } catch (err) {
      toast.error('Network error loading Hero Bento items');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(true);
  }, []);

  const openAddModal = (defaultCol = 1) => {
    setEditingItem(null);
    const colItems = items.filter(i => Number(i.column_index) === defaultCol);
    const nextOrder = colItems.length > 0 ? Math.max(...colItems.map(i => i.display_order || 0)) + 1 : 1;

    setFormData({
      name: '',
      media_type: 'image',
      media_url: '',
      poster_url: '',
      column_index: defaultCol,
      display_order: nextOrder,
      status: 'published'
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      media_type: item.media_type || 'image',
      media_url: item.media_url || '',
      poster_url: item.poster_url || '',
      column_index: Number(item.column_index) || 1,
      display_order: item.display_order || 1,
      status: item.status || 'published'
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please provide a section / item name');
      return;
    }

    if (!formData.media_url.trim()) {
      toast.error(`Please upload an ${formData.media_type}`);
      return;
    }

    setSubmitting(true);
    try {
      const url = editingItem
        ? `/api/hero-bento/${editingItem.id}`
        : '/api/hero-bento';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await apiRequest(url, {
        method,
        body: JSON.stringify({
          name: formData.name.trim(),
          media_type: formData.media_type,
          media_url: formData.media_url.trim(),
          poster_url: formData.poster_url.trim(),
          column_index: Number(formData.column_index),
          display_order: Number(formData.display_order),
          status: formData.status
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(editingItem ? 'Hero Bento item updated' : 'Hero Bento item added');
        setModalOpen(false);
        fetchItems(false);
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (err) {
      toast.error(err.message || 'Error saving hero bento item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestToggleStatus = (item) => {
    const targetStatus = item.status === 'published' ? 'hidden' : 'published';
    setStatusConfirmModal({
      item,
      targetStatus
    });
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusConfirmModal) return;
    const { item, targetStatus } = statusConfirmModal;
    setStatusConfirmModal(null);

    // In-place optimistic update without screen refresh
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: targetStatus } : i));
    setStats(prev => ({
      ...prev,
      totalPublished: targetStatus === 'published' ? prev.totalPublished + 1 : prev.totalPublished - 1,
      hiddenCount: targetStatus === 'hidden' ? prev.hiddenCount + 1 : prev.hiddenCount - 1
    }));

    try {
      const res = await apiRequest(`/api/hero-bento/${item.id}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`"${item.name}" is now ${targetStatus === 'published' ? 'Live on Homepage' : 'Hidden'}`);
        fetchItems(false);
      } else {
        fetchItems(false);
        toast.error(data.error || 'Failed to toggle status');
      }
    } catch (err) {
      fetchItems(false);
      toast.error('Error toggling status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    const itemToDelete = deleteModal;
    setDeleting(true);

    // In-place optimistic delete
    setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
    try {
      const res = await apiRequest(`/api/hero-bento/${itemToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Deleted "${itemToDelete.name}" from Hero Bento`);
        setDeleteModal(null);
        fetchItems(false);
      } else {
        fetchItems(false);
        toast.error(data.error || 'Delete failed');
      }
    } catch (err) {
      fetchItems(false);
      toast.error('Error deleting item');
    } finally {
      setDeleting(false);
    }
  };

  const handleMoveOrder = async (item, direction) => {
    const colItems = items
      .filter(i => Number(i.column_index) === Number(item.column_index))
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    const currentIndex = colItems.findIndex(i => i.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= colItems.length) return;

    const targetItem = colItems[targetIndex];

    const currentOrder = item.display_order || 0;
    const targetOrder = targetItem.display_order || 0;

    const newOrderForCurrent = targetOrder === currentOrder
      ? (direction === 'up' ? currentOrder - 1 : currentOrder + 1)
      : targetOrder;
    const newOrderForTarget = currentOrder;

    // In-place optimistic order update
    setItems(prev => prev.map(i => {
      if (i.id === item.id) return { ...i, display_order: newOrderForCurrent };
      if (i.id === targetItem.id) return { ...i, display_order: newOrderForTarget };
      return i;
    }));

    try {
      await apiRequest('/api/hero-bento/reorder', {
        method: 'POST',
        body: JSON.stringify({
          items: [
            { id: item.id, display_order: newOrderForCurrent, column_index: item.column_index },
            { id: targetItem.id, display_order: newOrderForTarget, column_index: targetItem.column_index }
          ]
        })
      });
      toast.success('Order updated');
      fetchItems(false);
    } catch (err) {
      fetchItems(false);
      toast.error('Failed to change order');
    }
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      // Tab filter
      if (activeTab === 'col1') return Number(item.column_index) === 1;
      if (activeTab === 'col2') return Number(item.column_index) === 2;
      if (activeTab === 'col3') return Number(item.column_index) === 3;
      if (activeTab === 'images') return item.media_type === 'image';
      if (activeTab === 'videos') return item.media_type === 'video';
      if (activeTab === 'published') return item.status === 'published';
      if (activeTab === 'hidden') return item.status === 'hidden';
      return true;
    });
  }, [items, search, activeTab]);

  // Column distribution for live overview
  const col1Items = items.filter(i => Number(i.column_index) === 1 && i.status === 'published');
  const col2Items = items.filter(i => Number(i.column_index) === 2 && i.status === 'published');
  const col3Items = items.filter(i => Number(i.column_index) === 3 && i.status === 'published');

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LayoutGrid size={24} style={{ color: 'var(--adm-primary)' }} />
            <span>Hero Bento Manager</span>
          </h1>
          <p className="adm-page-desc">
            Manage, upload, reorder, and hide/publish images and video creatives running in the homepage 3-column infinite bento slider.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="adm-btn adm-btn-secondary"
            onClick={fetchItems}
            disabled={loading}
            title="Refresh Bento Items"
          >
            <RefreshCw size={16} className={loading ? 'adm-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            onClick={() => openAddModal(1)}
          >
            <Plus size={16} />
            <span>Add Bento Media</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="adm-grid-4" style={{ marginBottom: '24px' }}>
        {/* Running Images */}
        <div className="adm-card adm-kpi-card">
          <div>
            <div className="adm-kpi-label">Running Hero Images</div>
            <div className="adm-kpi-value" style={{ color: '#38bdf8' }}>
              {stats.runningImagesCount}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
              Live in homepage infinite bento loop
            </div>
          </div>
          <div className="adm-kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
            <ImageIcon size={24} />
          </div>
        </div>

        {/* Running Videos */}
        <div className="adm-card adm-kpi-card">
          <div>
            <div className="adm-kpi-label">Running Hero Videos</div>
            <div className="adm-kpi-value" style={{ color: '#a855f7' }}>
              {stats.runningVideosCount}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
              Autoplaying & muted video reels
            </div>
          </div>
          <div className="adm-kpi-icon" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
            <Film size={24} />
          </div>
        </div>

        {/* Total Hero Bento Items */}
        <div className="adm-card adm-kpi-card">
          <div>
            <div className="adm-kpi-label">Total Bento Items</div>
            <div className="adm-kpi-value">
              {stats.total}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
              Col 1: {stats.col1Count} • Col 2: {stats.col2Count} • Col 3: {stats.col3Count}
            </div>
          </div>
          <div className="adm-kpi-icon">
            <Layers size={24} />
          </div>
        </div>

        {/* Hidden / Draft Items */}
        <div className="adm-card adm-kpi-card">
          <div>
            <div className="adm-kpi-label">Hidden Media</div>
            <div className="adm-kpi-value" style={{ color: stats.hiddenCount > 0 ? 'var(--adm-warning)' : 'var(--adm-text-muted)' }}>
              {stats.hiddenCount}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
              Hidden from homepage loop
            </div>
          </div>
          <div className="adm-kpi-icon" style={{ background: 'rgba(234, 179, 8, 0.12)', color: 'var(--adm-warning)' }}>
            <EyeOff size={24} />
          </div>
        </div>
      </div>

      {/* Live Bento Columns Visual Summary Strip */}
      <div className="adm-card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--adm-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: 'var(--adm-primary)' }} />
              Live Homepage Bento Running Status (Columns 1, 2, & 3)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
              Below shows exactly which images and videos are currently published and running in each column of the Hero Bento.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Column 1 */}
          <div style={{ background: 'var(--adm-bg-surface)', border: '1px solid var(--adm-border)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="adm-badge adm-badge-primary">Column 1 (Left)</span>
                <span style={{ fontSize: '12px', color: 'var(--adm-text-dim)' }}>{col1Items.length} live</span>
              </div>
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                style={{ padding: '3px 8px', fontSize: '11px', height: 'auto' }}
                onClick={() => openAddModal(1)}
              >
                <Plus size={12} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
              {col1Items.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', padding: '10px 0' }}>No active media in Column 1</div>
              ) : (
                col1Items.map(item => (
                  <div
                    key={item.id}
                    style={{
                      position: 'relative',
                      width: '72px',
                      height: '96px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1px solid var(--adm-border)',
                      background: '#000',
                      cursor: 'pointer'
                    }}
                    onClick={() => openEditModal(item)}
                    title={`${item.name} (${item.media_type.toUpperCase()}) - Click to edit`}
                  >
                    {item.media_type === 'video' ? (
                      <video
                        src={getMediaUrl(item.media_url)}
                        poster={item.poster_url ? getMediaUrl(item.poster_url) : undefined}
                        muted
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <img
                        src={getMediaUrl(item.media_url)}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
                      {item.media_type === 'video' ? (
                        <span style={{ background: 'rgba(168,85,247,0.9)', color: '#fff', borderRadius: '4px', padding: '2px 4px', fontSize: '9px', display: 'flex', alignItems: 'center' }}>
                          <Play size={8} />
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(56,189,248,0.9)', color: '#fff', borderRadius: '4px', padding: '2px 4px', fontSize: '9px' }}>
                          IMG
                        </span>
                      )}
                    </div>
                    <div style={{ position: 'absolute', bottom: '0', insetInline: '0', background: 'rgba(0,0,0,0.7)', padding: '2px 4px', fontSize: '9px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      #{item.display_order} {item.name}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2 */}
          <div style={{ background: 'var(--adm-bg-surface)', border: '1px solid var(--adm-border)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="adm-badge adm-badge-success">Column 2 (Center)</span>
                <span style={{ fontSize: '12px', color: 'var(--adm-text-dim)' }}>{col2Items.length} live</span>
              </div>
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                style={{ padding: '3px 8px', fontSize: '11px', height: 'auto' }}
                onClick={() => openAddModal(2)}
              >
                <Plus size={12} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
              {col2Items.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', padding: '10px 0' }}>No active media in Column 2</div>
              ) : (
                col2Items.map(item => (
                  <div
                    key={item.id}
                    style={{
                      position: 'relative',
                      width: '72px',
                      height: '96px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1px solid var(--adm-border)',
                      background: '#000',
                      cursor: 'pointer'
                    }}
                    onClick={() => openEditModal(item)}
                    title={`${item.name} (${item.media_type.toUpperCase()}) - Click to edit`}
                  >
                    {item.media_type === 'video' ? (
                      <video
                        src={getMediaUrl(item.media_url)}
                        poster={item.poster_url ? getMediaUrl(item.poster_url) : undefined}
                        muted
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <img
                        src={getMediaUrl(item.media_url)}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
                      {item.media_type === 'video' ? (
                        <span style={{ background: 'rgba(168,85,247,0.9)', color: '#fff', borderRadius: '4px', padding: '2px 4px', fontSize: '9px', display: 'flex', alignItems: 'center' }}>
                          <Play size={8} />
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(56,189,248,0.9)', color: '#fff', borderRadius: '4px', padding: '2px 4px', fontSize: '9px' }}>
                          IMG
                        </span>
                      )}
                    </div>
                    <div style={{ position: 'absolute', bottom: '0', insetInline: '0', background: 'rgba(0,0,0,0.7)', padding: '2px 4px', fontSize: '9px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      #{item.display_order} {item.name}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3 */}
          <div style={{ background: 'var(--adm-bg-surface)', border: '1px solid var(--adm-border)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="adm-badge adm-badge-warning">Column 3 (Right)</span>
                <span style={{ fontSize: '12px', color: 'var(--adm-text-dim)' }}>{col3Items.length} live</span>
              </div>
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                style={{ padding: '3px 8px', fontSize: '11px', height: 'auto' }}
                onClick={() => openAddModal(3)}
              >
                <Plus size={12} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
              {col3Items.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', padding: '10px 0' }}>No active media in Column 3</div>
              ) : (
                col3Items.map(item => (
                  <div
                    key={item.id}
                    style={{
                      position: 'relative',
                      width: '72px',
                      height: '96px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1px solid var(--adm-border)',
                      background: '#000',
                      cursor: 'pointer'
                    }}
                    onClick={() => openEditModal(item)}
                    title={`${item.name} (${item.media_type.toUpperCase()}) - Click to edit`}
                  >
                    {item.media_type === 'video' ? (
                      <video
                        src={getMediaUrl(item.media_url)}
                        poster={item.poster_url ? getMediaUrl(item.poster_url) : undefined}
                        muted
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <img
                        src={getMediaUrl(item.media_url)}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
                      {item.media_type === 'video' ? (
                        <span style={{ background: 'rgba(168,85,247,0.9)', color: '#fff', borderRadius: '4px', padding: '2px 4px', fontSize: '9px', display: 'flex', alignItems: 'center' }}>
                          <Play size={8} />
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(56,189,248,0.9)', color: '#fff', borderRadius: '4px', padding: '2px 4px', fontSize: '9px' }}>
                          IMG
                        </span>
                      )}
                    </div>
                    <div style={{ position: 'absolute', bottom: '0', insetInline: '0', background: 'rgba(0,0,0,0.7)', padding: '2px 4px', fontSize: '9px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      #{item.display_order} {item.name}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="adm-card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              { key: 'all', label: 'All Items', count: items.length },
              { key: 'col1', label: 'Column 1 (Left)', count: stats.col1Count },
              { key: 'col2', label: 'Column 2 (Center)', count: stats.col2Count },
              { key: 'col3', label: 'Column 3 (Right)', count: stats.col3Count },
              { key: 'images', label: 'Images', count: items.filter(i => i.media_type === 'image').length },
              { key: 'videos', label: 'Videos', count: items.filter(i => i.media_type === 'video').length },
              { key: 'published', label: 'Published', count: stats.totalPublished },
              { key: 'hidden', label: 'Hidden', count: stats.hiddenCount }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                className={`adm-btn ${activeTab === tab.key ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '13px' }}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '11px',
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : 'var(--adm-bg-surface)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  marginLeft: '4px'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & View Toggle */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-dim)' }} />
              <input
                type="text"
                placeholder="Search bento item..."
                className="adm-input"
                style={{ paddingLeft: '32px', height: '36px' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', border: '1px solid var(--adm-border)', borderRadius: '6px', overflow: 'hidden' }}>
              <button
                type="button"
                className={`adm-icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
                style={{ borderRadius: 0, height: '36px', width: '36px' }}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                className={`adm-icon-btn ${viewMode === 'table' ? 'active' : ''}`}
                style={{ borderRadius: 0, height: '36px', width: '36px' }}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <Layers size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Items Display */}
      {loading ? (
        <div className="adm-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--adm-text-dim)' }}>
          <RefreshCw size={32} className="adm-spin" style={{ margin: '0 auto 12px' }} />
          <p>Loading Hero Bento media...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="adm-card" style={{ padding: '60px', textAlign: 'center' }}>
          <LayoutGrid size={40} style={{ color: 'var(--adm-text-dim)', margin: '0 auto 12px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--adm-text-main)' }}>No Bento Media Found</h3>
          <p style={{ fontSize: '13px', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
            {search ? 'No items match your search filter.' : 'Add your first video or image for the hero infinite bento.'}
          </p>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            style={{ marginTop: '16px' }}
            onClick={() => openAddModal(1)}
          >
            <Plus size={16} />
            <span>Add Bento Media</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="adm-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: item.status === 'hidden' ? '1px dashed var(--adm-border)' : '1px solid var(--adm-border)',
                opacity: item.status === 'hidden' ? 0.75 : 1
              }}
            >
              {/* Media Preview Box */}
              <div style={{ position: 'relative', height: '180px', background: '#0a0a0c', overflow: 'hidden' }}>
                {item.media_type === 'video' ? (
                  <video
                    src={getMediaUrl(item.media_url)}
                    poster={item.poster_url ? getMediaUrl(item.poster_url) : undefined}
                    muted
                    playsInline
                    loop
                    controls
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <img
                    src={getMediaUrl(item.media_url)}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}

                {/* Top Badges */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                  <span className={`adm-badge ${Number(item.column_index) === 1 ? 'adm-badge-primary' : Number(item.column_index) === 2 ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                    Col {item.column_index}
                  </span>
                  <span className={`adm-badge ${item.media_type === 'video' ? 'adm-badge-purple' : 'adm-badge-info'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {item.media_type === 'video' ? <Film size={11} /> : <ImageIcon size={11} />}
                    {item.media_type.toUpperCase()}
                  </span>
                </div>

                {/* Status Badge */}
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <span className={`adm-badge ${item.status === 'published' ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                    {item.status === 'published' ? 'Live' : 'Hidden'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--adm-text-main)' }}>
                      {item.name}
                    </h4>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--adm-text-dim)', background: 'var(--adm-bg-surface)', padding: '2px 6px', borderRadius: '4px' }}>
                      Order #{item.display_order}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', wordBreak: 'break-all', marginBottom: '12px' }}>
                    {item.media_url}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--adm-border)' }}>
                  {/* Order controls */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      className="adm-icon-btn"
                      style={{ height: '30px', width: '30px' }}
                      onClick={() => handleMoveOrder(item, 'up')}
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      className="adm-icon-btn"
                      style={{ height: '30px', width: '30px' }}
                      onClick={() => handleMoveOrder(item, 'down')}
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {/* Status, Edit, Delete */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className={`adm-btn ${item.status === 'published' ? 'adm-btn-secondary' : 'adm-btn-primary'}`}
                      style={{ padding: '4px 8px', fontSize: '12px', height: '30px' }}
                      onClick={() => handleRequestToggleStatus(item)}
                      title={item.status === 'published' ? 'Hide from homepage' : 'Publish to homepage'}
                    >
                      {item.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                      <span>{item.status === 'published' ? 'Hide' : 'Publish'}</span>
                    </button>
                    <button
                      type="button"
                      className="adm-icon-btn"
                      style={{ height: '30px', width: '30px' }}
                      onClick={() => openEditModal(item)}
                      title="Edit Item"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="adm-icon-btn adm-icon-btn-danger"
                      style={{ height: '30px', width: '30px' }}
                      onClick={() => setDeleteModal(item)}
                      title="Delete Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="adm-card" style={{ overflowX: 'auto' }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Preview</th>
                <th>Section / Item Name</th>
                <th>Media Type</th>
                <th>Target Column</th>
                <th>Display Order</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} style={{ opacity: item.status === 'hidden' ? 0.7 : 1 }}>
                  <td>
                    <div style={{ width: '60px', height: '70px', borderRadius: '4px', overflow: 'hidden', background: '#000' }}>
                      {item.media_type === 'video' ? (
                        <video
                          src={getMediaUrl(item.media_url)}
                          poster={item.poster_url ? getMediaUrl(item.poster_url) : undefined}
                          muted
                          playsInline
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <img
                          src={getMediaUrl(item.media_url)}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--adm-text-main)' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--adm-text-dim)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.media_url}
                    </div>
                  </td>
                  <td>
                    <span className={`adm-badge ${item.media_type === 'video' ? 'adm-badge-purple' : 'adm-badge-info'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {item.media_type === 'video' ? <Film size={12} /> : <ImageIcon size={12} />}
                      {item.media_type.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`adm-badge ${Number(item.column_index) === 1 ? 'adm-badge-primary' : Number(item.column_index) === 2 ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                      Column {item.column_index}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 600 }}>#{item.display_order}</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button
                          type="button"
                          className="adm-icon-btn"
                          style={{ height: '18px', width: '18px', padding: 0 }}
                          onClick={() => handleMoveOrder(item, 'up')}
                        >
                          <ArrowUp size={10} />
                        </button>
                        <button
                          type="button"
                          className="adm-icon-btn"
                          style={{ height: '18px', width: '18px', padding: 0 }}
                          onClick={() => handleMoveOrder(item, 'down')}
                        >
                          <ArrowDown size={10} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`adm-badge ${item.status === 'published' ? 'adm-badge-success' : 'adm-badge-warning'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      onClick={() => handleToggleStatus(item)}
                      title="Click to toggle status"
                    >
                      {item.status === 'published' ? 'Published' : 'Hidden'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="adm-icon-btn"
                        onClick={() => openEditModal(item)}
                        title="Edit Item"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className="adm-icon-btn adm-icon-btn-danger"
                        onClick={() => setDeleteModal(item)}
                        title="Delete Item"
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

      {/* ADD / EDIT MODAL (NO website_url field) */}
      {modalOpen && (
        <div className="adm-modal-backdrop" onClick={() => !submitting && setModalOpen(false)}>
          <div className="adm-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--adm-text-main)' }}>
                {editingItem ? 'Edit Hero Bento Media' : 'Add New Hero Bento Media'}
              </h3>
              <button
                type="button"
                className="adm-icon-btn"
                style={{ border: 'none', background: 'transparent' }}
                onClick={() => setModalOpen(false)}
                disabled={submitting}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              {/* Information Banner */}
              <div style={{ background: 'var(--adm-bg-surface)', border: '1px solid var(--adm-border)', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: 'var(--adm-text-dim)', display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <Info size={16} style={{ color: 'var(--adm-primary)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ lineHeight: '1.6' }}>
                  <strong style={{ color: 'var(--adm-text-main)' }}>Hero Bento Media Specifications:</strong>
                  <div>• <strong>Images:</strong> JPG, PNG, WEBP, GIF (Max 10MB) — 4:5 or 9:16 portrait ratio.</div>
                  <div>• <strong>Videos:</strong> MP4, WEBM, MOV (Max 50MB) — 9:16 vertical reel. Autoplays muted & looped.</div>
                </div>
              </div>

              {/* Item / Section Name */}
              <div className="adm-form-group">
                <label className="adm-form-label">Section / Item Name *</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="e.g. Top Baller Video Reel, Myra Ad Creative"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <span style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginTop: '6px', display: 'block' }}>
                  Identifies this creative in the admin manager and accessible aria-labels.
                </span>
              </div>

              {/* Media Type Selector */}
              <div className="adm-form-group">
                <label className="adm-form-label">Media Type *</label>
                <select
                  className="adm-select"
                  value={formData.media_type}
                  onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                >
                  <option value="image">Image Creative (PNG, JPG, WEBP, GIF)</option>
                  <option value="video">Video Creative (MP4, WEBM, MOV)</option>
                </select>
              </div>

              {/* Media Upload Component */}
              <MediaUploadField
                label={formData.media_type === 'video' ? 'Video Media File *' : 'Image Media File *'}
                value={formData.media_url}
                onChange={(url) => setFormData({ ...formData, media_url: url })}
                type={formData.media_type === 'video' ? 'video' : 'image'}
                maxSizeMB={formData.media_type === 'video' ? 50 : 10}
                helpText={formData.media_type === 'video' ? 'Supported formats: MP4, WEBM, MOV (Max 50MB)' : 'Supported formats: JPG, PNG, WEBP, GIF (Max 10MB)'}
                required
              />

              {/* Optional Poster Image for Videos */}
              {formData.media_type === 'video' && (
                <MediaUploadField
                  label="Fallback Poster Image (Optional)"
                  value={formData.poster_url}
                  onChange={(url) => setFormData({ ...formData, poster_url: url })}
                  type="image"
                  maxSizeMB={10}
                  helpText="Preview frame shown before video autoplays (prevents black flash)"
                />
              )}

              {/* Column Selection & Order in 2-Column Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Hero Slider Column *</label>
                  <select
                    value={formData.column_index}
                    onChange={e => setFormData({ ...formData, column_index: Number(e.target.value) })}
                    className="adm-select"
                  >
                    <option value={1}>Column 1 (Left Track)</option>
                    <option value={2}>Column 2 (Center Track)</option>
                    <option value={3}>Column 3 (Right Track)</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={formData.display_order}
                    onChange={e => setFormData({ ...formData, display_order: Number(e.target.value) || 1 })}
                    className="adm-input"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="adm-form-group">
                <label className="adm-form-label">Visibility Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="adm-select"
                >
                  <option value="published">Published (Live in Hero)</option>
                  <option value="hidden">Hidden (Inactive / Draft)</option>
                </select>
              </div>

              {/* Action Buttons Right-Aligned */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-btn adm-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving Media...' : editingItem ? 'Save Changes' : 'Add to Hero Bento'}
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
                {statusConfirmModal.targetStatus === 'published' ? 'Publish Bento Item' : 'Hide Bento Item'}
              </h3>
              <button type="button" className="adm-icon-btn" onClick={() => setStatusConfirmModal(null)}>×</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize: '14px', color: 'var(--adm-text-muted)', lineHeight: '1.5', margin: 0 }}>
                Are you sure you want to <strong>{statusConfirmModal.targetStatus === 'published' ? 'Publish' : 'Hide'}</strong> <strong>"{statusConfirmModal.item.name}"</strong> in Hero Column {statusConfirmModal.item.column_index}?
              </p>
            </div>
            <div className="adm-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setStatusConfirmModal(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={`adm-btn ${statusConfirmModal.targetStatus === 'published' ? 'adm-btn-primary' : 'adm-btn-danger'}`}
                onClick={handleConfirmToggleStatus}
              >
                Confirm &amp; {statusConfirmModal.targetStatus === 'published' ? 'Publish' : 'Hide'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal && (
        <div className="adm-modal-backdrop" onClick={() => !deleting && setDeleteModal(null)}>
          <div className="adm-modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--adm-danger)' }}>
                Delete Bento Media
              </h3>
              <button
                type="button"
                className="adm-icon-btn"
                style={{ border: 'none', background: 'transparent' }}
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
              >
                <X size={18} />
              </button>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: 'var(--adm-text-main)', margin: '0 0 8px' }}>
                Are you sure you want to remove <strong>"{deleteModal.name}"</strong> from Hero Bento Column {deleteModal.column_index}?
              </p>
              <p style={{ fontSize: '12px', color: 'var(--adm-text-dim)', margin: 0 }}>
                This item will no longer appear in the hero infinite bento slider.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn"
                style={{ background: 'var(--adm-danger)', color: '#fff' }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
