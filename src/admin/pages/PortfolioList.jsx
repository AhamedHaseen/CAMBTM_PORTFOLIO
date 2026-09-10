import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  ExternalLink,
  Layers,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const CATEGORIES = ['All', 'Websites', 'Systems', 'Branding', 'Social Media', 'Campaigns', 'Automation'];
const STATUSES = ['All', 'published', 'draft'];

export default function PortfolioList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [deleteId, setDeleteId] = useState(null);

  const toast = useToast();

  const [statusConfirmModal, setStatusConfirmModal] = useState(null);

  const fetchProjects = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);

      const res = await apiRequest(`/api/portfolio?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (err) {
      toast.error('Failed to load portfolio projects');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(true);
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects(false);
  };

  const handleRequestTogglePublish = (p) => {
    const targetStatus = p.status === 'published' ? 'draft' : 'published';
    setStatusConfirmModal({
      project: p,
      targetStatus
    });
  };

  const handleConfirmTogglePublish = async () => {
    if (!statusConfirmModal) return;
    const { project, targetStatus } = statusConfirmModal;
    setStatusConfirmModal(null);

    // In-place optimistic update
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: targetStatus } : p));

    try {
      const res = await apiRequest(`/api/portfolio/${project.id}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ status: targetStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Project ${targetStatus === 'published' ? 'published (live)' : 'moved to drafts'}.`);
        fetchProjects(false);
      } else {
        fetchProjects(false);
        toast.error(data.error || 'Failed to update status');
      }
    } catch (err) {
      fetchProjects(false);
      toast.error('Error updating status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const idToDelete = deleteId;
    setDeleteId(null);

    // In-place optimistic deletion
    setProjects(prev => prev.filter(p => p.id !== idToDelete));
    try {
      const res = await apiRequest(`/api/portfolio/${idToDelete}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Project deleted successfully.');
        fetchProjects(false);
      } else {
        fetchProjects(false);
        toast.error(data.error || 'Failed to delete project');
      }
    } catch (err) {
      fetchProjects(false);
      toast.error('Error deleting project');
    }
  };

  const publishedCount = projects.filter(p => p.status === 'published').length;
  const draftCount = projects.filter(p => p.status !== 'published').length;

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Portfolio &amp; Case Studies</h1>
          <p className="adm-page-desc">
            Manage client case files, deliverables, metrics, and interactive showcase pages.
          </p>
        </div>
        <Link to="/studio/portfolio/add" className="adm-btn adm-btn-primary">
          <Plus size={16} />
          <span>Add New Project</span>
        </Link>
      </div>

      {/* KPI Stats in 1 row of 3 columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="adm-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Published Case Studies</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--adm-text-main)' }}>{publishedCount}</div>
          </div>
        </div>

        <div className="adm-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(234, 179, 8, 0.15)',
            color: '#eab308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Eye size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hidden / Draft Projects</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--adm-text-main)' }}>{draftCount}</div>
          </div>
        </div>

        <div className="adm-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--adm-primary, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Portfolio Projects</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--adm-text-main)' }}>{projects.length}</div>
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="adm-table-container" style={{ marginBottom: '24px' }}>
        <div className="adm-table-toolbar">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search title, brand, industry..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="adm-search-input"
              />
            </div>
            <button type="submit" className="adm-btn adm-btn-secondary adm-btn-sm">
              <Search size={14} />
              <span>Search</span>
            </button>
          </form>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--adm-text-dim)' }}>Category:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="adm-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--adm-text-dim)' }}>Status:</span>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="adm-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Projects List */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--adm-text-dim)' }}>
            Loading portfolio projects...
          </div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Layers size={40} color="var(--adm-text-dim)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', color: 'var(--adm-text-main)', margin: '0 0 6px' }}>No Projects Found</h3>
            <p style={{ fontSize: '13px', color: 'var(--adm-text-muted)', margin: '0 0 16px' }}>
              Try adjusting your search criteria or create a new portfolio project.
            </p>
            <Link to="/studio/portfolio/add" className="adm-btn adm-btn-primary adm-btn-sm">
              <Plus size={14} />
              <span>Create Project</span>
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Brand &amp; Headline</th>
                  <th>Location &amp; Industry</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--adm-text-main)', fontSize: '14px' }}>{p.brand}</div>
                        <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', maxWidth: '340px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.title}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--adm-text-main)' }}>
                        {p.location || 'Colombo, Sri Lanka'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)' }}>
                        {p.industry || 'Beauty & Wellness'} • {p.market || 'Global'}
                      </div>
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-neutral">{p.category}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleRequestTogglePublish(p)}
                        className={`adm-badge ${p.status === 'published' ? 'adm-badge-success' : 'adm-badge-warning'}`}
                        style={{ border: 'none', cursor: 'pointer' }}
                        title="Click to toggle publish status"
                      >
                        {p.status === 'published' ? 'Published' : 'Draft / Hidden'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Link
                          to={`/studio/portfolio/edit/${p.id}`}
                          className="adm-icon-btn"
                          title="Edit Case Study & Project"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="adm-icon-btn"
                          title="Delete Project"
                          style={{ color: 'var(--adm-danger)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Status Change Modal */}
      {statusConfirmModal && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal" style={{ maxWidth: '440px' }}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">
                {statusConfirmModal.targetStatus === 'published' ? 'Publish Portfolio Project' : 'Move to Drafts'}
              </h3>
              <button type="button" className="adm-icon-btn" onClick={() => setStatusConfirmModal(null)}>×</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize: '14px', color: 'var(--adm-text-muted)', lineHeight: '1.5', margin: 0 }}>
                Are you sure you want to <strong>{statusConfirmModal.targetStatus === 'published' ? 'Publish' : 'Unpublish (move to drafts)'}</strong> the project <strong>"{statusConfirmModal.project.brand} — {statusConfirmModal.project.title}"</strong>?
              </p>
            </div>
            <div className="adm-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setStatusConfirmModal(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={`adm-btn ${statusConfirmModal.targetStatus === 'published' ? 'adm-btn-primary' : 'adm-btn-warning'}`}
                onClick={handleConfirmTogglePublish}
              >
                Confirm &amp; {statusConfirmModal.targetStatus === 'published' ? 'Publish' : 'Move to Drafts'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Portfolio Project"
        message="Are you sure you want to delete this project? It will be removed from the public website."
        confirmText="Delete Project"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
