import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { recordAudit } from '../middleware/audit.js';

const router = express.Router();

/**
 * GET /api/hero-bento
 * Public endpoint: Returns published hero bento items organized by columns
 */
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM hero_bento
      WHERE is_deleted = FALSE AND status = 'published'
      ORDER BY column_index ASC, display_order ASC, id ASC
    `);

    const items = result.rows || [];
    const itemsByColumn = {
      col1: items.filter(i => Number(i.column_index) === 1),
      col2: items.filter(i => Number(i.column_index) === 2),
      col3: items.filter(i => Number(i.column_index) === 3)
    };

    return res.json({
      success: true,
      items,
      itemsByColumn,
      totalPublished: items.length
    });
  } catch (err) {
    console.error('Error fetching hero bento items:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/hero-bento/admin/all
 * Admin endpoint: Returns all items (published + hidden) with summary statistics
 */
router.get('/admin/all', requireAuth, async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM hero_bento
      WHERE is_deleted = FALSE
      ORDER BY column_index ASC, display_order ASC, id ASC
    `);

    const items = result.rows || [];

    const runningImages = items.filter(i => i.status === 'published' && i.media_type === 'image');
    const runningVideos = items.filter(i => i.status === 'published' && i.media_type === 'video');
    const hiddenItems = items.filter(i => i.status === 'hidden');

    const stats = {
      total: items.length,
      runningImagesCount: runningImages.length,
      runningVideosCount: runningVideos.length,
      totalPublished: runningImages.length + runningVideos.length,
      hiddenCount: hiddenItems.length,
      col1Count: items.filter(i => Number(i.column_index) === 1).length,
      col2Count: items.filter(i => Number(i.column_index) === 2).length,
      col3Count: items.filter(i => Number(i.column_index) === 3).length
    };

    return res.json({
      success: true,
      items,
      stats,
      runningItemsSummary: {
        images: runningImages.map(i => ({ id: i.id, name: i.name, url: i.media_url, col: i.column_index, order: i.display_order })),
        videos: runningVideos.map(i => ({ id: i.id, name: i.name, url: i.media_url, poster: i.poster_url, col: i.column_index, order: i.display_order }))
      }
    });
  } catch (err) {
    console.error('Error fetching admin hero bento:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/hero-bento
 * Admin endpoint: Create a new hero bento item
 */
router.post('/', requireAuth, async (req, res) => {
  const {
    name,
    media_type = 'image',
    media_url,
    poster_url = '',
    column_index = 1,
    display_order = 0,
    status = 'published'
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Section / Item Name is required.' });
  }

  if (!media_url || !media_url.trim()) {
    return res.status(400).json({ success: false, error: 'Image or Video media upload is required.' });
  }

  const validTypes = ['image', 'video'];
  const cleanType = validTypes.includes(media_type.toLowerCase()) ? media_type.toLowerCase() : 'image';
  const cleanCol = Math.min(Math.max(parseInt(column_index, 10) || 1, 1), 3);
  const cleanStatus = status === 'hidden' ? 'hidden' : 'published';

  try {
    const insertRes = await query(`
      INSERT INTO hero_bento (name, media_type, media_url, poster_url, column_index, display_order, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name.trim(), cleanType, media_url.trim(), poster_url.trim(), cleanCol, parseInt(display_order, 10) || 0, cleanStatus]);

    const createdItem = insertRes.rows[0];

    await recordAudit(req, {
      action: 'CREATE',
      module: 'Hero Bento',
      recordId: String(createdItem?.id || ''),
      description: `Admin added ${cleanType} to Hero Bento (Col ${cleanCol}): "${name.trim()}"`,
      details: { name: name.trim(), media_type: cleanType, column_index: cleanCol, status: cleanStatus }
    });

    return res.status(201).json({
      success: true,
      message: 'Hero Bento media item added successfully',
      item: createdItem
    });
  } catch (err) {
    console.error('Error creating hero bento item:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/hero-bento/:id
 * Admin endpoint: Update an existing hero bento item
 */
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const {
    name,
    media_type,
    media_url,
    poster_url,
    column_index,
    display_order,
    status
  } = req.body;

  try {
    const existing = await query('SELECT * FROM hero_bento WHERE id = $1 AND is_deleted = FALSE', [id]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Hero Bento item not found.' });
    }

    const current = existing.rows[0];

    const newName = name !== undefined ? name.trim() : current.name;
    const newMediaType = media_type !== undefined ? media_type.toLowerCase() : current.media_type;
    const newMediaUrl = media_url !== undefined ? media_url.trim() : current.media_url;
    const newPosterUrl = poster_url !== undefined ? poster_url.trim() : current.poster_url;
    const newColumn = column_index !== undefined ? Math.min(Math.max(parseInt(column_index, 10) || 1, 1), 3) : current.column_index;
    const newOrder = display_order !== undefined ? parseInt(display_order, 10) || 0 : current.display_order;
    const newStatus = status !== undefined ? (status === 'hidden' ? 'hidden' : 'published') : current.status;

    const updateRes = await query(`
      UPDATE hero_bento SET
        name = $1,
        media_type = $2,
        media_url = $3,
        poster_url = $4,
        column_index = $5,
        display_order = $6,
        status = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [newName, newMediaType, newMediaUrl, newPosterUrl, newColumn, newOrder, newStatus, id]);

    await recordAudit(req, {
      action: 'UPDATE',
      module: 'Hero Bento',
      recordId: String(id),
      description: `Admin updated Hero Bento item: "${newName}" (Col ${newColumn}, ${newStatus})`,
      details: { id, name: newName, media_type: newMediaType, column_index: newColumn, status: newStatus }
    });

    return res.json({
      success: true,
      message: 'Hero Bento item updated successfully',
      item: updateRes.rows[0]
    });
  } catch (err) {
    console.error('Error updating hero bento item:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/hero-bento/:id/toggle
 * Admin endpoint: Quick toggle published/hidden
 */
router.patch('/:id/toggle', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await query('SELECT * FROM hero_bento WHERE id = $1 AND is_deleted = FALSE', [id]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Hero Bento item not found.' });
    }

    const item = existing.rows[0];
    const newStatus = item.status === 'published' ? 'hidden' : 'published';

    await query(`
      UPDATE hero_bento SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [newStatus, id]);

    await recordAudit(req, {
      action: 'TOGGLE_STATUS',
      module: 'Hero Bento',
      recordId: String(id),
      description: `Admin changed status to ${newStatus.toUpperCase()} for item: "${item.name}"`
    });

    return res.json({
      success: true,
      message: `Item is now ${newStatus}`,
      status: newStatus
    });
  } catch (err) {
    console.error('Error toggling status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/hero-bento/:id
 * Admin endpoint: Soft delete hero bento item
 */
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await query('SELECT * FROM hero_bento WHERE id = $1 AND is_deleted = FALSE', [id]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Hero Bento item not found.' });
    }

    const item = existing.rows[0];

    await query('UPDATE hero_bento SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    await recordAudit(req, {
      action: 'DELETE',
      module: 'Hero Bento',
      recordId: String(id),
      description: `Admin removed item from Hero Bento: "${item.name}" (Col ${item.column_index})`
    });

    return res.json({ success: true, message: 'Hero Bento item deleted successfully' });
  } catch (err) {
    console.error('Error deleting hero bento item:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/hero-bento/reorder
 * Admin endpoint: Batch reorder display orders
 */
router.post('/reorder', requireAuth, async (req, res) => {
  const { items } = req.body; // Array of { id, display_order, column_index }

  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, error: 'Items array is required for reordering.' });
  }

  try {
    for (const item of items) {
      if (item.id) {
        await query(`
          UPDATE hero_bento SET
            display_order = COALESCE($1, display_order),
            column_index = COALESCE($2, column_index),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `, [parseInt(item.display_order, 10) || 0, parseInt(item.column_index, 10) || 1, item.id]);
      }
    }

    await recordAudit(req, {
      action: 'REORDER',
      module: 'Hero Bento',
      description: `Admin updated display order for ${items.length} Hero Bento items`
    });

    return res.json({ success: true, message: 'Hero Bento order updated successfully' });
  } catch (err) {
    console.error('Error reordering hero bento:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
