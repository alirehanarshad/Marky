import { Router } from 'express';
import { authService } from '../services/auth.service.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { createRateLimiter } from '../middleware/security.middleware.js';

const router = Router();

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts
  message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
});

// POST /api/auth/register — Public self-service signup (role is strictly 'USER')
router.post('/register', authRateLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register({ name, email, password });
    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      ...result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login — Authenticate credentials & return token
router.post('/login', authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({
      success: true,
      message: 'Login successful.',
      ...result
    });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me — Get profile of currently authenticated user
router.get('/me', authenticate, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// PUT /api/auth/profile — Update user profile (name, avatar)
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, avatar_url } = req.body;
    const updated = await authService.updateProfile(req.user.id, { name, avatar_url });
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/auth/change-password — Securely change password
router.post('/change-password', authenticate, authRateLimiter, async (req, res) => {
  try {
    const currentPassword = req.body.currentPassword || req.body.oldPassword;
    const { newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/auth/logout — Clears session context
router.post('/logout', optionalAuth, async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

export default router;
