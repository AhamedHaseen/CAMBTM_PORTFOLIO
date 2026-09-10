import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Eye,
  GripVertical,
  CheckCircle2,
  Sparkles,
  FileText,
  Upload,
  MapPin,
  TrendingUp,
  Building2
} from 'lucide-react';
import { useToast } from '../components/Toast';
import MediaUploadField from '../components/MediaUploadField';

const CATEGORIES = ['Branding', 'Websites', 'Systems', 'Social Media', 'Campaigns', 'Automation'];

export default function PortfolioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [isCustomBrand, setIsCustomBrand] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    slug: '',
    category: 'Branding',
    year: '2026',
    status: 'published',
    location: 'Colombo, Sri Lanka',
    industry: 'Beauty & Wellness',
    market: 'Sri Lanka & UAE',
    short_description: 'A connected brand and campaign direction designed to make Myra feel coherent across every customer touchpoint while creating a stronger platform for future growth.',
    challenge: 'Legacy workflows and fragmented brand touchpoints created high customer drop-off before checkout across retail channels.',
    approach: 'Unified digital design system, conversion-focused e-commerce storefront, and high-performance Meta creative funnels.',
    deliverables: 'Brand direction, social design system, campaign concepts, launch toolkit and performance-ready creative templates.',
    cover_image: '',
    featured_image: '',
    logo_url: '',
    services: 'branding, social, campaigns',
    display_order: 0
  });

  // 3 Structured Metrics
  const [metric1, setMetric1] = useState('+240% Sales Growth');
  const [metric2, setMetric2] = useState('4.8x Ad ROI');
  const [metric3, setMetric3] = useState('1.2M+ Reach');

  // Fetch available brands from DB
  useEffect(() => {
    apiRequest('/api/brands?all=true')
      .then(res => (res.headers.get('content-type')?.includes('application/json') ? res.json() : {}))
      .then(data => {
        if (data && data.brands) {
          setAvailableBrands(data.brands);
        }
      })
      .catch(err => console.warn('Could not fetch brands list:', err));
  }, []);

  useEffect(() => {
    if (isEdit) {
      apiRequest(`/api/portfolio/${id}`)
        .then(res => (res.headers.get('content-type')?.includes('application/json') ? res.json() : {}))
        .then(data => {
          if (data && data.success && data.project) {
            const p = data.project;
            setFormData({
              title: p.title || '',
              brand: p.brand || '',
              slug: p.slug || '',
              category: p.category || 'Branding',
              year: p.year || '2026',
              status: p.status || 'published',
              location: p.location || 'Colombo, Sri Lanka',
              industry: p.industry || 'Beauty & Wellness',
              market: p.market || 'Sri Lanka & UAE',
              short_description: p.short_description || '',
              challenge: p.challenge || '',
              approach: p.approach || '',
              deliverables: p.deliverables || '',
              cover_image: p.cover_image || '',
              featured_image: p.featured_image || '',
              logo_url: p.logo_url || '',
              services: Array.isArray(p.services) ? p.services.join(', ') : (p.services || ''),
              display_order: p.display_order || 0
            });

            if (Array.isArray(p.metrics)) {
              if (p.metrics[0]) setMetric1(typeof p.metrics[0] === 'object' ? `${p.metrics[0].value || ''} ${p.metrics[0].label || ''}` : p.metrics[0]);
              if (p.metrics[1]) setMetric2(typeof p.metrics[1] === 'object' ? `${p.metrics[1].value || ''} ${p.metrics[1].label || ''}` : p.metrics[1]);
              if (p.metrics[2]) setMetric3(typeof p.metrics[2] === 'object' ? `${p.metrics[2].value || ''} ${p.metrics[2].label || ''}` : p.metrics[2]);
            }
          }
        })
        .catch(err => {
          toast.error('Failed to load project details.');
        })
        .finally(() => setLoading(false));
    } else {
      // Auto compute next order
      apiRequest('/api/portfolio')
        .then(res => (res.headers.get('content-type')?.includes('application/json') ? res.json() : {}))
        .then(data => {
          if (data && data.projects) {
            setFormData(prev => ({ ...prev, display_order: data.projects.length + 1 }));
          }
        })
        .catch(() => { });
    }
  }, [id, isEdit]);

  const handleBrandSelect = (e) => {
    const selectedVal = e.target.value;
    if (selectedVal === '__custom__') {
      setIsCustomBrand(true);
      return;
    }

    setIsCustomBrand(false);
    const foundBrand = availableBrands.find(b => b.company_name === selectedVal);
    if (foundBrand) {
      const generatedSlug = foundBrand.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({
        ...prev,
        brand: foundBrand.company_name,
        slug: !isEdit ? generatedSlug : prev.slug,
        logo_url: foundBrand.logo_url || prev.logo_url
      }));
    } else {
      setFormData(prev => ({ ...prev, brand: selectedVal }));
    }
  };

  const handleCustomBrandInput = (e) => {
    const brand = e.target.value;
    const generatedSlug = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setFormData(prev => ({
      ...prev,
      brand,
      slug: !isEdit ? generatedSlug : prev.slug
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brand.trim()) {
      toast.error('Please select or specify a brand name.');
      return;
    }

    setSaving(true);

    try {
      const servicesArray = formData.services.split(',').map(s => s.trim()).filter(Boolean);
      const metricsArray = [metric1.trim(), metric2.trim(), metric3.trim()].filter(Boolean);

      const payload = {
        ...formData,
        services: servicesArray,
        metrics: metricsArray
      };

      const url = isEdit ? `/api/portfolio/${id}` : '/api/portfolio';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiRequest(url, {
        method,
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to save project');
      }

      toast.success(isEdit ? 'Portfolio case study updated successfully!' : 'New portfolio project created successfully!');
      navigate('/studio/portfolio');
    } catch (err) {
      toast.error(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--adm-text-muted)' }}>Loading project details...</div>;
  }

  const selectedBrandObj = availableBrands.find(b => b.company_name === formData.brand);

  return (
    <div>
      {/* Header */}
      <div className="adm-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link to="/studio/portfolio" className="adm-icon-btn" title="Back to Projects">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="adm-page-title">
              {isEdit ? `Edit Case Study: ${formData.brand || 'Project'}` : 'Create Portfolio Project & Case Study'}
            </h1>
            <p className="adm-page-desc">
              Select a brand partner from the dropdown and configure all case study parameters.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/studio/portfolio" className="adm-btn adm-btn-secondary">
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="adm-btn adm-btn-primary"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Row 1: Core Details & Classifications */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Card 1: Basic Identifiers */}
          <div className="adm-card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px', color: 'var(--adm-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="var(--adm-primary)" />
              Brand &amp; Project Identification
            </h3>

            {/* Brand Dropdown Selector */}
            <div className="adm-form-group">
              <label className="adm-form-label">Select Brand Partner *</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {!isCustomBrand ? (
                  <select
                    value={formData.brand}
                    onChange={handleBrandSelect}
                    required
                    className="adm-select"
                    style={{ flex: 1 }}
                  >
                    <option value="">-- Choose Brand Partner from Database --</option>
                    {availableBrands.map(b => (
                      <option key={b.id || b.company_name} value={b.company_name}>
                        {b.company_name} {b.status === 'published' ? '(Published)' : '(Draft)'}
                      </option>
                    ))}
                    <option value="__custom__">+ Enter Custom / New Brand Name...</option>
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                    <input
                      type="text"
                      required
                      placeholder="Enter brand name..."
                      value={formData.brand}
                      onChange={handleCustomBrandInput}
                      className="adm-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomBrand(false)}
                      className="adm-btn adm-btn-secondary adm-btn-sm"
                    >
                      Use Dropdown
                    </button>
                  </div>
                )}
              </div>

              {/* Brand Preview Badge if selected */}
              {selectedBrandObj && (
                <div style={{
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  background: 'var(--adm-surface-hover, rgba(255,255,255,0.03))',
                  borderRadius: '6px',
                  border: '1px solid var(--adm-border)'
                }}>
                  {selectedBrandObj.logo_url ? (
                    <img
                      src={selectedBrandObj.logo_url}
                      alt={selectedBrandObj.company_name}
                      style={{ width: '28px', height: '28px', objectFit: 'contain', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '2px' }}
                    />
                  ) : (
                    <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--adm-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700' }}>
                      {selectedBrandObj.company_name.charAt(0)}
                    </div>
                  )}
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--adm-text-main)' }}>
                    {selectedBrandObj.company_name}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--adm-text-dim)', marginLeft: 'auto' }}>
                    Logo auto-assigned from Brands database
                  </span>
                </div>
              )}
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Project Headline / Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Full Brand Rejuvenation & E-Commerce Scaler"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="adm-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="adm-form-group">
                <label className="adm-form-label">Category *</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="adm-select"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Display Order #</label>
                <input
                  type="number"
                  min="1"
                  value={formData.display_order}
                  onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 1 })}
                  className="adm-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="adm-form-group">
                <label className="adm-form-label">URL Slug</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  className="adm-input"
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="adm-select"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft / Hidden</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Market & Location Context */}
          <div className="adm-card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px', color: 'var(--adm-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--adm-primary)" />
              Location &amp; Industry Context
            </h3>

            <div className="adm-form-group">
              <label className="adm-form-label">Country &amp; Place (Location) *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Colombo, Sri Lanka or Riyadh, Saudi Arabia"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="adm-input"
                  style={{ paddingLeft: '34px' }}
                />
                <MapPin size={16} color="var(--adm-text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="adm-form-group">
                <label className="adm-form-label">Industry *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beauty & Wellness"
                  value={formData.industry}
                  onChange={e => setFormData({ ...formData, industry: e.target.value })}
                  className="adm-input"
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Market *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Lanka & UAE"
                  value={formData.market}
                  onChange={e => setFormData({ ...formData, market: e.target.value })}
                  className="adm-input"
                />
              </div>
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Services Provided (comma separated)</label>
              <input
                type="text"
                placeholder="branding, social, campaigns, websites"
                value={formData.services}
                onChange={e => setFormData({ ...formData, services: e.target.value })}
                className="adm-input"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Rich Case Study Content */}
        <div className="adm-card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px', color: 'var(--adm-text-main)' }}>
            Case Study Narrative &amp; Deliverables
          </h3>

          <div className="adm-form-group">
            <label className="adm-form-label">
              Short Summary / Executive Overview *
            </label>
            <textarea
              rows="3"
              required
              placeholder="e.g. A connected brand and campaign direction designed to make Myra feel coherent across every customer touchpoint while creating a stronger platform for future growth."
              value={formData.short_description}
              onChange={e => setFormData({ ...formData, short_description: e.target.value })}
              className="adm-textarea"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="adm-form-group">
              <label className="adm-form-label">The Challenge *</label>
              <textarea
                rows="4"
                required
                placeholder="Describe the client's initial friction, market competition, or legacy bottlenecks..."
                value={formData.challenge}
                onChange={e => setFormData({ ...formData, challenge: e.target.value })}
                className="adm-textarea"
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">The Approach / Strategy *</label>
              <textarea
                rows="4"
                required
                placeholder="Detail the strategic solution, design system overhaul, or performance funnels executed..."
                value={formData.approach}
                onChange={e => setFormData({ ...formData, approach: e.target.value })}
                className="adm-textarea"
              />
            </div>
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label">Deliverables *</label>
            <textarea
              rows="2"
              required
              placeholder="e.g. Brand direction, social design system, campaign concepts, launch toolkit and performance-ready creative templates."
              value={formData.deliverables}
              onChange={e => setFormData({ ...formData, deliverables: e.target.value })}
              className="adm-textarea"
            />
          </div>
        </div>

        {/* Row 3: Key Result Metrics & Media */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Card 1: Key Metrics */}
          <div className="adm-card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px', color: 'var(--adm-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--adm-primary)" />
              Key Result Metrics (3 Highlights)
            </h3>

            <div className="adm-form-group">
              <label className="adm-form-label">Metric 1 (e.g. Value + Label)</label>
              <input
                type="text"
                placeholder="+240% Sales Growth"
                value={metric1}
                onChange={e => setMetric1(e.target.value)}
                className="adm-input"
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Metric 2 (e.g. Value + Label)</label>
              <input
                type="text"
                placeholder="4.8x Ad ROI"
                value={metric2}
                onChange={e => setMetric2(e.target.value)}
                className="adm-input"
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Metric 3 (e.g. Value + Label)</label>
              <input
                type="text"
                placeholder="1.2M+ Reach"
                value={metric3}
                onChange={e => setMetric3(e.target.value)}
                className="adm-input"
              />
            </div>
          </div>

          {/* Card 2: Media & Visual Assets */}
          <div className="adm-card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px', color: 'var(--adm-text-main)' }}>
              Brand &amp; Visual Showcase
            </h3>

            <MediaUploadField
              label="Brand Partner Logo *"
              value={formData.logo_url}
              onChange={val => setFormData({ ...formData, logo_url: val })}
              type="image"
              maxSizeMB={10}
              helpText="Transparent PNG or SVG recommended"
            />

            <MediaUploadField
              label="Case Study Cover Image"
              value={formData.cover_image}
              onChange={val => setFormData({ ...formData, cover_image: val })}
              type="image"
              maxSizeMB={25}
              helpText="High-res preview visual displayed on portfolio atlas cards"
            />

            <MediaUploadField
              label="Featured Showcase Image"
              value={formData.featured_image}
              onChange={val => setFormData({ ...formData, featured_image: val })}
              type="image"
              maxSizeMB={25}
              helpText="Hero asset in full-screen case study drawer"
            />
          </div>
        </div>

        {/* Bottom Actions Right Aligned */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', marginBottom: '40px' }}>
          <Link to="/studio/portfolio" className="adm-btn adm-btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="adm-btn adm-btn-primary"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save & Publish'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
