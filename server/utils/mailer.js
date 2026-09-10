import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });


const FROM_EMAIL_DEFAULT = process.env.FROM_EMAIL || 'Cambridge Marketing Security <noreply@cambridgemarketing.com>';

// In-memory SMTP configuration cache
let activeSmtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: (process.env.SMTP_PORT || '465') === '465',
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  fromName: 'Cambridge Marketing Security',
  fromEmail: process.env.SMTP_USER || '',
  twoFactorEnabled: false,
  twoFactorMethod: 'email'
};

let cachedTransporter = null;

/**
 * Initialize / Reload SMTP config from DB
 */
export async function loadSmtpConfigFromDb() {
  try {
    const res = await query("SELECT value FROM settings WHERE key = 'smtp_settings'");
    if (res.rows && res.rows.length > 0) {
      const parsed = typeof res.rows[0].value === 'string' ? JSON.parse(res.rows[0].value) : res.rows[0].value;
      if (parsed && typeof parsed === 'object') {
        activeSmtpConfig = {
          ...activeSmtpConfig,
          ...parsed,
          port: parseInt(parsed.port || '465', 10),
          secure: parsed.port === 465 || parsed.port === '465' || parsed.secure === true
        };
        cachedTransporter = createTransporterFromConfig(activeSmtpConfig);
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not load SMTP config from settings table:', err.message);
  }
}

// Initial load attempt
loadSmtpConfigFromDb();

/**
 * Build a Nodemailer Transporter from config object
 */
export function createTransporterFromConfig(config) {
  if (!config || !config.host || !config.user || !config.pass) {
    return null;
  }

  const port = parseInt(config.port || '465', 10);
  const isSecure = port === 465 || config.secure === true;

  return nodemailer.createTransport({
    host: config.host.trim(),
    port,
    secure: isSecure,
    auth: {
      user: config.user.trim(),
      pass: config.pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Get active SMTP configuration (safely masked)
 */
export function getActiveSmtpConfig(maskPassword = true) {
  return {
    ...activeSmtpConfig,
    pass: maskPassword && activeSmtpConfig.pass ? '••••••••••••' : activeSmtpConfig.pass,
    hasPassword: Boolean(activeSmtpConfig.pass)
  };
}

/**
 * Update active SMTP configuration in memory & rebuild transporter
 */
export function updateActiveSmtpConfig(newConfig) {
  const mergedPass = (!newConfig.pass || newConfig.pass === '••••••••••••')
    ? activeSmtpConfig.pass
    : newConfig.pass;

  activeSmtpConfig = {
    ...activeSmtpConfig,
    ...newConfig,
    port: parseInt(newConfig.port || '465', 10),
    secure: parseInt(newConfig.port || '465', 10) === 465 || newConfig.secure === true,
    pass: mergedPass
  };

  cachedTransporter = createTransporterFromConfig(activeSmtpConfig);
  return activeSmtpConfig;
}

/**
 * Test SMTP connection and dispatch verification test email
 */
export async function testSmtpConnection(testConfig, targetEmail) {
  const configToTest = {
    ...activeSmtpConfig,
    ...testConfig,
    pass: (!testConfig.pass || testConfig.pass === '••••••••••••') ? activeSmtpConfig.pass : testConfig.pass
  };

  if (!configToTest.host || !configToTest.user || !configToTest.pass) {
    throw new Error('Host, Username (Email), and Password are required to test SMTP connection.');
  }

  const transporter = createTransporterFromConfig(configToTest);
  if (!transporter) {
    throw new Error('Invalid SMTP parameters provided.');
  }

  // 1. Verify SMTP handshake & credentials
  await transporter.verify();

  // 2. Send test email if recipient is provided
  if (targetEmail) {
    const fromAddress = configToTest.fromName
      ? `"${configToTest.fromName}" <${configToTest.user}>`
      : configToTest.user;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: targetEmail,
      subject: '✅ Hostinger SMTP Connection Test — Cambridge Marketing',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #111827; color: #f3f4f6; border-radius: 14px; padding: 28px; border: 1px solid rgba(255,255,255,0.1);">
          <h2 style="color: #6366f1; margin-top: 0;">🎉 Hostinger SMTP Connected Successfully!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            Your Cambridge Marketing Admin SMTP configuration is working properly.
          </p>
          <div style="background: #1f2937; padding: 16px; border-radius: 10px; font-size: 13px; margin: 20px 0; border: 1px solid rgba(255,255,255,0.06);">
            <div><strong>SMTP Host:</strong> <span style="color: #38bdf8;">${configToTest.host}</span></div>
            <div style="margin-top: 6px;"><strong>Port:</strong> ${configToTest.port} (${configToTest.port === 465 ? 'SSL' : 'TLS'})</div>
            <div style="margin-top: 6px;"><strong>Sender Account:</strong> ${configToTest.user}</div>
            <div style="margin-top: 6px;"><strong>Timestamp:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}</div>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">
            Two-Factor Authentication emails and password reset alerts will be delivered via this Hostinger account.
          </p>
        </div>
      `,
      text: `Hostinger SMTP Connected Successfully!\n\nHost: ${configToTest.host}\nPort: ${configToTest.port}\nUser: ${configToTest.user}\nTimestamp: ${new Date().toISOString()}`
    });

    return { success: true, messageId: info.messageId, recipient: targetEmail };
  }

  return { success: true, verified: true };
}

/**
 * Core send helper: Uses Active SMTP first, console mock fallback second.
 */
export async function sendEmail({ to, subject, html, text, replyTo = null, from = null }) {
  const recipient = Array.isArray(to) ? to : [to];

  // 1. Try Active SMTP Transporter first (Hostinger / configured SMTP)
  if (cachedTransporter || (activeSmtpConfig.host && activeSmtpConfig.user && activeSmtpConfig.pass)) {
    try {
      const transporter = cachedTransporter || createTransporterFromConfig(activeSmtpConfig);
      if (transporter) {
        const fromAddress = from || (activeSmtpConfig.fromName
          ? `"${activeSmtpConfig.fromName}" <${activeSmtpConfig.user}>`
          : (activeSmtpConfig.user || FROM_EMAIL_DEFAULT));

        const info = await transporter.sendMail({
          from: fromAddress,
          to: recipient.join(', '),
          subject,
          html,
          text,
          replyTo: replyTo || undefined
        });

        console.log(`✉️ [Hostinger SMTP] Email delivered to ${recipient.join(', ')} (ID: ${info.messageId})`);
        return { success: true, provider: 'smtp', id: info.messageId };
      }
    } catch (err) {
      console.error('⚠️ SMTP dispatch error, falling back to mock:', err.message);
    }
  }

  // 2. Fallback mock / development output
  console.log('\n======================================================');
  console.log('📧 [EMAIL DISPATCHED TO ADMIN / USER]');
  console.log(`To: ${recipient.join(', ')}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${text || 'See HTML template'}`);
  console.log('======================================================\n');

  return { success: true, provider: 'mock_console' };
}

/**
 * Send 2FA 6-Digit One-Time Password (OTP) via Email
 */
export async function sendTwoFactorOtpEmail({ userEmail, userName, otpCode, ip, userAgent }) {
  const requestTime = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Colombo'
  });

  const subject = `🔐 Your Cambridge Marketing 2FA Code: ${otpCode}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Two-Factor Authentication Code</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 24px; }
        .container { max-width: 580px; margin: 0 auto; background: #111827; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 28px 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.85); }
        .content { padding: 32px; }
        .otp-box { background: rgba(99, 102, 241, 0.12); border: 2px dashed rgba(99, 102, 241, 0.5); border-radius: 14px; padding: 24px; margin: 24px 0; text-align: center; }
        .otp-label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #818cf8; font-weight: 700; margin-bottom: 10px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #ffffff; letter-spacing: 10px; margin: 0; }
        .expiry-badge { display: inline-block; margin-top: 10px; font-size: 12px; color: #fca5a5; background: rgba(239, 68, 68, 0.15); padding: 4px 12px; border-radius: 6px; }
        .card { background: #1f2937; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 18px 20px; margin-top: 24px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #9ca3af; font-weight: 500; }
        .value { color: #f3f4f6; font-weight: 600; text-align: right; }
        .footer { background: #0f172a; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Cambridge Marketing</h1>
          <p>Two-Factor Authentication Security</p>
        </div>

        <div class="content">
          <p style="font-size: 15px; color: #f8fafc; margin-top: 0;">Hello <strong>${userName || 'Admin'}</strong>,</p>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
            A sign-in attempt was initiated for your Cambridge Marketing account (<strong>${userEmail}</strong>). Please enter the single-use 6-digit verification code below to complete your sign-in.
          </p>

          <div class="otp-box">
            <div class="otp-label">Your 2FA Verification Code</div>
            <div class="otp-code">${otpCode}</div>
            <div class="expiry-badge">⏱️ Valid for 10 minutes</div>
          </div>

          <div class="card">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700; margin-bottom: 10px;">
              🌐 Security Telemetry
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${requestTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">IP Address:</span>
              <span class="value" style="font-family: monospace; color: #38bdf8;">${ip || '127.0.0.1'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Client:</span>
              <span class="value" style="font-size: 12px; max-width: 260px; word-break: break-all;">${userAgent || 'Web Browser'}</span>
            </div>
          </div>

          <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 24px; line-height: 1.5;">
            ⚠️ If you did not request this code, please change your password immediately or alert the security team.
          </p>
        </div>

        <div class="footer">
          Cambridge Marketing &bull; Identity & Access Security System
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
CAMBRIDGE MARKETING — TWO-FACTOR AUTHENTICATION CODE

Hello ${userName || 'Admin'},

Your 6-digit verification code is: ${otpCode}

This code expires in 10 minutes.
Timestamp: ${requestTime}
IP Address: ${ip || '127.0.0.1'}

If you did not initiate this login, please contact your administrator.
  `.trim();

  return await sendEmail({
    to: userEmail,
    subject,
    html,
    text
  });
}

/**
 * Send automatic notification to Admin when any user requests a Password Reset
 */
export async function sendForgotPasswordNotification({ user, ip, userAgent, timestamp, origin }) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'ahamedhaseen2003@gmail.com';
  const siteUrl = origin || process.env.SITE_URL || 'http://localhost:5173';
  const usersManagementUrl = `${siteUrl}/studio/users`;

  const requestTime = timestamp || new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Colombo'
  });

  const subject = `🚨 [Password Reset Request] ${user?.full_name || 'User'} (${user?.email || 'N/A'})`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Security Alert: Password Reset Request</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 24px; }
        .container { max-width: 620px; margin: 0 auto; background: #111827; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 28px 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.85); }
        .content { padding: 32px; }
        .alert-banner { background: rgba(239, 68, 68, 0.12); border-left: 4px solid #ef4444; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; font-size: 14px; color: #fca5a5; line-height: 1.5; }
        .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700; margin: 24px 0 12px; }
        .card { background: #1f2937; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 18px 20px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #9ca3af; font-weight: 500; }
        .value { color: #f3f4f6; font-weight: 600; text-align: right; }
        .btn-container { text-align: center; margin: 32px 0 16px; }
        .btn { display: inline-block; background: #6366f1; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4); }
        .footer { background: #0f172a; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Cambridge Marketing Security</h1>
          <p>Automated Password Reset Alert</p>
        </div>
        
        <div class="content">
          <div class="alert-banner">
            <strong>⚠️ Password Reset Requested:</strong> The user <strong>${user?.full_name || 'User'} (${user?.email})</strong> requested a password reset.
          </div>

          <div class="section-title">👤 Requester Identity</div>
          <div class="card">
            <div class="detail-row">
              <span class="label">Full Name:</span>
              <span class="value">${user?.full_name || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">User Email:</span>
              <span class="value" style="color: #38bdf8;">${user?.email || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">User Role:</span>
              <span class="value">${user?.role || 'Staff / User'}</span>
            </div>
            <div class="detail-row">
              <span class="label">User ID:</span>
              <span class="value">#${user?.id || 'Unknown'}</span>
            </div>
          </div>

          <div class="section-title">🌐 Session & Device Telemetry</div>
          <div class="card">
            <div class="detail-row">
              <span class="label">Request Time:</span>
              <span class="value">${requestTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">IP Address:</span>
              <span class="value" style="font-family: monospace; color: #38bdf8;">${ip || '127.0.0.1'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Client Device / User Agent:</span>
              <span class="value" style="font-size: 12px; max-width: 280px; word-break: break-all;">${userAgent || 'Web Browser'}</span>
            </div>
          </div>

          <div class="btn-container">
            <a href="${usersManagementUrl}" class="btn" target="_blank">
              Open Admin Portal & Reset Password &rarr;
            </a>
          </div>
        </div>

        <div class="footer">
          Cambridge Marketing &bull; Security & Identity Management &bull; Admin Dispatch: ${adminEmail}
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
🚨 SECURITY ALERT: PASSWORD RESET REQUESTED

Requester: ${user?.full_name} (${user?.email})
Role: ${user?.role || 'User'}
Timestamp: ${requestTime}
IP Address: ${ip}

Manage: ${usersManagementUrl}
  `.trim();

  return await sendEmail({
    to: adminEmail,
    subject,
    html,
    text,
    replyTo: user?.email
  });
}

/**
 * Send password update confirmation to the user
 */
export async function sendPasswordResetAlert({ userEmail, userName, newPassword = null, requestedBy = 'Administrator', origin = null }) {
  const siteUrl = origin || process.env.SITE_URL || 'http://localhost:5173';
  const loginUrl = `${siteUrl}/studio/login`;

  const subject = newPassword
    ? `🔐 Your Cambridge Marketing CMS Password Has Been Updated`
    : `Password Update Notification — Cambridge Marketing`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Notification</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 28px 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
        .content { padding: 32px; }
        .password-box { background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.35); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
        .password-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #818cf8; font-weight: 700; margin-bottom: 8px; }
        .password-value { font-family: 'Courier New', Courier, monospace; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 2px; }
        .btn-container { text-align: center; margin: 28px 0 16px; }
        .btn { display: inline-block; background: #6366f1; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; }
        .footer { background: #0f172a; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Cambridge Marketing CMS</h1>
          <p>Security & Credentials Update</p>
        </div>

        <div class="content">
          <p style="font-size: 16px; color: #f8fafc; margin-top: 0;">Hello <strong>${userName || 'User'}</strong>,</p>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
            Your account credentials for the Cambridge Marketing Admin Portal have been updated by <strong>${requestedBy}</strong>.
          </p>

          ${newPassword ? `
            <div class="password-box">
              <div class="password-label">New Temporary Password</div>
              <div class="password-value">${newPassword}</div>
            </div>

            <div class="btn-container">
              <a href="${loginUrl}" class="btn" target="_blank">
                Sign In to Admin Portal &rarr;
              </a>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          Cambridge Marketing &bull; Security & Identity Management
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hello ${userName},

Your Cambridge Marketing CMS password has been updated by ${requestedBy}.
${newPassword ? `New Temporary Password: ${newPassword}\nLogin: ${loginUrl}` : ''}
  `.trim();

  return await sendEmail({
    to: userEmail,
    subject,
    html,
    text
  });
}

export default {
  sendEmail,
  sendTwoFactorOtpEmail,
  sendForgotPasswordNotification,
  sendPasswordResetAlert,
  getActiveSmtpConfig,
  updateActiveSmtpConfig,
  testSmtpConnection,
  loadSmtpConfigFromDb,
  createTransporterFromConfig
};
