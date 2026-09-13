import { Router } from 'express';
import { db } from '../database.js';
import { createRateLimiter } from '../middleware/security.middleware.js';

const router = Router();

const contactRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: 'Too many contact requests from this connection. Please try again later.'
});

// POST /api/contact — Public contact form submission
router.post('/', contactRateLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }

    if (!email || !email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, error: 'Subject is required.' });
    }

    if (!message || !message.trim() || message.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Message must be at least 5 characters long.' });
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    const result = await db.run(
      `INSERT INTO contact_submissions (name, email, subject, message, ip_address, status)
       VALUES (?, ?, ?, ?, ?, 'NEW')`,
      [name.trim(), email.trim().toLowerCase(), subject.trim(), message.trim(), String(ip)]
    );

    res.status(201).json({
      success: true,
      submissionId: result.lastID,
      message: 'Thank you for reaching out! Your inquiry has been securely logged.'
    });
  } catch (err) {
    console.error('[Contact] Error processing submission:', err.message);
    res.status(500).json({ success: false, error: 'Unable to process contact submission. Please try again later.' });
  }
});

// GET /api/contact — Admin only list of contact inquiries
router.get('/', async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Access denied: Administrator privileges required.' });
    }

    const submissions = await db.all(
      `SELECT id, name, email, subject, message, status, created_at
       FROM contact_submissions ORDER BY created_at DESC LIMIT 100`
    );

    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
