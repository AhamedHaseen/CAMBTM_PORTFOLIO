import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Film,
  X,
  FolderArchive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from './Toast';

export default function MediaUploadField({
  label,
  value,
  onChange,
  type = 'image', // 'image' | 'video' | 'logo'
  maxSizeMB = 10,
  helpText = '',
  required = false
}) {
  const [uploading, setUploading] = useState(false);
  const [libraryModal, setLibraryModal] = useState(false);
  const [libraryMedia, setLibraryMedia] = useState([]);
  const [loadingLib, setLoadingLib] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const toast = useToast();

  const isVideoOnly = type === 'video';
  const isImageOnly = type === 'image' || type === 'logo';
  const isAnyMedia = type === 'any' || type === 'media' || type === 'video';

  const allowedExtensions = isImageOnly 
    ? 'PNG, JPG, WEBP, SVG, GIF' 
    : isVideoOnly 
      ? 'MP4, WEBM, MOV, PNG, JPG, GIF' 
      : 'MP4, WEBM, MOV, PNG, JPG, WEBP, GIF';

  const acceptMimes = isImageOnly
    ? 'image/jpeg,image/png,image/webp,image/svg+xml,image/gif'
    : 'video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp,image/svg+xml,image/gif';

  const maxLimitMB = isImageOnly ? maxSizeMB : 100;

  // Detect whether the selected value is a video or an image
  const isValueVideo = /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(value || '');
  const isValueImage = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(value || '');
  const isVideo = isVideoOnly || isValueVideo;
  const isImage = isImageOnly || isValueImage;

  const handleFile = async (file) => {
    if (!file) return;

    // Validate size
    const maxSizeBytes = maxLimitMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is ${maxLimitMB}MB.`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiRequest('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success && data.media?.url) {
        onChange(data.media.url);
        toast.success(`Uploaded: ${data.media.original_name}`);
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error(err.message || 'File upload error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const openLibrary = async () => {
    setLibraryModal(true);
    setLoadingLib(true);
    try {
      const queryParam = isImageOnly ? '?type=image' : isVideoOnly ? '' : '';
      const res = await apiRequest(`/api/media${queryParam}`);
      const data = await res.json();
      if (data.success) {
        setLibraryMedia(data.media || []);
      }
    } catch (e) {
      toast.error('Failed to load library items');
    } finally {
      setLoadingLib(false);
    }
  };

  return (
    <div className="adm-form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label className="adm-form-label" style={{ margin: 0 }}>
          {label} {required && <span style={{ color: 'var(--adm-danger)' }}>*</span>}
        </label>
        <button
          type="button"
          onClick={openLibrary}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--adm-primary)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: 0
          }}
        >
          <FolderArchive size={13} />
          <span>Pick from Library</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={e => e.target.files && handleFile(e.target.files[0])}
        accept={acceptMimes}
        style={{ display: 'none' }}
      />

      {/* Upload Dropzone / Preview Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        style={{
          border: dragActive ? '2px dashed var(--adm-primary)' : '1px dashed var(--adm-border)',
          borderRadius: 'var(--adm-radius-md)',
          background: dragActive ? 'var(--adm-primary-light)' : 'var(--adm-surface)',
          padding: value ? '12px' : '20px',
          textAlign: 'center',
          transition: 'var(--adm-transition)',
          position: 'relative'
        }}
      >
        {value ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
            {/* Visual Preview */}
            <div style={{
              width: isValueVideo ? '90px' : '70px',
              height: '56px',
              borderRadius: '6px',
              background: '#090b10',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid var(--adm-border)'
            }}>
              {isValueVideo ? (
                <video src={value} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <img
                  src={value}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>

            {/* URL Meta & Controls */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                Format: {allowedExtensions} • Max: {maxLimitMB}MB
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="adm-btn adm-btn-secondary adm-btn-sm"
                title="Replace file"
              >
                {uploading ? <Loader2 size={13} className="adm-spin" /> : <Upload size={13} />}
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="adm-icon-btn"
                style={{ width: '28px', height: '28px', color: 'var(--adm-danger)' }}
                title="Remove file"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--adm-surface-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              color: 'var(--adm-primary)'
            }}>
              {uploading ? <Loader2 size={22} className="adm-spin" /> : (isVideo ? <Film size={22} /> : <Upload size={22} />)}
            </div>

            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '4px' }}>
              {uploading ? 'Uploading media asset...' : 'Drag & drop file here, or click to upload'}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginBottom: '12px' }}>
              Supported formats: <strong>{allowedExtensions}</strong> • Max size: <strong>{maxLimitMB}MB</strong>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="adm-btn adm-btn-primary adm-btn-sm"
            >
              <Upload size={13} />
              <span>Browse Computer</span>
            </button>
          </div>
        )}
      </div>

      {/* Fallback Direct URL Input for External / CDN Links */}
      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="text"
          placeholder={`Or enter external ${type} URL (https://...)`}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="adm-input"
          style={{ fontSize: '12px', padding: '6px 10px' }}
        />
      </div>

      {helpText && (
        <div style={{ fontSize: '11px', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
          {helpText}
        </div>
      )}

      {/* Media Picker Modal */}
      {libraryModal && (
        <div className="adm-modal-backdrop" onClick={() => setLibraryModal(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0, color: 'var(--adm-text-main)' }}>
                Select Asset from Media Library
              </h3>
              <button onClick={() => setLibraryModal(false)} className="adm-icon-btn" style={{ border: 'none', background: 'transparent' }}>
                <X size={18} />
              </button>
            </div>

            {loadingLib ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--adm-text-muted)' }}>Loading assets...</div>
            ) : libraryMedia.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--adm-text-dim)' }}>
                No assets in library yet. Upload one from your computer.
              </div>
            ) : (
              <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', padding: '4px' }}>
                {libraryMedia.map(m => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onChange(m.url);
                      setLibraryModal(false);
                      toast.success(`Selected: ${m.original_name}`);
                    }}
                    style={{
                      border: value === m.url ? '2px solid var(--adm-primary)' : '1px solid var(--adm-border)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: 'var(--adm-surface)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ height: '90px', background: '#090b10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {m.file_type === 'image' ? (
                        <img src={m.url} alt={m.original_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Film size={28} color="var(--adm-accent)" />
                      )}
                    </div>
                    <div style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '600', color: 'var(--adm-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.original_name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" onClick={() => setLibraryModal(false)} className="adm-btn adm-btn-secondary adm-btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .adm-spin { animation: admSpin 0.8s linear infinite; }
        @keyframes admSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
