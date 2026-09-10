import express from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { generateToken, requireAuth, JWT_SECRET } from '../middleware/auth.js';
import { recordAudit, recordLoginLog, recordLogout } from '../middleware/audit.js';
import { generateBase32Secret, generateRecoveryCodes, verifyTOTP, getOtpAuthUrl } from '../utils/totp.js';
import { sendPasswordResetAlert, sendForgotPasswordNotification, sendTwoFactorOtpEmail, getActiveSmtpConfig } from '../utils/mailer.js';

const router = express.Router();

// Strict rate limiter for login endpoint to prevent brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // max 10 attempts per IP
  message: {
    success: false,
    error: 'Too many login attempts from this IP. Please try again after 10 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/auth/login
 */
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both email and password.'
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const userResult = await query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);

    if (!userResult.rows || userResult.rows.length === 0) {
      await recordLoginLog(req, { email: cleanEmail, status: 'FAILED' });
      await recordAudit(req, { action: 'FAILED_LOGIN', module: 'Auth', description: `Failed login attempt for unknown email: ${cleanEmail}` });
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const user = userResult.rows[0];

    // Check if account is suspended
    if (user.status === 'suspended') {
      await recordLoginLog(req, { email: cleanEmail, status: 'SUSPENDED', adminUser: user.full_name });
      return res.status(403).json({
        success: false,
        error: 'This account has been suspended by an administrator.'
      });
    }

    // Check if account is temporarily locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const waitMinutes = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      await recordLoginLog(req, { email: cleanEmail, status: 'LOCKED', adminUser: user.full_name });
      return res.status(403).json({
        success: false,
        error: `Account is locked due to multiple failed attempts. Try again in ${waitMinutes} minute(s).`
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      const failedCount = (user.failed_attempts || 0) + 1;
      let lockTime = null;

      // Lock account after 3 consecutive failed attempts for 10 minutes
      if (failedCount >= 3) {
        lockTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      }

      await query('UPDATE users SET failed_attempts = $1, locked_until = $2 WHERE id = $3', [failedCount, lockTime, user.id]);
      await recordLoginLog(req, { email: cleanEmail, status: 'FAILED', adminUser: user.full_name });
      await recordAudit(req, { action: 'FAILED_LOGIN', module: 'Auth', recordId: String(user.id), description: `Failed password attempt for user: ${cleanEmail} (Attempt ${failedCount}/3)` });

      const remainingAttempts = Math.max(0, 3 - failedCount);
      return res.status(401).json({
        success: false,
        error: remainingAttempts > 0
          ? `Invalid password. ${remainingAttempts} attempt(s) remaining before account lockout.`
          : 'Account has been locked for 10 minutes due to 3 consecutive failed attempts.'
      });
    }

    // Check if 2FA is enabled (per user or globally via SMTP configuration)
    const smtpConfig = getActiveSmtpConfig(false);
    const is2FAEnabled = Boolean(user.two_factor_enabled || smtpConfig.twoFactorEnabled);
    const twoFactorMethod = user.two_factor_method || smtpConfig.twoFactorMethod || 'email';

    if (is2FAEnabled) {
      if (twoFactorMethod === 'email') {
        // Generate 6-digit numeric OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await query('UPDATE users SET email_otp_code = $1, email_otp_expires_at = $2 WHERE id = $3', [otpCode, expiresAt, user.id]);

        // Determine destination inbox (if user.email is demo/placeholder like cambm.com, fallback to active SMTP user or notify email)
        let deliveryEmail = user.email;
        if ((user.email.endsWith('@cambm.com') || user.email.endsWith('@cambt.com') || user.email.endsWith('@example.com')) && (smtpConfig.user || process.env.ADMIN_NOTIFY_EMAIL)) {
          deliveryEmail = smtpConfig.user || process.env.ADMIN_NOTIFY_EMAIL;
        }

        // Dispatch OTP via SMTP to verified inbox
        sendTwoFactorOtpEmail({
          userEmail: deliveryEmail,
          userName: user.full_name,
          otpCode,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }).catch(e => console.error('⚠️ 2FA Email Dispatch error:', e.message));

        const tempToken = jwt.sign(
          { id: user.id, email: user.email, deliveryEmail, requires2FA: true, method: 'email', rememberMe: Boolean(rememberMe) },
          JWT_SECRET,
          { expiresIn: '10m' }
        );

        return res.json({
          success: true,
          requires2FA: true,
          method: 'email',
          email: deliveryEmail,
          tempToken,
          message: `A 6-digit verification code has been sent to ${deliveryEmail}.`
        });
      } else if (twoFactorMethod === 'totp' && user.two_factor_secret) {
        const tempToken = jwt.sign(
          { id: user.id, email: user.email, requires2FA: true, method: 'totp', rememberMe: Boolean(rememberMe) },
          JWT_SECRET,
          { expiresIn: '5m' }
        );

        return res.json({
          success: true,
          requires2FA: true,
          method: 'totp',
          tempToken,
          message: 'Two-Factor Authentication TOTP code required.'
        });
      }
    }

    // Successful login (when 2FA is disabled): reset failed attempts
    await query('UPDATE users SET failed_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = generateToken(user, rememberMe);

    // Set secure HTTP-only cookie
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    };

    res.cookie('cambm_token', token, cookieOptions);

    // Record login log and audit log
    await recordLoginLog(req, { email: cleanEmail, status: 'SUCCESS', adminUser: user.full_name });
    await recordAudit(req, { action: 'LOGIN', module: 'Auth', recordId: String(user.id), description: `Admin user logged in successfully: ${user.full_name}` });

    let permissions = ['*'];
    try {
      permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || ['*']);
    } catch (e) {
      permissions = ['*'];
    }

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar: user.avatar,
        two_factor_enabled: Boolean(user.two_factor_enabled || smtpConfig.twoFactorEnabled),
        two_factor_method: twoFactorMethod,
        permissions
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred during login.'
    });
  }
});

/**
 * POST /api/auth/resend-2fa-email
 * Resend 6-digit OTP code to user's login email
 */
router.post('/resend-2fa-email', async (req, res) => {
  const { tempToken } = req.body;

  if (!tempToken) {
    return res.status(400).json({ success: false, error: 'Temporary session token required.' });
  }

  try {
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    if (!decoded || !decoded.requires2FA) {
      return res.status(401).json({ success: false, error: 'Invalid or expired 2FA session token.' });
    }

    const userResult = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (!userResult.rows || userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const user = userResult.rows[0];
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await query('UPDATE users SET email_otp_code = $1, email_otp_expires_at = $2 WHERE id = $3', [otpCode, expiresAt, user.id]);

    const smtpConfig = getActiveSmtpConfig(false);
    let deliveryEmail = decoded.deliveryEmail || user.email;
    if ((deliveryEmail.endsWith('@cambm.com') || deliveryEmail.endsWith('@cambt.com') || deliveryEmail.endsWith('@example.com')) && (smtpConfig.user || process.env.ADMIN_NOTIFY_EMAIL)) {
      deliveryEmail = smtpConfig.user || process.env.ADMIN_NOTIFY_EMAIL;
    }

    await sendTwoFactorOtpEmail({
      userEmail: deliveryEmail,
      userName: user.full_name,
      otpCode,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.json({
      success: true,
      message: `A new 6-digit verification code has been dispatched to ${deliveryEmail}.`
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Failed to resend code: ' + err.message });
  }
});

/**
 * POST /api/auth/verify-2fa
 * Complete login using Email OTP code, 2FA TOTP code or Backup Recovery Code
 */
router.post('/verify-2fa', async (req, res) => {
  const { tempToken, code } = req.body;

  if (!tempToken || !code) {
    return res.status(400).json({ success: false, error: 'Temporary token and 2FA code are required.' });
  }

  try {
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    if (!decoded || !decoded.requires2FA) {
      return res.status(401).json({ success: false, error: 'Invalid or expired 2FA session token.' });
    }

    const userResult = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (!userResult.rows || userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const user = userResult.rows[0];
    const cleanCode = String(code || '').trim().replace(/[\s-]+/g, '');
    const dbOtp = String(user.email_otp_code || '').trim();

    console.log(`🔑 [2FA Verification] User: ${user.email} | Received: "${cleanCode}" | Expected: "${dbOtp}"`);

    let isValid = false;
    let authMethodUsed = 'Email OTP';

    // 1. Check Email OTP code if user has one (Session validity is cryptographically guaranteed by tempToken 10m lifetime)
    if (dbOtp && dbOtp === cleanCode) {
      isValid = true;
      authMethodUsed = 'Email OTP';
      // Clear OTP after successful use to prevent reuse
      await query('UPDATE users SET email_otp_code = NULL, email_otp_expires_at = NULL WHERE id = $1', [user.id]);
    }

    // 2. Check TOTP code if TOTP configured
    if (!isValid && user.two_factor_secret) {
      if (verifyTOTP(user.two_factor_secret, cleanCode)) {
        isValid = true;
        authMethodUsed = 'TOTP Authenticator';
      }
    }

    // 3. Check Backup Recovery Codes if other methods failed
    let usedRecoveryCode = false;
    let recoveryCodes = [];
    try {
      recoveryCodes = typeof user.recovery_codes === 'string' ? JSON.parse(user.recovery_codes) : (user.recovery_codes || []);
    } catch (e) {
      recoveryCodes = [];
    }

    if (!isValid && recoveryCodes.includes(cleanCode.toUpperCase())) {
      isValid = true;
      usedRecoveryCode = true;
      authMethodUsed = 'Backup Recovery Code';
      // Remove the used recovery code
      const remainingCodes = recoveryCodes.filter(c => c !== cleanCode.toUpperCase());
      await query('UPDATE users SET recovery_codes = $1 WHERE id = $2', [JSON.stringify(remainingCodes), user.id]);
    }

    if (!isValid) {
      await recordLoginLog(req, { email: user.email, status: 'FAILED_2FA', adminUser: user.full_name });
      await recordAudit(req, { action: 'FAILED_2FA', module: 'Auth', recordId: String(user.id), description: `Failed 2FA code attempt for user: ${user.email}` });
      return res.status(401).json({ success: false, error: 'Invalid verification code. Please try again or request a new code.' });
    }

    // Reset failed attempts upon successful 2FA
    await query('UPDATE users SET failed_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = generateToken(user, decoded.rememberMe);

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: decoded.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    };

    res.cookie('cambm_token', token, cookieOptions);

    await recordLoginLog(req, { email: user.email, status: 'SUCCESS', adminUser: user.full_name });
    await recordAudit(req, {
      action: 'LOGIN_2FA',
      module: 'Auth',
      recordId: String(user.id),
      description: `User verified 2FA (${authMethodUsed}) and logged in: ${user.full_name}`
    });

    let permissions = ['*'];
    try {
      permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || ['*']);
    } catch (e) {
      permissions = ['*'];
    }

    return res.json({
      success: true,
      message: '2FA authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar: user.avatar,
        two_factor_enabled: Boolean(user.two_factor_enabled),
        permissions
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, error: '2FA session expired. Please log in again.' });
  }
});

/**
 * POST /api/auth/setup-2fa
 * Generate a new secret and recovery codes for the logged in user
 */
router.post('/setup-2fa', requireAuth, async (req, res) => {
  try {
    const secret = generateBase32Secret(20);
    const recoveryCodes = generateRecoveryCodes(6);
    const otpAuthUrl = getOtpAuthUrl(req.user.email, secret, 'CambridgeMarketing');

    // Save temporary secret
    await query('UPDATE users SET two_factor_secret = $1, recovery_codes = $2 WHERE id = $3', [
      secret,
      JSON.stringify(recoveryCodes),
      req.user.id
    ]);

    return res.json({
      success: true,
      secret,
      otpAuthUrl,
      recoveryCodes
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/confirm-2fa
 * Verify and enable 2FA
 */
router.post('/confirm-2fa', requireAuth, async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: 'Verification code is required' });
  }

  try {
    const userRes = await query('SELECT two_factor_secret, recovery_codes FROM users WHERE id = $1', [req.user.id]);
    const user = userRes.rows[0];

    if (!user || !user.two_factor_secret) {
      return res.status(400).json({ success: false, error: '2FA setup was not initiated. Please start setup again.' });
    }

    const isValid = verifyTOTP(user.two_factor_secret, code);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid 6-digit code. Please enter the current code from your authenticator app.' });
    }

    await query('UPDATE users SET two_factor_enabled = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [req.user.id]);
    await recordAudit(req, {
      action: 'ENABLE_2FA',
      module: 'Security',
      recordId: String(req.user.id),
      description: `User enabled Two-Factor Authentication: ${req.user.email}`
    });

    return res.json({
      success: true,
      message: 'Two-Factor Authentication is now enabled on your account!'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/disable-2fa
 * Disable 2FA with password confirmation
 */
router.post('/disable-2fa', requireAuth, async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, error: 'Password is required to disable 2FA' });
  }

  try {
    const userRes = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const isMatch = await bcrypt.compare(password, userRes.rows[0]?.password_hash || '');
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Incorrect password' });
    }

    await query('UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = \'\', recovery_codes = \'[]\', updated_at = CURRENT_TIMESTAMP WHERE id = $1', [req.user.id]);
    await recordAudit(req, {
      action: 'DISABLE_2FA',
      module: 'Security',
      recordId: String(req.user.id),
      description: `User disabled Two-Factor Authentication: ${req.user.email}`
    });

    return res.json({
      success: true,
      message: 'Two-Factor Authentication has been disabled.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('cambm_token', { path: '/', sameSite: isProd ? 'none' : 'lax', secure: isProd });

    let token = req.cookies?.cambm_token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.id) {
          const userRes = await query('SELECT email, full_name FROM users WHERE id = $1', [decoded.id]);
          if (userRes.rows.length > 0) {
            await recordLogout(userRes.rows[0].email);
            await recordAudit(req, { action: 'LOGOUT', module: 'Auth', recordId: String(decoded.id), description: `Admin logged out: ${userRes.rows[0].full_name}` });
          }
        }
      } catch (e) {}
    }

    return res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userRes = await query('SELECT id, email, full_name, role, avatar, two_factor_enabled, permissions, status FROM users WHERE id = $1', [req.user.id]);
    if (!userRes.rows || userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const u = userRes.rows[0];
    let permissions = ['*'];
    try {
      permissions = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : (u.permissions || ['*']);
    } catch (e) {
      permissions = ['*'];
    }

    res.json({
      success: true,
      user: {
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        avatar: u.avatar,
        two_factor_enabled: Boolean(u.two_factor_enabled),
        permissions,
        status: u.status
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/auth/update-profile
 */
router.put('/update-profile', requireAuth, async (req, res) => {
  const { full_name, avatar } = req.body;
  try {
    await query(`
      UPDATE users SET full_name = $1, avatar = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [full_name || req.user.full_name, avatar || req.user.avatar, req.user.id]);

    await recordAudit(req, {
      action: 'UPDATE',
      module: 'Admin Profile',
      recordId: String(req.user.id),
      description: `Admin updated profile details: ${full_name}`
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/auth/change-password
 */
router.put('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Current and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, error: 'New password must be at least 8 characters long' });
  }

  try {
    const userRes = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const currentHash = userRes.rows[0]?.password_hash;

    const isMatch = await bcrypt.compare(currentPassword, currentHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, req.user.id]);

    await recordAudit(req, {
      action: 'CHANGE_PASSWORD',
      module: 'Auth',
      recordId: String(req.user.id),
      description: 'Admin user successfully changed account password'
    });

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email address is required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const userRes = await query('SELECT id, full_name, email, role, two_factor_enabled, created_at FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    const user = userRes.rows?.[0];

    // Extract device, IP and request telemetry
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Browser / Device';
    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Colombo',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    if (user) {
      await recordAudit(req, {
        action: 'PASSWORD_RESET_REQUEST',
        module: 'Auth',
        recordId: String(user.id),
        description: `Password reset requested for user: ${user.email} (${user.full_name}, Role: ${user.role || 'Staff'}) from IP: ${ip}`
      });

      // Automatically dispatch rich notification to main admin (ahamedhaseen2003@gmail.com)
      await sendForgotPasswordNotification({
        user,
        ip,
        userAgent,
        timestamp,
        origin
      });
    }

    return res.json({
      success: true,
      message: 'Password reset request has been logged and sent to your administrator (ahamedhaseen2003@gmail.com).'
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/admin-reset-password
 */
router.post('/admin-reset-password', requireAuth, async (req, res) => {
  const { userId, newPassword, sendEmail = true } = req.body;

  if (!userId || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, error: 'Valid user ID and password (min 8 chars) are required' });
  }

  try {
    const userRes = await query('SELECT id, full_name, email FROM users WHERE id = $1', [userId]);
    const user = userRes.rows?.[0];
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await query('UPDATE users SET password_hash = $1, failed_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [password_hash, userId]);

    await recordAudit(req, {
      action: 'ADMIN_RESET_PASSWORD',
      module: 'User Management',
      recordId: String(userId),
      description: `Administrator ${req.user.full_name} updated password for user ${user.email}`
    });

    if (sendEmail) {
      const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
      await sendPasswordResetAlert({
        userEmail: user.email,
        userName: user.full_name,
        newPassword,
        requestedBy: req.user?.full_name || 'Administrator',
        origin
      });
    }

    return res.json({
      success: true,
      message: `Password updated successfully for ${user.email}. Notification dispatched.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
