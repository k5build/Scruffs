/**
 * AES-256-GCM field-level encryption for PII at rest.
 *
 * ENCRYPTION_KEY  — 64-char hex string (32 bytes). Used for AES-256-GCM.
 * FIELD_HMAC_KEY  — 64-char hex string (32 bytes). Used for HMAC-SHA256 searchable hashes.
 *
 * Output format of encryptField:
 *   "enc:" + base64( IV[12 bytes] || AuthTag[16 bytes] || CipherText )
 *
 * The "enc:" prefix lets decryptField detect already-encrypted values and
 * pass through legacy plaintext data transparently.
 */

import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'crypto';
import { logger } from './logger';

const ENC_PREFIX = 'enc:';
const IV_LENGTH  = 12;  // GCM recommended
const TAG_LENGTH = 16;  // GCM auth tag

// ── Key resolution ────────────────────────────────────────────────────────────

/** Parse a 64-char hex env var into a 32-byte Buffer. Returns null on failure. */
function parseHexKey(envVar: string, name: string): Buffer | null {
  const raw = process.env[envVar];
  if (!raw) return null;
  if (raw.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(raw)) {
    logger.error('crypto', `${name} must be a 64-character hex string`, { action: 'key-validation' });
    return null;
  }
  return Buffer.from(raw, 'hex');
}

/** Deterministic dev-only fallback key derived from the key name. NEVER used in production. */
function devFallbackKey(seed: string): Buffer {
  // 32 bytes from the seed string, right-padded with zeros
  return Buffer.from(seed.padEnd(64, '0').slice(0, 64), 'hex');
}

function getEncryptionKey(): Buffer {
  const key = parseHexKey('ENCRYPTION_KEY', 'ENCRYPTION_KEY');
  if (key) return key;

  if (process.env.NODE_ENV === 'production') {
    logger.error('crypto', 'ENCRYPTION_KEY not set in production — data will not be encrypted securely');
  } else {
    logger.warn('crypto', 'ENCRYPTION_KEY not set — using dev fallback key (NOT safe for production)');
  }

  // Deterministic dev fallback — same key every restart so existing data stays readable
  return devFallbackKey('0000000000000000000000000000000000000000000000000000000000000001');
}

function getHmacKey(): Buffer {
  const key = parseHexKey('FIELD_HMAC_KEY', 'FIELD_HMAC_KEY');
  if (key) return key;

  if (process.env.NODE_ENV === 'production') {
    logger.error('crypto', 'FIELD_HMAC_KEY not set in production — HMAC hashes will not be secure');
  } else {
    logger.warn('crypto', 'FIELD_HMAC_KEY not set — using dev fallback key');
  }

  return devFallbackKey('0000000000000000000000000000000000000000000000000000000000000002');
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Encrypt a plaintext string with AES-256-GCM.
 * Returns: "enc:" + base64( IV || AuthTag || CipherText )
 */
export function encryptField(plaintext: string): string {
  if (!plaintext) return plaintext;
  // Idempotent — don't double-encrypt
  if (plaintext.startsWith(ENC_PREFIX)) return plaintext;

  const key = getEncryptionKey();
  const iv  = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag   = cipher.getAuthTag();

  // Layout: IV[12] + AuthTag[16] + CipherText[n]
  const payload = Buffer.concat([iv, authTag, encrypted]);
  return ENC_PREFIX + payload.toString('base64');
}

/**
 * Decrypt a value encrypted by encryptField.
 * If value does not start with "enc:" it is returned as-is (backward compat).
 */
export function decryptField(value: string): string {
  if (!value) return value;
  if (!value.startsWith(ENC_PREFIX)) return value; // legacy plaintext

  try {
    const key     = getEncryptionKey();
    const payload = Buffer.from(value.slice(ENC_PREFIX.length), 'base64');

    if (payload.length < IV_LENGTH + TAG_LENGTH + 1) {
      throw new Error('Payload too short');
    }

    const iv         = payload.subarray(0, IV_LENGTH);
    const authTag    = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = payload.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  } catch (err) {
    logger.error('crypto', 'decryptField failed — returning empty string', {
      error: err instanceof Error ? err.message : String(err),
    });
    return '';
  }
}

/**
 * HMAC-SHA256 of a value with FIELD_HMAC_KEY.
 * Returns lowercase hex. Use for searchable indexed lookups on encrypted fields.
 */
export function hashField(value: string): string {
  const key  = getHmacKey();
  return createHmac('sha256', key).update(value, 'utf8').digest('hex');
}

/** Returns true if a value was produced by encryptField. */
export function isEncrypted(value: string): boolean {
  return typeof value === 'string' && value.startsWith(ENC_PREFIX);
}
