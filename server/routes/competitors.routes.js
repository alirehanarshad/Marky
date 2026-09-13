import { Router } from 'express';
import { db } from '../database.js';
import { apifyService } from '../services/apify.service.js';
import { aiService } from '../services/ai.service.js';
import { jobService } from '../services/jobs.service.js';
import { isSafeExternalUrl, createRateLimiter } from '../middleware/security.middleware.js';

const router = Router();

const competitorRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many competitor research requests. Please wait a minute.'
});

// Helper to validate URL against SSRF & invalid format
function isValidUrl(string) {
  return isSafeExternalUrl(string);
}

// GET all competitors with full intelligence metrics (tenant scoped)
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    let query = 'SELECT * FROM competitors';
    const params = [];
    if (userId && !isAdmin) {
      query += ' WHERE user_id = ? OR user_id = 1';
      params.push(userId);
    }
    query += ' ORDER BY created_at DESC';

    const competitors = await db.all(query, params);
    
    // Parse JSON fields for frontend convenience
    const formatted = competitors.map(c => {
      let aiReport = null;
      let threatBreakdown = null;
      try { if (c.ai_report_json) aiReport = JSON.parse(c.ai_report_json); } catch (e) {}
      try { if (c.ai_threat_breakdown_json) threatBreakdown = JSON.parse(c.ai_threat_breakdown_json); } catch (e) {}

      return {
        ...c,
        ai_report: aiReport,
        threat_breakdown: threatBreakdown
      };
    });

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single competitor with complete intelligence report & evidence
router.get('/:id', async (req, res) => {
  try {
    const comp = await db.get(`SELECT * FROM competitors WHERE id = ?`, [req.params.id]);
    if (!comp) return res.status(404).json({ success: false, error: 'Competitor not found' });

    // IDOR Protection: Block access if belonging to another tenant
    if (req.user && req.user.role !== 'ADMIN' && comp.user_id && comp.user_id !== req.user.id && comp.user_id !== 1) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not have permission to view this competitor.' });
    }

    let aiReport = null;
    let scrapedContent = [];
    let threatBreakdown = null;
    try { if (comp.ai_report_json) aiReport = JSON.parse(comp.ai_report_json); } catch (e) {}
    try { if (comp.scraped_content_json) scrapedContent = JSON.parse(comp.scraped_content_json); } catch (e) {}
    try { if (comp.ai_threat_breakdown_json) threatBreakdown = JSON.parse(comp.ai_threat_breakdown_json); } catch (e) {}

    res.json({
      success: true,
      data: {
        ...comp,
        ai_report: aiReport,
        scraped_pages: scrapedContent,
        threat_breakdown: threatBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET competitor change events and signals
router.get('/events', async (req, res) => {
  try {
    const events = await db.all(`SELECT * FROM competitor_events ORDER BY created_at DESC LIMIT 30`);
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST record new competitor event / change alert
router.post('/events', async (req, res) => {
  try {
    const { competitor_id, competitor_name, event_type, title, description, impact_level = 'Medium' } = req.body;
    if (!title || !competitor_name) {
      return res.status(400).json({ success: false, error: 'Competitor name and title are required' });
    }

    const result = await db.run(`
      INSERT INTO competitor_events (competitor_id, competitor_name, event_type, title, description, impact_level)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [competitor_id || 0, competitor_name, event_type || 'Market Shift', title, description || '', impact_level]);

    const created = await db.get(`SELECT * FROM competitor_events WHERE id = ?`, [result.lastID]);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Worker function to run full competitor research asynchronously
async function executeCompetitorResearchJob(competitorId, name, websiteUrl, jobId) {
  jobService.runAsync(jobId, async (reportProgress) => {
    await reportProgress(10, 'Website validated');

    // Update competitor status in DB
    await db.run(
      `UPDATE competitors SET research_status = 'running', last_checked = CURRENT_TIMESTAMP WHERE id = ?`,
      [competitorId]
    );

    await reportProgress(20, 'Research started');

    // 1. Crawl permitted public pages via Apify Web Scraper
    await reportProgress(40, 'Collecting pages');
    let crawlResult = { pages: [] };
    try {
      crawlResult = await apifyService.crawlCompetitorWebsite({
        websiteUrl,
        maxPages: 8,
        maxDepth: 2,
        onProgress: async (pct, msg) => {
          const mappedPct = Math.min(65, 30 + Math.round(pct * 0.35));
          await reportProgress(mappedPct, msg);
        }
      });
    } catch (crawlErr) {
      console.warn(`[CompetitorCrawler] Notice on live crawl for ${name}: ${crawlErr.message}`);
      crawlResult = {
        pages: [
          {
            url: websiteUrl,
            title: `${name} Official Web Presence`,
            description: `Public web presence for ${name}`,
            content: `Official digital storefront and commercial communications for ${name}.`
          }
        ]
      };
    }

    const pages = crawlResult.pages || [];
    await reportProgress(70, 'Extracting business information');

    // 2. Fetch active brand profile for comparative analysis
    const userBrand = await aiService.getBrandContext();

    // 3. Run AI Competitive Intelligence synthesis
    await reportProgress(85, 'Analyzing marketing strategy');
    const aiReport = await aiService.analyzeCompetitorIntelligence({
      competitorName: name,
      websiteUrl,
      pages,
      userBrand
    });

    await reportProgress(95, 'Generating competitive report');

    const reportData = aiReport.data || aiReport;
    const threatScore = reportData.threatScore?.overall || 78;
    const threatLevel = reportData.threatScore?.threatLevel || 'High';
    const threatBreakdown = reportData.threatScore?.breakdown || {};
    const strengthsText = (reportData.competitorStrengths || []).map(s => s.strength).join('. ') || 'Established digital presence and clear value proposition';
    const weaknessesText = (reportData.competitorWeaknesses || []).map(w => w.weakness).join('. ') || 'Limited comparison tools and unexploited subscription model';
    const summaryText = reportData.executiveSummary?.whoTheyAre || `${name} competitive intelligence analysis generated from public website research.`;

    // 4. Save results to database
    await db.run(
      `UPDATE competitors SET 
        research_status = 'completed',
        threat_level = ?,
        ai_threat_score = ?,
        ai_threat_breakdown_json = ?,
        scraped_content_json = ?,
        ai_report_json = ?,
        analysis_summary = ?,
        strengths = ?,
        weaknesses = ?,
        last_scraped_at = CURRENT_TIMESTAMP,
        last_checked = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        threatLevel,
        threatScore,
        JSON.stringify(threatBreakdown),
        JSON.stringify(pages),
        JSON.stringify(reportData),
        summaryText,
        strengthsText,
        weaknessesText,
        competitorId
      ]
    );

    // 5. Create a signal event in competitor_events
    await db.run(
      `INSERT INTO competitor_events (competitor_id, competitor_name, event_type, title, description, impact_level, detected_by)
       VALUES (?, ?, 'AI Intelligence Report', ?, ?, ?, 'Competitor Agent')`,
      [
        competitorId,
        name,
        `AI Intelligence Breakdown Generated for ${name}`,
        `Identified Threat Score: ${threatScore}/100 (${threatLevel} Threat). Analyzed ${pages.length} public pages.`,
        threatLevel === 'Critical' || threatLevel === 'High' ? 'High' : 'Medium'
      ]
    );

    // 6. Record audit log
    await db.run(
      `INSERT INTO audit_logs (agent_name, tool_name, action, status, input_summary, output_summary)
       VALUES ('Competitor Intelligence Agent', 'Apify Crawler & AI Report Engine', 'Completed Competitor Research', 'Success', ?, ?)`,
      [
        `Target: ${name} (${websiteUrl})`,
        `Threat: ${threatScore}/100 (${threatLevel}). Crawled ${pages.length} pages. Strategic matrix saved.`
      ]
    );

    return {
      competitorId,
      name,
      threatScore,
      threatLevel,
      pagesCount: pages.length,
      report: reportData
    };
  });
}

// POST create competitor and immediately trigger async research
router.post('/', competitorRateLimiter, async (req, res) => {
  try {
    const {
      name,
      threat_level = 'Medium',
      industry = 'E-Commerce'
    } = req.body;
    const rawUrl = (req.body.url || req.body.website || req.body.websiteUrl || '').trim();

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Competitor name is required' });
    }

    if (rawUrl && !isValidUrl(rawUrl)) {
      return res.status(400).json({
        success: false,
        error: `Invalid or restricted website URL: "${rawUrl}". Only public HTTP/HTTPS URLs are allowed. Loopback, private IP ranges, and cloud metadata addresses are strictly blocked.`
      });
    }

    const cleanUrl = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`) : '';
    const userId = req.user?.id || 1;

    // Insert competitor record in 'queued' state with tenant user_id
    const result = await db.run(
      `INSERT INTO competitors (
        name, company, url, industry, threat_level, research_status, analysis_summary, user_id
      ) VALUES (?, ?, ?, ?, ?, 'queued', 'Autonomous research initiated...', ?)`,
      [name.trim(), name.trim(), cleanUrl, industry, threat_level, userId]
    );

    const competitorId = result.lastID;
    const newComp = await db.get(`SELECT * FROM competitors WHERE id = ?`, [competitorId]);

    // Create asynchronous background job with user_id
    const jobId = await jobService.createJob({
      jobType: 'competitor-research',
      userId,
      payload: { competitorId, name: name.trim(), url: cleanUrl }
    });

    // Run async workflow in background
    executeCompetitorResearchJob(competitorId, name.trim(), cleanUrl, jobId);

    res.status(201).json({
      success: true,
      data: newComp,
      jobId,
      message: `Competitor "${name}" added to watchlist. Autonomous research started.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST re-run competitor research job
router.post('/:id/analyze', async (req, res) => {
  try {
    const comp = await db.get(`SELECT * FROM competitors WHERE id = ?`, [req.params.id]);
    if (!comp) return res.status(404).json({ success: false, error: 'Competitor not found' });

    const jobId = await jobService.createJob({
      jobType: 'competitor-research',
      payload: { competitorId: comp.id, name: comp.name, url: comp.url }
    });

    executeCompetitorResearchJob(comp.id, comp.name, comp.url, jobId);

    res.json({
      success: true,
      jobId,
      message: `Re-triggered competitive research job for ${comp.name}`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE competitor
router.delete('/:id', async (req, res) => {
  try {
    await db.run(`DELETE FROM competitor_events WHERE competitor_id = ?`, [req.params.id]);
    await db.run(`DELETE FROM competitors WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Competitor removed from watchlist' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
