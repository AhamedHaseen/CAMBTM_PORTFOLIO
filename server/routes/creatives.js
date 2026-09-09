import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { recordAudit } from '../middleware/audit.js';

const router = express.Router();

/**
 * GET /api/creatives
 * Fetch creatives with optional placement or category filters
 */
router.get('/', async (req, res) => {
  const { placement, category } = req.query;
  try {
    let sql = 'SELECT * FROM creatives WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (placement && placement !== 'All') {
      sql += ` AND placements LIKE $${paramIndex}`;
      params.push(`%${placement}%`);
      paramIndex++;
    }

    if (category && category !== 'All') {
      sql += ` AND LOWER(category) = LOWER($${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    sql += ' ORDER BY display_order ASC, created_at DESC';

    const result = await query(sql, params);
    const creatives = (result.rows || []).map(c => ({
      ...c,
      placements: typeof c.placements === 'string' ? JSON.parse(c.placements || '[]') : (c.placements || []),
      is_published: Boolean(c.is_published)
    }));

    return res.json({ success: true, creatives });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/creatives
 * Create new creative asset
 */
router.post('/', requireAuth, async (req, res) => {
  const {
    title,
    description = '',
    image_url,
    category = 'Branding',
    placements = ['Homepage'],
    display_order = 0,
    is_published = true
  } = req.body;

  if (!title || !image_url) {
    return res.status(400).json({ success: false, error: 'Title and image URL are required.' });
  }

  try {
    const placementsStr = typeof placements === 'string' ? placements : JSON.stringify(placements);

    await query(`
      INSERT INTO creatives (title, description, image_url, category, placements, display_order, is_published)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [title, description, image_url, category, placementsStr, display_order, is_published]);

    await recordAudit(req, {
      action: 'CREATE',
      module: 'Creatives',
      description: `Admin uploaded creative: ${title}`,
      details: { title, category, placements }
    });

    return res.status(201).json({ success: true, message: 'Creative created successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/creatives/:id
 */
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, description, image_url, category, placements, display_order, is_published } = req.body;

  try {
    const placementsStr = typeof placements === 'string' ? placements : JSON.stringify(placements || []);

    await query(`
      UPDATE creatives SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        image_url = COALESCE($3, image_url),
        category = COALESCE($4, category),
        placements = COALESCE($5, placements),
        display_order = COALESCE($6, display_order),
        is_published = COALESCE($7, is_published),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
    `, [title, description, image_url, category, placementsStr, display_order, is_published, id]);

    await recordAudit(req, {
      action: 'UPDATE',
      module: 'Creatives',
      recordId: String(id),
      description: `Admin updated creative ID: ${id} (${title})`
    });

    return res.json({ success: true, message: 'Creative updated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/creatives/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM creatives WHERE id = $1', [id]);
    await recordAudit(req, {
      action: 'DELETE',
      module: 'Creatives',
      recordId: String(id),
      description: `Admin deleted creative: ${id}`
    });
    return res.json({ success: true, message: 'Creative deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
