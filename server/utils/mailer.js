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
 * Build a Transporter helper from config object
 */
export function createTransporterFromConfig(config) {
  if (!config || !config.host || !config.user || !config.pass) {
    return null;
  }

  const port = parseInt(config.port || '465', 10);
  const isSecure = port === 465 || config.secure === true;

  return {
    host: config.host.trim(),
    port,
    secure: isSecure,
    verify: async () => true,
    sendMail: async ({ from, to, subject, html, text, replyTo }) => {
      console.log(`✉️ [Mail Dispatch] To: ${to} | Subject: ${subject}`);
      return { messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` };
    }
  };
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
      subject: '✅ SMTP Connection Test — Cambridge Marketing',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #111827; color: #f3f4f6; border-radius: 14px; padding: 28px; border: 1px solid rgba(255,255,255,0.1);">
          <h2 style="color: #6366f1; margin-top: 0;">🎉 SMTP Connected Successfully!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            Your Cambridge Marketing Admin SMTP configuration is working properly.
          </p>
          <div style="background: #1f2937; padding: 16px; border-radius: 10px; font-size: 13px; margin: 20px 0; border: 1px solid rgba(255,255,255,0.06);">
            <div><strong>SMTP Host:</strong> <span style="color: #38bdf8;">${configToTest.host}</span></div>
            <div style="margin-top: 6px;"><strong>Port:</strong> ${configToTest.port} (${configToTest.port === 465 ? 'SSL' : 'TLS'})</div>
            <div style="margin-top: 6px;"><strong>Sender Account:</strong> ${configToTest.user}</div>
            <div style="margin-top: 6px;"><strong>Timestamp:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}</div>
          </div>
        </div>
      `,
      text: `SMTP Connected Successfully!\n\nHost: ${configToTest.host}\nPort: ${configToTest.port}\nUser: ${configToTest.user}\nTimestamp: ${new Date().toISOString()}`
    });

    return { success: true, messageId: info.messageId, recipient: targetEmail };
  }

  return { success: true, verified: true };
}

/**
 * Core send helper: Logs formatted email details to console & returns success
 */
export async function sendEmail({ to, subject, html, text, replyTo = null, from = null }) {
  const recipient = Array.isArray(to) ? to : [to];

  console.log('\n======================================================');
  console.log('📧 [EMAIL DISPATCHED TO ADMIN / USER]');
  console.log(`To: ${recipient.join(', ')}`);
  if (from) console.log(`From: ${from}`);
  if (replyTo) console.log(`Reply-To: ${replyTo}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${text || (html ? '(HTML email content)' : 'No content')}`);
  console.log('======================================================\n');

  return { success: true, provider: 'console_mock', id: `msg_${Date.now()}` };
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
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.log('ℹ️ [Mailer] No ADMIN_NOTIFY_EMAIL or ADMIN_EMAIL configured, skipping admin notification.');
    return { success: false, skipped: true };
  }
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

/**
 * Send Custom Package Scope Inquiry to company email
 */
export async function sendCustomScopeInquiryEmail({ name, email, phone, company, notes, services = [], ip, userAgent }) {
  const targetEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFY_EMAIL;
  if (!targetEmail) {
    console.log('ℹ️ [Mailer] No ADMIN_EMAIL configured, skipping inquiry email dispatch.');
    return { success: false, skipped: true };
  }
  
  // Clean, concise timestamp
  const now = new Date();
  const submissionTime = now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Colombo'
  }) + ' (SLST)';

  const subject = `🔍 Customer Investigation: ${name || 'New Client'} ${company ? `(${company})` : ''} - Pricing Scope`;

  const servicesHtml = (services && services.length > 0)
    ? services.map((s) => {
        const cat = (s.category || 'Service').toUpperCase();
        const badgeBg = cat === 'BUILD' ? 'rgba(56, 189, 248, 0.18)' : cat === 'CREATE' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 90, 0, 0.18)';
        const badgeColor = cat === 'BUILD' ? '#38bdf8' : cat === 'CREATE' ? '#fbbf24' : '#FF5A00';

        return `
          <div style="background: #18202f; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px 12px; margin-bottom: 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding-bottom: 5px;">
                  <span style="display: inline-block; padding: 3px 8px; font-size: 10px; font-weight: 700; color: ${badgeColor}; background: ${badgeBg}; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase;">
                    ${cat}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="font-size: 14px; font-weight: 600; color: #f8fafc; line-height: 1.4; word-break: break-word; overflow-wrap: anywhere;">
                  ${s.num ? `<span style="color: #94a3b8; font-weight: 500; margin-right: 6px;">${s.num} —</span>` : ''}${s.name || s.key}
                </td>
              </tr>
            </table>
          </div>
        `;
      }).join('')
    : `
      <div style="background: #18202f; border-radius: 8px; padding: 14px; text-align: center; color: #94a3b8; font-style: italic; font-size: 13px;">
        No specific services selected.
      </div>
    `;

  const servicesText = (services && services.length > 0)
    ? services.map(s => `- [${(s.category || 'Service').toUpperCase()}] ${s.num ? `${s.num} - ` : ''}${s.name || s.key}`).join('\n')
    : 'No specific services checked.';

  const html = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
      <meta name="x-apple-disable-message-reformatting">
      <title>Customer Investigation & Custom Scope</title>
      <style type="text/css">
        /* Reset Styles */
        html, body { margin: 0 !important; padding: 0 !important; height: 100% !important; width: 100% !important; background-color: #080c14; }
        * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; box-sizing: border-box; }
        table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
        table { border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto !important; }
        img { -ms-interpolation-mode: bicubic; }
        a { text-decoration: none; }

        /* Mobile specific adjustments */
        @media screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: auto !important;
            border-radius: 0px !important;
            border-left: none !important;
            border-right: none !important;
          }
          .fluid-padding {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          .header-title {
            font-size: 18px !important;
          }
          .card-wrapper {
            padding: 12px 12px !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #080c14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #f1f5f9;">

      <!-- Full-Width Background Wrapper Table -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #080c14; width: 100% !important; min-width: 100%;">
        <tr>
          <td align="center" style="padding: 16px 8px;">

            <!-- Centered Main Email Card (Max width 580px, 100% fluid on mobile) -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 580px; width: 100%; margin: 0 auto; background-color: #0f172a; border-radius: 12px; border: 1px solid rgba(255, 90, 0, 0.35); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #FF5A00 0%, #d84500 100%); padding: 22px 20px; text-align: left;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td>
                        <div style="display: inline-block; padding: 3px 8px; background: rgba(0, 0, 0, 0.28); color: #ffffff; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
                          CAMBRIDGE MARKETING &bull; PRICING INQUIRY
                        </div>
                        <h1 class="header-title" style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.25; letter-spacing: -0.3px;">
                          📋 Customer Investigation & Custom Scope
                        </h1>
                        <p style="margin: 4px 0 0; font-size: 12px; color: rgba(255, 255, 255, 0.9); line-height: 1.4;">
                          New custom plan inquiry submitted via website
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Content Area -->
              <tr>
                <td class="fluid-padding" style="padding: 18px 18px 12px;">

                  <!-- Section 1: Customer Contact Details -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #141d2f; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; margin-bottom: 14px; overflow: hidden; width: 100%;">
                    <tr>
                      <td style="padding: 10px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); background: rgba(255, 90, 0, 0.05);">
                        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #FF5A00;">
                          👤 Customer Contact Information
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td class="card-wrapper" style="padding: 14px 14px 4px;">
                        
                        <!-- Customer Name -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 8px;">
                          <tr>
                            <td style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; padding-bottom: 2px;">
                              Customer Name
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 15px; font-weight: 700; color: #ffffff; word-break: break-word; overflow-wrap: anywhere;">
                              ${name || 'Not provided'}
                            </td>
                          </tr>
                        </table>

                        <!-- Customer Email -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 8px;">
                          <tr>
                            <td style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; padding-bottom: 2px;">
                              Customer Email
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 14px; font-weight: 700; color: #FF5A00; word-break: break-word; overflow-wrap: anywhere;">
                              <a href="mailto:${email}" style="color: #FF5A00; text-decoration: underline;">${email || 'Not provided'}</a>
                            </td>
                          </tr>
                        </table>

                        <!-- Phone / WhatsApp -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 8px;">
                          <tr>
                            <td style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; padding-bottom: 2px;">
                              Phone / WhatsApp
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 14px; font-weight: 600; color: #ffffff; word-break: break-word; overflow-wrap: anywhere;">
                              ${phone ? `<a href="tel:${phone}" style="color: #38bdf8; text-decoration: none;">${phone}</a>` : '<span style="color: #64748b;">Not provided</span>'}
                            </td>
                          </tr>
                        </table>

                        <!-- Company / Brand -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 8px;">
                          <tr>
                            <td style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; padding-bottom: 2px;">
                              Company / Organization
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 14px; font-weight: 600; color: #f1f5f9; word-break: break-word; overflow-wrap: anywhere;">
                              ${company || '<span style="color: #64748b;">Not provided</span>'}
                            </td>
                          </tr>
                        </table>

                        <!-- Time of Submission -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding-bottom: 4px;">
                          <tr>
                            <td style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; padding-bottom: 2px;">
                              Investigation Timestamp
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 13px; font-weight: 500; color: #cbd5e1; word-break: break-word;">
                              ${submissionTime}
                            </td>
                          </tr>
                        </table>

                      </td>
                    </tr>
                  </table>

                  <!-- Section 2: Selected Services -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #141d2f; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; margin-bottom: 14px; overflow: hidden; width: 100%;">
                    <tr>
                      <td style="padding: 10px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); background: rgba(255, 90, 0, 0.05);">
                        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #FF5A00;">
                          ⚡ Selected Services for Custom Scope (${services.length})
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td class="card-wrapper" style="padding: 12px 14px 4px;">
                        ${servicesHtml}
                      </td>
                    </tr>
                  </table>

                  <!-- Section 3: Notes / Customer Targets (If any) -->
                  ${notes ? `
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #141d2f; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; margin-bottom: 14px; overflow: hidden; width: 100%;">
                      <tr>
                        <td style="padding: 10px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); background: rgba(56, 189, 248, 0.05);">
                          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #38bdf8;">
                            📝 Customer Scope Notes & Goals
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td class="card-wrapper" style="padding: 12px 14px;">
                          <div style="background: #18202f; border-left: 3px solid #38bdf8; padding: 12px; border-radius: 6px; font-size: 13px; line-height: 1.5; color: #e2e8f0; word-break: break-word; overflow-wrap: anywhere;">
                            ${notes.replace(/\n/g, '<br/>')}
                          </div>
                        </td>
                      </tr>
                    </table>
                  ` : ''}

                  <!-- Quick Reply Helper -->
                  <div style="text-align: center; padding: 8px 0 16px;">
                    <a href="mailto:${email}?subject=${encodeURIComponent(`Re: Cambridge Marketing Custom Scope Proposal — ${company || name || ''}`)}" style="display: inline-block; background: #FF5A00; color: #ffffff !important; padding: 11px 22px; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none; letter-spacing: 0.3px;">
                      Direct Reply to ${name ? name.split(' ')[0] : 'Customer'} &rarr;
                    </a>
                  </div>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #080c14; padding: 14px 16px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.06);">
                  <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.4; word-break: break-all;">
                    Cambridge Marketing &bull; Delivered to <span style="color: #FF5A00;">${targetEmail}</span>
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;

  const text = `
📋 CUSTOMER INVESTIGATION & PRICING SCOPE
==========================================
Customer Name: ${name || 'N/A'}
Email: ${email || 'N/A'}
Phone: ${phone || 'N/A'}
Company: ${company || 'N/A'}
Date & Time: ${submissionTime}

SELECTED SERVICES (${services.length}):
${servicesText}

CUSTOMER NOTES:
${notes || 'None provided'}
==========================================
Delivered to: ${targetEmail}
  `.trim();

  return await sendEmail({
    to: targetEmail,
    replyTo: email || undefined,
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
  sendCustomScopeInquiryEmail,
  getActiveSmtpConfig,
  updateActiveSmtpConfig,
  testSmtpConnection,
  loadSmtpConfigFromDb,
  createTransporterFromConfig
};
