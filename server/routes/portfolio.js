import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { recordAudit } from '../middleware/audit.js';

const router = express.Router();

/**
 * GET /api/portfolio
 * Public and Admin endpoint: returns portfolio list. Supports category, status, and search query filters.
 */
router.get('/', async (req, res) => {
  const { category, status, search, limit = 50, offset = 0 } = req.query;

  try {
    let sql = 'SELECT * FROM portfolio_projects WHERE is_deleted = FALSE';
    const params = [];
    let paramIndex = 1;

    if (category && category !== 'All') {
      sql += ` AND LOWER(category) = LOWER($${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    if (status && status !== 'All') {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search && search.trim() !== '') {
      sql += ` AND (LOWER(title) LIKE $${paramIndex} OR LOWER(brand) LIKE $${paramIndex} OR LOWER(short_description) LIKE $${paramIndex})`;
      params.push(`%${search.trim().toLowerCase()}%`);
      paramIndex++;
    }

    sql += ` ORDER BY display_order ASC, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await query(sql, params);

    // Format JSON fields safely for both PostgreSQL & SQLite
    const projects = (result.rows || []).map(p => ({
      ...p,
      services: typeof p.services === 'string' ? JSON.parse(p.services || '[]') : (p.services || []),
      metrics: typeof p.metrics === 'string' ? JSON.parse(p.metrics || '[]') : (p.metrics || []),
    }));

    return res.json({
      success: true,
      projects,
      total: projects.length
    });
  } catch (err) {
    console.error('Portfolio list error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/portfolio/:id (or slug)
 * Returns a specific portfolio project including its Case Study Sections
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const projectRes = await query(
      'SELECT * FROM portfolio_projects WHERE (id = $1 OR slug = $1) AND is_deleted = FALSE',
      [id]
    );

    if (!projectRes.rows || projectRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const project = projectRes.rows[0];
    project.services = typeof project.services === 'string' ? JSON.parse(project.services || '[]') : (project.services || []);
    project.metrics = typeof project.metrics === 'string' ? JSON.parse(project.metrics || '[]') : (project.metrics || []);

    const sectionsRes = await query(
      'SELECT * FROM portfolio_sections WHERE project_id = $1 ORDER BY display_order ASC, id ASC',
      [project.id]
    );

    return res.json({
      success: true,
      project: {
        ...project,
        sections: sectionsRes.rows || []
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/portfolio
 * Protected: Creates a new portfolio project and default case study sections
 */
router.post('/', requireAuth, async (req, res) => {
  const {
    id: rawId,
    title,
    brand,
    slug: rawSlug,
    category = 'Branding',
    year = '2026',
    status = 'published',
    short_description = '',
    cover_image = '',
    featured_image = '',
    logo_url = '',
    services = ['branding', 'social'],
    industry = 'Beauty & Wellness',
    market = 'Sri Lanka & UAE',
    location = 'Colombo, Sri Lanka',
    challenge = '',
    approach = '',
    deliverables = '',
    metrics = ['+240% Sales Growth', '4.8x Ad ROI', '1.2M+ Reach'],
    display_order: rawDisplayOrder = 0,
    sections = []
  } = req.body;

  if (!title || !brand) {
    return res.status(400).json({ success: false, error: 'Title and Brand Name are required.' });
  }

  const slug = (rawSlug || brand.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '');
  const id = rawId || slug || `proj-${Date.now()}`;

  try {
    let display_order = parseInt(rawDisplayOrder, 10);
    if (!display_order || display_order <= 0) {
      const maxOrderRes = await query('SELECT COALESCE(MAX(display_order), 0) as max_order FROM portfolio_projects WHERE is_deleted = FALSE');
      display_order = (parseInt(maxOrderRes.rows[0]?.max_order || 0, 10)) + 1;
    }

    const servicesStr = typeof services === 'string' ? services : JSON.stringify(services);
    const metricsStr = typeof metrics === 'string' ? metrics : JSON.stringify(metrics);

    await query(`
      INSERT INTO portfolio_projects (
        id, slug, brand, title, category, year, status,
        short_description, cover_image, featured_image, logo_url,
        services, industry, market, location, challenge, approach, deliverables, metrics, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    `, [
      id, slug, brand, title, category, year, status,
      short_description, cover_image, featured_image, logo_url,
      servicesStr, industry, market, location, challenge, approach, deliverables, metricsStr, display_order
    ]);

    // Handle sections
    const defaultSections = sections.length > 0 ? sections : [
      { section_key: 'overview', title: 'Executive Overview', content: short_description || `Case study for ${brand}`, is_enabled: true, display_order: 1 },
      { section_key: 'challenge', title: 'The Challenge', content: challenge || '', is_enabled: true, display_order: 2 },
      { section_key: 'approach', title: 'The Approach', content: approach || '', is_enabled: true, display_order: 3 },
      { section_key: 'deliverables', title: 'Deliverables', content: deliverables || '', is_enabled: true, display_order: 4 },
      { section_key: 'results', title: 'Key Results & Impact', content: '', is_enabled: true, display_order: 5 },
    ];

    for (const s of defaultSections) {
      await query(`
        INSERT INTO portfolio_sections (project_id, section_key, title, content, is_enabled, display_order)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [id, s.section_key || 'custom', s.title, s.content || '', s.is_enabled ?? true, s.display_order || 1]);
    }

    await recordAudit(req, {
      action: 'CREATE',
      module: 'Portfolio',
      recordId: id,
      description: `Admin created new portfolio project: ${title} (${brand})`,
      details: { id, title, brand, category, status }
    });

    return res.status(201).json({
      success: true,
      message: 'Portfolio project created successfully',
      projectId: id
    });
  } catch (err) {
    console.error('Create portfolio error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/portfolio/:id
 * Protected: Updates an existing portfolio project and its case study sections
 */
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    brand,
    slug,
    category,
    year,
    status,
    short_description,
    cover_image,
    featured_image,
    logo_url,
    services,
    industry,
    market,
    location,
    challenge,
    approach,
    deliverables,
    metrics,
    display_order,
    sections
  } = req.body;

  try {
    const existing = await query('SELECT * FROM portfolio_projects WHERE id = $1 AND is_deleted = FALSE', [id]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const servicesStr = typeof services === 'string' ? services : JSON.stringify(services || []);
    const metricsStr = typeof metrics === 'string' ? metrics : JSON.stringify(metrics || []);

    await query(`
      UPDATE portfolio_projects SET
        title = COALESCE($1, title),
        brand = COALESCE($2, brand),
        slug = COALESCE($3, slug),
        category = COALESCE($4, category),
        year = COALESCE($5, year),
        status = COALESCE($6, status),
        short_description = COALESCE($7, short_description),
        cover_image = COALESCE($8, cover_image),
        featured_image = COALESCE($9, featured_image),
        logo_url = COALESCE($10, logo_url),
        services = COALESCE($11, services),
        industry = COALESCE($12, industry),
        market = COALESCE($13, market),
        location = COALESCE($14, location),
        challenge = COALESCE($15, challenge),
        approach = COALESCE($16, approach),
        deliverables = COALESCE($17, deliverables),
        metrics = COALESCE($18, metrics),
        display_order = COALESCE($19, display_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $20
    `, [
      title, brand, slug, category, year, status,
      short_description, cover_image, featured_image, logo_url,
      servicesStr, industry, market, location, challenge, approach, deliverables,
      metricsStr, display_order, id
    ]);

    // Update sections if provided
    if (Array.isArray(sections)) {
      await query('DELETE FROM portfolio_sections WHERE project_id = $1', [id]);
      for (let i = 0; i < sections.length; i++) {
        const s = sections[i];
        await query(`
          INSERT INTO portfolio_sections (project_id, section_key, title, content, is_enabled, display_order)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [id, s.section_key || `sec-${i}`, s.title, s.content || '', s.is_enabled ?? true, s.display_order ?? i + 1]);
      }
    }

    await recordAudit(req, {
      action: 'UPDATE',
      module: 'Portfolio',
      recordId: id,
      description: `Admin updated portfolio project: ${title || brand}`,
      details: { id, title, brand, status }
    });

    return res.json({
      success: true,
      message: 'Project updated successfully'
    });
  } catch (err) {
    console.error('Update portfolio error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/portfolio/:id/publish
 * Toggle publish status
 */
router.patch('/:id/publish', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'published' or 'draft'

  try {
    await query('UPDATE portfolio_projects SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, id]);
    await recordAudit(req, {
      action: status === 'published' ? 'PUBLISH' : 'UNPUBLISH',
      module: 'Portfolio',
      recordId: id,
      description: `Admin ${status === 'published' ? 'published' : 'unpublished'} project: ${id}`
    });
    return res.json({ success: true, message: `Project status set to ${status}` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/portfolio/:id
 * Soft delete project with audit log
 */
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await query('UPDATE portfolio_projects SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    await recordAudit(req, {
      action: 'DELETE',
      module: 'Portfolio',
      recordId: id,
      description: `Admin soft-deleted portfolio project: ${id}`
    });
    return res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
