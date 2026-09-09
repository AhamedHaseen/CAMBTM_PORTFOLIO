import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/login-history
 * Fetch paginated login logs
 */
router.get('/', requireAuth, async (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;
  try {
    let sql = 'SELECT * FROM login_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status && status !== 'All') {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY login_time DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await query(sql, params);
    const countRes = await query('SELECT COUNT(*) as count FROM login_logs');

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
