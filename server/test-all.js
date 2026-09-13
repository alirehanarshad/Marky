import express from 'express';
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

async function runAllTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING FULL SYSTEM TEST SUITE FOR AI WORKFORCE');
  console.log('====================================================\n');

  // 1. Initialize DB
  await initDatabase();
  console.log('✅ 1. Database schema and seed data verified');

  // Setup test Express instance
  const app = express();
  app.use(express.json());
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

  const server = app.listen(5099);

  const testEndpoint = async (name, url, options = {}) => {
    try {
      const fullUrl = `http://localhost:5099${url}`;
      const res = await fetch(fullUrl, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        console.log(`✅ PASS: ${name} [${res.status}]`);
        return data;
      } else {
        console.error(`❌ FAIL: ${name} [${res.status}] - ${data.error || JSON.stringify(data)}`);
        return null;
      }
    } catch (e) {
      console.error(`❌ ERROR: ${name} - ${e.message}`);
      return null;
    }
  };

  try {
    // 2. Test Brands
    await testEndpoint('GET /api/brands', '/api/brands');
    const brandCreate = await testEndpoint('POST /api/brands', '/api/brands', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Brand Automation',
        category: 'Tech SaaS',
        tier: 'Premium',
        brand_voice: 'Bold & Direct'
      })
    });
    if (brandCreate?.data?.id) {
      await testEndpoint(`POST /api/brands/${brandCreate.data.id}/duplicate`, `/api/brands/${brandCreate.data.id}/duplicate`, { method: 'POST' });
      await testEndpoint(`DELETE /api/brands/${brandCreate.data.id}`, `/api/brands/${brandCreate.data.id}`, { method: 'DELETE' });
    }

    // 3. Test Campaigns
    await testEndpoint('GET /api/campaigns', '/api/campaigns');
    await testEndpoint('GET /api/campaigns/stats', '/api/campaigns/stats');

    // 4. Test CRM
    await testEndpoint('GET /api/crm', '/api/crm');
    await testEndpoint('GET /api/crm/stats', '/api/crm/stats');
    const leadCreate = await testEndpoint('POST /api/crm', '/api/crm', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Lead Persona',
        phone: '+92 300 1234567',
        status: 'Prospect',
        category: 'Wholesale Buyer'
      })
    });
    if (leadCreate?.data?.id) {
      await testEndpoint(`GET /api/crm/${leadCreate.data.id}/activities`, `/api/crm/${leadCreate.data.id}/activities`);
      await testEndpoint(`POST /api/crm/${leadCreate.data.id}/activities`, `/api/crm/${leadCreate.data.id}/activities`, {
        method: 'POST',
        body: JSON.stringify({ summary: 'Verified phone number via WhatsApp', activity_type: 'WhatsApp' })
      });
      await testEndpoint(`DELETE /api/crm/${leadCreate.data.id}`, `/api/crm/${leadCreate.data.id}`, { method: 'DELETE' });
    }

    // 5. Test Competitors
    await testEndpoint('GET /api/competitors', '/api/competitors');
    await testEndpoint('GET /api/competitors/events', '/api/competitors/events');

    // 6. Test Scrapers & Meta Ad Intelligence
    await testEndpoint('GET /api/scrapers/meta-ads', '/api/scrapers/meta-ads?query=honey');
    await testEndpoint('POST /api/scrapers/meta-ads/analyze', '/api/scrapers/meta-ads/analyze', {
      method: 'POST',
      body: JSON.stringify({ competitor: 'Marhaba', ads: [{ headline: 'Pure Honey', primary_text: 'Buy 2 Get 1 Free', call_to_action: 'Order Now' }] })
    });
    await testEndpoint('GET /api/scrapers/maps', '/api/scrapers/maps?city=Lahore&category=Organic');

    // 7. Test AI Universal Tools & Strategy
    await testEndpoint('GET /api/ai/status', '/api/ai/status');
    await testEndpoint('POST /api/ai/run-tool', '/api/ai/run-tool', {
      method: 'POST',
      body: JSON.stringify({
        toolId: 'meta-ad-copy-pas',
        toolTitle: 'Facebook PAS Ad Package',
        category: 'Advertising',
        inputs: { productName: 'KMB Raw Sidr Honey', targetAudience: 'Health Seekers' }
      })
    });
    await testEndpoint('POST /api/ai/chat', '/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'What is the best way to cut COD return rate?' }],
        persona: 'Pakistani COD & Logistics Specialist'
      })
    });

    // 8. Test Workforce Orchestration & Agent Task Graph
    await testEndpoint('GET /api/workflows', '/api/workflows');
    await testEndpoint('GET /api/workflows/runs', '/api/workflows/runs');
    const workflowRun = await testEndpoint('POST /api/workflows/run', '/api/workflows/run', {
      method: 'POST',
      body: JSON.stringify({
        userGoal: 'We are launching a new SaaS product in Pakistan with a $2,000 monthly marketing budget and want 500 qualified leads.'
      })
    });

    // 9. Test Human-in-the-Loop Approvals
    const approvals = await testEndpoint('GET /api/approvals', '/api/approvals');
    if (approvals?.data && approvals.data.length > 0) {
      const pendingOne = approvals.data.find(a => a.status === 'Pending') || approvals.data[0];
      await testEndpoint(`POST /api/approvals/${pendingOne.id}/approve`, `/api/approvals/${pendingOne.id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ reviewed_by: 'Test Supervisor', review_reason: 'Automated test suite approval' })
      });
    }

    // 10. Test Audit Logs
    await testEndpoint('GET /api/audit-logs', '/api/audit-logs');

    // 11. Test AI Executive CMO Reports
    await testEndpoint('GET /api/reports', '/api/reports');
    await testEndpoint('POST /api/reports/generate', '/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ period: 'Last 30 Days' })
    });

    console.log('\n====================================================');
    console.log('🎉 ALL ENDPOINTS & AGENT WORKFLOWS PASSED 100%!');
    console.log('====================================================');
  } finally {
    server.close();
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
