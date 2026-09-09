import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { recordAudit } from '../middleware/audit.js';

const router = express.Router();

// Middleware to ensure user is logged in
router.use(requireAuth);

/**
 * GET /api/users
 * List all users
 */
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, email, full_name, role, avatar, status, two_factor_enabled, permissions, created_at, updated_at
      FROM users
      ORDER BY id ASC
    `);

    const users = (result.rows || []).map(u => {
      let permissions = ['*'];
      try {
        permissions = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : (u.permissions || ['*']);
      } catch (e) {
        permissions = ['*'];
      }
      return {
        ...u,
        permissions,
        two_factor_enabled: Boolean(u.two_factor_enabled)
      };
    });

    return res.json({
      success: true,
      users
    });
  } catch (err) {
    console.error('Fetch users error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/users
 * Create a new user profile
 */
router.post('/', async (req, res) => {
  const { email, password, full_name, role, permissions, status } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'A user with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const permsJson = JSON.stringify(Array.isArray(permissions) ? permissions : ['*']);

    const result = await query(`
      INSERT INTO users (email, password_hash, full_name, role, permissions, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, email, full_name, role, status, created_at
    `, [cleanEmail, password_hash, full_name || 'Staff Member', role || 'editor', permsJson, status || 'active']);

    const newUser = result.rows[0];

    await recordAudit(req, {
      action: 'CREATE',
      module: 'User Management',
      recordId: String(newUser.id),
      description: `Created new admin/staff profile: ${cleanEmail} (Role: ${role || 'editor'})`
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser
    });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/users/:id
 * Update user profile, role, permissions, or password
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { email, full_name, role, permissions, status, password } = req.body;

  try {
    const existing = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const current = existing.rows[0];
    let password_hash = current.password_hash;
    if (password && password.trim().length >= 8) {
      const salt = await bcrypt.genSalt(10);
      password_hash = await bcrypt.hash(password.trim(), salt);
    }

    const cleanEmail = email ? email.trim().toLowerCase() : current.email;
    const permsJson = permissions !== undefined 
      ? JSON.stringify(Array.isArray(permissions) ? permissions : ['*'])
      : current.permissions;

    await query(`
      UPDATE users 
      SET email = $1, full_name = $2, role = $3, permissions = $4, status = $5, password_hash = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `, [cleanEmail, full_name || current.full_name, role || current.role, permsJson, status || current.status, password_hash, id]);

    await recordAudit(req, {
      action: 'UPDATE',
      module: 'User Management',
      recordId: String(id),
      description: `Updated user account details: ${cleanEmail} (Role: ${role || current.role})`
    });

    return res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user profile
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (parseInt(id, 10) === req.user.id) {
    return res.status(400).json({ success: false, error: 'You cannot delete your own active administrator profile.' });
  }

  try {
    const target = await query('SELECT email, full_name FROM users WHERE id = $1', [id]);
    if (!target.rows || target.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const deletedUser = target.rows[0];

    await query('DELETE FROM users WHERE id = $1', [id]);

    await recordAudit(req, {
      action: 'DELETE',
      module: 'User Management',
      recordId: String(id),
      description: `Deleted user profile: ${deletedUser.email} (${deletedUser.full_name})`
    });

    return res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
