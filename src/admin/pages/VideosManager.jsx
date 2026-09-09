import React, { useState, useEffect } from 'react';
import {
  Film,
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  Edit2,
  Tv,
  Radio,
  X,
  Volume2,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import MediaUploadField from '../components/MediaUploadField';

import { apiRequest } from '../utils/api';

const VIDEO_PLACEMENTS = [
  'Homepage Hero',
  'Homepage Creative Section',
  'Homepage Video Section',
  'Portfolio',
  'Case Study',
  'Creative Gallery',
  'Video Gallery',
  'Featured Section'
];

export default function VideosManager() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const toast = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    video_url: '',
    video_type: 'html5',
    poster_url: '',
    is_hero: false,
    autoplay: true,
    loop: true,
    muted: true,
    controls: false,
    placements: ['Homepage Hero'],
    display_order: 1,
    is_published: true
  });

  const fetchVideos = async () => {
    try {
      const res = await apiRequest('/api/videos');
      const data = await res.json();
      if (data.success) {
        setVideos(data.videos || []);
      }
    } catch (err) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      title: '',
      description: '',
      video_url: '',
      video_type: 'html5',
      poster_url: '',
      is_hero: false,
      autoplay: true,
      loop: true,
      muted: true,
      controls: false,
      placements: ['Homepage Hero'],
      display_order: videos.length + 1,
      is_published: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description || '',
      video_url: item.video_url,
      video_type: item.video_type || 'html5',
      poster_url: item.poster_url || '',
      is_hero: Boolean(item.is_hero),
      autoplay: Boolean(item.autoplay),
      loop: Boolean(item.loop),
      muted: Boolean(item.muted),
      controls: Boolean(item.controls),
      placements: Array.isArray(item.placements) ? item.placements : ['Homepage Hero'],
      display_order: item.display_order || 1,
      is_published: Boolean(item.is_published)
    });
    setModalOpen(true);
  };

  const handleSetAsHero = async (id) => {
    try {
      const res = await apiRequest(`/api/videos/${id}/set-hero`, {
        method: 'PUT',
        body: JSON.stringify({ autoplay: true, loop: true, muted: true, controls: false })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Designated as the live Homepage Hero Media!');
        fetchVideos();
      } else {
        toast.error(data.error || 'Failed to update hero video');
      }
    } catch (err) {
      toast.error('Error setting hero media');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.video_url) {
      toast.error('Title and Media URL/File are required.');
      return;
    }

    try {
      const url = editingItem ? `/api/videos/${editingItem.id}` : '/api/videos';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await apiRequest(url, {
        method,
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingItem ? 'Media updated!' : 'Media added!');
        setModalOpen(false);
        fetchVideos();
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
      const res = await apiRequest(`/api/videos/${deleteId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Media removed.');
        setDeleteId(null);
        fetchVideos();
      }
    } catch (err) {
      toast.error('Failed to delete media');
    }
  };

  const currentHero = videos.find(v => v.is_hero);

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Video & Hero Video Management</h1>
          <p className="adm-page-desc">
            Manage showcase video assets, YouTube/Vimeo embeds, and configure the dedicated live Homepage Hero Video.
          </p>
        </div>
        <button onClick={handleOpenCreate} className="adm-btn adm-btn-primary">
          <Plus size={16} />
          <span>Upload / Add Video</span>
        </button>
      </div>

      {/* Featured Homepage Hero Status Card */}
      <div className="adm-card" style={{ marginBottom: '28px', borderLeft: '4px solid var(--adm-accent)', background: 'radial-gradient(ellipse at top right, rgba(6, 182, 212, 0.08) 0%, var(--adm-surface-card) 70%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Tv size={18} color="var(--adm-accent)" />
              <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--adm-accent)', letterSpacing: '0.5px' }}>
                Active Homepage Hero Video
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--adm-text-main)', margin: '0 0 4px' }}>
              {currentHero ? currentHero.title : 'Default Site Hero Video'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', margin: 0 }}>
              {currentHero ? `Source: ${currentHero.video_url}` : 'Using system fallback hero showcase.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="adm-badge adm-badge-success">
              <Radio size={12} />
              <span>Live on Homepage</span>
            </span>
            {currentHero && (
              <button onClick={() => handleOpenEdit(currentHero)} className="adm-btn adm-btn-secondary adm-btn-sm">
                <Sliders size={14} />
                <span>Configure Settings</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Videos List Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--adm-text-muted)' }}>Loading videos...</div>
      ) : videos.length === 0 ? (
        <div className="adm-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Film size={40} color="var(--adm-text-dim)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', color: 'var(--adm-text-main)', margin: '0 0 6px' }}>No Videos Added</h3>
          <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', margin: '0 0 16px' }}>
            Add your brand video reels or YouTube links.
          </p>
          <button onClick={handleOpenCreate} className="adm-btn adm-btn-primary adm-btn-sm">
            <Plus size={14} />
            <span>Add First Video</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {videos.map(v => (
            <div key={v.id} className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '190px', background: '#000', position: 'relative', overflow: 'hidden' }}>
                {v.video_type === 'image' || /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(v.video_url) ? (
                  <img
                    src={v.video_url}
                    alt={v.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : v.video_type === 'html5' || /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(v.video_url) ? (
                  <video
                    src={v.video_url}
                    poster={v.poster_url}
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090b10', color: 'var(--adm-text-dim)' }}>
                    <Film size={36} />
                  </div>
                )}
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  {v.is_hero && (
                    <span className="adm-badge" style={{ background: 'var(--adm-accent)', color: '#000', fontWeight: '700' }}>
                      Hero Video
                    </span>
                  )}
                </div>
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <span className={`adm-badge ${v.is_published ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                    {v.is_published ? 'Live' : 'Hidden'}
                  </span>
                </div>
              </div>

              <div style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--adm-text-main)', margin: '0 0 4px' }}>
                  {v.title}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--adm-text-muted)', margin: '0 0 12px' }}>
                  {v.description || 'No description entered.'}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                  {Array.isArray(v.placements) && v.placements.map((loc, idx) => (
                    <span key={idx} style={{ fontSize: '11px', background: 'var(--adm-surface-hover)', padding: '2px 6px', borderRadius: '4px', color: 'var(--adm-text-dim)' }}>
                      {loc}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--adm-border)', paddingTop: '12px' }}>
                  {!v.is_hero ? (
                    <button
                      onClick={() => handleSetAsHero(v.id)}
                      className="adm-btn adm-btn-secondary adm-btn-sm"
                      style={{ fontSize: '11px' }}
                    >
                      <Tv size={12} />
                      <span>Set as Hero</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--adm-accent)', fontWeight: '600' }}>
                      ✓ Active Hero
                    </span>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenEdit(v)} className="adm-icon-btn" title="Edit Video">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteId(v.id)} className="adm-icon-btn" title="Delete Video" style={{ color: 'var(--adm-danger)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--adm-text-main)' }}>
                {editingItem ? 'Edit Video Asset & Hero Settings' : 'Add New Video'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="adm-icon-btn" style={{ border: 'none', background: 'transparent' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="adm-form-group">
                <label className="adm-form-label">Media Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cambridge 2026 Brand Reel"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="adm-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Media Type</label>
                  <select
                    value={form.video_type}
                    onChange={e => setForm({ ...form, video_type: e.target.value })}
                    className="adm-select"
                  >
                    <option value="html5">Direct MP4 / Video Upload</option>
                    <option value="image">Direct Image / Animated GIF</option>
                    <option value="youtube">YouTube Embed</option>
                    <option value="vimeo">Vimeo Embed</option>
                    <option value="external">External Stream / URL</option>
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

              <MediaUploadField
                label="Video or Image File / Media Source"
                value={form.video_url}
                onChange={val => {
                  const isImg = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(val);
                  setForm(prev => ({
                    ...prev,
                    video_url: val,
                    video_type: isImg && prev.video_type === 'html5' ? 'image' : prev.video_type
                  }));
                }}
                type="any"
                maxSizeMB={100}
                required
                helpText="Upload an MP4/WEBM video, animated GIF, or image (up to 100MB), or enter an external link"
              />

              <MediaUploadField
                label="Poster / Thumbnail Image"
                value={form.poster_url}
                onChange={val => setForm({ ...form, poster_url: val })}
                type="image"
                maxSizeMB={10}
                helpText="Optional video poster displayed before playback starts"
              />

              {/* Video Playback Flags */}
              <div style={{ background: 'var(--adm-surface)', padding: '16px', borderRadius: 'var(--adm-radius-md)', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--adm-text-main)', marginBottom: '12px' }}>
                  HTML5 Video Playback Flags
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                    <input
                      type="checkbox"
                      checked={form.autoplay}
                      onChange={e => setForm({ ...form, autoplay: e.target.checked })}
                      style={{ accentColor: '#6366f1' }}
                    />
                    <span>Autoplay</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                    <input
                      type="checkbox"
                      checked={form.loop}
                      onChange={e => setForm({ ...form, loop: e.target.checked })}
                      style={{ accentColor: '#6366f1' }}
                    />
                    <span>Loop indefinitely</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                    <input
                      type="checkbox"
                      checked={form.muted}
                      onChange={e => setForm({ ...form, muted: e.target.checked })}
                      style={{ accentColor: '#6366f1' }}
                    />
                    <span>Muted by default</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                    <input
                      type="checkbox"
                      checked={form.is_hero}
                      onChange={e => setForm({ ...form, is_hero: e.target.checked })}
                      style={{ accentColor: '#06b6d4' }}
                    />
                    <span style={{ fontWeight: form.is_hero ? '700' : '400', color: form.is_hero ? 'var(--adm-accent)' : 'inherit' }}>
                      Set as Homepage Hero
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="adm-btn adm-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  {editingItem ? 'Update Video' : 'Save Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Video"
        message="Are you sure you want to delete this video asset?"
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
