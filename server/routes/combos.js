import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';
import { recordAudit } from '../middleware/audit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/combos.json');

const router = express.Router();

const INITIAL_COMBOS = [
  {
    id: 'video',
    title: 'Videography Combo',
    description: 'For brands that need recurring content, social execution and a consistent monthly video pipeline.',
    engagement: 'MONTHLY PLAN',
    items: [
      '12 Static Creatives',
      'Social Media Management for Meta & TikTok',
      'Basic Campaign Management',
      '1 Video Shoot',
      'Monthly Reporting'
    ],
    featured: false,
    display_order: 1,
    status: 'active'
  },
  {
    id: 'web',
    title: 'Website Combo',
    description: 'For businesses that need ongoing marketing supported by a professionally built and maintained website.',
    engagement: '6-MONTH PLAN',
    items: [
      'Free Custom Website & Free Hosting',
      '12 Static Creatives',
      'Social Media Management for Meta & TikTok',
      'Basic Campaign Management',
      'Monthly Maintenance & Technical Support',
      'Monthly Reporting'
    ],
    featured: true,
    display_order: 2,
    status: 'active'
  },
  {
    id: 'pos',
    title: 'POS Combo',
    description: 'For retail, restaurant and service businesses that need marketing and an operational POS system together.',
    engagement: 'ANNUAL PLAN',
    items: [
      'Free Custom Cloud POS & Free Hosting',
      '12 Static Creatives',
      'Social Media Management for Meta & TikTok',
      'Basic Campaign Management',
      'Monthly Maintenance & Technical Support',
      'Monthly Reporting'
    ],
    featured: false,
    display_order: 3,
    status: 'active'
  }
];

function loadCombosFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading combos.json:', err.message);
  }
  return [...INITIAL_COMBOS];
}

function saveCombosToFile(list) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing combos.json:', err.message);
  }
}

let inMemoryCombos = loadCombosFromFile();

// ── GET /api/combos ──
router.get('/', async (req, res) => {
  try {
    const showAll = req.query.all === 'true';

    if (supabase) {
      let query = supabase.from('combo_packages').select('*').order('display_order', { ascending: true });
      if (!showAll) {
        query = query.eq('status', 'active');
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return res.json({ success: true, combos: data });
      }
    }

    const filtered = showAll ? inMemoryCombos : inMemoryCombos.filter(c => c.status === 'active');
    filtered.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    return res.json({ success: true, combos: filtered });
  } catch (err) {
    console.error('Error fetching combos:', err);
    return res.json({ success: true, combos: inMemoryCombos });
  }
});

// ── POST /api/combos (Create new combo package) ──
router.post('/', async (req, res) => {
  try {
    const {
      id,
      title,
      description = '',
      engagement = 'MONTHLY PLAN',
      items = [],
      featured = false,
      display_order = inMemoryCombos.length + 1,
      status = 'active'
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Package title is required' });
    }

    const newId = id && id.trim()
      ? id.toLowerCase().replace(/[^a-z0-9_-]/g, '')
      : 'pkg_' + Date.now();

    const newCombo = {
      id: newId,
      title: title.trim(),
      description: (description || '').trim(),
      engagement: (engagement || 'MONTHLY PLAN').trim(),
      items: Array.isArray(items) ? items.filter(Boolean) : [],
      featured: Boolean(featured),
      display_order: Number(display_order) || (inMemoryCombos.length + 1),
      status: status || 'active'
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('combo_packages').insert([newCombo]).select().single();
        if (!error && data) {
          inMemoryCombos.push(data);
          recordAudit(req, 'CREATE_COMBO_PACKAGE', `Created combo package: ${title}`).catch(() => { });
          return res.status(201).json({ success: true, combo: data });
        }
      } catch { }
    }

    inMemoryCombos.push(newCombo);
    saveCombosToFile(inMemoryCombos);
    recordAudit(req, 'CREATE_COMBO_PACKAGE', `Created combo package: ${title}`).catch(() => { });
    return res.status(201).json({ success: true, combo: newCombo });
  } catch (err) {
    console.error('Error creating combo package:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to create combo package' });
  }
});

// ── PUT /api/combos/:id (Update combo package) ──
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.id;

    if (supabase) {
      try {
        const { data, error } = await supabase.from('combo_packages').update(updates).eq('id', id).select().single();
        if (!error && data) {
          const idx = inMemoryCombos.findIndex(c => c.id === id);
          if (idx !== -1) inMemoryCombos[idx] = data;
          saveCombosToFile(inMemoryCombos);
          recordAudit(req, 'UPDATE_COMBO_PACKAGE', `Updated combo package: ${id}`).catch(() => { });
          return res.json({ success: true, combo: data });
        }
      } catch { }
    }

    const idx = inMemoryCombos.findIndex(c => c.id === id);
    if (idx !== -1) {
      inMemoryCombos[idx] = { ...inMemoryCombos[idx], ...updates };
      saveCombosToFile(inMemoryCombos);
      recordAudit(req, 'UPDATE_COMBO_PACKAGE', `Updated combo package: ${id}`).catch(() => { });
      return res.json({ success: true, combo: inMemoryCombos[idx] });
    }

    return res.status(404).json({ success: false, error: 'Combo package not found' });
  } catch (err) {
    console.error('Error updating combo package:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update combo package' });
  }
});

// ── DELETE /api/combos/:id (Delete combo package) ──
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (supabase) {
      try {
        await supabase.from('combo_packages').delete().eq('id', id);
      } catch { }
    }

    inMemoryCombos = inMemoryCombos.filter(c => c.id !== id);
    saveCombosToFile(inMemoryCombos);
    recordAudit(req, 'DELETE_COMBO_PACKAGE', `Deleted combo package: ${id}`).catch(() => { });
    return res.json({ success: true, message: 'Combo package deleted successfully' });
  } catch (err) {
    console.error('Error deleting combo package:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to delete combo package' });
  }
});

export default router;
