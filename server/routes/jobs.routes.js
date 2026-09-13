import { Router } from 'express';
import { jobService } from '../services/jobs.service.js';
import { db } from '../database.js';

const router = Router();

// GET job status and progress
router.get('/:id', async (req, res) => {
  try {
    const job = await jobService.getJob(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    // IDOR / Tenant verification
    if (req.user && req.user.role !== 'ADMIN' && job.user_id && job.user_id !== req.user.id && job.user_id !== 1) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not have permission to view this job.' });
    }
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST cancel job
router.post('/:id/cancel', async (req, res) => {
  try {
    const job = await jobService.getJob(req.params.id);
    if (job && req.user && req.user.role !== 'ADMIN' && job.user_id && job.user_id !== req.user.id && job.user_id !== 1) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not have permission to cancel this job.' });
    }
    const result = await jobService.cancelJob(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET list recent background jobs
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    let query = 'SELECT job_id, job_type, status, progress, current_step, error_message, created_at, completed_at FROM background_jobs WHERE 1=1';
    const params = [];
    if (userId && !isAdmin) {
      query += ' AND (user_id = ? OR user_id = 1)';
      params.push(userId);
    }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const jobs = await db.all(query, params);
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
