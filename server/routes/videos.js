import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { recordAudit } from '../middleware/audit.js';

const router = express.Router();

/**
 * GET /api/videos
 * Fetch all videos
 */
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM videos ORDER BY is_hero DESC, display_order ASC, created_at DESC');
    const videos = (result.rows || []).map(v => ({
      ...v,
      placements: typeof v.placements === 'string' ? JSON.parse(v.placements || '[]') : (v.placements || []),
      is_hero: Boolean(v.is_hero),
      autoplay: Boolean(v.autoplay),
      loop: Boolean(v.loop),
      muted: Boolean(v.muted),
      controls: Boolean(v.controls),
      is_published: Boolean(v.is_published)
    }));
    return res.json({ success: true, videos });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/videos/hero
 * Public endpoint: Returns the currently active Hero Video configuration for the Home Page
 */
router.get('/hero', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM videos
      WHERE is_hero = TRUE AND is_published = TRUE
      ORDER BY updated_at DESC LIMIT 1
    `);

    if (result.rows && result.rows.length > 0) {
      const hero = result.rows[0];
      return res.json({
        success: true,
        hero: {
          ...hero,
          is_hero: true,
          autoplay: Boolean(hero.autoplay),
          loop: Boolean(hero.loop),
          muted: Boolean(hero.muted),
          controls: Boolean(hero.controls),
        }
      });
    }

    // Default fallback hero if none designated in database
    return res.json({
      success: true,
      hero: {
        title: 'Cambridge Marketing Default Hero',
        video_url: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41228-large.mp4',
        video_type: 'html5',
        poster_url: 'images/hero-poster.jpg',
        autoplay: true,
        loop: true,
        muted: true,
        controls: false,
        is_hero: true
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/videos
 */
router.post('/', requireAuth, async (req, res) => {
  const {
    title,
    description = '',
    video_url,
    video_type = 'html5',
    poster_url = '',
    is_hero = false,
    autoplay = true,
    loop = true,
    muted = true,
    controls = false,
    placements = ['Homepage Hero'],
    display_order = 0,
    is_published = true
  } = req.body;

  if (!title || !video_url) {
    return res.status(400).json({ success: false, error: 'Title and Video URL are required.' });
  }

  try {
    const placementsStr = typeof placements === 'string' ? placements : JSON.stringify(placements);

    // If marked as hero, reset other hero flags
    if (is_hero) {
      await query('UPDATE videos SET is_hero = FALSE WHERE is_hero = TRUE');
    }

    await query(`
      INSERT INTO videos (
        title, description, video_url, video_type, poster_url,
        is_hero, autoplay, loop, muted, controls, placements,
        display_order, is_published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      title, description, video_url, video_type, poster_url,
      is_hero, autoplay, loop, muted, controls, placementsStr,
      display_order, is_published
    ]);

    await recordAudit(req, {
      action: 'CREATE',
      module: 'Videos',
      description: `Admin uploaded video: ${title} (Hero: ${is_hero})`
    });

    return res.status(201).json({ success: true, message: 'Video created successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/videos/:id
 */
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    video_url,
    video_type,
    poster_url,
    is_hero,
    autoplay,
    loop,
    muted,
    controls,
    placements,
    display_order,
    is_published
  } = req.body;

  try {
    const placementsStr = typeof placements === 'string' ? placements : JSON.stringify(placements || []);

    if (is_hero) {
      await query('UPDATE videos SET is_hero = FALSE WHERE id != $1', [id]);
    }

    await query(`
      UPDATE videos SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        video_url = COALESCE($3, video_url),
        video_type = COALESCE($4, video_type),
        poster_url = COALESCE($5, poster_url),
        is_hero = COALESCE($6, is_hero),
        autoplay = COALESCE($7, autoplay),
        loop = COALESCE($8, loop),
        muted = COALESCE($9, muted),
        controls = COALESCE($10, controls),
        placements = COALESCE($11, placements),
        display_order = COALESCE($12, display_order),
        is_published = COALESCE($13, is_published),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
    `, [
      title, description, video_url, video_type, poster_url,
      is_hero, autoplay, loop, muted, controls, placementsStr,
      display_order, is_published, id
    ]);

    await recordAudit(req, {
      action: 'UPDATE',
      module: 'Videos',
      recordId: String(id),
      description: `Admin updated video ID: ${id} (${title})`
    });

    return res.json({ success: true, message: 'Video updated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/videos/:id/set-hero
 * Dedicated Hero Video Switcher
 */
router.put('/:id/set-hero', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { autoplay = true, loop = true, muted = true, controls = false } = req.body;

  try {
    await query('UPDATE videos SET is_hero = FALSE');
    await query(`
      UPDATE videos SET
        is_hero = TRUE,
        autoplay = $1,
        loop = $2,
        muted = $3,
        controls = $4,
        is_published = TRUE,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `, [autoplay, loop, muted, controls, id]);

    await recordAudit(req, {
      action: 'SET_HERO_VIDEO',
      module: 'Videos',
      recordId: String(id),
      description: `Admin designated video ID: ${id} as the active Homepage Hero Video`
    });

    return res.json({ success: true, message: 'Hero Video updated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/videos/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM videos WHERE id = $1', [id]);
    await recordAudit(req, {
      action: 'DELETE',
      module: 'Videos',
      recordId: String(id),
      description: `Admin deleted video: ${id}`
    });
    return res.json({ success: true, message: 'Video deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
