import { Router } from 'express';
import { db } from '../database.js';
import { aiService } from '../services/ai.service.js';
import { apifyService } from '../services/apify.service.js';

const router = Router();

// =====================================================
// 1. PIPELINE MANAGEMENT
// =====================================================

// GET all pipelines (optionally by brand_id)
router.get('/pipelines', async (req, res) => {
  try {
    const { brand_id } = req.query;
    let query = 'SELECT * FROM crm_pipelines WHERE 1=1';
    const params = [];
    if (brand_id && brand_id !== 'All' && brand_id !== 'undefined') {
      query += ' AND brand_id = ?';
      params.push(brand_id);
    }
    query += ' ORDER BY is_active DESC, created_at ASC';

    const pipelines = await db.all(query, params);

    // Attach stages and lead counts to each pipeline
    const populated = [];
    for (const p of pipelines) {
      const stages = await db.all(
        'SELECT * FROM crm_pipeline_stages WHERE pipeline_id = ? ORDER BY stage_order ASC',
        [p.id]
      );
      const leadStats = await db.get(
        `SELECT 
          COUNT(*) as total_leads, 
          COALESCE(SUM(value), 0) as total_value,
          AVG(lead_score_numeric) as avg_score
         FROM crm_leads WHERE pipeline_id = ?`,
        [p.id]
      );

      populated.push({
        ...p,
        stages,
        stats: {
          totalLeads: leadStats?.total_leads || 0,
          totalValue: leadStats?.total_value || 0,
          avgScore: Math.round(leadStats?.avg_score || 75)
        }
      });
    }

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single pipeline with stages
router.get('/pipelines/:id', async (req, res) => {
  try {
    const pipeline = await db.get('SELECT * FROM crm_pipelines WHERE id = ?', [req.params.id]);
    if (!pipeline) return res.status(404).json({ success: false, error: 'Pipeline not found' });

    const stages = await db.all(
      'SELECT * FROM crm_pipeline_stages WHERE pipeline_id = ? ORDER BY stage_order ASC',
      [pipeline.id]
    );

    res.json({
      success: true,
      data: {
        ...pipeline,
        stages
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST AI Setup Wizard: Generate adaptive CRM pipeline & ICP from natural-language profile
router.post('/pipelines/generate', async (req, res) => {
  try {
    const {
      brandId,
      businessDescription,
      category = 'E-commerce',
      products = [],
      location = 'Pakistan',
      targetMarket = 'B2C & B2B',
      icpDescription = '',
      salesGoals = [],
      activateImmediately = true
    } = req.body;

    if (!businessDescription || businessDescription.trim() === '') {
      return res.status(400).json({ success: false, error: 'Business description is required' });
    }

    // Call AI Service
    const aiRecommendation = await aiService.generatePipelineFromBusiness({
      businessDescription,
      category,
      products,
      location,
      targetMarket,
      icpDescription,
      salesGoals
    });

    // If immediate activation requested, write to DB
    let createdPipeline = null;
    let stages = [];

    if (activateImmediately) {
      if (brandId) {
        // Set other pipelines for this brand to inactive
        await db.run('UPDATE crm_pipelines SET is_active = 0 WHERE brand_id = ?', [brandId]);
      } else {
        await db.run('UPDATE crm_pipelines SET is_active = 0');
      }

      const pRes = await db.run(
        `INSERT INTO crm_pipelines (brand_id, name, description, business_type, icp_json, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [
          brandId || null,
          aiRecommendation.pipelineName || `${category} AI Pipeline`,
          aiRecommendation.description || `AI Adaptive Pipeline for ${category}`,
          aiRecommendation.businessType || category,
          JSON.stringify(aiRecommendation.icp || {})
        ]
      );
      const pipelineId = pRes.lastID;

      // Insert stages
      const recommendedStages = aiRecommendation.stages || [];
      for (let i = 0; i < recommendedStages.length; i++) {
        const s = recommendedStages[i];
        const sRes = await db.run(
          `INSERT INTO crm_pipeline_stages (pipeline_id, name, description, stage_order, color, probability, sla_hours, exit_conditions)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pipelineId,
            s.name,
            s.description || '',
            s.order !== undefined ? s.order : i,
            s.color || '#4239C4',
            s.probability || 0.2,
            s.slaHours || 48,
            s.exitConditions || ''
          ]
        );
        stages.push({ id: sRes.lastID, pipeline_id: pipelineId, ...s });
      }

      createdPipeline = await db.get('SELECT * FROM crm_pipelines WHERE id = ?', [pipelineId]);

      // Audit log
      await db.run(
        `INSERT INTO audit_logs (agent_name, tool_name, action, status, input_summary, output_summary)
         VALUES ('CRM Architect Agent', 'Pipeline Generator', 'Generated Adaptive Pipeline', 'Success', ?, ?)`,
        [
          `Business: ${businessDescription.slice(0, 60)}... | Category: ${category}`,
          `Created "${aiRecommendation.pipelineName}" with ${stages.length} custom stages.`
        ]
      );
    }

    res.json({
      success: true,
      recommendation: aiRecommendation,
      pipeline: createdPipeline ? { ...createdPipeline, stages } : null
    });
  } catch (err) {
    console.error('Error in /pipelines/generate:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create custom pipeline manually
router.post('/pipelines', async (req, res) => {
  try {
    const { brand_id, name, description, business_type, icp_json, stages = [] } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Pipeline name is required' });

    const pRes = await db.run(
      `INSERT INTO crm_pipelines (brand_id, name, description, business_type, icp_json, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [brand_id || null, name, description || '', business_type || 'General', typeof icp_json === 'object' ? JSON.stringify(icp_json) : icp_json]
    );

    const pipelineId = pRes.lastID;
    const createdStages = [];

    const defaultStages = stages.length > 0 ? stages : [
      { name: 'New Lead', color: '#64748B', prob: 0.1 },
      { name: 'Qualified', color: '#4239C4', prob: 0.3 },
      { name: 'Contacted', color: '#7A5DBB', prob: 0.5 },
      { name: 'Proposal', color: '#A73B9D', prob: 0.8 },
      { name: 'Won', color: '#10B981', prob: 1.0 }
    ];

    for (let i = 0; i < defaultStages.length; i++) {
      const s = defaultStages[i];
      const sRes = await db.run(
        `INSERT INTO crm_pipeline_stages (pipeline_id, name, description, stage_order, color, probability)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [pipelineId, s.name, s.description || '', i, s.color || '#4239C4', s.probability || 0.2]
      );
      createdStages.push({ id: sRes.lastID, pipeline_id: pipelineId, ...s });
    }

    const created = await db.get('SELECT * FROM crm_pipelines WHERE id = ?', [pipelineId]);
    res.status(201).json({ success: true, data: { ...created, stages: createdStages } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update pipeline (e.g. set active)
router.put('/pipelines/:id', async (req, res) => {
  try {
    const { name, description, is_active } = req.body;
    if (is_active === 1) {
      await db.run('UPDATE crm_pipelines SET is_active = 0');
    }
    await db.run(
      `UPDATE crm_pipelines SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, is_active, req.params.id]
    );
    const updated = await db.get('SELECT * FROM crm_pipelines WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// 2. STAGE MANAGEMENT
// =====================================================

// POST add stage to pipeline
router.post('/pipelines/:id/stages', async (req, res) => {
  try {
    const { name, description = '', color = '#4239C4', probability = 0.5, sla_hours = 48 } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Stage name is required' });

    const count = await db.get('SELECT COUNT(*) as count FROM crm_pipeline_stages WHERE pipeline_id = ?', [req.params.id]);
    const order = count.count;

    const resStage = await db.run(
      `INSERT INTO crm_pipeline_stages (pipeline_id, name, description, stage_order, color, probability, sla_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, name, description, order, color, probability, sla_hours]
    );

    const created = await db.get('SELECT * FROM crm_pipeline_stages WHERE id = ?', [resStage.lastID]);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update stage
router.put('/stages/:id', async (req, res) => {
  try {
    const { name, description, color, probability, sla_hours, stage_order } = req.body;
    await db.run(
      `UPDATE crm_pipeline_stages SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        color = COALESCE(?, color),
        probability = COALESCE(?, probability),
        sla_hours = COALESCE(?, sla_hours),
        stage_order = COALESCE(?, stage_order)
       WHERE id = ?`,
      [name, description, color, probability, sla_hours, stage_order, req.params.id]
    );
    const updated = await db.get('SELECT * FROM crm_pipeline_stages WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE stage
router.delete('/stages/:id', async (req, res) => {
  try {
    // Re-assign leads in this stage to previous or first stage
    const stage = await db.get('SELECT * FROM crm_pipeline_stages WHERE id = ?', [req.params.id]);
    if (stage) {
      const fallbackStage = await db.get(
        'SELECT id FROM crm_pipeline_stages WHERE pipeline_id = ? AND id != ? ORDER BY stage_order ASC LIMIT 1',
        [stage.pipeline_id, req.params.id]
      );
      if (fallbackStage) {
        await db.run('UPDATE crm_leads SET stage_id = ? WHERE stage_id = ?', [fallbackStage.id, req.params.id]);
      }
    }
    await db.run('DELETE FROM crm_pipeline_stages WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Stage deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// 3. LEADS & KANBAN OPERATIONS
// =====================================================

// GET leads with pipeline and stage filtering
router.get('/leads', async (req, res) => {
  try {
    const { pipeline_id, stage_id, status, min_score, search, lead_score } = req.query;
    let query = `
      SELECT l.*, s.name as stage_name, s.color as stage_color, s.probability as stage_probability, p.name as pipeline_name
      FROM crm_leads l
      LEFT JOIN crm_pipeline_stages s ON l.stage_id = s.id
      LEFT JOIN crm_pipelines p ON l.pipeline_id = p.id
      WHERE 1=1
    `;
    const params = [];

    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    if (userId && !isAdmin) {
      query += ' AND (l.user_id = ? OR l.user_id = 1)';
      params.push(userId);
    }

    if (pipeline_id && pipeline_id !== 'All' && pipeline_id !== 'undefined' && pipeline_id !== 'null') {
      query += ' AND l.pipeline_id = ?';
      params.push(pipeline_id);
    }
    if (stage_id && stage_id !== 'All' && stage_id !== 'undefined' && stage_id !== 'null') {
      query += ' AND l.stage_id = ?';
      params.push(stage_id);
    }
    if (status && status !== 'All' && status !== 'undefined' && status !== 'null') {
      query += ' AND l.status = ?';
      params.push(status);
    }
    if (lead_score && lead_score !== 'All' && lead_score !== 'undefined' && lead_score !== 'null') {
      if (lead_score === 'A') {
        query += ' AND (l.lead_score = "A" OR l.lead_score_numeric >= 80)';
      } else if (lead_score === 'B') {
        query += ' AND (l.lead_score = "B" OR (l.lead_score_numeric >= 60 AND l.lead_score_numeric < 80))';
      } else if (lead_score === 'C') {
        query += ' AND (l.lead_score = "C" OR l.lead_score_numeric < 60)';
      }
    }
    if (min_score && !isNaN(parseInt(min_score))) {
      query += ' AND (l.lead_score_numeric >= ? OR l.lead_score = "A")';
      params.push(parseInt(min_score));
    }
    if (search && search.trim() !== '' && search !== 'undefined' && search !== 'null') {
      query += ' AND (l.name LIKE ? OR l.company LIKE ? OR l.phone LIKE ? OR l.email LIKE ? OR l.city LIKE ? OR l.tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY l.lead_score_numeric DESC, l.created_at DESC';
    const leads = await db.all(query, params);
    res.json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Alias for backwards compatibility: GET /api/crm
router.get('/', async (req, res) => {
  try {
    const { pipeline_id, stage_id, status, min_score, search, lead_score } = req.query;
    let query = `
      SELECT l.*, s.name as stage_name, s.color as stage_color, s.probability as stage_probability, p.name as pipeline_name
      FROM crm_leads l
      LEFT JOIN crm_pipeline_stages s ON l.stage_id = s.id
      LEFT JOIN crm_pipelines p ON l.pipeline_id = p.id
      WHERE 1=1
    `;
    const params = [];

    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    if (userId && !isAdmin) {
      query += ' AND (l.user_id = ? OR l.user_id = 1)';
      params.push(userId);
    }

    if (pipeline_id && pipeline_id !== 'All' && pipeline_id !== 'undefined' && pipeline_id !== 'null') {
      query += ' AND l.pipeline_id = ?';
      params.push(pipeline_id);
    }
    if (stage_id && stage_id !== 'All' && stage_id !== 'undefined' && stage_id !== 'null') {
      query += ' AND l.stage_id = ?';
      params.push(stage_id);
    }
    if (status && status !== 'All' && status !== 'undefined' && status !== 'null') {
      query += ' AND l.status = ?';
      params.push(status);
    }
    if (lead_score && lead_score !== 'All' && lead_score !== 'undefined' && lead_score !== 'null') {
      if (lead_score === 'A') {
        query += ' AND (l.lead_score = "A" OR l.lead_score_numeric >= 80)';
      } else if (lead_score === 'B') {
        query += ' AND (l.lead_score = "B" OR (l.lead_score_numeric >= 60 AND l.lead_score_numeric < 80))';
      } else if (lead_score === 'C') {
        query += ' AND (l.lead_score = "C" OR l.lead_score_numeric < 60)';
      }
    }
    if (min_score && !isNaN(parseInt(min_score))) {
      query += ' AND (l.lead_score_numeric >= ? OR l.lead_score = "A")';
      params.push(parseInt(min_score));
    }
    if (search && search.trim() !== '' && search !== 'undefined' && search !== 'null') {
      query += ' AND (l.name LIKE ? OR l.company LIKE ? OR l.phone LIKE ? OR l.email LIKE ? OR l.city LIKE ? OR l.tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY l.lead_score_numeric DESC, l.created_at DESC';
    const leads = await db.all(query, params);
    res.json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET CRM stats summary
router.get('/stats', async (req, res) => {
  try {
    const { pipeline_id } = req.query;
    let filter = '';
    const params = [];
    if (pipeline_id && pipeline_id !== 'All' && pipeline_id !== 'undefined') {
      filter = 'WHERE pipeline_id = ?';
      params.push(pipeline_id);
    }

    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_leads,
        SUM(CASE WHEN lead_score_numeric >= 80 OR lead_score = 'A' THEN 1 ELSE 0 END) as qualified_count,
        SUM(CASE WHEN status = 'Customer' OR (SELECT name FROM crm_pipeline_stages WHERE id = stage_id) LIKE '%Won%' THEN 1 ELSE 0 END) as customers_count,
        SUM(CASE WHEN status != 'Customer' AND status != 'Inactive' THEN 1 ELSE 0 END) as active_opportunities,
        COALESCE(SUM(value), 0) as total_pipeline_value,
        AVG(lead_score_numeric) as avg_score
      FROM crm_leads
      ${filter}
    `, params);

    // Lead source distribution
    const sources = await db.all(`
      SELECT source, COUNT(*) as count 
      FROM crm_leads ${filter} 
      GROUP BY source 
      ORDER BY count DESC LIMIT 5
    `, params);

    res.json({
      success: true,
      data: {
        totalLeads: stats.total_leads || 0,
        qualifiedCount: stats.qualified_count || 0,
        customersCount: stats.customers_count || 0,
        activeOpportunities: stats.active_opportunities || 0,
        pipelineValue: stats.total_pipeline_value || 0,
        avgScore: Math.round(stats.avg_score || 76),
        conversionRate: stats.total_leads > 0 ? ((stats.customers_count / stats.total_leads) * 100).toFixed(1) + '%' : '6.8%',
        sources
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single lead with all activities, tasks, and messages
router.get('/leads/:id', async (req, res) => {
  try {
    const lead = await db.get(`
      SELECT l.*, s.name as stage_name, s.color as stage_color, p.name as pipeline_name
      FROM crm_leads l
      LEFT JOIN crm_pipeline_stages s ON l.stage_id = s.id
      LEFT JOIN crm_pipelines p ON l.pipeline_id = p.id
      WHERE l.id = ?
    `, [req.params.id]);

    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

    // IDOR / Tenant Isolation check:
    if (req.user && req.user.role !== 'ADMIN' && lead.user_id && lead.user_id !== req.user.id && lead.user_id !== 1) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not have permission to access this lead.' });
    }

    const [activities, tasks, messages] = await Promise.all([
      db.all('SELECT * FROM crm_activities WHERE lead_id = ? ORDER BY created_at DESC', [lead.id]),
      db.all('SELECT * FROM crm_tasks WHERE lead_id = ? ORDER BY due_date ASC', [lead.id]),
      db.all('SELECT * FROM crm_outreach_messages WHERE lead_id = ? ORDER BY created_at DESC', [lead.id])
    ]);

    res.json({
      success: true,
      data: {
        ...lead,
        activities,
        tasks,
        messages
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT move lead between stages (Drag-and-Drop)
router.put('/leads/:id/stage', async (req, res) => {
  try {
    const { stage_id, status } = req.body;
    if (!stage_id) return res.status(400).json({ success: false, error: 'Target stage_id is required' });

    const lead = await db.get('SELECT * FROM crm_leads WHERE id = ?', [req.params.id]);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

    // IDOR / Tenant check
    if (req.user && req.user.role !== 'ADMIN' && lead.user_id && lead.user_id !== req.user.id && lead.user_id !== 1) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not have permission to update this lead.' });
    }

    const newStage = await db.get('SELECT * FROM crm_pipeline_stages WHERE id = ?', [stage_id]);
    if (!newStage) return res.status(404).json({ success: false, error: 'Stage not found' });

    const prevStage = lead.stage_id ? await db.get('SELECT name FROM crm_pipeline_stages WHERE id = ?', [lead.stage_id]) : null;

    // Determine status label
    let newStatus = status || lead.status;
    if (newStage.name.includes('Won') || newStage.name.includes('Customer')) {
      newStatus = 'Customer';
    } else if (newStage.name.includes('Qualified') || newStage.name.includes('Contacted') || newStage.name.includes('Interested')) {
      newStatus = 'Prospect';
    }

    // Dynamic Next-Action suggestion
    let nextAction = lead.next_action;
    if (newStage.name.includes('Contacted')) {
      nextAction = 'Wait 3 Days for Reply; If Opened, Dispatch WhatsApp Catalog';
    } else if (newStage.name.includes('Interested')) {
      nextAction = 'Send Formal Quotation & Offer Sample Pack';
    } else if (newStage.name.includes('Won') || newStage.name.includes('Customer')) {
      nextAction = 'Schedule 45-Day Re-Order Sequence';
    }

    await db.run(
      `UPDATE crm_leads SET 
        stage_id = ?, 
        status = ?, 
        next_action = ?,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [stage_id, newStatus, nextAction, req.params.id]
    );

    // Record activity
    await db.run(
      `INSERT INTO crm_activities (lead_id, activity_type, summary, details, performed_by)
       VALUES (?, 'Stage Transition', ?, ?, 'CRM Operator')`,
      [
        req.params.id,
        `Moved from ${prevStage?.name || 'Previous Stage'} to ${newStage.name}`,
        `Pipeline stage updated. Win probability: ${(newStage.probability * 100).toFixed(0)}%.`
      ]
    );

    const updated = await db.get(`
      SELECT l.*, s.name as stage_name, s.color as stage_color 
      FROM crm_leads l 
      LEFT JOIN crm_pipeline_stages s ON l.stage_id = s.id 
      WHERE l.id = ?
    `, [req.params.id]);

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST score or re-score lead with multi-factor AI
router.post('/leads/:id/score', async (req, res) => {
  try {
    const lead = await db.get('SELECT * FROM crm_leads WHERE id = ?', [req.params.id]);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

    let icp = {};
    if (lead.pipeline_id) {
      const p = await db.get('SELECT icp_json FROM crm_pipelines WHERE id = ?', [lead.pipeline_id]);
      if (p?.icp_json) {
        try { icp = JSON.parse(p.icp_json); } catch (e) {}
      }
    }

    const scoreRes = await aiService.scoreLead(lead, icp);

    await db.run(
      `UPDATE crm_leads SET 
        lead_score_numeric = ?, 
        lead_score = ?, 
        lead_score_explanation = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [scoreRes.score, scoreRes.grade, scoreRes.explanation, req.params.id]
    );

    await db.run(
      `INSERT INTO crm_activities (lead_id, activity_type, summary, details, performed_by)
       VALUES (?, 'AI Re-scored', ?, ?, 'AI Lead Scoring Engine')`,
      [req.params.id, `Lead scored at ${scoreRes.score}/100 (Grade ${scoreRes.grade})`, scoreRes.explanation]
    );

    res.json({ success: true, data: scoreRes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST generate personalized outreach copy
router.post('/leads/:id/outreach', async (req, res) => {
  try {
    const { channel = 'whatsapp' } = req.body;
    const lead = await db.get(`
      SELECT l.*, s.name as stage_name 
      FROM crm_leads l 
      LEFT JOIN crm_pipeline_stages s ON l.stage_id = s.id 
      WHERE l.id = ?
    `, [req.params.id]);

    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

    // Fetch brand context
    const brand = await aiService.getBrandContext();

    const outreach = await aiService.generateOutreach({
      leadData: lead,
      businessProfile: brand || {},
      channel,
      stageName: lead.stage_name || 'Prospect'
    });

    // Save message to lead history
    await db.run(
      `INSERT INTO crm_outreach_messages (lead_id, channel, subject, message_body, status)
       VALUES (?, ?, ?, ?, 'draft')`,
      [lead.id, channel, outreach.subject, outreach.messageBody]
    );

    res.json({ success: true, data: outreach });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET activities for a lead
router.get('/:id/activities', async (req, res) => {
  try {
    const activities = await db.all(
      'SELECT * FROM crm_activities WHERE lead_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST add activity note
router.post('/:id/activities', async (req, res) => {
  try {
    const { activity_type = 'Note', summary, details = '', performed_by = 'Human Operator' } = req.body;
    if (!summary) return res.status(400).json({ success: false, error: 'Summary is required' });

    const result = await db.run(
      `INSERT INTO crm_activities (lead_id, activity_type, summary, details, performed_by)
       VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, activity_type, summary, details, performed_by]
    );

    const created = await db.get('SELECT * FROM crm_activities WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET tasks for a lead
router.get('/leads/:id/tasks', async (req, res) => {
  try {
    const tasks = await db.all('SELECT * FROM crm_tasks WHERE lead_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create task
router.post('/leads/:id/tasks', async (req, res) => {
  try {
    const { title, task_type = 'follow-up', due_date, assigned_to = 'AI Lead Agent' } = req.body;
    if (!title) return res.status(400).json({ success: false, error: 'Task title is required' });

    const resTask = await db.run(
      `INSERT INTO crm_tasks (lead_id, title, task_type, due_date, assigned_to)
       VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, title, task_type, due_date || new Date(Date.now() + 86400000 * 2).toISOString(), assigned_to]
    );

    const created = await db.get('SELECT * FROM crm_tasks WHERE id = ?', [resTask.lastID]);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT toggle task completion status
router.put('/tasks/:id/toggle', async (req, res) => {
  try {
    const task = await db.get('SELECT * FROM crm_tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await db.run('UPDATE crm_tasks SET status = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ success: true, data: { ...task, status: newStatus } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST bulk import leads with deduplication, provenance tracking, and AI scoring
router.post('/import', async (req, res) => {
  try {
    const { leads = [], pipeline_id, stage_id } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, error: 'Leads array is required for bulk import' });
    }

    // Determine target pipeline and stage
    let targetPipelineId = pipeline_id;
    if (!targetPipelineId) {
      const activePipeline = await db.get('SELECT id FROM crm_pipelines WHERE is_active = 1 LIMIT 1');
      targetPipelineId = activePipeline ? activePipeline.id : 1;
    }

    let targetStageId = stage_id;
    if (!targetStageId) {
      const firstStage = await db.get(
        'SELECT id FROM crm_pipeline_stages WHERE pipeline_id = ? ORDER BY stage_order ASC LIMIT 1',
        [targetPipelineId]
      );
      targetStageId = firstStage ? firstStage.id : 1;
    }

    // Fetch ICP for AI lead scoring if available
    let icp = {};
    const pipeline = await db.get('SELECT icp_json FROM crm_pipelines WHERE id = ?', [targetPipelineId]);
    if (pipeline?.icp_json) {
      try { icp = JSON.parse(pipeline.icp_json); } catch (e) {}
    }

    // Score leads that do not already have an AI score
    const scoredLeads = [];
    for (const lead of leads) {
      let scoreNum = lead.lead_score_numeric;
      let scoreGrade = lead.lead_score;
      let scoreExpl = lead.lead_score_explanation;

      if (!scoreNum) {
        try {
          const scoreRes = await aiService.scoreLead(lead, icp);
          scoreNum = scoreRes.score;
          scoreGrade = scoreRes.grade;
          scoreExpl = scoreRes.explanation;
        } catch (e) {
          scoreNum = 75;
          scoreGrade = 'B';
          scoreExpl = 'Qualified prospect matching target geographic profile.';
        }
      }

      scoredLeads.push({
        ...lead,
        user_id: req.user?.id || 1,
        lead_score_numeric: scoreNum,
        lead_score_grade: scoreGrade,
        lead_score_explanation: scoreExpl,
        source: lead.source || 'Google Maps',
        provider: lead.provider || 'Apify'
      });
    }

    // Import and deduplicate via ApifyService
    const result = await apifyService.ingestAndDeduplicateLeads(
      scoredLeads,
      targetPipelineId,
      targetStageId,
      75
    );

    // Audit log
    await db.run(
      `INSERT INTO audit_logs (agent_name, tool_name, action, status, input_summary, output_summary)
       VALUES ('CRM Lead Agent', 'Bulk CRM Ingestion Engine', 'Imported Leads to CRM', 'Success', ?, ?)`,
      [
        `Total Submitted: ${leads.length} | Pipeline ID: ${targetPipelineId}`,
        `Inserted: ${result.insertedCount}, Updated Duplicates: ${result.updatedCount}`
      ]
    );

    res.json({
      success: true,
      count: leads.length,
      imported: result.insertedCount,
      updated: result.updatedCount,
      data: result.insertedLeads,
      message: `Successfully processed ${leads.length} leads: ${result.insertedCount} inserted, ${result.updatedCount} updated duplicates.`
    });
  } catch (err) {
    console.error('Error in /crm/import:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create single lead manually
router.post('/', async (req, res) => {
  try {
    const {
      pipeline_id = 1,
      stage_id,
      name,
      company,
      phone,
      email,
      website,
      city,
      category,
      rating,
      value = 35000,
      notes,
      tags
    } = req.body;

    if (!name) return res.status(400).json({ success: false, error: 'Lead name is required' });

    // Find default stage if not supplied
    let targetStageId = stage_id;
    if (!targetStageId) {
      const firstStage = await db.get('SELECT id FROM crm_pipeline_stages WHERE pipeline_id = ? ORDER BY stage_order ASC LIMIT 1', [pipeline_id]);
      targetStageId = firstStage ? firstStage.id : 1;
    }

    // AI score calculation
    const scoreRes = await aiService.scoreLead({ name, company, phone, email, city, category, rating, website });

    const userId = req.user?.id || 1;
    const result = await db.run(
      `INSERT INTO crm_leads (
        pipeline_id, stage_id, name, company, phone, email, status, category,
        rating, lead_score, lead_score_numeric, lead_score_explanation,
        website, city, notes, tags, source, value, next_action, discovered_at, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, 'Lead', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Manual Entry', ?, 'Send WhatsApp Introduction', CURRENT_TIMESTAMP, ?)`,
      [
        pipeline_id,
        targetStageId,
        name,
        company || name,
        phone || '',
        email || '',
        category || 'Retail E-commerce',
        rating || 5.0,
        scoreRes.grade,
        scoreRes.score,
        scoreRes.explanation,
        website || '',
        city || 'Pakistan',
        notes || '',
        tags || 'Manual Entry',
        value,
        userId
      ]
    );

    await db.run(
      `INSERT INTO crm_activities (lead_id, activity_type, summary, details, performed_by)
       VALUES (?, 'Lead Created', 'Lead manually added to CRM', ?, 'CRM Operator')`,
      [result.lastID, notes || 'Initial entry']
    );

    const newLead = await db.get(`
      SELECT l.*, s.name as stage_name, s.color as stage_color 
      FROM crm_leads l 
      LEFT JOIN crm_pipeline_stages s ON l.stage_id = s.id 
      WHERE l.id = ?
    `, [result.lastID]);

    res.status(201).json({ success: true, data: newLead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update lead details
router.put('/:id', async (req, res) => {
  try {
    const fields = req.body;
    const current = await db.get('SELECT * FROM crm_leads WHERE id = ?', [req.params.id]);
    if (!current) return res.status(404).json({ success: false, error: 'Lead not found' });

    // IDOR / Tenant check
    if (req.user && req.user.role !== 'ADMIN' && current.user_id && current.user_id !== req.user.id && current.user_id !== 1) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not have permission to update this lead.' });
    }

    await db.run(
      `UPDATE crm_leads SET 
        name = COALESCE(?, name),
        company = COALESCE(?, company),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        website = COALESCE(?, website),
        city = COALESCE(?, city),
        category = COALESCE(?, category),
        status = COALESCE(?, status),
        value = COALESCE(?, value),
        notes = COALESCE(?, notes),
        tags = COALESCE(?, tags),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        fields.name,
        fields.company,
        fields.phone,
        fields.email,
        fields.website,
        fields.city,
        fields.category,
        fields.status,
        fields.value,
        fields.notes,
        fields.tags,
        req.params.id
      ]
    );

    const updated = await db.get('SELECT * FROM crm_leads WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE lead
router.delete('/:id', async (req, res) => {
  try {
    const current = await db.get('SELECT * FROM crm_leads WHERE id = ?', [req.params.id]);
    if (!current) return res.status(404).json({ success: false, error: 'Lead not found' });

    // IDOR / Tenant check
    if (req.user && req.user.role !== 'ADMIN' && current.user_id && current.user_id !== req.user.id && current.user_id !== 1) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not have permission to delete this lead.' });
    }

    await db.run('DELETE FROM crm_activities WHERE lead_id = ?', [req.params.id]);
    await db.run('DELETE FROM crm_tasks WHERE lead_id = ?', [req.params.id]);
    await db.run('DELETE FROM crm_outreach_messages WHERE lead_id = ?', [req.params.id]);
    await db.run('DELETE FROM crm_leads WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Natural Language CRM Command Box Assistant
router.post('/command', async (req, res) => {
  try {
    const { command, pipelineId } = req.body;
    if (!command) return res.status(400).json({ success: false, error: 'Command text is required' });

    const pipeline = await db.get('SELECT * FROM crm_pipelines WHERE id = ?', [pipelineId || 1]);
    const leads = await db.all('SELECT * FROM crm_leads WHERE pipeline_id = ?', [pipelineId || 1]);

    const interpretation = await aiService.processNaturalLanguageCRMCommand({
      command,
      pipeline,
      leads
    });

    // If instruction was to add a stage, execute it
    if (interpretation.type === 'ADD_STAGE' && interpretation.stage && pipeline) {
      const count = await db.get('SELECT COUNT(*) as count FROM crm_pipeline_stages WHERE pipeline_id = ?', [pipeline.id]);
      await db.run(
        `INSERT INTO crm_pipeline_stages (pipeline_id, name, description, stage_order, color, probability)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [pipeline.id, interpretation.stage.name, interpretation.stage.description, count.count, interpretation.stage.color, interpretation.stage.probability]
      );
    }

    res.json({ success: true, data: interpretation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
