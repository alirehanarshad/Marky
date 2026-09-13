import crypto from 'node:crypto';

const MASTER_SECRET = process.env.SESSION_SECRET || 'marky_production_secret_key_2026_rbac_hardened';
const SALT = 'marky_vault_salt_commercial_2026';
// Derive consistent 32-byte AES-256 key from master secret
const AES_KEY = crypto.scryptSync(MASTER_SECRET, SALT, 32);

export class CryptoService {
  /**
   * Encrypts plaintext string using AES-256-GCM authenticated cipher
   */
  encrypt(plaintext) {
    if (!plaintext || typeof plaintext !== 'string') return '';
    try {
      const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
      const cipher = crypto.createCipheriv('aes-256-gcm', AES_KEY, iv);
      const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
      const authTag = cipher.getAuthTag();

      // Return IV:AuthTag:Ciphertext in hex
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (err) {
      console.error('[CryptoService] Encryption error:', err.message);
      throw new Error('Failed to encrypt secret credential at rest');
    }
  }

  /**
   * Decrypts ciphertext string using AES-256-GCM
   */
  decrypt(ciphertext) {
    if (!ciphertext || typeof ciphertext !== 'string' || !ciphertext.includes(':')) {
      return '';
    }
    try {
      const parts = ciphertext.split(':');
      if (parts.length !== 3) return '';

      const [ivHex, authTagHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');

      const decipher = crypto.createDecipheriv('aes-256-gcm', AES_KEY, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return decrypted.toString('utf8');
    } catch (err) {
      console.error('[CryptoService] Decryption verification failed:', err.message);
      return '';
    }
  }

  /**
   * Safely masks a sensitive secret (e.g. sk-proj-1234567890 -> sk-••••••••890)
   * Never emits full plaintext to browser or logs.
   */
  maskSecret(secret) {
    if (!secret || typeof secret !== 'string') return '';
    const trimmed = secret.trim();
    if (trimmed.length <= 8) {
      return '••••••••';
    }

    if (trimmed.startsWith('sk-')) {
      const suffix = trimmed.slice(-4);
      return `sk-••••••••${suffix}`;
    }

    if (trimmed.startsWith('https://')) {
      try {
        const url = new URL(trimmed);
        const hostParts = url.hostname.split('.');
        if (hostParts.length >= 2) {
          return `https://••••••••.${hostParts.slice(-2).join('.')}`;
        }
      } catch (e) {}
    }

    const prefix = trimmed.slice(0, 3);
    const suffix = trimmed.slice(-4);
    return `${prefix}••••••••${suffix}`;
  }
}

export const cryptoService = new CryptoService();
