import { authService } from '../services/auth.service.js';
import { db } from '../database.js';

/**
 * Enforces valid authentication token. Rejects with 401 if missing or invalid.
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers['x-auth-token'];
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (authHeader) {
      token = authHeader.trim();
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid session token.'
      });
    }

    const user = await authService.verifyToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication session. Please log in again.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Authentication failed: ' + err.message });
  }
}

/**
 * Optional authentication: attaches req.user if a valid token is present,
 * but allows unauthenticated access if omitted.
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers['x-auth-token'];
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (authHeader) {
      token = authHeader.trim();
    }

    if (token) {
      const user = await authService.verifyToken(token);
      if (user) {
        req.user = user;
      }
    }
  } catch (e) {
    // Ignore optional auth parsing errors
  }
  next();
}

/**
 * Role-Based Access Control middleware.
 * Usage: requireRole('ADMIN')
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: This action requires the '${role}' role. Current role: '${req.user.role}'.`
      });
    }

    next();
  };
}

/**
 * Enforces Tenant / Resource Ownership.
 * Allows access if req.user is ADMIN or if resource.user_id matches req.user.id.
 */
export function requireOwnership(table, idParam = 'id') {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    // Admins bypass tenant ownership checks
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const resourceId = req.params[idParam];
    if (!resourceId) return next();

    try {
      const row = await db.get(`SELECT user_id FROM ${table} WHERE id = ?`, [resourceId]);
      if (!row) {
        return res.status(404).json({ success: false, error: 'Resource not found.' });
      }

      // If resource has a user_id and it doesn't match, block with 403 IDOR defense
      if (row.user_id && row.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You do not have permission to access or modify this record.'
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Authorization error: ' + err.message });
    }
  };
}
