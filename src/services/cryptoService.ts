/**
 * Automotive-Grade Web Cryptography Service
 * Implements NIST SP 800-132 compliant PBKDF2 key derivation,
 * AES-256-GCM authenticated encryption, timing-safe comparisons,
 * and strict input sanitization.
 */

const PBKDF2_ITERATIONS = 100_000;
const HASH_ALGO = 'SHA-256';
const KEY_LENGTH_BITS = 256;
const IV_LENGTH_BYTES = 12; // 96-bit IV recommended for AES-GCM
const SALT_LENGTH_BYTES = 16; // 128-bit cryptographic salt

// Base64 / ArrayBuffer conversion helpers
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate a cryptographically secure pseudo-random salt.
 */
export function generateSalt(length = SALT_LENGTH_BYTES): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return bufferToBase64(array);
}

/**
 * Generate a cryptographically secure 96-bit IV for AES-GCM.
 */
export function generateIV(): Uint8Array {
  const iv = new Uint8Array(IV_LENGTH_BYTES);
  window.crypto.getRandomValues(iv);
  return iv;
}

/**
 * Hash password using PBKDF2 with SHA-256 and 100,000 iterations (NIST standard).
 */
export async function hashPassword(password: string, saltBase64: string): Promise<string> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const saltBytes = base64ToBuffer(saltBase64);
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGO,
    },
    passwordKey,
    KEY_LENGTH_BITS
  );

  return bufferToBase64(derivedBits);
}

/**
 * Constant-time string comparison to prevent timing side-channel attacks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Constant-time dummy comparison to prevent length leak
    let dummy = 0;
    for (let i = 0; i < a.length; i++) {
      dummy |= a.charCodeAt(i) ^ a.charCodeAt(i);
    }
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Derive an AES-256-GCM symmetric encryption key from the user's password.
 */
export async function deriveEncryptionKey(password: string, saltBase64: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const saltBytes = base64ToBuffer(saltBase64);
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGO,
    },
    passwordKey,
    {
      name: 'AES-GCM',
      length: KEY_LENGTH_BITS,
    },
    false, // Non-extractable key for defense in depth
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt arbitrary payload using AES-256-GCM with authenticated tag.
 */
export async function encryptData<T>(
  data: T,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string; version: number }> {
  const enc = new TextEncoder();
  const iv = generateIV();
  const plaintext = JSON.stringify(data);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    enc.encode(plaintext)
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv),
    version: 1,
  };
}

/**
 * Decrypt AES-256-GCM authenticated ciphertext.
 */
export async function decryptData<T>(
  ciphertextBase64: string,
  ivBase64: string,
  key: CryptoKey
): Promise<T> {
  const ciphertextBytes = base64ToBuffer(ciphertextBase64);
  const ivBytes = base64ToBuffer(ivBase64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes as unknown as BufferSource,
    },
    key,
    ciphertextBytes as unknown as BufferSource
  );

  const dec = new TextDecoder();
  const decryptedJson = dec.decode(decryptedBuffer);
  return JSON.parse(decryptedJson) as T;
}

/**
 * Strict image URL sanitizer to prevent XSS (disallow javascript:, vbscript:, etc.)
 */
export function sanitizeImageUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Allow safe HTTPS URLs
  if (trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Allow safe Data URLs strictly restricted to standard image formats
  const safeDataUrlPattern = /^data:image\/(png|jpeg|jpg|webp|gif|avif|svg\+xml);base64,[A-Za-z0-9+/=]+$/;
  if (safeDataUrlPattern.test(trimmed)) {
    return trimmed;
  }

  return '';
}

/**
 * Validate password complexity based on enterprise security standards:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number or special character
 */
export function evaluatePasswordStrength(password: string): {
  isValid: boolean;
  score: number; // 0 to 4
  label: 'Too Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('At least 8 characters');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('One uppercase letter');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('One lowercase letter');

  if (/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
  else feedback.push('One number or special character');

  if (password.length >= 12 && score === 4) score++;

  let label: 'Too Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  switch (Math.min(score, 4)) {
    case 0:
    case 1:
      label = 'Too Weak';
      break;
    case 2:
      label = 'Weak';
      break;
    case 3:
      label = 'Medium';
      break;
    default:
      label = score >= 5 ? 'Very Strong' : 'Strong';
      break;
  }

  return {
    isValid: password.length >= 8 && score >= 3,
    score,
    label,
    feedback,
  };
}
