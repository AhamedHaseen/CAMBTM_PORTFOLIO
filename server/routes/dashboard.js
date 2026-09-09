import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/dashboard/summary
 * Aggregates all KPI counts and recent activity for the Admin Dashboard
 */
router.get('/summary', requireAuth, async (req, res) => {
  try {
    // 1. Projects KPI
    const totalProjectsRes = await query('SELECT COUNT(*) as count FROM portfolio_projects WHERE is_deleted = FALSE');
    const pubProjectsRes = await query("SELECT COUNT(*) as count FROM portfolio_projects WHERE is_deleted = FALSE AND status = 'published'");
    const draftProjectsRes = await query("SELECT COUNT(*) as count FROM portfolio_projects WHERE is_deleted = FALSE AND status != 'published'");

    // 2. Creatives KPI
    const totalCreativesRes = await query('SELECT COUNT(*) as count FROM creatives');

    // 3. Videos KPI
    const totalVideosRes = await query('SELECT COUNT(*) as count FROM videos');

    // 4. Brands KPI
    const totalBrandsRes = await query('SELECT COUNT(*) as count FROM brands WHERE is_deleted = FALSE');

    // 5. Hero Bento KPI
    const totalHeroBentoRes = await query('SELECT COUNT(*) as count FROM hero_bento WHERE is_deleted = FALSE');
    const runningImagesRes = await query("SELECT COUNT(*) as count FROM hero_bento WHERE is_deleted = FALSE AND status = 'published' AND media_type = 'image'");
    const runningVideosRes = await query("SELECT COUNT(*) as count FROM hero_bento WHERE is_deleted = FALSE AND status = 'published' AND media_type = 'video'");

    // 6. Recent Activity (Audit logs)
    const recentActivityRes = await query(`
      SELECT id, admin_user, action, module, record_id, description, created_at
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 6
    `);

    // 7. Recent Login History
    const recentLoginsRes = await query(`
      SELECT id, admin_user, email, ip_address, device, browser, status, login_time
      FROM login_logs
      ORDER BY login_time DESC
      LIMIT 6
    `);

    return res.json({
      success: true,
      stats: {
        totalProjects: parseInt(totalProjectsRes.rows[0]?.count || 0, 10),
        publishedProjects: parseInt(pubProjectsRes.rows[0]?.count || 0, 10),
        draftProjects: parseInt(draftProjectsRes.rows[0]?.count || 0, 10),
        totalCreatives: parseInt(totalCreativesRes.rows[0]?.count || 0, 10),
        totalVideos: parseInt(totalVideosRes.rows[0]?.count || 0, 10),
        totalBrands: parseInt(totalBrandsRes.rows[0]?.count || 0, 10),
        totalHeroBento: parseInt(totalHeroBentoRes.rows[0]?.count || 0, 10),
        runningHeroImages: parseInt(runningImagesRes.rows[0]?.count || 0, 10),
        runningHeroVideos: parseInt(runningVideosRes.rows[0]?.count || 0, 10)
      },
      recentActivity: recentActivityRes.rows || [],
      recentLogins: recentLoginsRes.rows || []
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
