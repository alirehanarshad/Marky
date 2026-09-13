import { Router } from 'express';
import { db } from '../database.js';

const router = Router();

// GET audit logs with search, agent filter, and pagination
router.get('/', async (req, res) => {
  try {
    const { agent, status, search, limit = 50 } = req.query;
    let query = `SELECT * FROM audit_logs WHERE 1=1`;
    const params = [];

    if (agent && agent !== 'All') {
      query += ` AND agent_name = ?`;
      params.push(agent);
    }
    if (status && status !== 'All') {
      query += ` AND status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (action LIKE ? OR input_summary LIKE ? OR output_summary LIKE ? OR agent_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(parseInt(limit, 10) || 50);

    const logs = await db.all(query, params);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST append manual audit event
router.post('/', async (req, res) => {
  try {
    const { agent_name = 'Supervisor', tool_name = 'Console', action, status = 'Success', input_summary = '', output_summary = '' } = req.body;
    if (!action) return res.status(400).json({ success: false, error: 'Action is required' });

    const result = await db.run(`
      INSERT INTO audit_logs (agent_name, tool_name, action, status, input_summary, output_summary)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [agent_name, tool_name, action, status, input_summary, output_summary]);

    const created = await db.get(`SELECT * FROM audit_logs WHERE id = ?`, [result.lastID]);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
