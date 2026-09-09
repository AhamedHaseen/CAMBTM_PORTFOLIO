import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const JWT_SECRET = process.env.JWT_SECRET || 'cambm_super_secure_jwt_secret_key_2026_@cambridge_marketing!';

/**
 * Authentication Middleware: Validates JWT from cookie or Authorization header
 */
export async function requireAuth(req, res, next) {
  try {
    let token = req.cookies?.cambm_token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: No session token provided. Please log in.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from DB to ensure still valid & not locked
    const result = await query('SELECT id, email, full_name, role, avatar, locked_until FROM users WHERE id = $1', [decoded.id]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User session invalid. Please log in again.'
      });
    }

    const user = result.rows[0];

    // Check account lockout
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(403).json({
        success: false,
        error: `Account is temporarily locked until ${new Date(user.locked_until).toLocaleTimeString()}. Please try again later.`
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Session expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token.'
    });
  }
}

/**
 * Superadmin-only Authorization Middleware
 */
export function requireSuperadmin(req, res, next) {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Superadmin access required.'
    });
  }
  next();
}

export function generateToken(user, rememberMe = false) {
  const expiresIn = rememberMe ? '30d' : '24h';
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.full_name
    },
    JWT_SECRET,
    { expiresIn }
  );
}

export const authenticateToken = requireAuth;

export default {
  requireAuth,
  authenticateToken,
  requireSuperadmin,
  generateToken
};
