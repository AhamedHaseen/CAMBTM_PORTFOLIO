import express from 'express';
import { query, getEngine } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { recordAudit } from '../middleware/audit.js';
import {
  getActiveSmtpConfig,
  updateActiveSmtpConfig,
  testSmtpConnection
} from '../utils/mailer.js';

const router = express.Router();

/**
 * GET /api/settings
 * Fetch system & website general settings
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM settings');
    const settingsMap = {};
    (result.rows || []).forEach(row => {
      try {
        settingsMap[row.key] = JSON.parse(row.value);
      } catch (e) {
        settingsMap[row.key] = row.value;
      }
    });

    return res.json({
      success: true,
      settings: settingsMap,
      system: {
        databaseEngine: getEngine(),
        supabaseConnected: Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase')),
        serverTime: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV || 'development'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/settings
 * Update settings key/value
 */
router.put('/', requireAuth, async (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ success: false, error: 'Settings object required' });
  }

  try {
    for (const [key, val] of Object.entries(settings)) {
      const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
      const exists = await query('SELECT key FROM settings WHERE key = $1', [key]);
      if (exists.rows && exists.rows.length > 0) {
        await query('UPDATE settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2', [valStr, key]);
      } else {
        await query('INSERT INTO settings (key, value) VALUES ($1, $2)', [key, valStr]);
      }
    }

    await recordAudit(req, {
      action: 'UPDATE',
      module: 'Settings',
      description: 'Admin updated website & system settings'
    });

    return res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/settings/smtp
 * Get SMTP settings (with masked password)
 */
router.get('/smtp', requireAuth, async (req, res) => {
  try {
    const config = getActiveSmtpConfig(false);
    return res.json({
      success: true,
      smtp: config
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/settings/smtp
 * Save and apply SMTP settings
 */
router.put('/smtp', requireAuth, async (req, res) => {
  const { host, port, secure, user, pass, fromName, fromEmail, twoFactorEnabled, twoFactorMethod } = req.body;

  try {
    const currentConfig = getActiveSmtpConfig(false);
    const updatedPass = (!pass || pass === '••••••••••••') ? currentConfig.pass : pass;

    const newSmtpSettings = {
      host: (host || 'smtp.hostinger.com').trim(),
      port: parseInt(port || '465', 10),
      secure: parseInt(port || '465', 10) === 465 || secure === true,
      user: (user || '').trim(),
      pass: updatedPass || '',
      fromName: fromName ? fromName.trim() : 'Cambridge Marketing Security',
      fromEmail: fromEmail ? fromEmail.trim() : (user || '').trim(),
      twoFactorEnabled: Boolean(twoFactorEnabled),
      twoFactorMethod: twoFactorMethod || 'email'
    };

    // Save to settings table in DB
    const valStr = JSON.stringify(newSmtpSettings);
    const exists = await query('SELECT key FROM settings WHERE key = $1', ['smtp_settings']);
    if (exists.rows && exists.rows.length > 0) {
      await query('UPDATE settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2', [valStr, 'smtp_settings']);
    } else {
      await query('INSERT INTO settings (key, value) VALUES ($1, $2)', ['smtp_settings', valStr]);
    }

    // Apply live in-memory
    updateActiveSmtpConfig(newSmtpSettings);

    await recordAudit(req, {
      action: 'UPDATE_SMTP',
      module: 'Settings',
      description: `Admin updated SMTP credentials for ${newSmtpSettings.user || 'hostinger'} (2FA: ${newSmtpSettings.twoFactorEnabled ? 'Enabled' : 'Disabled'})`
    });

    return res.json({
      success: true,
      message: 'SMTP settings saved and updated successfully.',
      smtp: getActiveSmtpConfig(true)
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/settings/smtp/test
 * Test SMTP connection and optionally send a verification email
 */
router.post('/smtp/test', requireAuth, async (req, res) => {
  const { host, port, secure, user, pass, fromName, targetEmail } = req.body;

  try {
    const currentConfig = getActiveSmtpConfig(false);
    const testConfig = {
      host: (host || currentConfig.host || 'smtp.hostinger.com').trim(),
      port: parseInt(port || currentConfig.port || '465', 10),
      secure: parseInt(port || currentConfig.port || '465', 10) === 465 || secure === true,
      user: (user || currentConfig.user || '').trim(),
      pass: (!pass || pass === '••••••••••••') ? currentConfig.pass : pass,
      fromName: fromName || currentConfig.fromName || 'Cambridge Marketing Security'
    };

    const recipient = targetEmail || req.user?.email;
    const result = await testSmtpConnection(testConfig, recipient);

    return res.json({
      success: true,
      message: `SMTP connection established successfully! Test email dispatched to ${recipient}.`,
      result
    });
  } catch (err) {
    console.error('SMTP test connection failed:', err);
    return res.status(400).json({
      success: false,
      error: `SMTP Connection Error: ${err.message}`
    });
  }
});

export default router;
