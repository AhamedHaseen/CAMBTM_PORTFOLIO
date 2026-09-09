import React, { useState, useEffect } from 'react';
import {
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  X
} from 'lucide-react';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import MediaUploadField from '../components/MediaUploadField';

const AVAILABLE_LOCATIONS = [
  'Homepage',
  'Portfolio',
  'Creative Gallery',
  'Case Study',
  'Featured Section'
];

const CATEGORIES = ['Branding', 'Motion', '3D Design', 'Typography', 'Campaign Art', 'UI/UX'];

export default function CreativesManager() {
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const toast = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'Branding',
    placements: ['Homepage', 'Portfolio'],
    display_order: 1,
    is_published: true
  });

  const fetchCreatives = async () => {
    try {
      const res = await fetch('/api/creatives', { headers: { 'Accept': 'application/json' } });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setCreatives(data.creatives || []);
        }
      }
    } catch (err) {
      toast.error('Failed to load creatives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatives();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      title: '',
      description: '',
      image_url: '',
      category: 'Branding',
      placements: ['Homepage', 'Portfolio'],
      display_order: creatives.length + 1,
      is_published: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description || '',
      image_url: item.image_url,
      category: item.category || 'Branding',
      placements: Array.isArray(item.placements) ? item.placements : ['Homepage'],
      display_order: item.display_order || 1,
      is_published: Boolean(item.is_published)
    });
    setModalOpen(true);
  };

  const handleTogglePlacement = (loc) => {
    setForm(prev => {
      const exists = prev.placements.includes(loc);
      const updated = exists ? prev.placements.filter(l => l !== loc) : [...prev.placements, loc];
      return { ...prev, placements: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.image_url) {
      toast.error('Title and Image URL are required.');
      return;
    }

    try {
      const url = editingItem ? `/api/creatives/${editingItem.id}` : '/api/creatives';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('cambm_token')
            ? { 'Authorization': `Bearer ${localStorage.getItem('cambm_token')}` }
            : {})
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingItem ? 'Creative updated!' : 'Creative added!');
        setModalOpen(false);
        fetchCreatives();
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/creatives/${deleteId}`, {
        method: 'DELETE',
        headers: {
          ...(localStorage.getItem('cambm_token')
            ? { 'Authorization': `Bearer ${localStorage.getItem('cambm_token')}` }
            : {})
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Creative asset deleted.');
        setDeleteId(null);
        fetchCreatives();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Creatives Management</h1>
          <p className="adm-page-desc">
            Manage visuals, motion graphics, and artworks displayed across Homepage, Gallery, and Case Studies.
          </p>
        </div>
        <button onClick={handleOpenCreate} className="adm-btn adm-btn-primary">
          <Plus size={16} />
          <span>Add Creative</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--adm-text-muted)' }}>Loading creatives...</div>
      ) : creatives.length === 0 ? (
        <div className="adm-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Sparkles size={40} color="var(--adm-accent)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', color: 'var(--adm-text-main)', margin: '0 0 6px' }}>No Creatives Yet</h3>
          <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', margin: '0 0 16px' }}>
            Upload design showcase assets to display on the frontend.
          </p>
          <button onClick={handleOpenCreate} className="adm-btn adm-btn-primary adm-btn-sm">
            <Plus size={14} />
            <span>Upload Creative</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {creatives.map(c => (
            <div key={c.id} className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '180px', background: 'var(--adm-surface)', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={c.image_url}
                  alt={c.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop'; }}
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  <span className="adm-badge adm-badge-neutral" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                    {c.category}
                  </span>
                </div>
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <span className={`adm-badge ${c.is_published ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                    {c.is_published ? 'Live' : 'Hidden'}
                  </span>
                </div>
              </div>

              <div style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--adm-text-main)', margin: '0 0 4px' }}>
                  {c.title}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--adm-text-muted)', margin: '0 0 12px', minHeight: '32px' }}>
                  {c.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                  {Array.isArray(c.placements) && c.placements.map((loc, i) => (
                    <span key={i} style={{ fontSize: '11px', background: 'var(--adm-surface-hover)', padding: '2px 6px', borderRadius: '4px', color: 'var(--adm-text-dim)' }}>
                      {loc}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--adm-border)', paddingTop: '12px' }}>
                  <button onClick={() => handleOpenEdit(c)} className="adm-icon-btn" title="Edit Creative">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteId(c.id)} className="adm-icon-btn" title="Delete Creative" style={{ color: 'var(--adm-danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--adm-text-main)' }}>
                {editingItem ? 'Edit Creative Asset' : 'Add New Creative Asset'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="adm-icon-btn" style={{ border: 'none', background: 'transparent' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="adm-form-group">
                <label className="adm-form-label">Creative Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3D Spatial Identity Art"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="adm-input"
                />
              </div>

              <MediaUploadField
                label="Creative Image File"
                value={form.image_url}
                onChange={val => setForm({ ...form, image_url: val })}
                type="image"
                maxSizeMB={25}
                required
                helpText="High-res PNG, JPG, or WEBP (up to 25MB)"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="adm-select"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Display Order</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={e => setForm({ ...form, display_order: parseInt(e.target.value, 10) || 1 })}
                    className="adm-input"
                  />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Description</label>
                <textarea
                  rows="2"
                  placeholder="Brief creative notes..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="adm-textarea"
                />
              </div>

              {/* Placement Selectors */}
              <div className="adm-form-group">
                <label className="adm-form-label">Where should this creative appear?</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {AVAILABLE_LOCATIONS.map(loc => {
                    const isChecked = form.placements.includes(loc);
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => handleTogglePlacement(loc)}
                        style={{
                          background: isChecked ? 'var(--adm-primary-light)' : 'var(--adm-surface)',
                          border: isChecked ? '1px solid var(--adm-primary)' : '1px solid var(--adm-border)',
                          color: isChecked ? 'var(--adm-primary)' : 'var(--adm-text-muted)',
                          padding: '6px 12px',
                          borderRadius: 'var(--adm-radius-md)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: isChecked ? '600' : '400'
                        }}
                      >
                        {loc} {isChecked ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="adm-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--adm-text-main)' }}>
                  <div className="adm-switch">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={e => setForm({ ...form, is_published: e.target.checked })}
                    />
                    <span className="adm-slider"></span>
                  </div>
                  <span>Publish to frontend</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="adm-btn adm-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  {editingItem ? 'Update Creative' : 'Save Creative'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Creative Asset"
        message="Are you sure you want to remove this creative asset?"
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
