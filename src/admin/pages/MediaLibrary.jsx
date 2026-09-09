import React, { useState, useEffect, useRef } from 'react';
import {
  FolderArchive,
  Upload,
  Search,
  Copy,
  Trash2,
  Eye,
  Check,
  Film,
  Image as ImageIcon,
  File,
  X
} from 'lucide-react';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

export default function MediaLibrary() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [previewItem, setPreviewItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fileInputRef = useRef(null);
  const toast = useToast();

  const fetchMedia = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/media?${params.toString()}`, {
        headers: {
          ...(localStorage.getItem('cambm_token')
            ? { 'Authorization': `Bearer ${localStorage.getItem('cambm_token')}` }
            : {})
        }
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setMedia(data.media || []);
        }
      }
    } catch (err) {
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [typeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedia();
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          ...(localStorage.getItem('cambm_token')
            ? { 'Authorization': `Bearer ${localStorage.getItem('cambm_token')}` }
            : {})
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Uploaded: ${data.media.original_name}`);
        fetchMedia();
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('File upload error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Media URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/media/${deleteId}`, {
        method: 'DELETE',
        headers: {
          ...(localStorage.getItem('cambm_token')
            ? { 'Authorization': `Bearer ${localStorage.getItem('cambm_token')}` }
            : {})
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Media file deleted.');
        setDeleteId(null);
        fetchMedia();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (err) {
      toast.error('Failed to delete media');
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Media Library</h1>
          <p className="adm-page-desc">
            Central repository for all uploaded images, video reels, and brand assets.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept="image/*,video/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="adm-btn adm-btn-primary"
          >
            <Upload size={16} />
            <span>{uploading ? 'Uploading File...' : 'Upload Media Asset'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="adm-table-container" style={{ marginBottom: '24px' }}>
        <div className="adm-table-toolbar">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search filename..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="adm-search-input"
            />
            <button type="submit" className="adm-btn adm-btn-secondary adm-btn-sm">
              <Search size={14} />
              <span>Search</span>
            </button>
          </form>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'image', 'video'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`adm-btn adm-btn-sm ${typeFilter === type ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--adm-text-muted)' }}>
            Loading media files...
          </div>
        ) : media.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <FolderArchive size={40} color="var(--adm-text-dim)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', color: 'var(--adm-text-main)', margin: '0 0 6px' }}>No Media Found</h3>
            <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', margin: '0 0 16px' }}>
              Upload images or videos to build your asset library.
            </p>
            <button onClick={() => fileInputRef.current?.click()} className="adm-btn adm-btn-primary adm-btn-sm">
              <Upload size={14} />
              <span>Upload Now</span>
            </button>
          </div>
        ) : (
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {media.map(m => (
              <div
                key={m.id}
                style={{
                  background: 'var(--adm-surface)',
                  border: '1px solid var(--adm-border)',
                  borderRadius: 'var(--adm-radius-md)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  style={{
                    height: '140px',
                    background: '#090b10',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => setPreviewItem(m)}
                >
                  {m.file_type === 'image' ? (
                    <img
                      src={m.url}
                      alt={m.original_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300'; }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--adm-accent)' }}>
                      <Film size={36} />
                      <div style={{ fontSize: '11px', marginTop: '4px' }}>VIDEO</div>
                    </div>
                  )}
                </div>

                <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--adm-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.original_name}>
                      {m.original_name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                      {m.file_size ? `${(m.file_size / 1024).toFixed(0)} KB` : ''} • {m.mime_type?.split('/')[1] || m.file_type}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--adm-border)' }}>
                    <button
                      onClick={() => handleCopyUrl(m.url, m.id)}
                      className="adm-btn adm-btn-secondary adm-btn-sm"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                      title="Copy URL"
                    >
                      {copiedId === m.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => setDeleteId(m.id)}
                      className="adm-icon-btn"
                      style={{ width: '28px', height: '28px', color: 'var(--adm-danger)' }}
                      title="Delete asset"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="adm-modal-backdrop" onClick={() => setPreviewItem(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--adm-text-main)' }}>
                {previewItem.original_name}
              </h3>
              <button onClick={() => setPreviewItem(null)} className="adm-icon-btn" style={{ border: 'none', background: 'transparent' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ maxHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090b10', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
              {previewItem.file_type === 'image' ? (
                <img src={previewItem.url} alt={previewItem.original_name} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
              ) : (
                <video src={previewItem.url} controls style={{ maxWidth: '100%', maxHeight: '400px' }} />
              )}
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Asset URL</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" readOnly value={previewItem.url} className="adm-input" />
                <button
                  type="button"
                  onClick={() => handleCopyUrl(previewItem.url, previewItem.id)}
                  className="adm-btn adm-btn-primary"
                >
                  <Copy size={16} />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Media File"
        message="Are you sure you want to permanently delete this media asset?"
        confirmText="Delete File"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
