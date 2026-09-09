import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/audit-logs
 * Fetch paginated audit logs with search and module filters
 */
router.get('/', requireAuth, async (req, res) => {
  const { module, action, search, limit = 50, offset = 0 } = req.query;
  try {
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (module && module !== 'All') {
      sql += ` AND module = $${paramIndex}`;
      params.push(module);
      paramIndex++;
    }

    if (action && action !== 'All') {
      sql += ` AND action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }

    if (search && search.trim() !== '') {
      sql += ` AND (LOWER(description) LIKE $${paramIndex} OR LOWER(admin_user) LIKE $${paramIndex})`;
      params.push(`%${search.trim().toLowerCase()}%`);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await query(sql, params);
    const countRes = await query('SELECT COUNT(*) as count FROM audit_logs');

    return res.json({
      success: true,
      logs: result.rows || [],
      total: parseInt(countRes.rows[0]?.count || 0, 10)
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
