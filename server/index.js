import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase, db } from './database.js';
import brandsRouter from './routes/brands.routes.js';
import campaignsRouter from './routes/campaigns.routes.js';
import crmRouter from './routes/crm.routes.js';
import competitorsRouter from './routes/competitors.routes.js';
import scrapersRouter from './routes/scrapers.routes.js';
import contentRouter from './routes/content.routes.js';
import aiRouter from './routes/ai.routes.js';
import workflowsRouter from './routes/workflows.routes.js';
import approvalsRouter from './routes/approvals.routes.js';
import auditRouter from './routes/audit.routes.js';
import reportsRouter from './routes/reports.routes.js';
import creativeRouter from './routes/creative.routes.js';
import productsRouter from './routes/products.routes.js';
import apifyRouter from './routes/apify.routes.js';
import jobsRouter from './routes/jobs.routes.js';
import authRouter from './routes/auth.routes.js';
import adminUsersRouter from './routes/admin-users.routes.js';
import { applySecurityHeaders } from './middleware/security.middleware.js';
import { authenticate, requireRole, optionalAuth } from './middleware/auth.middleware.js';
import { aiService } from './services/ai.service.js';
import { apifyService } from './services/apify.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server or root with override: true so active keys are honored
dotenv.config({ path: path.join(__dirname, '.env'), override: true });
dotenv.config({ path: path.join(__dirname, '..', '.env'), override: true });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(applySecurityHeaders);
app.use(optionalAuth);

// Request Logger
app.use((req, res, next) => {
  const userContext = req.user ? `[User:${req.user.id}:${req.user.role}]` : '[Anon]';
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} ${userContext}`);
  next();
});

// High-Speed Server In-Memory Cache (TTL: 30s)
const serverCache = new Map();
const SERVER_CACHE_TTL = 30 * 1000;

app.use((req, res, next) => {
  if (req.method !== 'GET') {
    // Invalidate cache on mutations (POST, PUT, DELETE)
    serverCache.clear();
    return next();
  }

  // Skip caching for real-time chat, transcriptions, jobs, auth, admin-users, and individual private records
  if (
    req.path.startsWith('/api/ai/chat') || 
    req.path.startsWith('/api/ai/transcribe') || 
    req.path.startsWith('/api/jobs') ||
    req.path.startsWith('/api/auth') ||
    req.path.startsWith('/api/admin/users') ||
    req.path.startsWith('/api/crm/leads/') ||
    req.path.startsWith('/api/competitors/')
  ) {
    return next();
  }

  // Tenant-scoped cache key prevents cross-user data leakage (Section 45)
  const userId = req.user?.id || 'anon';
  const cacheKey = `${userId}:${req.originalUrl || req.url}`;
  const cached = serverCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp < SERVER_CACHE_TTL)) {
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
    return res.json(cached.data);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      serverCache.set(cacheKey, { data: body, timestamp: Date.now() });
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
    }
    return originalJson(body);
  };

  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const brandsCount = await db.get('SELECT COUNT(*) as count FROM brands');
    const campaignsCount = await db.get('SELECT COUNT(*) as count FROM campaigns');
    const leadsCount = await db.get('SELECT COUNT(*) as count FROM crm_leads');
    const competitorsCount = await db.get('SELECT COUNT(*) as count FROM competitors');
    const pendingApprovalsCount = await db.get("SELECT COUNT(*) as count FROM approvals WHERE status = 'Pending'");
    const workflowRunsCount = await db.get('SELECT COUNT(*) as count FROM workflow_runs');

    res.json({
      status: 'online',
      platform: 'MarketPulse AI Marketing Workforce Platform',
      version: '2.0.0 (Production Workforce Edition)',
      geminiConfigured: aiService.getStatus().configured,
      apifyConfigured: apifyService.getStatus().configured,
      database: {
        brands: brandsCount.count,
        campaigns: campaignsCount.count,
        leads: leadsCount.count,
        competitors: competitorsCount.count,
        pendingApprovals: pendingApprovalsCount.count,
        workflowRuns: workflowRunsCount.count
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Reset demo database endpoint (Strictly Admin only)
app.post('/api/admin/reset-db', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    await db.run('DROP TABLE IF EXISTS campaigns');
    await db.run('DROP TABLE IF EXISTS brands');
    await db.run('DROP TABLE IF EXISTS crm_leads');
    await db.run('DROP TABLE IF EXISTS crm_activities');
    await db.run('DROP TABLE IF EXISTS competitors');
    await db.run('DROP TABLE IF EXISTS competitor_events');
    await db.run('DROP TABLE IF EXISTS saved_strategies');
    await db.run('DROP TABLE IF EXISTS saved_content');
    await db.run('DROP TABLE IF EXISTS workflows');
    await db.run('DROP TABLE IF EXISTS workflow_runs');
    await db.run('DROP TABLE IF EXISTS workflow_tasks');
    await db.run('DROP TABLE IF EXISTS approvals');
    await db.run('DROP TABLE IF EXISTS audit_logs');
    await db.run('DROP TABLE IF EXISTS reports');
    await initDatabase();
    res.json({ success: true, message: 'Database reset and re-seeded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mount Routes
app.use('/api/brands', brandsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/crm', crmRouter);
app.use('/api/competitors', competitorsRouter);
app.use('/api/scrapers', scrapersRouter);
app.use('/api/content', contentRouter);
app.use('/api/ai', aiRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/audit-logs', auditRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/creative', creativeRouter);
app.use('/api/products', productsRouter);
app.use('/api/apify', apifyRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin/users', adminUsersRouter);

// Global Error Handler — Sanitize output in production, protect against info leakage
app.use((err, req, res, next) => {
  console.error('[ServerError]', err.message);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    success: false,
    error: isProd ? 'Internal server error. Please try again later.' : (err.message || 'Internal server error')
  });
});

// Initialize DB and start server
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 MarketPulse AI Workforce Server running on http://localhost:${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🤖 AI Engine: ${aiService.getStatus().configured ? 'Gemini API Connected ✅' : 'Smart Local Fallback Active ⚡'}`);
      console.log(`🌐 Apify Engine: ${apifyService.getStatus().configured ? 'Apify Cloud Connected ✅' : 'Local Discovery Engine Active ⚡'}`);
      console.log(`=========================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
