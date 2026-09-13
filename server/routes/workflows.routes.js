import { Router } from 'express';
import { db } from '../database.js';
import { orchestratorService } from '../services/orchestrator.service.js';

const router = Router();

// GET Workforce and Agent Status + System KPIs
router.get('/', async (req, res) => {
  try {
    const workforceData = await orchestratorService.getWorkforceStatus();
    res.json({ success: true, data: workforceData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET list of past workflow runs
router.get('/runs', async (req, res) => {
  try {
    const runs = await db.all(`SELECT * FROM workflow_runs ORDER BY created_at DESC LIMIT 20`);
    res.json({ success: true, data: runs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single workflow run with its task graph nodes
router.get('/runs/:id', async (req, res) => {
  try {
    const run = await db.get(`SELECT * FROM workflow_runs WHERE id = ?`, [req.params.id]);
    if (!run) return res.status(404).json({ success: false, error: 'Workflow run not found' });

    const tasks = await db.all(
      `SELECT * FROM workflow_tasks WHERE run_id = ? ORDER BY order_index ASC`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...run, tasks } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST trigger a new goal execution via AI Orchestrator
router.post('/run', async (req, res) => {
  try {
    const { userGoal, brandId, executionMode } = req.body;
    if (!userGoal) {
      return res.status(400).json({ success: false, error: 'userGoal is required' });
    }

    const executionResult = await orchestratorService.planAndExecuteGoal({
      userGoal,
      brandId,
      executionMode
    });

    res.status(201).json({ success: true, data: executionResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════
// AGENT DOSSIER & DIRECT DISPATCH ENDPOINTS
// ═══════════════════════════════════════════════════

// GET all 12 agents with live status
router.get('/agents', async (req, res) => {
  try {
    const { SPECIALIZED_AGENTS } = await import('../services/orchestrator.service.js');
    
    // Get task counts per agent for live status
    const taskCounts = await db.all(`
      SELECT agent_name, COUNT(*) as task_count,
        MAX(created_at) as last_active
      FROM workflow_tasks
      GROUP BY agent_name
    `);

    const taskMap = {};
    taskCounts.forEach(t => { taskMap[t.agent_name] = t; });

    const agents = SPECIALIZED_AGENTS.map((agent, i) => ({
      ...agent,
      status: i < 4 ? 'Active' : 'Idle',
      taskCount: taskMap[agent.name]?.task_count || 0,
      lastActive: taskMap[agent.name]?.last_active || null
    }));

    res.json({ success: true, data: agents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single agent dossier with recent tasks & stats
router.get('/agents/:id', async (req, res) => {
  try {
    const dossier = await orchestratorService.getAgentDossier(req.params.id);
    res.json({ success: true, data: dossier });
  } catch (err) {
    res.status(err.message.includes('not found') ? 404 : 500).json({ success: false, error: err.message });
  }
});

// POST dispatch a single agent with a direct task
router.post('/agents/:id/dispatch', async (req, res) => {
  try {
    const { task, brandId } = req.body;
    if (!task) {
      return res.status(400).json({ success: false, error: 'task description is required' });
    }

    const result = await orchestratorService.dispatchSingleAgent({
      agentId: req.params.id,
      task,
      brandId
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(err.message.includes('not found') ? 404 : 500).json({ success: false, error: err.message });
  }
});

// GET agent performance stats
router.get('/agents/:id/stats', async (req, res) => {
  try {
    const stats = await orchestratorService.getAgentStats(req.params.id);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(err.message.includes('not found') ? 404 : 500).json({ success: false, error: err.message });
  }
});

export default router;

