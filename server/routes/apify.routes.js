import { Router } from 'express';
import { apifyService } from '../services/apify.service.js';
import { aiService } from '../services/ai.service.js';
import { db } from '../database.js';

const router = Router();

// GET Apify configuration status (masked token only, never plain secret)
router.get('/config', async (req, res) => {
  try {
    const status = await apifyService.getStatus();
    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST save or update Apify API key
router.post('/config', async (req, res) => {
  try {
    const { apiKey, monthlyBudgetLimit = 25.0 } = req.body;
    if (!apiKey) {
      return res.status(400).json({ success: false, error: 'API key is required' });
    }

    const result = await apifyService.saveApiKey(apiKey, monthlyBudgetLimit);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST test connection against live Apify API
router.post('/test', async (req, res) => {
  try {
    const { apiKey } = req.body || {};
    const result = await apifyService.testConnection(apiKey);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE remove Apify API key
router.delete('/config', async (req, res) => {
  try {
    const result = await apifyService.removeApiKey();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Apify usage metrics & runs
router.get('/usage', async (req, res) => {
  try {
    const result = await apifyService.getUsage();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET pre-configured Apify actors directory
router.get('/actors', async (req, res) => {
  try {
    const actors = await db.all('SELECT * FROM apify_actors ORDER BY id ASC');
    res.json({ success: true, data: actors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST run automated lead discovery job with deduplication & AI scoring
router.post('/discover', async (req, res) => {
  try {
    const city = req.body.city || req.body.location || 'Lahore';
    const category = req.body.category || req.body.query || 'Organic Foods';
    const pipelineId = req.body.pipelineId || req.body.pipeline_id || 1;
    const stageId = req.body.stageId || req.body.stage_id || 1;
    const maxResults = req.body.maxResults || req.body.max_items || 25;
    const searchQuery = req.body.searchQuery || req.body.query || '';

    // 1. Fetch active pipeline ICP
    const pipeline = await db.get('SELECT * FROM crm_pipelines WHERE id = ?', [pipelineId]);
    let icp = {};
    if (pipeline?.icp_json) {
      try {
        icp = JSON.parse(pipeline.icp_json);
      } catch (e) {}
    }

    // 2. Execute Apify actor
    const searchTerms = searchQuery 
      ? [searchQuery]
      : [`${category} in ${city}, Pakistan`];

    const scraperResult = await apifyService.runMapsScraper({
      city,
      category,
      maxResults: Math.min(maxResults, 50),
      searchTerms
    });

    const discoveredLeads = scraperResult.data || [];

    // 3. AI score and enrich leads
    const scoredLeads = [];
    for (const lead of discoveredLeads) {
      const scoreResult = await aiService.scoreLead(lead, icp);
      scoredLeads.push({
        ...lead,
        lead_score_numeric: scoreResult.score,
        lead_score_grade: scoreResult.grade,
        lead_score_explanation: scoreResult.explanation
      });
    }

    // 4. Ingest and deduplicate into CRM
    const ingestResult = await apifyService.ingestAndDeduplicateLeads(
      scoredLeads,
      pipelineId,
      stageId,
      75
    );

    // 5. Log audit trail
    await db.run(
      `INSERT INTO audit_logs (agent_name, tool_name, action, status, input_summary, output_summary)
       VALUES ('Lead Generation Agent', 'Apify Discovery Engine', 'Executed Lead Discovery', 'Success', ?, ?)`,
      [
        `City: ${city} | Category: ${category} | Requested: ${maxResults}`,
        `Discovered ${discoveredLeads.length} leads. Inserted: ${ingestResult.insertedCount}, Updated duplicates: ${ingestResult.updatedCount}.`
      ]
    );

    const payload = {
      provider: scraperResult.provider,
      total_scraped: discoveredLeads.length,
      inserted: ingestResult.insertedCount,
      updated: ingestResult.updatedCount,
      summary: {
        total_scraped: discoveredLeads.length,
        inserted: ingestResult.insertedCount,
        updated: ingestResult.updatedCount
      },
      leads: scoredLeads
    };

    res.json({
      success: true,
      data: payload,
      ...payload
    });
  } catch (err) {
    console.error('Error in /api/apify/discover:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
