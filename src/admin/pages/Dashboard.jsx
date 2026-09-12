import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  FileText,
  Sparkles,
  LayoutGrid,
  Film,
  Building2,
  Plus,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Laptop,
  Smartphone,
  FolderArchive,
  Users,
  Settings as SettingsIcon,
  Database,
  Package,
  MapPin,
  Mail,
  Phone,
  Layers,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import { formatLocalDateOnly, formatLocalTimeOnly } from '../utils/date';
import { useToast } from '../components/Toast';

const DEFAULT_COMBOS = [
  {
    id: 'video',
    title: 'Videography Package',
    description: 'For brands that need recurring content, social execution and a monthly video pipeline.',
    engagement: 'MONTHLY PLAN',
    featured: false,
    items: [
      '12 Static Creatives',
      'Social Media Management',
      'Basic Campaign Management',
      '1 Video Shoot',
      'Monthly Reporting'
    ]
  },
  {
    id: 'web',
    title: 'Website Package',
    description: 'For businesses that need ongoing marketing supported by a professionally built website.',
    engagement: '6-MONTH PLAN',
    featured: true,
    items: [
      'Free Custom Website',
      'Free Hosting',
      '12 Static Creatives',
      'Social Media Management',
      'Basic Campaign Management',
      'Monthly Maintenance & Support',
      'Monthly Reporting'
    ]
  },
  {
    id: 'pos',
    title: 'POS Package',
    description: 'For retail, restaurant and service businesses that need marketing and a POS system together.',
    engagement: 'ANNUAL PLAN',
    featured: false,
    items: [
      'Free Custom Cloud POS Software',
      'Free Hosting',
      '12 Static Creatives',
      'Social Media Management',
      'Basic Campaign Management',
      'Monthly Maintenance & Support',
      'Monthly Reporting'
    ]
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState({
    stats: {
      totalProjects: 0,
      publishedProjects: 0,
      draftProjects: 0,
      totalCreatives: 0,
      totalVideos: 0,
      totalBrands: 0
    },
    recentActivity: [],
    recentLogins: []
  });
  const [combosData, setCombosData] = useState(DEFAULT_COMBOS);
  const [contactsData, setContactsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Add Included Item State
  const [addFeaturePkg, setAddFeaturePkg] = useState(null);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [savingFeature, setSavingFeature] = useState(false);

  const hasPerm = (perm) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const perms = Array.isArray(user.permissions) ? user.permissions : (user.permissions === '*' ? ['*'] : []);
    if (perms.includes('*')) return true;
    return perms.includes(perm);
  };

  useEffect(() => {
    apiRequest('/api/dashboard/summary')
      .then(res => (res.headers.get('content-type')?.includes('application/json') ? res.json() : {}))
      .then(resData => {
        if (resData && resData.success) {
          setData(resData);
        }
      })
      .catch(err => console.error('Error fetching dashboard summary:', err))
      .finally(() => setLoading(false));

    apiRequest('/api/combos?all=true')
      .then(res => (res.headers.get('content-type')?.includes('application/json') ? res.json() : {}))
      .then(d => {
        if (d && d.success && Array.isArray(d.combos)) {
          setCombosData(d.combos);
        }
      })
      .catch(() => { });

    apiRequest('/api/contacts?all=true')
      .then(res => (res.headers.get('content-type')?.includes('application/json') ? res.json() : {}))
      .then(d => {
        if (d && d.success && Array.isArray(d.contacts)) {
          setContactsData(d.contacts);
        }
      })
      .catch(() => { });
  }, []);

  const handleAddIncluded = async (e) => {
    if (e) e.preventDefault();
    if (!addFeaturePkg || !newFeatureText.trim()) return;

    const trimmed = newFeatureText.trim();
    const currentItems = Array.isArray(addFeaturePkg.items) ? addFeaturePkg.items : [];
    const updatedItems = [...currentItems, trimmed];

    setSavingFeature(true);
    try {
      await apiRequest(`/api/combos/${addFeaturePkg.id}`, {
        method: 'PUT',
        body: JSON.stringify({ items: updatedItems })
      });
    } catch { }

    setCombosData(prev => {
      const base = prev && prev.length > 0 ? prev : DEFAULT_COMBOS;
      const updated = base.map(p => p.id === addFeaturePkg.id ? { ...p, items: updatedItems } : p);
      try {
        localStorage.setItem('cambm_admin_combos', JSON.stringify(updated));
        localStorage.setItem('cambm_combos', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('cambm_combos_updated'));
      } catch { }
      return updated;
    });
    toast.success(`Added "${trimmed}" to ${addFeaturePkg.title}`);
    setNewFeatureText('');
    setAddFeaturePkg(prev => prev ? { ...prev, items: updatedItems } : null);
    setSavingFeature(false);
  };

  const handleRemoveIncluded = async (pkgToUpdate, itemIndex) => {
    const currentItems = Array.isArray(pkgToUpdate.items) ? pkgToUpdate.items : [];
    const updatedItems = currentItems.filter((_, idx) => idx !== itemIndex);

    try {
      await apiRequest(`/api/combos/${pkgToUpdate.id}`, {
        method: 'PUT',
        body: JSON.stringify({ items: updatedItems })
      });
    } catch { }

    toast.info(`Removed item from ${pkgToUpdate.title}`);
    setCombosData(prev => {
      const base = prev && prev.length > 0 ? prev : DEFAULT_COMBOS;
      const updated = base.map(p => p.id === pkgToUpdate.id ? { ...p, items: updatedItems } : p);
      try {
        localStorage.setItem('cambm_admin_combos', JSON.stringify(updated));
        localStorage.setItem('cambm_combos', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('cambm_combos_updated'));
      } catch { }
      return updated;
    });
    if (addFeaturePkg && addFeaturePkg.id === pkgToUpdate.id) {
      setAddFeaturePkg(prev => ({ ...prev, items: updatedItems }));
    }
  };

  const formatDate = (dateStr) => {
    return formatLocalDateOnly(dateStr);
  };

  const formatTime = (dateStr) => {
    return formatLocalTimeOnly(dateStr);
  };

  const formatIpAddress = (ip) => {
    if (!ip) return '127.0.0.1';
    let cleaned = String(ip).trim();
    if (cleaned.includes(',')) cleaned = cleaned.split(',')[0].trim();
    if (cleaned.startsWith('::ffff:')) cleaned = cleaned.replace('::ffff:', '');
    if (cleaned === '::1' || cleaned === 'localhost') return '127.0.0.1';
    return cleaned;
  };

  const getActionBadgeClass = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('PURGE')) return 'adm-badge-danger';
    if (act.includes('FAILED') || act.includes('LOCK')) return 'adm-badge-rose';
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('RESTORE')) return 'adm-badge-success';
    if (act.includes('PUBLISH') && !act.includes('UNPUBLISH')) return 'adm-badge-teal';
    if (act.includes('2FA') || act.includes('SECURITY')) return 'adm-badge-purple';
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('REORDER') || act.includes('STATUS')) return 'adm-badge-info';
    if (act === 'LOGIN' || act.includes('AUTH')) return 'adm-badge-primary';
    if (act.includes('EXPORT') || act.includes('BACKUP') || act.includes('UNPUBLISH') || act.includes('SET_HERO') || act.includes('DB')) return 'adm-badge-warning';
    return 'adm-badge-neutral';
  };

  return (
    <div>
      {/* Page Title & Actions */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'}</h1>
          <p className="adm-page-desc">
            Manage your Cambridge Marketing system, packages, content, and office contacts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/studio/combo-packages" className="adm-btn adm-btn-secondary">
            <Package size={16} />
            <span>+ Add Combo Package</span>
          </Link>
          <Link to="/studio/contacts" className="adm-btn adm-btn-primary">
            <Plus size={16} />
            <span>+ Add Contact Details</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="adm-grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '24px' }}>
        {/* Total Projects */}
        {hasPerm('manage_portfolio') && (
          <Link to="/studio/portfolio" className="adm-card adm-kpi-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div>
              <div className="adm-kpi-label">Total Projects</div>
              <div className="adm-kpi-value">{loading ? '...' : data.stats.totalProjects}</div>
              <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
                {data.stats.publishedProjects} published • {data.stats.draftProjects} drafts
              </div>
            </div>
            <div className="adm-kpi-icon">
              <Briefcase size={24} />
            </div>
          </Link>
        )}

        {/* Hero Bento Media */}
        {hasPerm('manage_bento') && (
          <Link to="/studio/hero-bento" className="adm-card adm-kpi-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div>
              <div className="adm-kpi-label">Hero Bento Media</div>
              <div className="adm-kpi-value" style={{ color: 'var(--adm-primary)' }}>
                {loading ? '...' : (data.stats.totalHeroBento || 16)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', marginTop: '4px' }}>
                {data.stats.runningHeroImages || 12} images • {data.stats.runningHeroVideos || 4} videos live
              </div>
            </div>
            <div className="adm-kpi-icon" style={{ background: 'rgba(217, 119, 6, 0.12)', color: 'var(--adm-primary)' }}>
              <LayoutGrid size={24} />
            </div>
          </Link>
        )}

        {/* Combo Packages */}
        <Link to="/studio/combo-packages" className="adm-card adm-kpi-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div>
            <div className="adm-kpi-label">Combo Packages</div>
            <div className="adm-kpi-value" style={{ color: 'var(--adm-text-main)' }}>
              {combosData.length > 0 ? combosData.length : 3}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)', marginTop: '4px' }}>
              Live bundled packages
            </div>
          </div>
          <div className="adm-kpi-icon" style={{ background: 'var(--adm-surface-hover)', color: 'var(--adm-text-main)', border: '1px solid var(--adm-border)' }}>
            <Package size={22} />
          </div>
        </Link>

        {/* Contact Offices */}
        <Link to="/studio/contacts" className="adm-card adm-kpi-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div>
            <div className="adm-kpi-label">Contact Offices</div>
            <div className="adm-kpi-value" style={{ color: 'var(--adm-text-main)' }}>
              {contactsData.length > 0 ? contactsData.length : 2}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)', marginTop: '4px' }}>
              Sri Lanka, Saudi Arabia &amp; Global
            </div>
          </div>
          <div className="adm-kpi-icon" style={{ background: 'var(--adm-surface-hover)', color: 'var(--adm-text-main)', border: '1px solid var(--adm-border)' }}>
            <MapPin size={22} />
          </div>
        </Link>
      </div>

      {/* Dedicated Section: Combo Packages & Contact Details (Black & White Theme) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Combo Packages Management Card */}
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--adm-radius-sm)',
                background: 'var(--adm-surface-hover)',
                border: '1px solid var(--adm-border)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--adm-text-main)'
              }}>
                <Package size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--adm-text-main)' }}>
                  Combo Packages
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                  Package features and inclusions
                </span>
              </div>
            </div>
            <Link
              to="/studio/combo-packages"
              className="adm-btn adm-btn-secondary adm-btn-sm"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--adm-text-main)',
                borderColor: 'var(--adm-border)'
              }}
            >
              <Plus size={13} />
              <span>Add Package</span>
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {(combosData.length > 0 ? combosData : DEFAULT_COMBOS).map(pkg => (
              <div key={pkg.id} style={{
                padding: '16px 18px',
                borderRadius: 'var(--adm-radius-md)',
                background: 'var(--adm-surface-hover)',
                border: '1px solid var(--adm-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--adm-text-main)' }}>
                      {pkg.title}
                    </span>
                    {pkg.featured && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'var(--adm-text-main)',
                        color: 'var(--adm-bg)',
                        letterSpacing: '0.04em'
                      }}>
                        FEATURED
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: 'var(--adm-text-main)',
                    background: 'var(--adm-surface)',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    border: '1px solid var(--adm-border)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}>
                    {pkg.engagement}
                  </span>
                </div>

                {/* Description */}
                {pkg.description && (
                  <div style={{ fontSize: '12.5px', color: 'var(--adm-text-muted)', lineHeight: '1.45' }}>
                    {pkg.description}
                  </div>
                )}

                {/* What is included features preview */}
                <div style={{
                  borderTop: '1px solid var(--adm-border)',
                  paddingTop: '10px',
                  marginTop: '2px'
                }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--adm-text-main)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px'
                  }}>
                    Included ({(pkg.items || []).length}):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '6px' }}>
                    {(pkg.items || []).slice(0, 4).map((feat, fIdx) => (
                      <div key={fIdx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: 'var(--adm-text-main)',
                        lineHeight: '1.35'
                      }}>
                        <span style={{
                          fontWeight: '900',
                          fontSize: '11px',
                          color: 'var(--adm-text-main)'
                        }}>✓</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{feat}</span>
                      </div>
                    ))}
                    {(pkg.items || []).length > 4 && (
                      <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)', fontStyle: 'italic', paddingTop: '2px' }}>
                        + {(pkg.items || []).length - 4} more included...
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer link to manager */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  borderTop: '1px solid var(--adm-border)',
                  paddingTop: '8px',
                  marginTop: 'auto'
                }}>
                  <Link
                    to="/studio/combo-packages"
                    style={{
                      fontSize: '11.5px',
                      fontWeight: '600',
                      color: 'var(--adm-text-muted)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--adm-text-main)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--adm-text-muted)'}
                  >
                    <span>Manage / Edit Package</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>

                {/* Big Button Without Icon: Add Included */}
                <button
                  type="button"
                  onClick={() => {
                    setAddFeaturePkg(pkg);
                    setNewFeatureText('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    marginTop: '8px',
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
        </div>

        {/* Contact Details Management Card */}
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--adm-radius-sm)',
                background: 'var(--adm-surface-hover)',
                border: '1px solid var(--adm-border)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--adm-text-main)'
              }}>
                <MapPin size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--adm-text-main)' }}>
                  Contact &amp; Offices
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                  Office branches &amp; contact lines
                </span>
              </div>
            </div>
            <Link
              to="/studio/contacts"
              className="adm-btn adm-btn-secondary adm-btn-sm"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--adm-text-main)',
                borderColor: 'var(--adm-border)'
              }}
            >
              <Plus size={13} />
              <span>Add Contact</span>
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {(contactsData.length > 0 ? contactsData : [
              {
                id: 1,
                location_name: 'Cambridge Marketing - Sri Lanka',
                phone: '+94 76 649 0522',
                email: 'marketing@cambt.com',
                address: '328/3 Temple Road, Kaduwela Road, Battaramulla, Colombo, Sri Lanka 10120',
                country_code: 'LK',
                is_primary: true
              },
              {
                id: 2,
                location_name: 'Cambridge Marketing - Saudi Arabia',
                phone: '+966 50 123 4567',
                email: 'marketing@cambt.com',
                address: 'City Centre, Mishrifah, Jeddah, Saudi Arabia',
                country_code: 'SA',
                is_primary: false
              }
            ]).map(loc => (
              <div key={loc.id} style={{
                padding: '16px 18px',
                borderRadius: 'var(--adm-radius-md)',
                background: 'var(--adm-surface-hover)',
                border: '1px solid var(--adm-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <Building2 size={16} style={{ color: 'var(--adm-text-main)', flexShrink: 0 }} />
                    <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--adm-text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {loc.location_name}
                    </span>
                    {loc.is_primary && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'var(--adm-text-main)',
                        color: 'var(--adm-bg)',
                        flexShrink: 0,
                        letterSpacing: '0.04em'
                      }}>
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--adm-text-main)',
                    background: 'var(--adm-surface)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--adm-border)',
                    flexShrink: 0
                  }}>
                    {loc.country_code || 'LK'}
                  </span>
                </div>

                {/* Details stack - properly aligned */}
                <div style={{
                  borderTop: '1px solid var(--adm-border)',
                  paddingTop: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {/* Phone */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '16px', display: 'grid', placeItems: 'center', color: 'var(--adm-text-main)', flexShrink: 0 }}>
                      <Phone size={13} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--adm-text-main)' }}>
                      {loc.phone}
                    </span>
                  </div>

                  {/* Email */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '16px', display: 'grid', placeItems: 'center', color: 'var(--adm-text-main)', flexShrink: 0 }}>
                      <Mail size={13} />
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--adm-text-main)' }}>
                      {loc.email}
                    </span>
                  </div>

                  {/* Address */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minHeight: '36px' }}>
                    <div style={{ width: '16px', display: 'grid', placeItems: 'center', color: 'var(--adm-text-main)', flexShrink: 0, marginTop: '2px' }}>
                      <MapPin size={13} />
                    </div>
                    <span style={{ fontSize: '12.5px', color: 'var(--adm-text-muted)', lineHeight: '1.4' }}>
                      {loc.address}
                    </span>
                  </div>
                </div>

                {/* Edit Link */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
                  <Link
                    to="/studio/contacts"
                    style={{
                      fontSize: '11.5px',
                      fontWeight: '600',
                      color: 'var(--adm-text-main)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Manage / Edit Office</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Recent Activity & Recent Logins (Only if permitted) */}
      {hasPerm('view_audit_logs') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Recent Activity Stream */}
          <div className="adm-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--adm-primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--adm-text-main)' }}>
                  Recent Activity
                </h3>
              </div>
              <Link to="/studio/audit-logs" style={{ fontSize: '13px', color: 'var(--adm-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>View Audit Logs</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {data.recentActivity.length === 0 ? (
              <p style={{ color: 'var(--adm-text-dim)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
                No recent activity recorded yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.recentActivity.map(act => (
                  <div key={act.id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: 'var(--adm-radius-md)',
                    background: 'var(--adm-surface-hover)',
                    border: '1px solid var(--adm-border)'
                  }}>
                    <span className={`adm-badge ${getActionBadgeClass(act.action)}`} style={{ textTransform: 'uppercase', fontSize: '10px', marginTop: '2px' }}>
                      {act.action.replace(/_/g, ' ')}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--adm-text-main)', wordBreak: 'break-word' }}>
                        {act.details}
                      </p>
                      <div style={{ fontSize: '11px', color: 'var(--adm-text-dim)', marginTop: '4px', display: 'flex', gap: '8px' }}>
                        <span>By: <strong>{act.users?.full_name || 'System / Admin'}</strong></span>
                        <span>•</span>
                        <span>{formatDate(act.created_at)} at {formatTime(act.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Logins Stream */}
          <div className="adm-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--adm-success)" />
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--adm-text-main)' }}>
                  Recent Login History
                </h3>
              </div>
              <Link to="/studio/login-history" style={{ fontSize: '13px', color: 'var(--adm-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>View Full Log</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {data.recentLogins.length === 0 ? (
              <p style={{ color: 'var(--adm-text-dim)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
                No recent logins recorded.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.recentLogins.map(log => {
                  const isMobile = /mobile|android|iphone/i.test(log.user_agent || '');
                  return (
                    <div key={log.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 'var(--adm-radius-md)',
                      background: 'var(--adm-surface-hover)',
                      border: '1px solid var(--adm-border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--adm-radius-sm)',
                          background: log.status === 'success' ? 'var(--adm-success-bg)' : 'var(--adm-danger-bg)',
                          color: log.status === 'success' ? 'var(--adm-success)' : 'var(--adm-danger)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isMobile ? <Smartphone size={16} /> : <Laptop size={16} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--adm-text-main)' }}>
                            {log.users?.full_name || 'Administrator'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--adm-text-dim)', marginTop: '2px' }}>
                            IP: {formatIpAddress(log.ip_address)} • {formatDate(log.created_at)} at {formatTime(log.created_at)}
                          </div>
                        </div>
                      </div>
                      <span className={`adm-badge ${log.status === 'success' ? 'adm-badge-success' : 'adm-badge-danger'}`}>
                        {log.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Modal: Add Included Item to Combo Package */}
      {addFeaturePkg && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
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
            maxWidth: '520px',
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
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--adm-text-main)' }}>
                  Add Included to {addFeaturePkg.title}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                  Add a new feature, deliverable or capability to this package bundle.
                </p>
              </div>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => setAddFeaturePkg(null)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddIncluded}>
              <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--adm-text-main)', marginBottom: '6px' }}>
                    New Included Item *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="adm-search-input"
                      placeholder="e.g. 1 Video Shoot per Month or Custom POS Integration"
                      value={newFeatureText}
                      onChange={e => setNewFeatureText(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      autoFocus
                      required
                    />
                    <button
                      type="submit"
                      className="adm-btn adm-btn-primary"
                      disabled={savingFeature || !newFeatureText.trim()}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {savingFeature ? 'Adding...' : '+ Add'}
                    </button>
                  </div>
                </div>

                {/* Current Inclusions List Preview with ability to remove */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--adm-text-muted)'
                    }}>
                      Current Inclusions ({(addFeaturePkg.items || []).length}):
                    </span>
                  </div>

                  <div style={{
                    maxHeight: '180px',
                    overflowY: 'auto',
                    background: 'var(--adm-surface-card)',
                    border: '1px solid var(--adm-border)',
                    borderRadius: 'var(--adm-radius-md)',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {(addFeaturePkg.items || []).length === 0 ? (
                      <div style={{ fontSize: '12px', color: 'var(--adm-text-dim)', textAlign: 'center', padding: '12px 0' }}>
                        No items currently listed. Add one above.
                      </div>
                    ) : (
                      (addFeaturePkg.items || []).map((it, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            background: 'var(--adm-surface)',
                            border: '1px solid var(--adm-border)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--adm-text-main)' }}>
                            <span style={{ fontWeight: '800', color: 'var(--adm-text-main)', fontSize: '11px' }}>✓</span>
                            <span>{it}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveIncluded(addFeaturePkg, idx)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--adm-text-dim)',
                              cursor: 'pointer',
                              padding: '2px 4px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Remove feature"
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--adm-danger)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--adm-text-dim)'}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div style={{
                padding: '14px 24px',
                borderTop: '1px solid var(--adm-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Link
                  to="/studio/combo-packages"
                  style={{
                    fontSize: '12px',
                    color: 'var(--adm-text-muted)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onClick={() => setAddFeaturePkg(null)}
                >
                  <span>Open Full Package Editor</span>
                  <ArrowUpRight size={13} />
                </Link>

                <button
                  type="button"
                  className="adm-btn adm-btn-secondary"
                  onClick={() => setAddFeaturePkg(null)}
                >
                  Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
