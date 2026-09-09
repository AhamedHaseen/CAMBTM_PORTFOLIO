import crypto from 'crypto';

/**
 * Standard RFC 6238 Time-based One-Time Password (TOTP) Implementation
 * Compatible with Google Authenticator, 1Password, Authy, Apple Keychain
 */

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(length = 20) {
  let secret = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[bytes[i] % 32];
  }
  return secret;
}

export function generateRecoveryCodes(count = 6) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

function base32ToBuffer(base32) {
  const clean = base32.replace(/[^A-Z2-7]/gi, '').toUpperCase();
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
}

export function verifyTOTP(secret, userCode, windowVariance = 1) {
  if (!secret || !userCode) return false;
  const codeStr = String(userCode).replace(/\s+/g, '').trim();
  if (codeStr.length !== 6) return false;

  const epoch = Math.floor(Date.now() / 1000);
  const currentStep = Math.floor(epoch / 30);
  const key = base32ToBuffer(secret);

  for (let offset = -windowVariance; offset <= windowVariance; offset++) {
    const timeStep = currentStep + offset;
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigInt64BE(BigInt(timeStep));
    
    const hmac = crypto.createHmac('sha1', key).update(timeBuffer).digest();
    const hmacOffset = hmac[hmac.length - 1] & 0x0f;
    const code = (
      ((hmac[hmacOffset] & 0x7f) << 24) |
      ((hmac[hmacOffset + 1] & 0xff) << 16) |
      ((hmac[hmacOffset + 2] & 0xff) << 8) |
      (hmac[hmacOffset + 3] & 0xff)
    ) % 1000000;

    if (code.toString().padStart(6, '0') === codeStr) {
      return true;
    }
  }
  return false;
}

export function getOtpAuthUrl(email, secret, issuer = 'CambridgeMarketing') {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}
