import { Router } from 'express';
import { db } from '../database.js';

const router = Router();

// GET all approvals with optional status filter
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `SELECT * FROM approvals WHERE 1=1`;
    const params = [];

    if (status && status !== 'All') {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC`;
    const approvals = await db.all(query, params);

    const parsed = approvals.map(a => ({
      ...a,
      payload: a.payload_json ? JSON.parse(a.payload_json) : {}
    }));

    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Approve action (Supervisor sign-off)
router.post('/:id/approve', async (req, res) => {
  try {
    const { reviewed_by = 'Human Supervisor (Operator 1)', review_reason = 'Action authorized after parameter inspection.' } = req.body;
    
    const approval = await db.get(`SELECT * FROM approvals WHERE id = ?`, [req.params.id]);
    if (!approval) return res.status(404).json({ success: false, error: 'Approval item not found' });

    await db.run(`
      UPDATE approvals 
      SET status = 'Approved', reviewed_by = ?, review_reason = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [reviewed_by, review_reason, req.params.id]);

    // If associated with a task, update task to Completed
    if (approval.task_id) {
      await db.run(`UPDATE workflow_tasks SET status = 'Completed' WHERE id = ?`, [approval.task_id]);
    }

    // If associated with a workflow run, check if all tasks are complete
    if (approval.run_id) {
      const remainingPending = await db.get(
        `SELECT COUNT(*) as count FROM approvals WHERE run_id = ? AND status = 'Pending'`,
        [approval.run_id]
      );
      if (remainingPending.count === 0) {
        await db.run(
          `UPDATE workflow_runs SET status = 'Completed', progress = 100, current_step = 'Workflow authorized & live in production' WHERE id = ?`,
          [approval.run_id]
        );
      }
    }

    // Log to audit trail
    await db.run(`
      INSERT INTO audit_logs (agent_name, tool_name, action, status, input_summary, output_summary)
      VALUES (?, 'Human Approval System', 'Supervisor Authorization Granted', 'Success', ?, ?)
    `, [
      approval.requested_by_agent || 'Advertising Agent',
      `Approval #${approval.id}: ${approval.title}`,
      `Authorized by ${reviewed_by}. Reason: ${review_reason}`
    ]);

    res.json({ success: true, message: 'Action successfully approved and queued for execution' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Reject action
router.post('/:id/reject', async (req, res) => {
  try {
    const { reviewed_by = 'Human Supervisor (Operator 1)', reason = 'Strategy adjustments required by human supervisor.' } = req.body;
    
    const approval = await db.get(`SELECT * FROM approvals WHERE id = ?`, [req.params.id]);
    if (!approval) return res.status(404).json({ success: false, error: 'Approval item not found' });

    await db.run(`
      UPDATE approvals 
      SET status = 'Rejected', reviewed_by = ?, review_reason = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [reviewed_by, reason, req.params.id]);

    if (approval.task_id) {
      await db.run(`UPDATE workflow_tasks SET status = 'Rejected' WHERE id = ?`, [approval.task_id]);
    }

    if (approval.run_id) {
      await db.run(
        `UPDATE workflow_runs SET status = 'Cancelled by Supervisor', current_step = 'Supervisor rejected pending action' WHERE id = ?`,
        [approval.run_id]
      );
    }

    // Log to audit trail
    await db.run(`
      INSERT INTO audit_logs (agent_name, tool_name, action, status, input_summary, output_summary)
      VALUES (?, 'Human Approval System', 'Supervisor Rejection Issued', 'Warning', ?, ?)
    `, [
      approval.requested_by_agent || 'Advertising Agent',
      `Approval #${approval.id}: ${approval.title}`,
      `Rejected by ${reviewed_by}. Reason: ${reason}`
    ]);

    res.json({ success: true, message: 'Action rejected by supervisor.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT Edit parameters and approve
router.put('/:id/edit', async (req, res) => {
  try {
    const { payload, review_reason = 'Parameters adjusted and authorized by supervisor.' } = req.body;
    
    const approval = await db.get(`SELECT * FROM approvals WHERE id = ?`, [req.params.id]);
    if (!approval) return res.status(404).json({ success: false, error: 'Approval item not found' });

    const newPayloadJson = JSON.stringify(payload || {});

    await db.run(`
      UPDATE approvals 
      SET status = 'Approved', payload_json = ?, review_reason = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [newPayloadJson, review_reason, req.params.id]);

    if (approval.task_id) {
      await db.run(`UPDATE workflow_tasks SET status = 'Completed', output_data = ? WHERE id = ?`, [newPayloadJson, approval.task_id]);
    }

    // Log to audit trail
    await db.run(`
      INSERT INTO audit_logs (agent_name, tool_name, action, status, input_summary, output_summary)
      VALUES (?, 'Human Approval System', 'Supervisor Edited & Approved', 'Success', ?, ?)
    `, [
      approval.requested_by_agent || 'Advertising Agent',
      `Approval #${approval.id}: Parameters Modified`,
      review_reason
    ]);

    res.json({ success: true, message: 'Parameters updated and action approved.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
