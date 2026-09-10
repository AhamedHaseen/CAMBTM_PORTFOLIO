import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
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
  Code2,
  Palette,
  TrendingUp,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Check,
  AlertTriangle
} from 'lucide-react';
import { apiRequest, parseResponseJson } from '../utils/api';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const INITIAL_SERVICES = [
  // BUILD
  { id: 'b1', category: 'build', num: '01', name: 'Website Development', description: 'Corporate, portfolio, e-commerce and custom websites.', display_order: 1, status: 'active' },
  { id: 'b2', category: 'build', num: '02', name: 'POS Systems', description: 'Sales, billing, inventory and multi-branch operations.', display_order: 2, status: 'active' },
  { id: 'b3', category: 'build', num: '03', name: 'ERP Systems', description: 'Connected workflows for finance, HR, stock and operations.', display_order: 3, status: 'active' },
  { id: 'b4', category: 'build', num: '04', name: 'Custom Software & App Development', description: 'Tailored web, mobile and internal business platforms.', display_order: 4, status: 'active' },
  { id: 'b5', category: 'build', num: '05', name: 'Workflow Automation', description: 'Automate repetitive tasks, approvals and operational handoffs.', display_order: 5, status: 'active' },
  { id: 'b6', category: 'build', num: '06', name: 'AI Integration', description: 'AI agents, assistants and AI-powered business processes.', display_order: 6, status: 'active' },
  { id: 'b7', category: 'build', num: '07', name: 'CRM Solutions', description: 'Lead, pipeline, customer and sales workflow systems.', display_order: 7, status: 'active' },
  { id: 'b8', category: 'build', num: '08', name: 'Maintenance & Technical Support', description: 'Monitoring, updates, fixes, performance and ongoing support.', display_order: 8, status: 'active' },
  { id: 'b9', category: 'build', num: '09', name: 'SaaS Product Development', description: 'Design and engineering for subscription-based software products.', display_order: 9, status: 'active' },
  { id: 'b10', category: 'build', num: '10', name: 'Cybersecurity', description: 'Security reviews, hardening, access controls and protection.', display_order: 10, status: 'active' },
  { id: 'b11', category: 'build', num: '11', name: 'Data Migration', description: 'Structured migration across platforms, systems and databases.', display_order: 11, status: 'active' },
  { id: 'b12', category: 'build', num: '12', name: 'Data Analysis', description: 'Reporting, dashboards and decision-ready business insights.', display_order: 12, status: 'active' },
  { id: 'b13', category: 'build', num: '13', name: 'API Integration', description: 'Connect payments, platforms, third-party tools and internal systems.', display_order: 13, status: 'active' },

  // CREATE
  { id: 'c1', category: 'create', num: '01', name: 'Branding', description: 'Identity systems, brand guidelines and rollout assets.', display_order: 1, status: 'active' },
  { id: 'c2', category: 'create', num: '02', name: 'Video Production', description: 'End-to-end shoots for campaigns, brands and social media.', display_order: 2, status: 'active' },
  { id: 'c3', category: 'create', num: '03', name: 'Video Editing', description: 'Reels, advertisements, corporate and social-first edits.', display_order: 3, status: 'active' },
  { id: 'c4', category: 'create', num: '04', name: 'Photography', description: 'Product, food, people, spaces and campaign photography.', display_order: 4, status: 'active' },
  { id: 'c5', category: 'create', num: '05', name: 'Motion Graphics', description: 'Animated brand visuals, explainers and performance creatives.', display_order: 5, status: 'active' },
  { id: 'c6', category: 'create', num: '06', name: 'Graphic Design', description: 'Social media, campaign and promotional creative production.', display_order: 6, status: 'active' },
  { id: 'c7', category: 'create', num: '07', name: 'AI Creative Studio', description: 'AI-led imagery, video, UGC-style and campaign production.', display_order: 7, status: 'active' },
  { id: 'c8', category: 'create', num: '08', name: 'Presenter-Led Content', description: 'On-camera content for education, promotion and brand storytelling.', display_order: 8, status: 'active' },

  // GROW
  { id: 'g1', category: 'grow', num: '01', name: 'Social Media Management', description: 'Planning, publishing, community management and reporting.', display_order: 1, status: 'active' },
  { id: 'g2', category: 'grow', num: '02', name: 'SEO', description: 'Technical, on-page and content-led search optimisation.', display_order: 2, status: 'active' },
  { id: 'g3', category: 'grow', num: '03', name: 'Lead Generation', description: 'Campaigns and funnels built to acquire qualified prospects.', display_order: 3, status: 'active' },
  { id: 'g4', category: 'grow', num: '04', name: 'Email & WhatsApp Marketing', description: 'Lifecycle, campaign, nurture and broadcast communication.', display_order: 4, status: 'active' },
  { id: 'g5', category: 'grow', num: '05', name: 'Paid Advertising', description: 'Meta, TikTok and Google campaign management.', display_order: 5, status: 'active' },
  { id: 'g6', category: 'grow', num: '06', name: 'E-Commerce Marketing', description: 'Acquisition, conversion and retention for online stores.', display_order: 6, status: 'active' },
  { id: 'g7', category: 'grow', num: '07', name: 'Google Business Profile Management', description: 'Profile optimisation, content, reviews and local visibility.', display_order: 7, status: 'active' }
];

const CATEGORIES = [
  { id: 'build', label: 'BUILD', subtitle: 'Technology & Infrastructure', icon: Code2, color: '#FF5A00' },
  { id: 'create', label: 'CREATE', subtitle: 'Content & Production', icon: Palette, color: '#3B82F6' },
  { id: 'grow', label: 'GROW', subtitle: 'Marketing & Distribution', icon: TrendingUp, color: '#10B981' }
];

export default function ServicesManager() {
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'build' | 'create' | 'grow'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals & Confirmations
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [statusChangeItem, setStatusChangeItem] = useState(null);

  const toast = useToast();

  // Form state
  const [form, setForm] = useState({
    category: 'build',
    name: '',
    description: '',
    icon: 'Code2',
    display_order: 1,
    status: 'active'
  });

  const fetchServices = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await apiRequest('/api/services?all=true');
      const data = await parseResponseJson(res);
      if (data && data.success && Array.isArray(data.services || data.data)) {
        const list = data.services || data.data;
        if (list.length > 0) {
          setServices(list);
        }
      }
    } catch (err) {
      console.warn('API sync failed, using current active services:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Load initial services from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cambm_services');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setServices(parsed);
        }
      }
    } catch (e) {}
    fetchServices(true);
  }, []);

  // Save to localStorage and dispatch update whenever services state changes
  useEffect(() => {
    if (services && services.length > 0) {
      try {
        localStorage.setItem('cambm_services', JSON.stringify(services));
        window.dispatchEvent(new Event('cambm_services_updated'));
      } catch (e) {}
    }
  }, [services]);

  const handleOpenCreate = (preselectedCategory = 'build') => {
    setEditingItem(null);
    const cat = preselectedCategory === 'all' ? 'build' : preselectedCategory;
    const sameCatItems = services.filter(s => s.category === cat);
    const nextOrder = sameCatItems.length > 0 ? Math.max(...sameCatItems.map(s => Number(s.display_order || s.sort_order || 0))) + 1 : 1;

    setForm({
      category: cat,
      name: '',
      description: '',
      icon: cat === 'build' ? 'Code2' : cat === 'create' ? 'Palette' : 'TrendingUp',
      display_order: nextOrder,
      status: 'active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      category: item.category || 'build',
      name: item.name || '',
      description: item.description || '',
      icon: item.icon || 'Code2',
      display_order: Number(item.display_order || item.sort_order || 1),
      status: item.status || (item.is_active ? 'active' : 'inactive')
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Service name is required');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Service description is required');
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = Boolean(editingItem);
      const url = isEdit ? `/api/services/${editingItem.id}` : '/api/services';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...form,
        display_order: Number(form.display_order) || 1,
        sort_order: Number(form.display_order) || 1,
        is_active: form.status === 'active'
      };

      const res = await apiRequest(url, {
        method,
        body: JSON.stringify(payload)
      });

      const data = await parseResponseJson(res);
      const createdItem = data?.service || data?.data;

      if (isEdit) {
        setServices(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...payload, ...(createdItem || {}) } : s));
      } else {
        const newItem = createdItem || {
          id: 'srv_' + Date.now(),
          ...payload,
          num: String(payload.display_order).padStart(2, '0')
        };
        setServices(prev => [...prev, newItem]);
      }

      toast.success(isEdit ? `Updated "${form.name}" successfully!` : `Created "${form.name}" successfully!`);
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      // Local optimistic fallback
      if (editingItem) {
        setServices(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...form } : s));
        toast.success(`Updated "${form.name}" locally`);
      } else {
        const newId = 'srv_' + Date.now();
        setServices(prev => [...prev, { id: newId, ...form }]);
        toast.success(`Created "${form.name}" locally`);
      }
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmToggleStatus = async () => {
    if (!statusChangeItem) return;
    const nextStatus = statusChangeItem.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await apiRequest(`/api/services/${statusChangeItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus, is_active: nextStatus === 'active' })
      });
      const data = await parseResponseJson(res);
      toast.success(`"${statusChangeItem.name}" is now ${nextStatus}`);
      setServices(prev => prev.map(s => s.id === statusChangeItem.id ? { ...s, status: nextStatus, is_active: nextStatus === 'active' } : s));
    } catch (err) {
      setServices(prev => prev.map(s => s.id === statusChangeItem.id ? { ...s, status: nextStatus, is_active: nextStatus === 'active' } : s));
      toast.success(`"${statusChangeItem.name}" is now ${nextStatus}`);
    } finally {
      setStatusChangeItem(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      const res = await apiRequest(`/api/services/${deleteItem.id}`, {
        method: 'DELETE'
      });
      toast.success(`Deleted "${deleteItem.name}"`);
      setServices(prev => prev.filter(s => s.id !== deleteItem.id));
    } catch (err) {
      setServices(prev => prev.filter(s => s.id !== deleteItem.id));
      toast.success(`Deleted "${deleteItem.name}"`);
    } finally {
      setDeleteItem(null);
    }
  };

  const handleReorder = async (item, direction) => {
    const catItems = services
      .filter(s => s.category === item.category)
      .sort((a, b) => (Number(a.display_order || a.sort_order || 0)) - (Number(b.display_order || b.sort_order || 0)));

    const currentIndex = catItems.findIndex(s => s.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= catItems.length) return;

    const targetItem = catItems[targetIndex];
    const currentOrder = item.display_order || item.sort_order;
    const targetOrder = targetItem.display_order || targetItem.sort_order;

    // Swap in state
    setServices(prev => prev.map(s => {
      if (s.id === item.id) return { ...s, display_order: targetOrder, sort_order: targetOrder };
      if (s.id === targetItem.id) return { ...s, display_order: currentOrder, sort_order: currentOrder };
      return s;
    }));

    try {
      await Promise.all([
        apiRequest(`/api/services/${item.id}`, {
          method: 'PUT',
          body: JSON.stringify({ display_order: targetOrder, sort_order: targetOrder })
        }),
        apiRequest(`/api/services/${targetItem.id}`, {
          method: 'PUT',
          body: JSON.stringify({ display_order: currentOrder, sort_order: currentOrder })
        })
      ]);
      toast.success('Order updated');
    } catch (err) {
      // Local reorder succeeded
    }
  };

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const itemStatus = item.status || (item.is_active ? 'active' : 'inactive');
      const matchesStatus = statusFilter === 'all' || itemStatus === statusFilter;
      const matchesSearch =
        (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [services, activeCategory, statusFilter, search]);

  // Two-digit numbers map
  const categoryNumberMaps = useMemo(() => {
    const maps = { build: {}, create: {}, grow: {} };
    ['build', 'create', 'grow'].forEach(cat => {
      const catList = services
        .filter(s => s.category === cat)
        .sort((a, b) => (Number(a.display_order || a.sort_order || 0)) - (Number(b.display_order || b.sort_order || 0)));
      catList.forEach((item, idx) => {
        maps[cat][item.id] = String(idx + 1).padStart(2, '0');
      });
    });
    return maps;
  }, [services]);

  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter(s => s.status === 'active' || s.is_active === true).length;
    const build = services.filter(s => s.category === 'build').length;
    const create = services.filter(s => s.category === 'create').length;
    const grow = services.filter(s => s.category === 'grow').length;
    return { total, active, build, create, grow };
  }, [services]);

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={24} style={{ color: 'var(--adm-primary)' }} />
            <span>Our Packages & Services</span>
          </h1>
          <p className="adm-page-desc">
            Manage your service catalog across Build, Create, and Grow. Add names, descriptions, and let the system auto-align and auto-number them.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="adm-btn adm-btn-secondary"
            onClick={() => fetchServices(true)}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'adm-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            onClick={() => handleOpenCreate(activeCategory)}
          >
            <Plus size={16} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Stats row with responsive cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div className="adm-card" style={{ padding: '20px', borderLeft: '4px solid var(--adm-primary, #FF5A00)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--adm-text-muted)', letterSpacing: '0.05em' }}>
            Total Services
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', margin: '8px 0 4px 0', color: 'var(--adm-text)' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '13px', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> {stats.active} Active on Website
          </div>
        </div>

        <div className="adm-card" style={{ padding: '20px', borderLeft: '4px solid #FF5A00' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#FF5A00', letterSpacing: '0.05em' }}>
            BUILD (Tech & Infra)
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', margin: '8px 0 4px 0', color: 'var(--adm-text)' }}>
            {stats.build}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--adm-text-muted)' }}>
            Web, AI, CRM, Mobile, API
          </div>
        </div>

        <div className="adm-card" style={{ padding: '20px', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#3B82F6', letterSpacing: '0.05em' }}>
            CREATE (Content & Media)
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', margin: '8px 0 4px 0', color: 'var(--adm-text)' }}>
            {stats.create}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--adm-text-muted)' }}>
            Video, 3D, CGI, Creative Production
          </div>
        </div>

        <div className="adm-card" style={{ padding: '20px', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#10B981', letterSpacing: '0.05em' }}>
            GROW (Marketing & Ads)
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', margin: '8px 0 4px 0', color: 'var(--adm-text)' }}>
            {stats.grow}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--adm-text-muted)' }}>
            Performance Ads, Social, SEO, Leads
          </div>
        </div>
      </div>

      {/* Control Bar: Categories, Search, Filters, View Modes */}
      <div className="adm-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              className={`adm-btn ${activeCategory === 'all' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
              onClick={() => setActiveCategory('all')}
              style={{ fontSize: '13px', padding: '7px 14px' }}
            >
              All Packages ({stats.total})
            </button>
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const count = services.filter(s => s.category === cat.id).length;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  className={`adm-btn ${isActive ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    fontSize: '13px',
                    padding: '7px 14px',
                    borderColor: isActive ? cat.color : undefined,
                    background: isActive ? cat.color : undefined,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Icon size={14} />
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Search, Filter & View Mode */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px', display: 'flex', alignItems: 'center' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  color: 'var(--adm-text-dim, #94a3b8)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
              <input
                type="text"
                placeholder="Search services..."
                className="adm-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  paddingLeft: '36px',
                  paddingRight: '12px',
                  height: '38px',
                  fontSize: '13px',
                  lineHeight: '38px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <select
              className="adm-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                width: '130px',
                height: '38px',
                fontSize: '13px',
                padding: '0 12px',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
            </select>

            <div
              style={{
                display: 'flex',
                border: '1px solid var(--adm-border)',
                borderRadius: 'var(--adm-radius-md, 8px)',
                overflow: 'hidden',
                height: '38px',
                boxSizing: 'border-box'
              }}
            >
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '0 12px',
                  height: '100%',
                  background: viewMode === 'grid' ? 'var(--adm-primary, #6366f1)' : 'var(--adm-surface)',
                  color: viewMode === 'grid' ? '#ffffff' : 'var(--adm-text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <LayoutGrid size={14} />
                <span>Grid</span>
              </button>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '0 12px',
                  height: '100%',
                  background: viewMode === 'table' ? 'var(--adm-primary, #6366f1)' : 'var(--adm-surface)',
                  color: viewMode === 'table' ? '#ffffff' : 'var(--adm-text-muted)',
                  border: 'none',
                  borderLeft: '1px solid var(--adm-border)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={14} />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Grid or Table View */}
      {loading && services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--adm-text-muted)' }}>
          <RefreshCw size={28} className="adm-spin" style={{ margin: '0 auto 12px auto', display: 'block', color: 'var(--adm-primary)' }} />
          Loading services catalog...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="adm-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <Layers size={40} style={{ color: 'var(--adm-text-muted)', margin: '0 auto 12px auto', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No services found</h3>
          <p style={{ color: 'var(--adm-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
            {search ? 'Try adjusting your search query.' : 'Add your first service to this package category.'}
          </p>
          <button className="adm-btn adm-btn-primary" onClick={() => handleOpenCreate(activeCategory)}>
            <Plus size={16} /> Add Service
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="adm-card" style={{ overflowX: 'auto', padding: 0 }}>
          <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--adm-border)', background: 'var(--adm-bg-secondary)' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', width: '70px' }}>NO</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', width: '110px' }}>PACKAGE</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700' }}>SERVICE NAME</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700' }}>DESCRIPTION</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', width: '110px' }}>STATUS</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', width: '160px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(item => {
                const catMeta = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[0];
                const autoNum = categoryNumberMaps[item.category]?.[item.id] || '01';
                const isActive = item.status === 'active' || item.is_active === true;

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--adm-border)', opacity: isActive ? 1 : 0.65 }}>
                    <td style={{ padding: '14px 16px', fontWeight: '700', fontFamily: 'monospace', color: catMeta.color }}>
                      #{autoNum}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: catMeta.color, background: 'var(--adm-bg-secondary)', padding: '3px 8px', borderRadius: '4px' }}>
                        {catMeta.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: 'var(--adm-text)' }}>
                      {item.name}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13.5px', color: 'var(--adm-text-muted)' }}>
                      {item.description}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => setStatusChangeItem(item)}
                        style={{
                          background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                          color: isActive ? '#10B981' : '#EF4444',
                          border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          borderRadius: '20px',
                          padding: '3px 10px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button className="adm-icon-btn" onClick={() => handleReorder(item, 'up')} title="Move Up">
                          <ArrowUp size={13} />
                        </button>
                        <button className="adm-icon-btn" onClick={() => handleReorder(item, 'down')} title="Move Down">
                          <ArrowDown size={13} />
                        </button>
                        <button className="adm-btn adm-btn-secondary" onClick={() => handleOpenEdit(item)} style={{ fontSize: '12px', padding: '4px 8px', height: '28px' }}>
                          <Edit2 size={12} />
                        </button>
                        <button className="adm-btn adm-btn-danger" onClick={() => setDeleteItem(item)} style={{ fontSize: '12px', padding: '4px 8px', height: '28px' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
          {filteredServices.map(item => {
            const catMeta = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[0];
            const CatIcon = catMeta.icon;
            const autoNum = categoryNumberMaps[item.category]?.[item.id] || '01';
            const isActive = item.status === 'active' || item.is_active === true;

            return (
              <div
                key={item.id}
                className="adm-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '22px',
                  borderTop: `4px solid ${catMeta.color}`,
                  opacity: isActive ? 1 : 0.65,
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <div>
                  {/* Top Bar with Number & Category Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          background: 'var(--adm-bg-secondary)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          color: catMeta.color,
                          border: '1px solid var(--adm-border)'
                        }}
                      >
                        #{autoNum}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: catMeta.color,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <CatIcon size={12} />
                        {catMeta.label}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <button
                      onClick={() => setStatusChangeItem(item)}
                      style={{
                        background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        color: isActive ? '#10B981' : '#EF4444',
                        border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        borderRadius: '20px',
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Click to toggle status"
                    >
                      {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* Name */}
                  <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: 'var(--adm-text)', lineHeight: '1.3' }}>
                    {item.name}
                  </h3>

                  {/* Description */}
                  <p style={{ fontSize: '13.5px', color: 'var(--adm-text-muted)', lineHeight: '1.55', marginBottom: '18px' }}>
                    {item.description}
                  </p>
                </div>

                {/* Card Actions Footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--adm-border)',
                    marginTop: '8px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="adm-icon-btn"
                      onClick={() => handleReorder(item, 'up')}
                      title="Move Up"
                      style={{ padding: '6px' }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      className="adm-icon-btn"
                      onClick={() => handleReorder(item, 'down')}
                      title="Move Down"
                      style={{ padding: '6px' }}
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="adm-btn adm-btn-secondary"
                      onClick={() => handleOpenEdit(item)}
                      style={{ fontSize: '12px', padding: '5px 12px', height: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit2 size={13} />
                      Edit
                    </button>
                    <button
                      className="adm-btn adm-btn-danger"
                      onClick={() => setDeleteItem(item)}
                      style={{ fontSize: '12px', padding: '5px 10px', height: '32px' }}
                      title="Delete service"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '20px'
          }}
        >
          <div
            className="adm-card"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '28px',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Layers size={22} style={{ color: 'var(--adm-primary, #FF5A00)' }} />
                {editingItem ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button className="adm-icon-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Category */}
              <div style={{ marginBottom: '18px' }}>
                <label className="adm-label" style={{ marginBottom: '8px', display: 'block', fontWeight: '700', fontSize: '13px' }}>
                  Package Category
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {CATEGORIES.map(cat => {
                    const isSel = form.category === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setForm({ ...form, category: cat.id })}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '12px 8px',
                          borderRadius: '8px',
                          border: `2px solid ${isSel ? cat.color : 'var(--adm-border)'}`,
                          background: isSel ? 'var(--adm-bg-secondary)' : 'transparent',
                          color: isSel ? 'var(--adm-text)' : 'var(--adm-text-muted)',
                          cursor: 'pointer',
                          fontWeight: isSel ? '700' : '500',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon size={18} style={{ color: cat.color }} />
                        <span style={{ fontSize: '12px' }}>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Service Name */}
              <div style={{ marginBottom: '16px' }}>
                <label className="adm-label" style={{ marginBottom: '6px', display: 'block', fontWeight: '700', fontSize: '13px' }}>
                  Service Name <span style={{ color: '#FF5A00' }}>*</span>
                </label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="e.g. Website Development"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <label className="adm-label" style={{ marginBottom: '6px', display: 'block', fontWeight: '700', fontSize: '13px' }}>
                  Description <span style={{ color: '#FF5A00' }}>*</span>
                </label>
                <textarea
                  className="adm-input"
                  rows={3}
                  placeholder="e.g. Corporate, portfolio, e-commerce and custom websites."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Display Order & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label className="adm-label" style={{ marginBottom: '6px', display: 'block', fontWeight: '700', fontSize: '13px' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="adm-input"
                    value={form.display_order}
                    onChange={e => setForm({ ...form, display_order: e.target.value })}
                  />
                </div>
                <div>
                  <label className="adm-label" style={{ marginBottom: '6px', display: 'block', fontWeight: '700', fontSize: '13px' }}>
                    Status
                  </label>
                  <select
                    className="adm-input"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
                  {submitting ? 'Saving...' : editingItem ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteItem)}
        title="Delete Service"
        message={`Are you sure you want to delete "${deleteItem?.name}"? It will no longer appear on the website.`}
        confirmText="Delete Service"
        danger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteItem(null)}
      />

      {/* Toggle Status Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(statusChangeItem)}
        title={statusChangeItem?.status === 'active' ? 'Deactivate Service' : 'Activate Service'}
        message={`Are you sure you want to mark "${statusChangeItem?.name}" as ${statusChangeItem?.status === 'active' ? 'Inactive (Hidden)' : 'Active (Visible on Website)'}?`}
        confirmText={statusChangeItem?.status === 'active' ? 'Set to Inactive' : 'Set to Active'}
        danger={statusChangeItem?.status === 'active'}
        onConfirm={confirmToggleStatus}
        onCancel={() => setStatusChangeItem(null)}
      />
    </div>
  );
}
