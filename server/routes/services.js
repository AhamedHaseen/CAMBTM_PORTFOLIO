import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { recordAudit } from '../middleware/audit.js';

const router = express.Router();

// Default initial services seed data across BUILD, CREATE, and GROW
const DEFAULT_SERVICES = [
  // BUILD (13 items)
  { id: 'b1', category: 'build', num: '01', name: 'Website Development', description: 'Corporate, portfolio, e-commerce and custom websites.', icon: 'Code2', display_order: 1, sort_order: 1, status: 'active', is_active: true },
  { id: 'b2', category: 'build', num: '02', name: 'POS Systems', description: 'Sales, billing, inventory and multi-branch operations.', icon: 'Code2', display_order: 2, sort_order: 2, status: 'active', is_active: true },
  { id: 'b3', category: 'build', num: '03', name: 'ERP Systems', description: 'Connected workflows for finance, HR, stock and operations.', icon: 'Code2', display_order: 3, sort_order: 3, status: 'active', is_active: true },
  { id: 'b4', category: 'build', num: '04', name: 'Custom Software & App Development', description: 'Tailored web, mobile and internal business platforms.', icon: 'Code2', display_order: 4, sort_order: 4, status: 'active', is_active: true },
  { id: 'b5', category: 'build', num: '05', name: 'Workflow Automation', description: 'Automate repetitive tasks, approvals and operational handoffs.', icon: 'Code2', display_order: 5, sort_order: 5, status: 'active', is_active: true },
  { id: 'b6', category: 'build', num: '06', name: 'AI Integration', description: 'AI agents, assistants and AI-powered business processes.', icon: 'Code2', display_order: 6, sort_order: 6, status: 'active', is_active: true },
  { id: 'b7', category: 'build', num: '07', name: 'CRM Solutions', description: 'Lead, pipeline, customer and sales workflow systems.', icon: 'Code2', display_order: 7, sort_order: 7, status: 'active', is_active: true },
  { id: 'b8', category: 'build', num: '08', name: 'Maintenance & Technical Support', description: 'Monitoring, updates, fixes, performance and ongoing support.', icon: 'Code2', display_order: 8, sort_order: 8, status: 'active', is_active: true },
  { id: 'b9', category: 'build', num: '09', name: 'SaaS Product Development', description: 'Design and engineering for subscription-based software products.', icon: 'Code2', display_order: 9, sort_order: 9, status: 'active', is_active: true },
  { id: 'b10', category: 'build', num: '10', name: 'Cybersecurity', description: 'Security reviews, hardening, access controls and protection.', icon: 'Code2', display_order: 10, sort_order: 10, status: 'active', is_active: true },
  { id: 'b11', category: 'build', num: '11', name: 'Data Migration', description: 'Structured migration across platforms, systems and databases.', icon: 'Code2', display_order: 11, sort_order: 11, status: 'active', is_active: true },
  { id: 'b12', category: 'build', num: '12', name: 'Data Analysis', description: 'Reporting, dashboards and decision-ready business insights.', icon: 'Code2', display_order: 12, sort_order: 12, status: 'active', is_active: true },
  { id: 'b13', category: 'build', num: '13', name: 'API Integration', description: 'Connect payments, platforms, third-party tools and internal systems.', icon: 'Code2', display_order: 13, sort_order: 13, status: 'active', is_active: true },

  // CREATE (8 items)
  { id: 'c1', category: 'create', num: '01', name: 'Branding', description: 'Identity systems, brand guidelines and rollout assets.', icon: 'Palette', display_order: 1, sort_order: 1, status: 'active', is_active: true },
  { id: 'c2', category: 'create', num: '02', name: 'Video Production', description: 'End-to-end shoots for campaigns, brands and social media.', icon: 'Palette', display_order: 2, sort_order: 2, status: 'active', is_active: true },
  { id: 'c3', category: 'create', num: '03', name: 'Video Editing', description: 'Reels, advertisements, corporate and social-first edits.', icon: 'Palette', display_order: 3, sort_order: 3, status: 'active', is_active: true },
  { id: 'c4', category: 'create', num: '04', name: 'Photography', description: 'Product, food, people, spaces and campaign photography.', icon: 'Palette', display_order: 4, sort_order: 4, status: 'active', is_active: true },
  { id: 'c5', category: 'create', num: '05', name: 'Motion Graphics', description: 'Animated brand visuals, explainers and performance creatives.', icon: 'Palette', display_order: 5, sort_order: 5, status: 'active', is_active: true },
  { id: 'c6', category: 'create', num: '06', name: 'Graphic Design', description: 'Social media, campaign and promotional creative production.', icon: 'Palette', display_order: 6, sort_order: 6, status: 'active', is_active: true },
  { id: 'c7', category: 'create', num: '07', name: 'AI Creative Studio', description: 'AI-led imagery, video, UGC-style and campaign production.', icon: 'Palette', display_order: 7, sort_order: 7, status: 'active', is_active: true },
  { id: 'c8', category: 'create', num: '08', name: 'Presenter-Led Content', description: 'On-camera content for education, promotion and brand storytelling.', icon: 'Palette', display_order: 8, sort_order: 8, status: 'active', is_active: true },

  // GROW (7 items)
  { id: 'g1', category: 'grow', num: '01', name: 'Social Media Management', description: 'Planning, publishing, community management and reporting.', icon: 'TrendingUp', display_order: 1, sort_order: 1, status: 'active', is_active: true },
  { id: 'g2', category: 'grow', num: '02', name: 'SEO', description: 'Technical, on-page and content-led search optimisation.', icon: 'TrendingUp', display_order: 2, sort_order: 2, status: 'active', is_active: true },
  { id: 'g3', category: 'grow', num: '03', name: 'Lead Generation', description: 'Campaigns and funnels built to acquire qualified prospects.', icon: 'TrendingUp', display_order: 3, sort_order: 3, status: 'active', is_active: true },
  { id: 'g4', category: 'grow', num: '04', name: 'Email & WhatsApp Marketing', description: 'Lifecycle, campaign, nurture and broadcast communication.', icon: 'TrendingUp', display_order: 4, sort_order: 4, status: 'active', is_active: true },
  { id: 'g5', category: 'grow', num: '05', name: 'Paid Advertising', description: 'Meta, TikTok and Google campaign management.', icon: 'TrendingUp', display_order: 5, sort_order: 5, status: 'active', is_active: true },
  { id: 'g6', category: 'grow', num: '06', name: 'E-Commerce Marketing', description: 'Acquisition, conversion and retention for online stores.', icon: 'TrendingUp', display_order: 6, sort_order: 6, status: 'active', is_active: true },
  { id: 'g7', category: 'grow', num: '07', name: 'Google Business Profile Management', description: 'Profile optimisation, content, reviews and local visibility.', icon: 'TrendingUp', display_order: 7, sort_order: 7, status: 'active', is_active: true },
];

let inMemoryServices = [...DEFAULT_SERVICES];

// Helper to auto-calculate two-digit numbers and normalize fields per category
function formatCategoryNumbers(servicesList) {
  const categories = ['build', 'create', 'grow'];
  const result = [];
  categories.forEach(cat => {
    const catItems = servicesList
      .filter(item => (item.category || '').toLowerCase() === cat)
      .sort((a, b) => (a.display_order || a.sort_order || 0) - (b.display_order || b.sort_order || 0));

    catItems.forEach((item, index) => {
      const num = String(index + 1).padStart(2, '0');
      const order = index + 1;
      const status = item.status || (item.is_active === false ? 'inactive' : 'active');
      const is_active = status === 'active';

      result.push({
        ...item,
        num,
        display_order: order,
        sort_order: order,
        status,
        is_active
      });
    });
  });
  return result;
}

// ── GET /api/services (Public & Admin Endpoint) ──
router.get('/', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const formatted = formatCategoryNumbers(data);
        return res.json({ success: true, services: formatted, data: formatted });
      }
    }
    const formatted = formatCategoryNumbers(inMemoryServices);
    return res.json({ success: true, services: formatted, data: formatted });
  } catch (err) {
    console.error('Error fetching services:', err);
    const formatted = formatCategoryNumbers(inMemoryServices);
    return res.json({ success: true, services: formatted, data: formatted });
  }
});

// ── POST /api/services (Create new service) ──
router.post('/', async (req, res) => {
  try {
    const { category, name, description, icon = 'Globe', display_order, status = 'active', is_active = true } = req.body;

    if (!category || !name || !description) {
      return res.status(400).json({ success: false, message: 'Category, name, and description are required.' });
    }

    const catNormalized = category.toLowerCase().trim();
    if (!['build', 'create', 'grow'].includes(catNormalized)) {
      return res.status(400).json({ success: false, message: 'Category must be build, create, or grow.' });
    }

    const currentCatItems = inMemoryServices.filter(s => s.category === catNormalized);
    const newOrder = Number(display_order) || (currentCatItems.length + 1);
    const newNum = String(newOrder).padStart(2, '0');

    const newService = {
      id: 'srv_' + Date.now(),
      category: catNormalized,
      num: newNum,
      name: name.trim(),
      description: description.trim(),
      icon: icon || 'Code2',
      display_order: newOrder,
      sort_order: newOrder,
      status: status || (is_active ? 'active' : 'inactive'),
      is_active: status === 'active' || Boolean(is_active),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('services')
        .insert([newService])
        .select()
        .single();

      if (!error && data) {
        inMemoryServices.push(data);
        return res.status(201).json({ success: true, service: data, data });
      }
    }

    inMemoryServices.push(newService);
    return res.status(201).json({ success: true, service: newService, data: newService });
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/services/:id (Update service) ──
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, name, description, icon, display_order, sort_order, status, is_active } = req.body;

    const updates = {
      updated_at: new Date().toISOString()
    };
    if (category) updates.category = category.toLowerCase().trim();
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (icon !== undefined) updates.icon = icon;
    if (display_order !== undefined) {
      updates.display_order = Number(display_order);
      updates.sort_order = Number(display_order);
    }
    if (sort_order !== undefined) {
      updates.sort_order = Number(sort_order);
      updates.display_order = Number(sort_order);
    }
    if (status !== undefined) {
      updates.status = status;
      updates.is_active = status === 'active';
    }
    if (is_active !== undefined) {
      updates.is_active = Boolean(is_active);
      updates.status = is_active ? 'active' : 'inactive';
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const idx = inMemoryServices.findIndex(s => s.id === id);
        if (idx !== -1) inMemoryServices[idx] = { ...inMemoryServices[idx], ...data };
        return res.json({ success: true, service: data, data });
      }
    }

    const idx = inMemoryServices.findIndex(s => s.id === id);
    if (idx !== -1) {
      inMemoryServices[idx] = { ...inMemoryServices[idx], ...updates };
      return res.json({ success: true, service: inMemoryServices[idx], data: inMemoryServices[idx] });
    }

    res.status(404).json({ success: false, message: 'Service not found.' });
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/services/:id (Delete service) ──
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (supabase) {
      await supabase.from('services').delete().eq('id', id);
    }

    const idx = inMemoryServices.findIndex(s => s.id === id);
    if (idx !== -1) {
      inMemoryServices.splice(idx, 1);
    }

    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
