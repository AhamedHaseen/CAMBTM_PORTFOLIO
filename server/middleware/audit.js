import { query } from '../config/db.js';

/**
 * Normalizes IP addresses, converting ::ffff:127.0.0.1 to clean 127.0.0.1
 */
export function normalizeIp(ip) {
  if (!ip) return '127.0.0.1';
  let cleaned = String(ip).trim();
  if (cleaned.includes(',')) {
    cleaned = cleaned.split(',')[0].trim();
  }
  if (cleaned.startsWith('::ffff:')) {
    cleaned = cleaned.replace('::ffff:', '');
  }
  if (cleaned === '::1' || cleaned === 'localhost') {
    return '127.0.0.1';
  }
  return cleaned;
}

/**
 * Record an action to the Audit Logs table
 */
export async function recordAudit(req, { action, module, recordId = '', description = '', details = {} }) {
  try {
    const adminUser = req?.user?.full_name || req?.user?.email || 'System';
    const rawIp = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || req?.ip || '127.0.0.1';
    const ipAddress = normalizeIp(rawIp);
    const userAgent = req?.headers['user-agent'] || 'Unknown Agent';
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details);

    await query(`
      INSERT INTO audit_logs (admin_user, action, module, record_id, description, details, ip_address, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
    `, [adminUser, action, module, String(recordId), description, detailsStr, String(ipAddress), String(userAgent)]);
  } catch (err) {
    console.error('⚠️ Failed to record audit log:', err.message);
  }
}

/**
 * Record a login attempt to the Login Logs table
 */
export async function recordLoginLog(req, { email, status, adminUser = 'Admin' }) {
  try {
    const rawIp = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || req?.ip || '127.0.0.1';
    const ipAddress = normalizeIp(rawIp);
    const userAgent = req?.headers['user-agent'] || '';
    
    // Parse device and browser
    let device = 'Desktop';
    if (/mobile/i.test(userAgent)) device = 'Mobile';
    else if (/tablet|ipad/i.test(userAgent)) device = 'Tablet';

    let browser = 'Browser';
    if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) browser = 'Chrome';
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
    else if (/firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/edg/i.test(userAgent)) browser = 'Edge';

    await query(`
      INSERT INTO login_logs (admin_user, email, ip_address, device, browser, status, login_time, logout_time)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, NULL)
    `, [adminUser, email, String(ipAddress), device, browser, status]);
  } catch (err) {
    console.error('⚠️ Failed to record login log:', err.message);
  }
}

/**
 * Record user logout timestamp on their active login session
 */
export async function recordLogout(email) {
  try {
    await query(`
      UPDATE login_logs 
      SET logout_time = CURRENT_TIMESTAMP 
      WHERE id = (
        SELECT id FROM login_logs 
        WHERE LOWER(email) = LOWER($1) AND status = 'SUCCESS' AND logout_time IS NULL 
        ORDER BY login_time DESC 
        LIMIT 1
      )
    `, [email]);
  } catch (err) {
    console.error('⚠️ Failed to record logout time:', err.message);
  }
}

export default {
  recordAudit,
  recordLoginLog,
  recordLogout
};
