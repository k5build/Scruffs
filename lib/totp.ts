/**
 * Pure Node.js TOTP implementation (RFC 6238).
 * No external packages — uses Node crypto built-in only.
 *
 * Exports:
 *   verifyTotp(secret, token, windowSteps?)  — verify a 6-digit TOTP token
 *   generateTotpSecret()                     — generate a new base32-encoded secret
 *   getTotpUri(secret, accountName, issuer)  — otpauth:// URI for QR scanning
 */

import { createHmac, randomBytes } from 'crypto';

// ── Base32 ────────────────────────────────────────────────────────────────────

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buf: Buffer): string {
  let bits  = 0;
  let value = 0;
  let out   = '';

  for (let i = 0; i < buf.length; i++) {
    value = (value << 8) | buf[i];
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += BASE32_CHARS[(value >>> bits) & 0x1f];
    }
  }

  // Remaining bits
  if (bits > 0) {
    out += BASE32_CHARS[(value << (5 - bits)) & 0x1f];
  }

  // Padding to multiple of 8
  while (out.length % 8 !== 0) out += '=';
  return out;
}

function base32Decode(encoded: string): Buffer {
  // Strip padding and uppercase
  const str = encoded.toUpperCase().replace(/=+$/, '');
  const bytes: number[] = [];
  let bits  = 0;
  let value = 0;

  for (let i = 0; i < str.length; i++) {
    const idx = BASE32_CHARS.indexOf(str[i]);
    if (idx === -1) throw new Error(`Invalid base32 character: ${str[i]}`);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 0xff);
    }
  }

  return Buffer.from(bytes);
}

// ── HOTP (HMAC-based OTP) — RFC 4226 ─────────────────────────────────────────

function hotp(secretBuf: Buffer, counter: bigint): string {
  // Counter as 8-byte big-endian buffer
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(counter);

  const mac  = createHmac('sha1', secretBuf).update(counterBuf).digest();
  const offset = mac[mac.length - 1] & 0x0f;
  const code   = (
    ((mac[offset]     & 0x7f) << 24) |
    ((mac[offset + 1] & 0xff) << 16) |
    ((mac[offset + 2] & 0xff) <<  8) |
    ((mac[offset + 3] & 0xff))
  ) % 1_000_000;

  return String(code).padStart(6, '0');
}

// ── TOTP (Time-based OTP) — RFC 6238 ──────────────────────────────────────────

const STEP_SECONDS = 30;

function currentStep(): bigint {
  return BigInt(Math.floor(Date.now() / 1000 / STEP_SECONDS));
}

/**
 * Verify a 6-digit TOTP token against a base32-encoded secret.
 * Allows ±windowSteps time steps (default 1 = ±30s, total 90s window).
 */
export function verifyTotp(
  secret:      string,
  token:       string,
  windowSteps: number = 1,
): boolean {
  if (!/^\d{6}$/.test(token.trim())) return false;

  let secretBuf: Buffer;
  try {
    secretBuf = base32Decode(secret);
  } catch {
    return false;
  }

  const step = currentStep();
  for (let delta = -windowSteps; delta <= windowSteps; delta++) {
    if (hotp(secretBuf, step + BigInt(delta)) === token.trim()) {
      return true;
    }
  }
  return false;
}

/**
 * Generate a new TOTP secret (20 random bytes encoded as base32).
 * Store this in ADMIN_TOTP_SECRET env var.
 */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

/**
 * Build an otpauth:// URI for QR code scanning in Google Authenticator / Authy.
 */
export function getTotpUri(
  secret:      string,
  accountName: string,
  issuer:      string,
): string {
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits:    '6',
    period:    String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
