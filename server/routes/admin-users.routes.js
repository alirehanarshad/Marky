import { Router } from 'express';
import { authService } from '../services/auth.service.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// All routes here require ADMIN role
router.use(authenticate);
router.use(requireRole('ADMIN'));

// GET /api/admin/users — List all registered platform users
router.get('/', async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/users/:id/status — Toggle user active / suspended status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const userId = parseInt(req.params.id, 10);

    // Prevent admin from locking out own account
    if (userId === req.user.id && status !== 'ACTIVE') {
      return res.status(400).json({ success: false, error: 'Cannot suspend your own active administrator account.' });
    }

    const updated = await authService.updateUserStatus(userId, status);
    res.json({ success: true, data: updated, message: `User status updated to ${status}` });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/users/:id/role — Change user role (ADMIN / USER)
router.patch('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const userId = parseInt(req.params.id, 10);

    if (userId === req.user.id && role !== 'ADMIN') {
      return res.status(400).json({ success: false, error: 'Cannot revoke your own administrator role.' });
    }

    const updated = await authService.updateUserRole(userId, role);
    res.json({ success: true, data: updated, message: `User role updated to ${role}` });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
