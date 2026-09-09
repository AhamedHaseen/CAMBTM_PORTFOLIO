import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { recordAudit } from '../middleware/audit.js';

const router = express.Router();

/**
 * GET /api/brands
 * Public / Admin: Fetch brands
 */
router.get('/', async (req, res) => {
  const { all } = req.query;
  try {
    let sql = 'SELECT * FROM brands WHERE is_deleted = FALSE';
    if (!all) {
      sql += " AND status = 'published'";
    }
    sql += ' ORDER BY display_order ASC, id ASC';

    const result = await query(sql);
    const brands = result.rows || [];

    const stats = {
      total: brands.length,
      published: brands.filter(b => b.status === 'published').length,
      hidden: brands.filter(b => b.status === 'hidden' || b.status === 'draft').length
    };

    return res.json({ success: true, brands, stats });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/brands
 * Add new brand logo (auto-calculates display order if not provided)
 */
router.post('/', requireAuth, async (req, res) => {
  const {
    company_name,
    logo_url,
    display_order,
    status = 'published'
  } = req.body;

  if (!company_name || !company_name.trim()) {
    return res.status(400).json({ success: false, error: 'Company / Brand Name is required.' });
  }

  if (!logo_url || !logo_url.trim()) {
    return res.status(400).json({ success: false, error: 'Brand Logo File is required.' });
  }

  try {
    let finalOrder = parseInt(display_order, 10);
    if (isNaN(finalOrder) || finalOrder <= 0) {
      const countRes = await query('SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM brands WHERE is_deleted = FALSE');
      finalOrder = parseInt(countRes.rows[0]?.next_order || 1, 10);
    }

    const cleanStatus = status === 'hidden' || status === 'draft' ? 'hidden' : 'published';

    const insertRes = await query(`
      INSERT INTO brands (company_name, logo_url, display_order, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [company_name.trim(), logo_url.trim(), finalOrder, cleanStatus]);

    const createdBrand = insertRes.rows[0];

    await recordAudit(req, {
      action: 'CREATE',
      module: 'Brands',
      recordId: String(createdBrand?.id || ''),
      description: `Admin added brand logo: "${company_name.trim()}" (Order #${finalOrder})`,
      details: { company_name: company_name.trim(), status: cleanStatus, display_order: finalOrder }
    });

    return res.status(201).json({ success: true, message: 'Brand logo added successfully', brand: createdBrand });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/brands/:id
 * Update brand logo
 */
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { company_name, logo_url, display_order, status } = req.body;

  try {
    const existing = await query('SELECT * FROM brands WHERE id = $1 AND is_deleted = FALSE', [id]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Brand not found' });
    }

    const current = existing.rows[0];
    const newName = company_name !== undefined ? company_name.trim() : current.company_name;
    const newLogo = logo_url !== undefined ? logo_url.trim() : current.logo_url;
    const newOrder = display_order !== undefined ? parseInt(display_order, 10) || current.display_order : current.display_order;
    const newStatus = status !== undefined ? (status === 'hidden' || status === 'draft' ? 'hidden' : 'published') : current.status;

    const updateRes = await query(`
      UPDATE brands SET
        company_name = $1,
        logo_url = $2,
        display_order = $3,
        status = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [newName, newLogo, newOrder, newStatus, id]);

    await recordAudit(req, {
      action: 'UPDATE',
      module: 'Brands',
      recordId: String(id),
      description: `Admin updated brand logo: "${newName}"`,
      details: { id, company_name: newName, status: newStatus, display_order: newOrder }
    });

    return res.json({ success: true, message: 'Brand updated successfully', brand: updateRes.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/brands/:id/toggle
 * 1-click toggle published/hidden
 */
router.patch('/:id/toggle', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await query('SELECT * FROM brands WHERE id = $1 AND is_deleted = FALSE', [id]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Brand not found' });
    }

    const current = existing.rows[0];
    const newStatus = current.status === 'published' ? 'hidden' : 'published';

    await query('UPDATE brands SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newStatus, id]);

    await recordAudit(req, {
      action: 'TOGGLE_STATUS',
      module: 'Brands',
      recordId: String(id),
      description: `Admin changed brand status to ${newStatus.toUpperCase()} for "${current.company_name}"`
    });

    return res.json({ success: true, message: `"${current.company_name}" is now ${newStatus}`, status: newStatus });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/brands/:id (Soft-delete)
 */
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await query('SELECT * FROM brands WHERE id = $1 AND is_deleted = FALSE', [id]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Brand not found' });
    }

    const brand = existing.rows[0];
    await query('UPDATE brands SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    await recordAudit(req, {
      action: 'DELETE',
      module: 'Brands',
      recordId: String(id),
      description: `Admin removed brand logo: "${brand.company_name}"`
    });

    return res.json({ success: true, message: `Brand "${brand.company_name}" deleted successfully` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/brands/reorder/batch
 * Batch update display order
 */
router.put('/reorder/batch', requireAuth, async (req, res) => {
  const { items } = req.body; // [{ id: 1, display_order: 1 }, ...]
  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, error: 'Expected items array' });
  }

  try {
    for (const item of items) {
      if (item.id) {
        await query('UPDATE brands SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [parseInt(item.display_order, 10) || 0, item.id]);
      }
    }
    return res.json({ success: true, message: 'Brands reordered successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
