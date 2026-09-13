import crypto from 'node:crypto';
import { db } from '../database.js';

const AUTH_SECRET = process.env.SESSION_SECRET || 'marky_production_secret_key_2026_rbac_hardened';

export class AuthService {
  /**
   * Generates a cryptographically strong scrypt hash with a unique random salt
   */
  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  /**
   * Verifies password against stored salt:hash using constant-time comparison
   */
  verifyPassword(password, storedHash) {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  }

  /**
   * Signs a secure base64url HMAC-SHA256 authentication token
   */
  createToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'USER',
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days validity
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(encodedPayload)
      .digest('base64url');

    return `${encodedPayload}.${signature}`;
  }

  /**
   * Validates token signature, expiration, and verifies user is active in DB
   */
  async verifyToken(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(encodedPayload)
      .digest('base64url');

    const sigBuffer = Buffer.from(signature);
    const expSigBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expSigBuffer.length || !crypto.timingSafeEqual(sigBuffer, expSigBuffer)) {
      return null;
    }

    try {
      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
      if (Date.now() > payload.exp) return null; // Expired

      // Verify user state in DB
      const user = await db.get(
        'SELECT id, name, email, role, status FROM users WHERE id = ?',
        [payload.id]
      );
      if (!user || user.status !== 'ACTIVE') return null;

      return user;
    } catch (e) {
      return null;
    }
  }

  /**
   * Registers a new account. Role is strictly 'USER'.
   */
  async register({ name, email, password }) {
    if (!email || !email.includes('@')) {
      throw new Error('Valid email address is required.');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }
    const cleanName = (name || email.split('@')[0]).trim();
    const cleanEmail = email.trim().toLowerCase();

    const existing = await db.get('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = this.hashPassword(password);
    const result = await db.run(
      `INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'USER', 'ACTIVE')`,
      [cleanName, cleanEmail, passwordHash]
    );

    const user = {
      id: result.lastID,
      name: cleanName,
      email: cleanEmail,
      role: 'USER',
      status: 'ACTIVE'
    };

    const token = this.createToken(user);
    return { user, token };
  }

  /**
   * Authenticates user credentials and returns user profile + session token
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (user.status === 'SUSPENDED' || user.status === 'DISABLED') {
      throw new Error('This account has been suspended or disabled. Please contact an administrator.');
    }

    const isValid = this.verifyPassword(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    const userSafe = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar_url: user.avatar_url
    };

    const token = this.createToken(userSafe);
    return { user: userSafe, token };
  }

  /**
   * Ensures default Administrator exists upon system initialization
   */
  async bootstrapAdmin() {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@marky.ai').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Marky2026!';
    const existing = await db.get('SELECT id, role FROM users WHERE email = ?', [adminEmail]);

    if (!existing) {
      const hash = this.hashPassword(adminPassword);
      await db.run(
        `INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'ADMIN', 'ACTIVE')`,
        ['System Administrator', adminEmail, hash]
      );
      console.log(`[Security] Initial bootstrap Administrator created: ${adminEmail}`);
    }
  }

  /**
   * Administrative User Management
   */
  async getAllUsers() {
    return await db.all(
      `SELECT id, name, email, role, status, avatar_url, created_at, updated_at 
       FROM users ORDER BY id ASC`
    );
  }

  async updateUserStatus(id, status) {
    const allowed = ['ACTIVE', 'SUSPENDED', 'DISABLED'];
    if (!allowed.includes(status)) {
      throw new Error(`Invalid status: ${status}. Allowed: ${allowed.join(', ')}`);
    }
    await db.run(`UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [status, id]);
    return await db.get('SELECT id, name, email, role, status FROM users WHERE id = ?', [id]);
  }

  async updateUserRole(id, role) {
    const allowed = ['ADMIN', 'USER'];
    if (!allowed.includes(role)) {
      throw new Error(`Invalid role: ${role}. Allowed: ${allowed.join(', ')}`);
    }
    await db.run(`UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [role, id]);
    return await db.get('SELECT id, name, email, role, status FROM users WHERE id = ?', [id]);
  }

  /**
   * Updates user profile (name, avatar_url)
   */
  async updateProfile(userId, { name, avatar_url }) {
    if (!name || !name.trim()) {
      throw new Error('Name cannot be blank.');
    }
    const cleanName = name.trim();
    await db.run(
      `UPDATE users SET name = ?, avatar_url = COALESCE(?, avatar_url), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [cleanName, avatar_url || null, userId]
    );
    return await db.get('SELECT id, name, email, role, status, avatar_url FROM users WHERE id = ?', [userId]);
  }

  /**
   * Securely changes password with verification of old password
   */
  async changePassword(userId, oldPassword, newPassword) {
    if (!oldPassword || !newPassword) {
      throw new Error('Both current password and new password are required.');
    }
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters.');
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw new Error('User account not found.');
    }

    const isValid = this.verifyPassword(oldPassword, user.password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect.');
    }

    const newHash = this.hashPassword(newPassword);
    await db.run(
      `UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newHash, userId]
    );

    return { success: true, message: 'Password updated successfully.' };
  }
}

export const authService = new AuthService();
export default authService;
