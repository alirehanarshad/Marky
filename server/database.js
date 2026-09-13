import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'marketpulse.db');
const verboseSqlite = sqlite3.verbose();

const rawDb = new verboseSqlite.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to open SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at ${DB_PATH}`);
  }
});

// Promisified helper methods
export const db = {
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      rawDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      rawDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      rawDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  raw: rawDb
};

async function safeAddColumn(table, columnDefinition) {
  try {
    await db.run(`ALTER TABLE ${table} ADD COLUMN ${columnDefinition}`);
  } catch (e) {
    if (!e.message?.includes('duplicate column name')) {
      // Ignore already existing columns silently, but log unexpected syntax errors
    }
  }
}

export async function initDatabase() {
  console.log('Initializing SQLite database schema for AI Workforce Platform...');

  // 0. Users & RBAC Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await safeAddColumn('users', 'role TEXT NOT NULL DEFAULT "USER"');
  await safeAddColumn('users', 'status TEXT NOT NULL DEFAULT "ACTIVE"');
  await safeAddColumn('users', 'avatar_url TEXT');

  // Tenant scoping columns
  await safeAddColumn('brands', 'user_id INTEGER DEFAULT 1');
  await safeAddColumn('campaigns', 'user_id INTEGER DEFAULT 1');
  await safeAddColumn('crm_leads', 'user_id INTEGER DEFAULT 1');
  await safeAddColumn('competitors', 'user_id INTEGER DEFAULT 1');
  await safeAddColumn('background_jobs', 'user_id INTEGER DEFAULT 1');
  await safeAddColumn('product_profiles', 'user_id INTEGER DEFAULT 1');
  await safeAddColumn('product_profiles', 'brand_id INTEGER');
  await safeAddColumn('saved_content', 'user_id INTEGER DEFAULT 1');
  await safeAddColumn('saved_content', 'brand_id INTEGER');
  await safeAddColumn('creative_jobs', 'user_id INTEGER DEFAULT 1');
  await safeAddColumn('creative_jobs', 'brand_id INTEGER');

  // Performance & Security Indexes
  try {
    await db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_crm_leads_user_id ON crm_leads(user_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_competitors_user_id ON competitors(user_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_background_jobs_user_id ON background_jobs(user_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_product_profiles_user_brand ON product_profiles(user_id, brand_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_saved_content_user_brand ON saved_content(user_id, brand_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_user_integrations_uid ON user_integrations(user_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_user_integrations_provider ON user_integrations(user_id, provider_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON contact_submissions(created_at)`);
  } catch (e) {}

  // 0b. User Integrations & Provider Credentials Vault (AES-256 Encrypted at Rest)
  await db.run(`
    CREATE TABLE IF NOT EXISTS user_integrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      provider_id TEXT NOT NULL,
      provider_type TEXT NOT NULL,
      display_name TEXT NOT NULL,
      credentials_encrypted TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'NOT_CONNECTED',
      capabilities_json TEXT,
      metadata_json TEXT,
      last_tested_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, provider_id)
    )
  `);

  // 0c. Public Contact Submissions Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      ip_address TEXT,
      status TEXT DEFAULT 'NEW',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bootstrap Administrator Account
  try {
    const { authService } = await import('./services/auth.service.js');
    await authService.bootstrapAdmin();
  } catch (e) {
    console.warn('[Security] Notice on bootstrap admin:', e.message);
  }

  // 1. Brands Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company_name TEXT,
      industry TEXT,
      category TEXT,
      tier TEXT DEFAULT 'Mass',
      description TEXT,
      website TEXT,
      product_service TEXT,
      product_category TEXT,
      pricing TEXT,
      target_audience TEXT,
      target_locations TEXT DEFAULT 'Pakistan (Nationwide)',
      brand_voice TEXT DEFAULT 'Professional, Persuasive & Trustworthy',
      tone TEXT DEFAULT 'Confident & High-Energy',
      brand_positioning TEXT,
      competitors TEXT,
      usps TEXT,
      key_messaging TEXT,
      keywords TEXT,
      social_platforms TEXT DEFAULT 'TikTok, Facebook, Instagram, Daraz',
      marketing_goals TEXT,
      business_goals TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Safe migrations for existing brands table
  await safeAddColumn('brands', 'company_name TEXT');
  await safeAddColumn('brands', 'industry TEXT');
  await safeAddColumn('brands', 'product_service TEXT');
  await safeAddColumn('brands', 'product_category TEXT');
  await safeAddColumn('brands', 'pricing TEXT');
  await safeAddColumn('brands', 'target_locations TEXT');
  await safeAddColumn('brands', 'brand_voice TEXT');
  await safeAddColumn('brands', 'tone TEXT');
  await safeAddColumn('brands', 'brand_positioning TEXT');
  await safeAddColumn('brands', 'competitors TEXT');
  await safeAddColumn('brands', 'usps TEXT');
  await safeAddColumn('brands', 'key_messaging TEXT');
  await safeAddColumn('brands', 'keywords TEXT');
  await safeAddColumn('brands', 'social_platforms TEXT');
  await safeAddColumn('brands', 'marketing_goals TEXT');
  await safeAddColumn('brands', 'business_goals TEXT');

  // 2. Campaigns Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_id INTEGER,
      name TEXT NOT NULL,
      objective TEXT,
      status TEXT DEFAULT 'Active',
      start_date TEXT,
      end_date TEXT,
      budget REAL DEFAULT 0,
      currency TEXT DEFAULT 'PKR',
      platforms TEXT,
      kpi TEXT DEFAULT 'ROAS 4.0x',
      creative TEXT,
      copy TEXT,
      landing_page TEXT,
      target_geography TEXT DEFAULT 'Lahore, Karachi, Islamabad',
      approval_status TEXT DEFAULT 'Approved',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (brand_id) REFERENCES brands (id) ON DELETE CASCADE
    )
  `);

  await safeAddColumn('campaigns', 'kpi TEXT');
  await safeAddColumn('campaigns', 'creative TEXT');
  await safeAddColumn('campaigns', 'copy TEXT');
  await safeAddColumn('campaigns', 'landing_page TEXT');
  await safeAddColumn('campaigns', 'target_geography TEXT');
  await safeAddColumn('campaigns', 'approval_status TEXT');
  await safeAddColumn('campaigns', 'blueprint_json TEXT');
  await safeAddColumn('campaigns', 'tags TEXT');
  await safeAddColumn('campaigns', 'target_audience TEXT');
  await safeAddColumn('campaigns', 'ad_spend REAL DEFAULT 0');
  await safeAddColumn('campaigns', 'roas REAL DEFAULT 0');
  await safeAddColumn('campaigns', 'conversions INTEGER DEFAULT 0');

  // 3. CRM Leads Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS crm_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      email TEXT,
      status TEXT DEFAULT 'Lead',
      category TEXT,
      rating REAL DEFAULT 5.0,
      lead_score TEXT DEFAULT 'B',
      website TEXT,
      city TEXT,
      notes TEXT,
      tags TEXT,
      source TEXT DEFAULT 'Map Scraper',
      campaign_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await safeAddColumn('crm_leads', 'company TEXT');
  await safeAddColumn('crm_leads', 'lead_score TEXT');
  await safeAddColumn('crm_leads', 'notes TEXT');
  await safeAddColumn('crm_leads', 'tags TEXT');
  await safeAddColumn('crm_leads', 'source TEXT');
  await safeAddColumn('crm_leads', 'campaign_id INTEGER');
  await safeAddColumn('crm_leads', 'pipeline_id INTEGER');
  await safeAddColumn('crm_leads', 'stage_id INTEGER');
  await safeAddColumn('crm_leads', 'country TEXT DEFAULT "Pakistan"');
  await safeAddColumn('crm_leads', 'industry TEXT');
  await safeAddColumn('crm_leads', 'lead_score_numeric INTEGER DEFAULT 75');
  await safeAddColumn('crm_leads', 'lead_score_explanation TEXT');
  await safeAddColumn('crm_leads', 'source_id TEXT');
  await safeAddColumn('crm_leads', 'source_url TEXT');
  await safeAddColumn('crm_leads', 'value REAL DEFAULT 0');
  await safeAddColumn('crm_leads', 'next_action TEXT');
  await safeAddColumn('crm_leads', 'ai_research_json TEXT');
  await safeAddColumn('crm_leads', 'discovered_at DATETIME');
  await safeAddColumn('crm_leads', 'updated_at DATETIME');

  // 3b. CRM Pipelines Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS crm_pipelines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      business_type TEXT DEFAULT 'E-commerce',
      icp_json TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3c. CRM Pipeline Stages Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS crm_pipeline_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pipeline_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      stage_order INTEGER DEFAULT 0,
      color TEXT DEFAULT '#4239C4',
      probability REAL DEFAULT 0.1,
      sla_hours INTEGER DEFAULT 48,
      required_fields TEXT,
      automation_rules TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pipeline_id) REFERENCES crm_pipelines (id) ON DELETE CASCADE
    )
  `);

  // 3d. CRM Tasks Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS crm_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      task_type TEXT DEFAULT 'follow-up',
      due_date DATETIME,
      status TEXT DEFAULT 'pending',
      assigned_to TEXT DEFAULT 'AI Sales Agent',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES crm_leads (id) ON DELETE CASCADE
    )
  `);

  // 3e. CRM Outreach Messages Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS crm_outreach_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      channel TEXT DEFAULT 'whatsapp',
      subject TEXT,
      message_body TEXT NOT NULL,
      status TEXT DEFAULT 'suggested',
      sent_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES crm_leads (id) ON DELETE CASCADE
    )
  `);

  // 3f. Apify Integrations Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS apify_integrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_key TEXT,
      status TEXT DEFAULT 'Not Connected',
      last_tested_at DATETIME,
      monthly_budget_limit REAL DEFAULT 25.0,
      estimated_spend REAL DEFAULT 0.0,
      user_info_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3g. Apify Runs Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS apify_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_id TEXT NOT NULL,
      actor_name TEXT,
      run_id TEXT,
      status TEXT DEFAULT 'SUCCEEDED',
      items_collected INTEGER DEFAULT 0,
      compute_units REAL DEFAULT 0,
      estimated_usd REAL DEFAULT 0,
      error_message TEXT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )
  `);

  // 3h. Apify Actors Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS apify_actors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      description TEXT,
      category TEXT,
      input_schema_json TEXT,
      enabled INTEGER DEFAULT 1
    )
  `);

  // 4. CRM Activities Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS crm_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      activity_type TEXT NOT NULL,
      summary TEXT NOT NULL,
      details TEXT,
      performed_by TEXT DEFAULT 'AI Lead Agent',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES crm_leads (id) ON DELETE CASCADE
    )
  `);

  // 5. Competitors Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS competitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT,
      url TEXT,
      industry TEXT,
      products TEXT,
      pricing TEXT,
      positioning TEXT,
      social_accounts TEXT,
      ad_presence TEXT,
      threat_level TEXT DEFAULT 'Medium',
      analysis_summary TEXT,
      strengths TEXT,
      weaknesses TEXT,
      last_checked DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await safeAddColumn('competitors', 'company TEXT');
  await safeAddColumn('competitors', 'industry TEXT');
  await safeAddColumn('competitors', 'products TEXT');
  await safeAddColumn('competitors', 'pricing TEXT');
  await safeAddColumn('competitors', 'positioning TEXT');
  await safeAddColumn('competitors', 'social_accounts TEXT');
  await safeAddColumn('competitors', 'ad_presence TEXT');
  await safeAddColumn('competitors', 'weaknesses TEXT');
  await safeAddColumn('competitors', 'last_checked DATETIME');
  await safeAddColumn('competitors', 'research_status TEXT DEFAULT "idle"');
  await safeAddColumn('competitors', 'scraped_content_json TEXT');
  await safeAddColumn('competitors', 'ai_report_json TEXT');
  await safeAddColumn('competitors', 'ai_threat_score INTEGER DEFAULT 0');
  await safeAddColumn('competitors', 'ai_threat_breakdown_json TEXT');
  await safeAddColumn('competitors', 'last_scraped_at DATETIME');
  await safeAddColumn('competitors', 'updated_at DATETIME');

  // 6. Competitor Events Table (Change detection & alerts)
  await db.run(`
    CREATE TABLE IF NOT EXISTS competitor_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      competitor_id INTEGER NOT NULL,
      competitor_name TEXT NOT NULL,
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      impact_level TEXT DEFAULT 'Medium',
      detected_by TEXT DEFAULT 'Competitor Agent',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (competitor_id) REFERENCES competitors (id) ON DELETE CASCADE
    )
  `);

  // 7. Workflows Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS workflows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'Omnichannel Growth',
      trigger_type TEXT DEFAULT 'Manual / AI Orchestrator',
      estimated_time_saving_hours REAL DEFAULT 8.0,
      tasks_count INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 8. Workflow Runs Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS workflow_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workflow_id INTEGER,
      name TEXT NOT NULL,
      user_goal TEXT NOT NULL,
      status TEXT DEFAULT 'Completed',
      progress INTEGER DEFAULT 100,
      current_step TEXT,
      human_intervention_required INTEGER DEFAULT 0,
      hours_saved REAL DEFAULT 6.5,
      tasks_automated INTEGER DEFAULT 6,
      result_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )
  `);

  // 9. Workflow Tasks Table (Task graph nodes)
  await db.run(`
    CREATE TABLE IF NOT EXISTS workflow_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER NOT NULL,
      agent_name TEXT NOT NULL,
      task_name TEXT NOT NULL,
      status TEXT DEFAULT 'Completed',
      order_index INTEGER DEFAULT 0,
      requires_approval INTEGER DEFAULT 0,
      approval_id INTEGER,
      input_data TEXT,
      output_data TEXT,
      execution_time_ms INTEGER DEFAULT 1200,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (run_id) REFERENCES workflow_runs (id) ON DELETE CASCADE
    )
  `);

  // 10. Approvals Table (Human-in-the-Loop System)
  await db.run(`
    CREATE TABLE IF NOT EXISTS approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER,
      task_id INTEGER,
      title TEXT NOT NULL,
      action_type TEXT NOT NULL,
      description TEXT NOT NULL,
      risk_level TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Pending',
      payload_json TEXT,
      requested_by_agent TEXT DEFAULT 'Advertising Agent',
      reviewed_by TEXT,
      review_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME
    )
  `);

  // 11. Audit Logs Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT DEFAULT 'AI Agent Workforce',
      agent_name TEXT NOT NULL,
      tool_name TEXT,
      action TEXT NOT NULL,
      status TEXT DEFAULT 'Success',
      input_summary TEXT,
      output_summary TEXT,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 12. Saved Strategies & Content
  await db.run(`
    CREATE TABLE IF NOT EXISTS saved_strategies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      category TEXT,
      market TEXT,
      budget_total REAL DEFAULT 0,
      currency TEXT DEFAULT 'PKR',
      blueprint_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS saved_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tool_id TEXT,
      tool_title TEXT,
      input_summary TEXT,
      output_content TEXT,
      status TEXT DEFAULT 'Done',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    await db.run(`ALTER TABLE saved_content ADD COLUMN status TEXT DEFAULT 'Done'`);
  } catch (e) {
    // Column already exists
  }

  // 13. Reports Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_id INTEGER,
      title TEXT NOT NULL,
      period TEXT DEFAULT 'Last 30 Days',
      executive_summary TEXT,
      report_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 14. User Credits & Creative Budget Tracking
  await db.run(`
    CREATE TABLE IF NOT EXISTS user_credits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'default_marky_user',
      balance INTEGER DEFAULT 500,
      total_spent INTEGER DEFAULT 0,
      image_cost_credits INTEGER DEFAULT 5,
      video_5sec_cost_credits INTEGER DEFAULT 120,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ensure default credits exist
  const existingCredits = await db.get('SELECT * FROM user_credits WHERE user_id = ?', ['default_marky_user']);
  if (!existingCredits) {
    await db.run(
      'INSERT INTO user_credits (user_id, balance, total_spent, image_cost_credits, video_5sec_cost_credits) VALUES (?, 500, 0, 5, 120)',
      ['default_marky_user']
    );
  }

  // 15. Product Profiles
  await db.run(`
    CREATE TABLE IF NOT EXISTS product_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      price REAL DEFAULT 0,
      currency TEXT DEFAULT 'PKR',
      features TEXT,
      benefits TEXT,
      target_audience TEXT,
      product_images TEXT,
      usp TEXT,
      offer TEXT,
      competitors TEXT,
      website_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 16. Creative Generation Jobs (Magic Hour & Providers)
  await db.run(`
    CREATE TABLE IF NOT EXISTS creative_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT UNIQUE NOT NULL,
      job_type TEXT NOT NULL,
      prompt TEXT,
      provider TEXT DEFAULT 'MagicHour',
      status TEXT DEFAULT 'pending',
      model TEXT,
      duration INTEGER DEFAULT 5,
      resolution TEXT DEFAULT '480p',
      aspect_ratio TEXT DEFAULT '9:16',
      credits_deducted INTEGER DEFAULT 0,
      result_url TEXT,
      input_media_url TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 17. Tool Run History (Detailed per-tool execution logs)
  await db.run(`
    CREATE TABLE IF NOT EXISTS tool_run_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tool_id TEXT NOT NULL,
      tool_title TEXT NOT NULL,
      category TEXT NOT NULL,
      inputs_json TEXT,
      output_text TEXT,
      provider TEXT DEFAULT 'Gemini',
      credits_used INTEGER DEFAULT 0,
      brand_id INTEGER,
      product_id INTEGER,
      duration_ms INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 18. Background Jobs Table (Async processing engine)
  await db.run(`
    CREATE TABLE IF NOT EXISTS background_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT UNIQUE NOT NULL,
      job_type TEXT NOT NULL,
      status TEXT DEFAULT 'queued',
      progress INTEGER DEFAULT 0,
      current_step TEXT,
      payload_json TEXT,
      result_json TEXT,
      error_message TEXT,
      user_id TEXT DEFAULT 'default_marky_user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )
  `);

  // Performance Indexes for fast navigation and deduplication
  await db.run(`CREATE INDEX IF NOT EXISTS idx_background_jobs_id ON background_jobs(job_id)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_background_jobs_status ON background_jobs(status)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_crm_leads_source_id ON crm_leads(source_id)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_crm_leads_phone ON crm_leads(phone)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_crm_leads_pipeline ON crm_leads(pipeline_id)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON crm_leads(stage_id)`);

  // Check if seed data exists
  const brandCount = await db.get(`SELECT COUNT(*) as count FROM brands`);
  if (brandCount.count === 0) {
    console.log('Database is empty. Seeding realistic Pakistani e-commerce market data...');
    await seedRealisticData();
  } else {
    console.log(`Database already populated with ${brandCount.count} brands.`);
  }

  // Ensure initial workforce data (approvals, workflows, competitor events, audit logs) exists
  await ensureWorkforceData();
  await ensureReportData();
  await ensureContentLibraryData();
  await ensureCreativeGalleryData();
  await ensureCampaignBlueprints();
  await ensureCrmPipelineData();
  await ensureApifyIntegrationData();
}

async function ensureWorkforceData() {
  const approvalCount = await db.get(`SELECT COUNT(*) as count FROM approvals`);
  if (approvalCount.count === 0) {
    console.log('Seeding initial Human-in-the-Loop pending approvals and workforce tasks...');
    
    // Seed Approvals
    await db.run(`
      INSERT INTO approvals (title, action_type, description, risk_level, status, payload_json, requested_by_agent)
      VALUES 
      (
        'Authorize PKR 150,000 Meta Advantage+ Ad Spend for Ramadan Blitz',
        'Spend Advertising Budget',
        'Advertising Agent generated high-performing carousel creatives & PAS copy for KMB Honey. Ready to allocate PKR 150,000 over 14 days targeting Lahore, Karachi, Islamabad.',
        'High',
        'Pending',
        '{"campaign": "Ramadan Raw Honey Mega Blitz", "budget": 150000, "currency": "PKR", "platforms": ["Meta", "TikTok"], "projected_roas": "4.2x"}',
        'Advertising Agent'
      ),
      (
        'Broadcast Ramadan Early Bird WhatsApp Blast to 1,200 Wholesale Leads',
        'Send Bulk Communications',
        'Email & Messaging Agent drafted personalized Urdu/English discount blast with Cash-on-Delivery verification links for verified retail prospects.',
        'High',
        'Pending',
        '{"recipient_count": 1200, "channel": "WhatsApp Business API", "message_preview": "Assalam-o-Alaikum! Exclusive Ramadan Bulk Honey Stock is now live for wholesale partners..."}',
        'Email & Messaging Agent'
      ),
      (
        'Publish 6 Weekly TikTok UGC Video Scripts & Carousel Posts',
        'Publish Content',
        'Content Agent finalized 3 hook variants and 3 product unboxing scripts for Cydaix Handcrafted Leather goods.',
        'Medium',
        'Pending',
        '{"content_type": "TikTok Script + IG Carousel", "brand": "Cydaix", "posts_count": 6}',
        'Content Agent'
      )
    `);

    // Seed Competitor Events
    const marhaba = await db.get(`SELECT id FROM competitors WHERE name LIKE '%Marhaba%'`);
    const junaid = await db.get(`SELECT id FROM competitors WHERE name LIKE '%Junaid%'`);

    await db.run(`
      INSERT INTO competitor_events (competitor_id, competitor_name, event_type, title, description, impact_level, detected_by)
      VALUES
      (
        ${marhaba ? marhaba.id : 1},
        'Marhaba Laboratories',
        'Pricing & Offer Change',
        'Marhaba launched "Buy 2 Get 1 Free" 500g Honey Ramadan Pack on Daraz PK',
        'Detected price undercut of 18% on Daraz flash sales with subsidized free shipping nationwide. Immediate bundle counter-strategy recommended.',
        'High',
        'Competitor Agent'
      ),
      (
        ${junaid ? junaid.id : 2},
        'J. Junaid Jamshed',
        'Ad Creative Saturation',
        'New Meta Video Ad Campaign targeting Eid Kurta Collections (25+ Ad Variants)',
        'Heavy saturation on Instagram Stories with PKR 2.5M estimated weekly spend. Suggested counter-move: Capture TikTok live shopping traffic with lower price point.',
        'Medium',
        'Competitor Agent'
      )
    `);

    // Seed Workflows & Runs
    const runResult = await db.run(`
      INSERT INTO workflow_runs (name, user_goal, status, progress, current_step, human_intervention_required, hours_saved, tasks_automated, result_summary)
      VALUES
      (
        'SaaS E-Commerce Launch Blitz (Pakistan)',
        'Launch new D2C channel in Pakistan with PKR 250,000 budget and acquire 500 verified B2B customer leads',
        'Awaiting Approval',
        85,
        'Pending Supervisor Sign-Off for Meta Campaign Activation',
        1,
        18.5,
        7,
        'Generated full marketing strategy, competitor SWOT matrix, 5 ad angles, 20 TikTok video hooks, and scraped 45 B2B leads into CRM. Awaiting human ad spend sign-off.'
      )
    `);

    // Seed Tasks for this run
    const runId = runResult.lastID;
    await db.run(`
      INSERT INTO workflow_tasks (run_id, agent_name, task_name, status, order_index, requires_approval, input_data, output_data, execution_time_ms)
      VALUES
      (${runId}, 'Strategy Agent', 'Formulate Market Positioning & 30-Day Launch Blueprint', 'Completed', 1, 0, 'Target: Pakistan E-Com, Budget: 250k', 'Generated full financial breakdown, ROAS targets, and funnel stages.', 2100),
      (${runId}, 'Competitor Agent', 'Audit Marhaba & Local Rivals for Ad Saturation & Pricing', 'Completed', 2, 0, 'Competitor watchlist: 4 brands', 'Identified gap in premium unpasteurized cold-extracted honey messaging.', 1800),
      (${runId}, 'Content Agent', 'Generate 20 TikTok UGC Hooks & Video Scripts', 'Completed', 3, 0, 'Format: 20-30s Reels/TikTok', 'Scripts completed with 3-second visual hooks and PAS structure.', 2400),
      (${runId}, 'Lead Generation Agent', 'Scrape & Enrich 45 High-Intent Wholesale Distributors', 'Completed', 4, 0, 'Cities: Lahore, Karachi, Rawalpindi', 'Extracted verified phone, category, and WhatsApp numbers into CRM.', 3100),
      (${runId}, 'Advertising Agent', 'Structure Meta Advantage+ Ad Sets & Media Budget Allocation', 'Awaiting Approval', 5, 1, 'PKR 150k budget allocation', 'Ad sets staged in draft status. Human approval required before budget commit.', 900)
    `);

    // Seed Audit Logs
    await db.run(`
      INSERT INTO audit_logs (agent_name, tool_name, action, status, input_summary, output_summary)
      VALUES
      ('Lead Generation Agent', 'Google Maps Scraper', 'Scraped 45 local e-commerce wholesale distributors in Lahore & Karachi', 'Success', 'City: Lahore, Karachi | Category: Organic Honey & Bridal', '45 valid leads deduplicated and stored in CRM pipeline.'),
      ('Content Agent', 'TikTok Viral Scriptwriter', 'Generated 6 viral video scripts for Cydaix Minimalist Bifold', 'Success', 'Product: Cydaix Bifold | Tone: Modern Luxury', '20-second video hooks ready for creative production.'),
      ('Competitor Agent', 'Meta Ad Library Spy', 'Analyzed 12 active competitor ad creatives for pricing patterns', 'Success', 'Query: Honey, Leather, Lawn', 'Detected heavy Ramadan discount promotion on Meta Advantage+.'),
      ('Advertising Agent', 'Campaign Budget Manager', 'Created Ramadan Raw Honey Mega Blitz ad set draft', 'Approval Required', 'Budget: PKR 150,000 | Platforms: Meta, TikTok', 'Action routed to Human-in-the-Loop pending approvals queue.')
    `);
  }
}

async function ensureReportData() {
  const reportCount = await db.get(`SELECT COUNT(*) as count FROM reports`);
  if (reportCount.count === 0) {
    const kmb = await db.get(`SELECT id FROM brands WHERE name LIKE '%KMB%' LIMIT 1`);
    const brandId = kmb ? kmb.id : 1;

    const reportData = {
      healthScorecard: {
        overallHealth: { score: 78, label: 'Strong Growth', summary: 'Solid unit economics with 3.84x blended ROAS and expanding Tier 1 city penetration.', dataType: 'CALCULATED' },
        businessPerformance: { score: 82, label: 'Above Target', summary: 'PKR 2.4M gross revenue achieved across Shopify D2C and Daraz PK Flagship.', dataType: 'ACTUAL' },
        executionQuality: { score: 74, label: 'Stable', summary: 'Consistent creative cadence; ad fatigue manageable on Meta carousel sets.', dataType: 'CALCULATED' },
        marketReadiness: { score: 80, label: 'Well Positioned', summary: 'Purity laboratory certification gives strong defensibility against supermarket syrups.', dataType: 'ESTIMATED' },
        dataQuality: { score: 92, label: 'High Fidelity', summary: 'Synced with active CRM lead tracker, Shopify orders, and Meta ad accounts.', dataType: 'ACTUAL' }
      },
      targetVsActual: [
        { kpi: 'Gross Revenue (Last 30D)', target: 'PKR 2,800,000', actual: 'PKR 2,400,000', status: 'On Track', gap: '-14.3%', dataType: 'ACTUAL', note: 'Ramadan early-bird surge offsetting off-season dip.' },
        { kpi: 'Blended Ad Spend', target: 'PKR 650,000', actual: 'PKR 624,000', status: 'On Track', gap: '-4.0%', dataType: 'ACTUAL', note: 'Well-controlled spend across Meta and TikTok Shop ads.' },
        { kpi: 'Blended ROAS', target: '4.00x', actual: '3.84x', status: 'On Track', gap: '-0.16x', dataType: 'CALCULATED', note: 'Top carousel ad angle delivering 4.6x standalone ROAS.' },
        { kpi: 'Wholesale B2B Leads', target: '40 leads', actual: '45 leads', status: 'Ahead', gap: '+12.5%', dataType: 'ACTUAL', note: 'Local map scraper pipeline sync performing strongly in Lahore & Multan.' },
        { kpi: 'Customer Retention Rate', target: '25.0%', actual: '21.8%', status: 'Behind', gap: '-3.2%', dataType: 'CALCULATED', note: 'Requires automated 45-day honey reorder WhatsApp sequence.' }
      ],
      aiInsights: {
        whatIsWorking: 'UGC video unboxing showing laboratory purity certificates drives 4.6x ROAS on TikTok Shop and Instagram Reels. 1kg Sidr Honey bundle is top revenue contributor.',
        whatIsUnderperforming: 'Cash-on-Delivery return rate in secondary cities (Peshawar, Faisalabad) sits at 12.4%, eroding net margin by ~PKR 85,000.',
        whyItMatters: 'Lowering COD return rate below 8% through automated WhatsApp address verification immediately injects PKR 110,000 into monthly profit without additional ad spend.',
        aiDetectedOpportunities: 'Competitor Marhaba Laboratories is experiencing ad fatigue on Daraz; bidding on "pure raw sidr honey" during peak 8 PM - 11 PM mobile hours yields 28% cheaper CPC.',
        recommendedActions: '1. Launch automated 2-step WhatsApp COD confirmation. 2. Scale top-performing UGC video creative to PKR 25,000/day. 3. Activate 45-day reorder email blast.'
      },
      competitorIntelligence: [
        { competitor: 'Marhaba Laboratories', positioning: 'Mass Market / Pharmacy', threat: 'High', priceComparison: '-40% cheaper', adAngle: 'Traditional Heritage', gap: 'Lacks premium raw unfiltered trust; packaging is dated.' },
        { competitor: 'Organic Valley PK', positioning: 'Modern Premium D2C', threat: 'Medium', priceComparison: '+10% higher', adAngle: 'Aesthetic Lifestyle', gap: 'Higher pricing and slower nationwide shipping (4-5 days vs KMB 48h).' }
      ],
      growthOpportunities: [
        { opportunity: 'Automate WhatsApp COD Confirmation Flow', impact: 'High (+PKR 120K Profit)', effort: 'Low (2 days)', priority: 'High', timeline: 'Week 1', confidence: '94%' },
        { opportunity: 'Ramadan 3x 500g Gift Box Pre-Order Campaign', impact: 'High (+PKR 850K Revenue)', effort: 'Medium (5 days)', priority: 'High', timeline: 'Week 2', confidence: '88%' },
        { opportunity: 'B2B Wholesale Bakery & Restaurant Supply Program', impact: 'Medium (+PKR 400K MRR)', effort: 'Medium (10 days)', priority: 'Medium', timeline: 'Month 1', confidence: '82%' }
      ],
      recommendedActionPlan: [
        { phase: '7-Day Quick Wins', action: 'Integrate WhatsApp bot for instant order dispatch confirmation to reduce COD refusal.', owner: 'Growth Team', impact: 'Reduces return rate by 4.2%' },
        { phase: '30-Day Scale', action: 'Scale Ramadan Gift Box ad budget on Meta Advantage+ with 3 new UGC hook variants.', owner: 'Advertising Agent', impact: '+35% gross order volume' },
        { phase: '90-Day Vision', action: 'Establish recurring monthly honey subscription box for corporate executive wellness programs.', owner: 'Strategy Agent', impact: 'Builds predictable recurring MRR' }
      ],
      roiPotential: {
        currentRevenue: 2400000,
        projectedRevenue: 3450000,
        estimatedCost: 820000,
        projectedNetProfit: 1650000,
        estimatedRoi: '4.2x ROAS / 201% Net ROI'
      }
    };

    await db.run(`
      INSERT INTO reports (brand_id, title, period, executive_summary, report_json)
      VALUES (?, ?, ?, ?, ?)
    `, [
      brandId,
      'KMB Honey - Executive Marketing Performance & Growth Intelligence Dossier',
      'Last 30 Days',
      'Comprehensive CMO-grade marketing intelligence audit evaluating acquisition velocity, cross-channel blended ROAS (3.84x), competitive positioning vs Marhaba Labs, and immediate PKR 1.05M expansion vectors.',
      JSON.stringify(reportData)
    ]);
    console.log('Seeded default executive marketing report into reports table.');
  }
}

async function ensureContentLibraryData() {
  const hasMarhaba = await db.get(`SELECT id FROM saved_content WHERE tool_title LIKE '%Competitive Edge Matrix%'`);
  if (!hasMarhaba) {
    console.log('Seeding full detailed marketing documents into Content Library...');

    const marhabaDoc = `**KMB Honey: Competitive Edge Matrix - Marhaba Labs**

**Competitor Overview: Marhaba Labs**
A deeply entrenched legacy brand in Pakistan, Marhaba Labs dominates the herbal health and honey market through extensive physical pharmacy distribution and aggressive pricing. Their brand equity is built on decades of traditional trust and mass-market accessibility.

---

### **Marhaba's Strengths & KMB's Counter-Strategy**

*   **Nationwide Physical Pharmacy Distribution & Unmatched Retail Shelf Space**
    *   **KMB Counter-Strategy:** Position KMB as the *modern, intelligent choice* for premium wellness. Emphasize *digital convenience, direct-to-door delivery*, and a superior *online customer experience*. We don't need every shelf; we need *your family's trust*.
    *   **Conversion Copy Snippet:**
        > "Why queue for average? KMB delivers *pure, premium wellness* directly to your family's door. Skip the hassle, get the best. **Click. Ship. Thrive.**"

*   **ISO Certifications & Household Name Credibility**
    *   **KMB Counter-Strategy:** Elevate KMB's *own* quality narrative beyond basic certifications. Highlight *superior, traceable sourcing*, *rigorous 3rd-party lab testing*, and *unadulterated purity claims* that go beyond mere compliance. Reframe "household name" as traditional, while KMB is the *verified, modern standard* for uncompromising quality.
    *   **Conversion Copy Snippet:**
        > "Marhaba is a name. KMB is a PROMISE. A promise of *unadulterated purity*, backed by *rigorous lab tests* and *traceable sourcing*. Your family deserves more than just a name – they deserve **verified, potent wellness.**"

*   **Aggressive Price Competition**
    *   **KMB Counter-Strategy:** *DO NOT COMPETE ON PRICE.* Reframe price as a direct reflection of *purity, quality, and efficacy*. Highlight that true premium quality, ethical sourcing, and stringent testing *cost more* – and that KMB delivers *unmatched value* in tangible health benefits, not just a low sticker price. Target the discerning buyer willing to invest in their family's long-term health.
    *   **Conversion Copy Snippet:**
        > "Investing in KMB isn't spending more; it's *investing smarter* in your family's health. When you choose KMB, you choose *uncompromised purity* – because true wellness is priceless. **Don't compromise quality for a discount. Choose KMB.**"

---

### **Marhaba's Weaknesses & KMB's Leverage Strategy**

*   **Traditional, Outdated Packaging**
    *   **KMB Leverage Strategy:** Capitalize *aggressively* on KMB's *modern, aesthetic, premium packaging*. Position KMB as the ideal *gift* (especially for Ramadan) and a product that exudes quality and care. Emphasize the elevated user experience from unboxing to daily use.
    *   **Conversion Copy Snippet:**
        > "Tired of generic? KMB transforms wellness into an *experience*. Our elegant packaging makes KMB the *perfect Ramadan gift* – a beautiful testament to health and care for your loved ones. **Upgrade their pantry, upgrade their health.**"

*   **High Retail Markup (for traditional distribution)**
    *   **KMB Leverage Strategy:** Highlight KMB's *direct-to-consumer advantage*. Frame this as delivering *more value for money* directly to the customer, cutting out unnecessary middlemen costs. Emphasize that KMB's premium pricing reflects *product quality*, not inflated distribution chains.
    *   **Conversion Copy Snippet:**
        > "Why pay for middlemen? KMB delivers *premium quality, direct to you*. We cut the unnecessary retail markup, so every rupee you spend goes into the *unbeatable purity and potency* your family deserves. **Smarter health, smarter savings.**"

---

### **KMB's Core Differentiators & Messaging Pillars**

*   **Uncompromising Purity & Transparency:** Lab-tested, ethically sourced, 100% natural – verifiable quality that builds trust.
*   **Modern Wellness Experience:** Elegant, gift-worthy packaging; seamless online ordering; direct-to-door convenience.
*   **Value-Driven Health Investment:** Focus on long-term benefits, superior efficacy, and a premium product that justifies its price through results.
*   **Targeted Solutions:** Position KMB as the ultimate choice for specific health needs, daily wellness, and thoughtful, premium gifting.

---

### **Strategic Playbook: Immediate Action Items**

1.  **"Purity Verified" Digital Campaign Launch:**
    *   **Action:** Develop a multi-platform campaign (Facebook/Instagram video ads, landing pages, blog posts) showcasing KMB's 3rd-party lab results, sourcing stories, and 0% adulteration guarantee. Use compelling visuals and clear data points.
    *   **Target:** Health-conscious families, natural remedy seekers.
    *   **KPI:** High CTR on purity claims, engagement on video content, conversion rate from "Purity Page" to product.

2.  **"Ramadan Gifting Elevated" Activation:**
    *   **Action:** Create exclusive Ramadan gift bundles with bespoke premium packaging. Run highly targeted ad sets to "Ramadan Gift Shoppers" in Lahore, Karachi, and Islamabad, emphasizing KMB as a thoughtful, health-focused luxury gift. Leverage micro-influencers for unboxing reviews.
    *   **Target:** Ramadan gift shoppers.
    *   **KPI:** Gift bundle sales, Average Order Value (AOV), new customer acquisition during Ramadan.

3.  **"Direct-to-Door, Unbeatable Value" Messaging Reinforcement:**
    *   **Action:** Optimize website banners, product descriptions, and ad copy to consistently highlight the convenience and value of KMB's direct model. Offer a limited-time "Premium Delivery On Us" for first-time orders.
    *   **Target:** Busy urban families, convenience-seeking consumers.
    *   **KPI:** Website conversion rate, cart abandonment reduction, repeat purchase rate.

4.  **"The KMB Difference" Educational Content Series:**
    *   **Action:** Produce engaging short videos and carousels comparing the *attributes of truly pure honey* (e.g., crystallization, aroma, taste profile) versus mass-market alternatives. Educate without explicitly naming competitors, but clearly position KMB as the superior choice.
    *   **Target:** Educated health-conscious consumers, skeptics.
    *   **KPI:** Content share rate, time spent on page, organic search ranking for "pure honey Pakistan."

5.  **"Real Results, Real Families" Testimonial Blitz:**
    *   **Action:** Aggressively collect and promote high-quality video and written testimonials from satisfied customers. Focus on specific health benefits experienced and the "switch" from traditional brands. Implement a UGC campaign encouraging customers to share their KMB journey.
    *   **Target:** All segments, building social proof and trust.
    *   **KPI:** Testimonial submission rate, CTR on ads featuring testimonials, overall conversion rate uplift.`;

    await db.run(`
      INSERT INTO saved_content (tool_id, tool_title, input_summary, output_content)
      VALUES (?, ?, ?, ?)
    `, [
      'competitive-edge-matrix',
      'KMB Honey: Competitive Edge Matrix - Marhaba Labs',
      'Brand: KMB Honey | Competitor: Marhaba Laboratories | Counter-Strategy & Conversion Playbook',
      marhabaDoc
    ]);

    await db.run(`
      INSERT INTO saved_content (tool_id, tool_title, input_summary, output_content)
      VALUES (?, ?, ?, ?)
    `, [
      'tiktok-viral-scripts',
      'Ramadan Flash Sale: 5 Viral High-Converting TikTok Ad Scripts',
      'Channel: TikTok Shop & Reels | Audience: Urban Pakistani Families (22-45) | Objective: COD Sales',
      `# Ramadan Flash Sale: 5 Viral High-Converting TikTok Ad Scripts

## Executive Strategic Overview
Targeting high-intent impulsive TikTok shoppers in Lahore, Karachi, and Islamabad during Ramadan fasting hours (3 PM - 6 PM Pre-Iftar and 11 PM - 2 AM Post-Taraweeh). Focus on energy restoration, Sunnah wellness, and 100% money-back purity guarantee with Cash on Delivery.

---

### SCRIPT 1: The "Supermarket Sugar Syrup" Skeptic Hook (Problem-Agitation-Solution)
* **Duration:** 28 Seconds | **Format:** UGC Handheld Selfie Video
* **Visual:** Creator in home kitchen holding a standard supermarket amber bottle vs a crystalline raw jar of KMB Sidr honey.
* **Audio Track:** Trending soft lo-fi acoustic beat.

**[00:00 - 00:04] The Pattern Interrupt:**
> "Stop feeding your family heated sugar syrup for Iftar! Did you know 80% of commercial honey in Pakistan is boiled with industrial corn syrup?"

**[00:05 - 00:12] The Agitation & Proof:**
> "That's why supermarket honey never crystallizes and loses all natural enzymes. Look at this lab test certificate right here on KMB's cold-extracted Swat Sidr honey. 100% raw, unheated, zero added glucose."

**[00:13 - 00:22] The Transformation & Benefit:**
> "One spoon during Sehri gives sustained energy throughout a 14-hour fast without the insulin crash. My kids love it on warm parathas, and my digestion has never been smoother."

**[00:23 - 00:28] Call to Action:**
> "Tap the link below! Order 2 jars today and get Free Express Delivery + Cash on Delivery across Pakistan. Stock is limited before Ramadan!"

---

### SCRIPT 2: The "Grandmother Taste Test" Nostalgia Hook
* **Duration:** 32 Seconds | **Format:** Dual-cam emotional family review
* **Visual:** 68-year-old grandmother tasting KMB Berry Honey with a wooden spoon.

**[00:00 - 00:05] Hook:**
> "I gave my 70-year-old Dadi the honey she used to have in Swat 40 years ago... watch her reaction."

**[00:06 - 00:15] Reaction & Proof:**
> *(Dadi smells the jar, pauses, smiles)* "Yeh bilkul asli berik ka shehad hai... iski khushboo hi alag hai beta."
> "No pasteurization, straight from Karak wild jujube trees into food-grade glass jars."

**[00:16 - 00:25] Reassurance & Guarantees:**
> "KMB sends an authentic laboratory verification report with every single order. If you don't feel the pure difference, they refund 100% of your money at your doorstep."

**[00:26 - 00:32] CTA:**
> "Upgrade your Ramadan table. Click 'Shop Now' for special bundle pricing starting at PKR 2,450."`
    ]);

    await db.run(`
      INSERT INTO saved_content (tool_id, tool_title, input_summary, output_content)
      VALUES (?, ?, ?, ?)
    `, [
      'seo-product-page',
      'KMB Pure Wild Sidr Honey: Complete High-Converting E-Commerce Product Page',
      'Format: E-Commerce PDP Copy & SEO Metadata | Brand: KMB Natural Foods | Target: D2C Shopify Store',
      `# KMB Pure Wild Sidr Honey: Complete High-Converting E-Commerce Product Page

## SEO Metadata & Architecture
* **Primary Keyword:** Pure Sidr Honey Pakistan
* **Secondary Keywords:** Raw honey Lahore, organic sidr honey price karachi, unheated bee honey Swat
* **Meta Title:** 100% Pure Wild Sidr Honey (Swat Valleys) | KMB Natural Foods PK
* **Meta Description:** Experience lab-certified raw Sidr honey cold-extracted from Swat & Karak valleys. 100% unpasteurized purity with nationwide Cash-on-Delivery. Order now!

---

### 1. Above-The-Fold Hero Section
* **H1 Title:** Pure Wild Sidr (Beri) Honey — 100% Raw & Cold-Extracted
* **Subheadline:** Directly Harvested from Karak Wild Valleys. Never Heated, Never Ultra-Filtered, Never Blended with Sugar Syrup.
* **Trust Badges:** [Certified 0% Added Sugar] [PCSIR Lab Tested] [48-Hour Nationwide Delivery] [100% Money-Back Purity Guarantee]
* **Pricing:** PKR 3,450 (1kg Family Jar) — Save 20% on 2-Pack Bundle

---

### 2. The Purity Narrative: Why KMB is Different
Most supermarket honey is heated to 70°C to prevent crystallization, destroying delicate bee enzymes and antioxidants while leaving behind glorified caramel syrup.

KMB raw honey is:
1. **Cold-Extracted by Hand:** Extracted using gravity centrifugal spinning below 35°C, preserving living pollens, propolis, and bio-active flavonoids.
2. **Wild Mountain Terroir:** Bees forage exclusively on wild Sidr (Ziziphus spina-christi) blossom in pesticide-free mountain valleys.
3. **Batch-Tested Transparency:** Every harvest batch is verified for fructose/glucose ratios, moisture content (<18%), and zero synthetic antibiotics.

---

### 3. Customer Reviews & Social Proof
> ★★★★★ "Real honey after 15 years in Lahore."
> "I was skeptical because everyone in Pakistan claims their honey is pure. KMB sent a copy of their lab test with the jar. The aroma when you open the seal is unmistakable. Ordering my 4th jar now." — Dr. Tariq M., Model Town Lahore`
    ]);

    await db.run(`
      INSERT INTO saved_content (tool_id, tool_title, input_summary, output_content)
      VALUES (?, ?, ?, ?)
    `, [
      'whatsapp-nurture-flow',
      'B2B Wholesale & High-AOV Retail Partner WhatsApp Sequence (5-Step Automation)',
      'Channel: WhatsApp Business API | Target: Organic Boutiques, Health Marts & Executive Corporate Clients',
      `# B2B Wholesale & High-AOV Retail Partner WhatsApp Sequence (5-Step Automation)

## Workflow Objective
Convert inbound map-scraped wholesale inquiries and high-value Ramadan gift buyers into repeat corporate orders through personal, high-touch WhatsApp messaging.

---

### MESSAGE 1: Instant Lead Welcome & Wholesale Catalog (Trigger: 2 mins post-inquiry)
> "Assalam-o-Alaikum *{{contact_name}}*! 🌿
> 
> Thank you for inquiring about KMB Natural Foods wholesale partnership.
> 
> We supply 100% raw, lab-verified Sidr & Flora honey to leading organic marts, pharmacies, and corporate wellness programs in Lahore, Karachi & Islamabad.
> 
> 📄 **Here is our 2026 Wholesale Tier Catalog:** [PDF Download Link]
> 
> • Minimum Order Quantity: 12 Jars (Mixed Varieties Available)
> • Wholesale Margin: 38% - 44% Retail Markup
> • Fast 48h Dispatch with GST / NTN Invoicing
> 
> May I know how many retail shelves or gift sets you are planning for this Ramadan?"

---

### MESSAGE 2: The Lab Verification & Credibility Drop (Trigger: 24 hours later)
> "Good morning *{{contact_name}}*! 🍯
> 
> One question we always get from retailers: *'How do we prove to our walk-in customers that this honey is truly raw?'*
> 
> Here is a quick 45-second video showing our cold extraction process and our official PCSIR laboratory certificate: [Watch Video Link]
> 
> We also provide branded wooden display stands and educational counter flyers for your store at zero cost on orders above 24 jars.
> 
> Would you like us to dispatch a complimentary 250g sample tasting kit to your office today?"`
    ]);

    console.log('Seeded 4 comprehensive detailed documents into Content Library.');
  }
}

async function ensureCreativeGalleryData() {
  const hasDiverse = await db.get("SELECT COUNT(*) as count FROM creative_jobs WHERE job_type = 'assembled-video' OR job_type = 'upload-image' OR job_type = 'badge'");
  if (hasDiverse.count === 0) {
    console.log('Seeding initial diverse creative assets into Creative Gallery & Asset Vault...');

    const initialAssets = [
      {
        job_id: 'img_seed_kmb_marble',
        job_type: 'image',
        prompt: 'Luxury organic Sidr honey jar on raw Italian marble countertop, soft warm morning sunlight, dripping golden honeycomb with wooden honey dipper, photorealistic 8k commercial advertising photography.',
        provider: 'Flux.1 / Midjourney Engine',
        status: 'completed',
        duration: 5,
        resolution: '1024x1024',
        aspect_ratio: '1:1',
        credits_deducted: 5,
        result_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
        metadata: JSON.stringify({
          brand: 'KMB Honey',
          category: 'Organic FMCG',
          aspectRatio: '1:1',
          style: 'Photorealistic E-Commerce',
          tags: ['Honey', 'Organic', 'Macro', 'Ramadan Gifting']
        })
      },
      {
        job_id: 'img_seed_cydaix_wallet',
        job_type: 'image',
        prompt: 'Handcrafted top-grain cowhide leather bifold wallet in saddle brown, positioned on dark walnut executive desk with brass money clip and fountain pen, dramatic studio rim lighting, 8k luxury product shot.',
        provider: 'Flux.1 / Midjourney Engine',
        status: 'completed',
        duration: 5,
        resolution: '1024x1024',
        aspect_ratio: '1:1',
        credits_deducted: 5,
        result_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=80',
        metadata: JSON.stringify({
          brand: 'Cydaix',
          category: 'Leather & Fashion',
          aspectRatio: '1:1',
          style: 'Luxury Commercial',
          tags: ['Leather', 'Minimalist', 'Wallet', 'Men Accessories']
        })
      },
      {
        job_id: 'img_seed_opa_orange',
        job_type: 'image',
        prompt: 'Commercial product photography of a premium glass carafe with freshly squeezed Opa Valencia Orange Juice, dynamic liquid splash frozen in air, crisp condensation droplets on cold glass, bright morning glow.',
        provider: 'CreativeEngine (Simulated)',
        status: 'completed',
        duration: 5,
        resolution: '1024x1024',
        aspect_ratio: '1:1',
        credits_deducted: 5,
        result_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1200&q=80',
        metadata: JSON.stringify({
          brand: 'Opa Juice',
          category: 'Beverages',
          aspectRatio: '1:1',
          style: 'High-Speed Action',
          tags: ['Orange Juice', 'Splash', 'Condensation', 'FMCG']
        })
      },
      {
        job_id: 'img_seed_lumina_serum',
        job_type: 'image',
        prompt: 'Minimalist clean aesthetic amber dropper bottle of Lumina Halal Vitamin C Radiance Serum, placed on white frosted glass surrounded by natural water ripples and citrus slices, high-key studio softbox lighting.',
        provider: 'Flux.1 / Midjourney Engine',
        status: 'completed',
        duration: 5,
        resolution: '1024x1024',
        aspect_ratio: '1:1',
        credits_deducted: 5,
        result_url: 'https://images.unsplash.com/photo-1608248597359-00994f27f805?auto=format&fit=crop&w=1200&q=80',
        metadata: JSON.stringify({
          brand: 'Lumina Skincare PK',
          category: 'Beauty & Skincare',
          aspectRatio: '1:1',
          style: 'Dermatological Clean',
          tags: ['Vitamin C', 'Halal', 'Skincare', 'Serum']
        })
      },
      {
        job_id: 'vid_seed_kmb_ugc_pour',
        job_type: 'video',
        prompt: 'UGC TikTok video review: authentic Pakistani home kitchen creator opening KMB Royal Sidr Honey jar, pouring thick golden raw honey over paratha, showing PCSIR laboratory certificate stamp, 9:16 vertical.',
        provider: 'Wan 2.2 Motion Engine',
        status: 'completed',
        model: 'wan-2.2',
        duration: 5,
        resolution: '480p',
        aspect_ratio: '9:16',
        credits_deducted: 120,
        result_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        metadata: JSON.stringify({
          brand: 'KMB Honey',
          category: 'UGC Video Ads',
          mode: 'motion',
          aspectRatio: '9:16',
          tags: ['TikTok Ad', 'UGC', 'Honey Pour', 'Lab Stamp']
        })
      },
      {
        job_id: 'vid_seed_cydaix_unbox',
        job_type: 'video',
        prompt: 'Macro TikTok UGC unboxing: hands removing Cydaix cowhide bifold from matte black embossed gift box, feeling the genuine grain texture and testing smooth card extraction, high engagement 9:16 vertical format.',
        provider: 'Wan 2.2 Motion Engine',
        status: 'completed',
        model: 'wan-2.2',
        duration: 5,
        resolution: '480p',
        aspect_ratio: '9:16',
        credits_deducted: 120,
        result_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        metadata: JSON.stringify({
          brand: 'Cydaix',
          category: 'UGC Video Ads',
          mode: 'motion',
          aspectRatio: '9:16',
          tags: ['Leather Unbox', 'Macro', 'Reels', 'TikTok']
        })
      },
      {
        job_id: 'asset_seed_kmb_assembled_ad',
        job_type: 'assembled-video',
        prompt: 'KMB Honey Ramadan Early Bird Promo - 3-Scene Assembled Ad (Hook + Lab Proof + Free Dipper Offer)',
        provider: 'Video Ad Assembler (FFmpeg)',
        status: 'completed',
        model: 'ffmpeg-local',
        duration: 7,
        resolution: '480p',
        aspect_ratio: '9:16',
        credits_deducted: 0,
        result_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        metadata: JSON.stringify({
          brand: 'KMB Honey',
          category: 'Assembled Ad',
          scenes: 3,
          aspectRatio: '9:16',
          tags: ['Assembled', 'Ramadan Campaign', 'Offer', 'Advantage+']
        })
      },
      {
        job_id: 'edit_seed_kmb_ramadan',
        job_type: 'image-edit',
        prompt: 'AI Inpainting: Added traditional ornate Ramadan golden lanterns, warm ambient crescent moon glow, and royal emerald green velvet table runner behind KMB Honey jar.',
        provider: 'Magic Hour Inpainting Engine',
        status: 'completed',
        duration: 5,
        resolution: '1024x1024',
        aspect_ratio: '1:1',
        credits_deducted: 5,
        result_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
        input_media_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
        metadata: JSON.stringify({
          brand: 'KMB Honey',
          category: 'AI Inpainter',
          backgroundReplacement: 'Ramadan Festive Night with Gold Lanterns',
          tags: ['AI Edit', 'Inpainted', 'Festive']
        })
      },
      {
        job_id: 'upload_seed_brand_logo',
        job_type: 'upload-image',
        prompt: 'KMB Honey Official Vector Brand Logo & Monogram Badge (High-Resolution Master Asset)',
        provider: 'User Upload',
        status: 'completed',
        resolution: 'Vector / 2048x2048',
        aspect_ratio: '1:1',
        credits_deducted: 0,
        result_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        metadata: JSON.stringify({
          fileName: 'kmb-honey-official-logo.png',
          fileSize: 420800,
          mimeType: 'image/png',
          brand: 'KMB Honey',
          category: 'Brand Assets',
          tags: ['Logo', 'Master Asset', 'Transparent PNG']
        })
      },
      {
        job_id: 'badge_seed_organic_seal',
        job_type: 'badge',
        prompt: '100% Pure Organic Lab Verified Purity Seal & Quality Guarantee Badge',
        provider: 'Brand Trust Engine',
        status: 'completed',
        resolution: 'SVG Ready',
        aspect_ratio: '1:1',
        credits_deducted: 0,
        result_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
        metadata: JSON.stringify({
          brand: 'All Brands',
          category: 'Trust Badges & Seals',
          badgeText: '100% Pure Organic - Lab Verified Purity',
          color: 'from-amber-500 to-amber-600',
          icon: '🌿',
          tags: ['Seal', 'Trust Badge', 'Watermark', 'Purity']
        })
      }
    ];

    for (const item of initialAssets) {
      await db.run(
        `INSERT OR IGNORE INTO creative_jobs 
         (job_id, job_type, prompt, provider, status, model, duration, resolution, aspect_ratio, credits_deducted, result_url, input_media_url, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.job_id,
          item.job_type,
          item.prompt,
          item.provider,
          item.status,
          item.model || null,
          item.duration || 5,
          item.resolution || '1024x1024',
          item.aspect_ratio || '1:1',
          item.credits_deducted || 0,
          item.result_url,
          item.input_media_url || null,
          item.metadata
        ]
      );
    }
    console.log(`Seeded ${initialAssets.length} diverse creative assets into Creative Gallery.`);
  }
}

async function ensureCampaignBlueprints() {
  const campaignsWithoutBlueprint = await db.all("SELECT * FROM campaigns WHERE blueprint_json IS NULL OR blueprint_json = ''");
  if (!campaignsWithoutBlueprint || campaignsWithoutBlueprint.length === 0) return;

  console.log(`Generating AI Multi-Platform Ad Deployment Kits for ${campaignsWithoutBlueprint.length} campaigns...`);

  for (const camp of campaignsWithoutBlueprint) {
    let blueprint = null;

    if (camp.name.includes('Honey') || camp.name.includes('Ramadan')) {
      blueprint = {
        metaAds: {
          campaignName: `${camp.name} — Meta Advantage+ Sales`,
          objective: 'Sales / Conversions (Purchase Event)',
          buyingType: 'Auction',
          adSet: {
            audience: {
              locations: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan'],
              age: '24 - 58',
              gender: 'All',
              detailedInterests: [
                'Organic Food & Natural Health',
                'Raw Honey & Superfoods',
                'Ramadan Gifting & Festive Hampers',
                'Online Shoppers (Engaged Shoppers in Pakistan)'
              ],
              exclusions: ['Drop-shipping', 'Freelancers / Jobs seekers']
            },
            placements: 'Advantage+ Placements (Facebook News Feed, Instagram Reels, Instagram Stories, Marketplace)',
            optimization: 'Maximum number of purchases (7-day click or 1-day view)'
          },
          creatives: [
            {
              id: 'meta_hook_proof',
              name: 'Hook 1: Laboratory Proof vs Supermarket Sugar Syrup',
              angle: 'Lab Certified Raw Purity with 0% Heat Treatment',
              primaryText: `Did you know 85% of supermarket honey in Pakistan is boiled sugar syrup disguised as honey? 🚫\n\nWhen honey is heated above 40°C, all living enzymes and bio-flavonoids are destroyed forever.\n\nKMB Royal Sidr Honey is cold-extracted by hand from wild Swat Mountain hives. We don't boil it. We don't dilute it. And every single batch comes with an official PCSIR laboratory purity certificate in your box.\n\n🍯 Raw, unfiltered, living enzymes preserved\n🌿 100% Wild Sidr harvest from Swat Valley\n📦 Free Wooden Honey Dipper + Fast Nationwide COD\n\nTap below to order your jar before the Ramadan harvest batch sells out.`,
              headlines: [
                '100% Pure Raw Sidr Honey 🍯',
                'Lab Certified Raw & Unheated',
                'Free Wooden Honey Dipper + COD',
                'Real Honey from Swat Valleys',
                'PCSIR Tested: Zero Added Sugar'
              ],
              descriptions: [
                'Delivered across Pakistan in 48 hours. Pay Cash on Delivery.',
                'Over 14,000+ Pakistani families trust KMB for daily wellness.',
                'Pure mountain harvest with 100% money-back purity guarantee.'
              ],
              callToAction: 'Shop Now',
              recommendedFormat: '1:1 Square Carousel or High-Res Lifestyle Shot'
            },
            {
              id: 'meta_ramadan_gifting',
              name: 'Hook 2: Ramadan Early Bird & Family Health Gift',
              angle: 'Thoughtful Sunnah Health Gift for Parents & Loved Ones',
              primaryText: `Give the gift of pure Sunnah wellness this Ramadan. 🌙\n\nInstead of generic mithai boxes loaded with refined sugar, gift your parents and elders authentic, raw, lab-tested Swat Valley Sidr Honey.\n\n✨ Elegant matte-black embossed gift presentation\n✨ Lab certificate included with every jar\n✨ Free express delivery nationwide\n\nLimited Ramadan harvest batch now shipping across Pakistan.`,
              headlines: [
                'The Ultimate Ramadan Gift 🌙',
                'Pure Sunnah Wellness for Family',
                '100% Lab Tested Raw Honey',
                'Free Doorstep Delivery Pakistan',
                'Order Official KMB Honey Gift Box'
              ],
              descriptions: [
                'Pay Cash on Delivery nationwide.',
                'Dispatched in 48 hours to Lahore, Karachi, Islamabad.',
                '100% Pure Honey Guarantee.'
              ],
              callToAction: 'Order on WhatsApp',
              recommendedFormat: '4:5 Vertical Lifestyle or 9:16 Reel'
            }
          ],
          utmTracking: {
            baseUrl: 'https://kmbhoney.pk/products/royal-sidr-honey-swat',
            utmSource: 'facebook',
            utmMedium: 'paid_social',
            utmCampaign: 'ramadan_raw_honey_mega_blitz',
            fullUrl: 'https://kmbhoney.pk/products/royal-sidr-honey-swat?utm_source=facebook&utm_medium=paid_social&utm_campaign=ramadan_raw_honey_mega_blitz&utm_content=carousel_lab_proof'
          }
        },
        tiktokAds: {
          campaignName: `${camp.name} — TikTok Spark Ads`,
          objective: 'Community Interaction & TikTok Shop Purchases',
          targetAudience: {
            locations: ['Pakistan (Tier 1 & Tier 2 Cities)'],
            interests: ['Food & Beverage', 'Health & Wellness', 'TikTok Made Me Buy It', 'Daily Life'],
            age: '18 - 44'
          },
          hooksAndScripts: [
            {
              hookTitle: 'Viral Hook 1: The 5-Second Supermarket Honey Test',
              first3Seconds: 'STOP buying fake honey! Here is the 5-second test that exposes 90% of Pakistani supermarket jars.',
              visualDirection: 'Creator burns fake honey on a spoon (it blackens into caramel syrup) vs KMB raw honey which stays golden and pure.',
              voiceoverScript: 'Most honey in the market is heated to 70 degrees and mixed with industrial corn syrup. Real honey should be raw, cold-extracted, and thick. KMB honey comes straight from wild Swat bees and they even send the PCSIR lab certificate inside your parcel. Tap the link to get yours with cash on delivery!',
              callToAction: 'Tap Shop Now on TikTok Shop',
              hashtags: ['#TikTokMadeMeBuyIt', '#PureHoneyPK', '#SwatValleyHoney', '#Ramadan2026', '#HealthyLiving']
            },
            {
              hookTitle: 'Viral Hook 2: What Happens When You Eat Pure Sidr Honey Daily',
              first3Seconds: 'I replaced morning sugar with raw Swat honey for 30 days — here is what happened to my energy.',
              visualDirection: 'Morning aesthetic reel: warm water, lemon slice, slow macro pour of golden honey.',
              voiceoverScript: 'No afternoon energy crash, improved digestion, and zero artificial sweeteners. This is 100% wild Sidr honey from KMB Natural Foods. Lab tested, unheated, and delivered nationwide.',
              callToAction: 'Order Direct with Free Dipper',
              hashtags: ['#DesiSuperfood', '#NaturalWellness', '#RawHoneyPakistan', '#LahoreFoodies']
            }
          ],
          displayName: 'KMB Natural Foods',
          adText: '100% Raw Sidr Honey from Swat Valley. Lab certified unheated. Free delivery + Cash on Delivery nationwide!'
        },
        googleAds: {
          campaignType: 'Google Search Ads & Performance Max',
          biddingStrategy: 'Maximize Conversions (Target CPA: PKR 480)',
          keywords: {
            highIntentExact: [
              '[pure sidr honey pakistan]',
              '[buy raw honey lahore]',
              '[original honey price karachi]',
              '[kmb honey online]',
              '[pure unheated honey islamabad]'
            ],
            phraseMatch: [
              '"natural raw honey"',
              '"swat honey delivery"',
              '"best organic honey brand pakistan"',
              '"cold extracted honey"',
              '"pure sidr honey jar"'
            ],
            negativeKeywords: [
              'free honey recipe',
              'honey bee sting treatment',
              'cheap synthetic syrup',
              'honey bee farming training',
              'wikipedia',
              'jobs'
            ]
          },
          rsaAssets: {
            headlines: [
              '100% Pure Raw Sidr Honey',
              'Lab Certified Unheated Honey',
              'Swat Valley Mountain Harvest',
              'Free Nationwide Delivery',
              'Pay Cash on Delivery (COD)',
              'Zero Added Sugar Guarantee',
              'Shop 1kg Family Value Pack',
              'PCSIR Lab Tested Quality',
              'Delivered in 48 Hours',
              'Order Official KMB Honey'
            ],
            descriptions: [
              'Cold-extracted raw Sidr honey from wild Swat flora. 100% unpasteurized and pure.',
              'Experience authentic purity with living enzymes. Verified lab certificate with every order.',
              'Over 14,000 satisfied families across Lahore, Karachi & Islamabad. Order online today.',
              'Special Ramadan harvest bundle with free wooden dipper and express doorstep delivery.'
            ]
          },
          extensions: {
            sitelinks: [
              { title: 'Lab Purity Certificates', desc: 'Inspect verified 3rd-party PCSIR lab tests' },
              { title: 'Ramadan Gift Bundles', desc: 'Save up to 25% on 3-jar family packs' },
              { title: 'Customer Reviews', desc: 'Read 1,800+ 5-star verified buyer ratings' },
              { title: 'About Our Swat Valley Hives', desc: 'See our sustainable beekeeping harvest' }
            ],
            callouts: ['Cash on Delivery', 'Free Shipping Over PKR 3,000', '48h Doorstep Dispatch', '100% Cold Extracted']
          }
        },
        seoAndTags: {
          landingPageUrl: 'https://kmbhoney.pk/products/royal-sidr-honey-swat',
          metaTitle: 'Buy 100% Pure Raw Sidr Honey Online in Pakistan | KMB Honey',
          metaDescription: 'Order cold-extracted, unheated raw Sidr honey harvested from wild Swat valley flora. Lab certified with zero sugar syrup. Fast Cash-on-Delivery nationwide.',
          focusKeywords: ['raw sidr honey pakistan', 'pure honey swat valley', 'organic honey lahore', 'cold extracted honey karachi'],
          openGraph: {
            ogTitle: 'KMB Royal Sidr Honey — The Purity Standard of Pakistan',
            ogDescription: 'Wild mountain raw honey with official PCSIR lab testing. Delivered to your doorstep in 48 hours.'
          }
        },
        budgetAndEconomics: {
          totalBudget: camp.budget || 250000,
          currency: camp.currency || 'PKR',
          durationDays: 14,
          dailyBudget: Math.round((camp.budget || 250000) / 14),
          platformSplit: [
            { platform: 'Meta Ads (Facebook & Instagram)', percentage: 50, amount: Math.round((camp.budget || 250000) * 0.5), daily: Math.round((camp.budget || 250000) * 0.5 / 14), role: 'Core Conversion Engine & Carousel Retargeting' },
            { platform: 'TikTok Video & Spark Ads', percentage: 30, amount: Math.round((camp.budget || 250000) * 0.3), daily: Math.round((camp.budget || 250000) * 0.3 / 14), role: 'Viral Top-of-Funnel Hooks & UGC Impulses' },
            { platform: 'Google Search & PMax', percentage: 20, amount: Math.round((camp.budget || 250000) * 0.2), daily: Math.round((camp.budget || 250000) * 0.2 / 14), role: 'High-Intent Purchase Capture' }
          ],
          unitEconomics: {
            estimatedClicks: 5200,
            estimatedAvgCpc: 'PKR 48.0',
            projectedConversionRate: '2.9%',
            projectedOrders: 151,
            targetCpa: 'PKR 1,650',
            avgOrderValue: 'PKR 6,900',
            projectedGrossRevenue: `PKR ${Number(151 * 6900).toLocaleString()}`,
            projectedRoas: '4.17x',
            breakEvenRoas: '1.70x'
          }
        }
      };
    } else if (camp.name.includes('Leather') || camp.name.includes('Cydaix')) {
      blueprint = {
        metaAds: {
          campaignName: `${camp.name} — Meta Advantage+ Luxury Sales`,
          objective: 'Sales / Conversions (Purchase Event)',
          buyingType: 'Auction',
          adSet: {
            audience: {
              locations: ['Lahore (DHA, Gulberg)', 'Karachi (Clifton, DHA)', 'Islamabad (F-6 to F-11)', 'Rawalpindi'],
              age: '22 - 45',
              gender: 'Men & Women (Gift Buyers)',
              detailedInterests: [
                'Leather crafting & Luxury goods',
                'Minimalist wallets & Cardholders',
                'Corporate Executives & Tech Professionals',
                'Engaged Shoppers'
              ],
              exclusions: ['Cheap synthetic leather', 'Job seekers']
            },
            placements: 'Advantage+ Placements (Instagram Feed, Reels, Facebook Feed)',
            optimization: 'Purchases'
          },
          creatives: [
            {
              id: 'cydaix_meta_craft',
              name: 'Variation 1: The End of Bulky Wallets',
              angle: 'Full-Grain Top Cowhide Minimalist Slim Design',
              primaryText: `Still carrying a bulky wallet from 2012 that ruins your suit silhouette? 💼\n\nMeet the Cydaix Minimalist Bifold. Handcrafted from top-grain Pakistani cowhide that patinas richer with every single day of use.\n\n✨ Holds 8+ cards and flat banknotes with zero pocket bulge\n✨ RFID-blocking brass core protects your debit cards\n✨ 5-Year Leather Craft Guarantee\n\nDoorstep Cash-on-Delivery across Pakistan. Tap Shop Now to claim yours with a complimentary leather care balm.`,
              headlines: [
                'Handcrafted Top-Grain Leather 💼',
                'The End of Bulky Wallets',
                '5-Year Leather Craft Warranty',
                'Slim Profile. Zero Pocket Bulge.',
                'Doorstep COD Across Pakistan'
              ],
              descriptions: [
                'Free doorstep delivery in 48 hours. Pay Cash on Delivery.',
                'Over 8,500 modern Pakistani executives upgraded to Cydaix.',
                'Luxury executive gift packaging included.'
              ],
              callToAction: 'Shop Now',
              recommendedFormat: '1:1 Square Macro Product Shot & Video Unboxing'
            }
          ],
          utmTracking: {
            baseUrl: 'https://cydaixleather.com/products/minimalist-cowhide-bifold',
            utmSource: 'facebook',
            utmMedium: 'paid_social',
            utmCampaign: 'winter_handcrafted_leather_drop',
            fullUrl: 'https://cydaixleather.com/products/minimalist-cowhide-bifold?utm_source=facebook&utm_medium=paid_social&utm_campaign=winter_handcrafted_leather_drop'
          }
        },
        tiktokAds: {
          campaignName: `${camp.name} — TikTok Spark Ads`,
          objective: 'Website Conversions',
          targetAudience: {
            locations: ['Pakistan'],
            interests: ['Men Fashion', 'Luxury Accessories', 'Tech Lifestyle', 'TikTok Made Me Buy It'],
            age: '20 - 38'
          },
          hooksAndScripts: [
            {
              hookTitle: 'Viral Hook 1: Pocket Bulge vs Cydaix Slim Bifold',
              first3Seconds: 'If your wallet looks like a brick in your pocket, watch this.',
              visualDirection: 'Split screen: bulky bulging wallet ruining dress pants vs Cydaix slim bifold sliding in effortlessly with zero silhouette bulge.',
              voiceoverScript: 'This is top-grain full cowhide leather from Cydaix. Holds all your cash and 8 cards, but is literally thinner than your phone. Cash on delivery available everywhere in Pakistan.',
              callToAction: 'Tap Shop Now for 20% Off',
              hashtags: ['#MensFashionPK', '#LeatherWallet', '#MinimalistStyle', '#LahoreTech']
            }
          ],
          displayName: 'Cydaix Leather Craft',
          adText: 'Handcrafted top-grain cowhide wallets. Thinner than your phone, built to last a lifetime. Free delivery today!'
        },
        googleAds: {
          campaignType: 'Google Search Ads',
          biddingStrategy: 'Maximize Conversions (Target CPA: PKR 650)',
          keywords: {
            highIntentExact: [
              '[genuine leather wallet pakistan]',
              '[buy leather cardholder online]',
              '[cydaix wallet price]',
              '[minimalist wallet lahore]'
            ],
            phraseMatch: [
              '"leather bifold wallet pakistan"',
              '"best leather wallets for men"',
              '"pure cowhide cardholder"'
            ],
            negativeKeywords: ['cheap rexine wallet', 'free pattern', 'china bulk import']
          },
          rsaAssets: {
            headlines: [
              'Genuine Top-Grain Leather Wallets',
              'Cydaix Handcrafted Wallets',
              'Thinner Than Your Phone',
              '5-Year Leather Craft Warranty',
              'Free Nationwide COD Delivery',
              'Holds 8+ Cards & Cash Flat',
              'RFID Blocking Card Protection',
              'Premium Executive Gift Box',
              'Fast 48h Doorstep Dispatch',
              'Order Cydaix Leather Today'
            ],
            descriptions: [
              'Crafted from full-grain cowhide leather that develops a rich patina over time.',
              'Upgrade to minimalist luxury with zero pocket bulge. Free shipping across Pakistan.',
              'Rated 4.9/5 by 8,500+ corporate executives and modern professionals.',
              'Pay Cash on Delivery nationwide. Includes 5-year leather craft warranty.'
            ]
          },
          extensions: {
            sitelinks: [
              { title: 'Minimalist Bifold Collection', desc: 'Shop our bestselling executive slim wallets' },
              { title: 'Leather Cardholder Sleeves', desc: 'Ultra-compact everyday carry essentials' },
              { title: 'Customer Reviews', desc: 'Read 900+ verified customer ratings' }
            ],
            callouts: ['100% Genuine Cowhide', 'Cash on Delivery', '48h Doorstep Delivery', '5-Year Warranty']
          }
        },
        seoAndTags: {
          landingPageUrl: 'https://cydaixleather.com/products/minimalist-bifold-wallet',
          metaTitle: 'Buy Genuine Leather Wallets for Men in Pakistan | Cydaix Craft',
          metaDescription: 'Handcrafted minimalist cowhide leather bifold wallets and cardholders. 5-year leather warranty with nationwide Cash on Delivery across Pakistan.',
          focusKeywords: ['leather wallet pakistan', 'genuine cowhide bifold', 'minimalist cardholder lahore', 'men leather accessories'],
          openGraph: {
            ogTitle: 'Cydaix Minimalist Leather Bifold — Built to Outlast You',
            ogDescription: 'Top-grain Pakistani cowhide with zero pocket bulge. Handcrafted executive luxury.'
          }
        },
        budgetAndEconomics: {
          totalBudget: camp.budget || 400000,
          currency: camp.currency || 'PKR',
          durationDays: 20,
          dailyBudget: Math.round((camp.budget || 400000) / 20),
          platformSplit: [
            { platform: 'Meta Ads (Instagram Reels & Advantage+)', percentage: 60, amount: Math.round((camp.budget || 400000) * 0.6), daily: Math.round((camp.budget || 400000) * 0.6 / 20), role: 'Visual Aesthetic & High-Income Retargeting' },
            { platform: 'TikTok Video Ads', percentage: 25, amount: Math.round((camp.budget || 400000) * 0.25), daily: Math.round((camp.budget || 400000) * 0.25 / 20), role: 'Unboxing Viral Hooks & Everyday Carry Demonstrations' },
            { platform: 'Google Search Ads', percentage: 15, amount: Math.round((camp.budget || 400000) * 0.15), daily: Math.round((camp.budget || 400000) * 0.15 / 20), role: 'Bottom-Funnel High-Intent Keyword Capture' }
          ],
          unitEconomics: {
            estimatedClicks: 6800,
            estimatedAvgCpc: 'PKR 58.8',
            projectedConversionRate: '2.6%',
            projectedOrders: 176,
            targetCpa: 'PKR 2,272',
            avgOrderValue: 'PKR 7,500',
            projectedGrossRevenue: `PKR ${Number(176 * 7500).toLocaleString()}`,
            projectedRoas: '3.30x',
            breakEvenRoas: '1.65x'
          }
        }
      };
    } else {
      // General E-Commerce Blueprint
      blueprint = {
        metaAds: {
          campaignName: `${camp.name} — Meta Advantage+ Sales Blitz`,
          objective: 'Sales / Conversions',
          buyingType: 'Auction',
          adSet: {
            audience: {
              locations: ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad'],
              age: '20 - 45',
              gender: 'All',
              detailedInterests: ['E-commerce', 'Online Shopping', 'Brand Deals'],
              exclusions: ['Drop-shippers']
            },
            placements: 'Advantage+ Placements',
            optimization: 'Purchases'
          },
          creatives: [
            {
              id: 'general_meta_1',
              name: 'Primary Angle: Direct Benefit & Free Delivery',
              angle: 'Exclusive Launch Offer with Fast Doorstep COD',
              primaryText: `Upgrade your daily standard with ${camp.name}.\n\nTested and verified for premium quality with over 5,000+ happy buyers nationwide.\n\n✨ Premium Sourcing\n✨ Fast 48h Nationwide Cash-on-Delivery\n✨ 100% Satisfaction Guarantee\n\nTap below to shop the official collection today!`,
              headlines: [
                `${camp.name} Official Drop`,
                'Pay Cash on Delivery (COD)',
                '100% Premium Quality Guaranteed',
                'Fast 48h Express Shipping',
                'Limited Harvest Collection'
              ],
              descriptions: [
                'Delivered across Pakistan. 100% money back guarantee.',
                'Over 5,000+ verified customer reviews.'
              ],
              callToAction: 'Shop Now',
              recommendedFormat: '1:1 Square Ad or 9:16 Vertical Reel'
            }
          ],
          utmTracking: {
            baseUrl: 'https://marketpulse.pk/campaign/' + camp.id,
            utmSource: 'facebook',
            utmMedium: 'paid_social',
            utmCampaign: camp.name.toLowerCase().replace(/\s+/g, '_'),
            fullUrl: `https://marketpulse.pk/campaign/${camp.id}?utm_source=facebook&utm_medium=paid_social&utm_campaign=${camp.name.toLowerCase().replace(/\\s+/g, '_')}`
          }
        },
        tiktokAds: {
          campaignName: `${camp.name} — TikTok Spark Ads`,
          objective: 'Website Conversions',
          targetAudience: {
            locations: ['Pakistan'],
            interests: ['Trending', 'Shopping', 'Lifestyle'],
            age: '18 - 35'
          },
          hooksAndScripts: [
            {
              hookTitle: 'Viral Hook: Real Before/After Demo',
              first3Seconds: `Here is why everyone in Pakistan is switching to this...`,
              visualDirection: 'Quick unboxing and real lifestyle test.',
              voiceoverScript: 'Check this out before it sells out. Cash on delivery available nationwide.',
              callToAction: 'Shop Now on TikTok Shop',
              hashtags: ['#TikTokMadeMeBuyIt', '#PakistanShopping', '#TrendingPK']
            }
          ],
          displayName: camp.brand_name || 'MarketPulse Store',
          adText: `Official drop now live. Free express delivery across Pakistan!`
        },
        googleAds: {
          campaignType: 'Google Search Ads',
          biddingStrategy: 'Maximize Conversions',
          keywords: {
            highIntentExact: [`[buy ${camp.name.toLowerCase()} pakistan]`],
            phraseMatch: [`"${camp.name.toLowerCase()} online"`],
            negativeKeywords: ['free', 'cheap wholesale', 'wiki']
          },
          rsaAssets: {
            headlines: [
              camp.name.slice(0, 30),
              'Official Store Online',
              'Free Nationwide Delivery',
              'Pay Cash on Delivery'
            ],
            descriptions: [
              `Official collection for ${camp.name}. Shop online with 100% quality guarantee.`,
              'Delivered in 48 hours across Pakistan with Cash on Delivery.'
            ]
          },
          extensions: {
            sitelinks: [{ title: 'Best Sellers', desc: 'Shop top rated products' }],
            callouts: ['Cash on Delivery', 'Fast Delivery', '48h Dispatch']
          }
        },
        seoAndTags: {
          landingPageUrl: 'https://marketpulse.pk/campaign/' + camp.id,
          metaTitle: `${camp.name} | Official Store Pakistan`,
          metaDescription: `Discover ${camp.name}. Fast doorstep Cash-on-Delivery nationwide across Pakistan with verified quality guarantee.`,
          focusKeywords: [camp.name.toLowerCase(), 'pakistan online shopping'],
          openGraph: {
            ogTitle: camp.name,
            ogDescription: 'Official store drop with nationwide Cash on Delivery.'
          }
        },
        budgetAndEconomics: {
          totalBudget: camp.budget || 200000,
          currency: camp.currency || 'PKR',
          durationDays: 14,
          dailyBudget: Math.round((camp.budget || 200000) / 14),
          platformSplit: [
            { platform: 'Meta Ads', percentage: 60, amount: Math.round((camp.budget || 200000) * 0.6), daily: Math.round((camp.budget || 200000) * 0.6 / 14), role: 'Primary Acquisition' },
            { platform: 'TikTok Ads', percentage: 30, amount: Math.round((camp.budget || 200000) * 0.3), daily: Math.round((camp.budget || 200000) * 0.3 / 14), role: 'Viral Top of Funnel' },
            { platform: 'Google Ads', percentage: 10, amount: Math.round((camp.budget || 200000) * 0.1), daily: Math.round((camp.budget || 200000) * 0.1 / 14), role: 'Search Intent' }
          ],
          unitEconomics: {
            estimatedClicks: 4200,
            estimatedAvgCpc: 'PKR 47.6',
            projectedConversionRate: '2.5%',
            projectedOrders: 105,
            targetCpa: 'PKR 1,900',
            avgOrderValue: 'PKR 6,500',
            projectedGrossRevenue: `PKR ${Number(105 * 6500).toLocaleString()}`,
            projectedRoas: '3.41x',
            breakEvenRoas: '1.60x'
          }
        }
      };
    }

    await db.run(
      'UPDATE campaigns SET blueprint_json = ?, target_audience = ?, target_geography = ? WHERE id = ?',
      [
        JSON.stringify(blueprint),
        camp.name.includes('Honey') ? 'Health-conscious families, Ramadan gift shoppers' : 'Modern urban executives and gift buyers',
        'Lahore, Karachi, Islamabad, Faisalabad',
        camp.id
      ]
    );
  }

  console.log('Seeded AI Multi-Platform Ad Deployment Kits into campaigns.');
}

async function ensureCrmPipelineData() {
  const pipelineCount = await db.get('SELECT COUNT(*) as count FROM crm_pipelines');
  if (pipelineCount.count === 0) {
    console.log('Seeding initial Adaptive CRM Pipelines, Stages, and connecting leads...');

    const kmb = await db.get("SELECT id FROM brands WHERE name LIKE '%KMB%' LIMIT 1");
    const kmbId = kmb ? kmb.id : 1;

    const cydaix = await db.get("SELECT id FROM brands WHERE name LIKE '%Cydaix%' LIMIT 1");
    const cydaixId = cydaix ? cydaix.id : 2;

    const zest = await db.get("SELECT id FROM brands WHERE name LIKE '%Zest%' LIMIT 1");
    const zestId = zest ? zest.id : 3;

    // 1. Pipeline 1: KMB Honey D2C & Wholesale Retail Pipeline
    const p1Res = await db.run(
      `INSERT INTO crm_pipelines (brand_id, name, description, business_type, icp_json, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [
        kmbId,
        'D2C & Wholesale Distribution Pipeline',
        'Adaptive sales pipeline optimized for health-conscious retail buyers, wholesale dry-fruit marts, and corporate gifting accounts.',
        'E-commerce & Wholesale',
        JSON.stringify({
          industry: ['Organic FMCG', 'Health & Wellness', 'Retail Marts'],
          customer_type: 'B2B & High-Intent B2C',
          location: ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Multan'],
          age_range: '22-55',
          company_size: '1-50 employees (Retail Stores / Distributors)',
          purchase_intent: ['Pure Sidr Honey', 'Ramadan Gifting Bundles', 'Wholesale Jars'],
          need_signals: ['Discovered on Google Maps', 'Requested bulk price list', 'Inquired on WhatsApp']
        })
      ]
    );
    const p1Id = p1Res.lastID;

    // Stages for Pipeline 1
    const p1Stages = [
      { name: 'New Prospect', desc: 'Newly discovered prospect from Maps or inquiries', order: 0, color: '#64748B', prob: 0.1, sla: 24 },
      { name: 'AI Qualified', desc: 'Profile verified with high ICP fit and active phone/WhatsApp', order: 1, color: '#4239C4', prob: 0.3, sla: 48 },
      { name: 'Contacted', desc: 'Initial personalized WhatsApp catalog or introductory email sent', order: 2, color: '#7A5DBB', prob: 0.45, sla: 72 },
      { name: 'Interested', desc: 'Lead requested pricing, sample jar, or wholesale minimums', order: 3, color: '#A73B9D', prob: 0.65, sla: 48 },
      { name: 'Offer Sent', desc: 'Formal quotation or bulk bundle proposal submitted', order: 4, color: '#E66870', prob: 0.8, sla: 48 },
      { name: 'Won / Customer', desc: 'Order confirmed with Cash on Delivery or Bank Settlement', order: 5, color: '#10B981', prob: 1.0, sla: 0 }
    ];

    const stageMap = {};
    for (const s of p1Stages) {
      const sRes = await db.run(
        `INSERT INTO crm_pipeline_stages (pipeline_id, name, description, stage_order, color, probability, sla_hours)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [p1Id, s.name, s.desc, s.order, s.color, s.prob, s.sla]
      );
      stageMap[s.name] = sRes.lastID;
    }

    // 2. Pipeline 2: Cydaix Leather — Executive B2B & Gifting
    const p2Res = await db.run(
      `INSERT INTO crm_pipelines (brand_id, name, description, business_type, icp_json, is_active)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [
        cydaixId,
        'Executive Gifting & B2B Corporate Pipeline',
        'Tailored pipeline for IT companies, banks, and corporate firms purchasing premium handcrafted leather employee and client gifting kits.',
        'B2B / Luxury Goods',
        JSON.stringify({
          industry: ['Software / Tech', 'Banking & Finance', 'Corporate Gifting'],
          customer_type: 'B2B',
          location: ['Karachi', 'Lahore', 'Islamabad'],
          company_size: '20-500 employees',
          purchase_intent: ['Corporate Onboarding Kits', 'Minimalist Wallets', 'Laptop Sleeves']
        })
      ]
    );

    const p2Stages = [
      { name: 'Identified Account', desc: 'Corporate firm identified via public directory or outreach', order: 0, color: '#64748B', prob: 0.1, sla: 24 },
      { name: 'ICP Qualified', desc: 'Executive headcount and corporate gifting season verified', order: 1, color: '#4239C4', prob: 0.3, sla: 48 },
      { name: 'Discovery Call', desc: 'Introductory discussion on branding, embossing, and volume', order: 2, color: '#7A5DBB', prob: 0.5, sla: 72 },
      { name: 'Mockup & Quote Sent', desc: 'Sample physical prototype or digital branded mockup shared', order: 3, color: '#A73B9D', prob: 0.7, sla: 48 },
      { name: 'Contract Signed', desc: 'Purchase order signed with 50% advance deposit', order: 4, color: '#10B981', prob: 1.0, sla: 0 }
    ];

    for (const s of p2Stages) {
      await db.run(
        `INSERT INTO crm_pipeline_stages (pipeline_id, name, description, stage_order, color, probability, sla_hours)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [p2Res.lastID, s.name, s.desc, s.order, s.color, s.prob, s.sla]
      );
    }

    // 3. Pipeline 3: Zest Apparel — Boutique Stockist Pipeline
    const p3Res = await db.run(
      `INSERT INTO crm_pipelines (brand_id, name, description, business_type, icp_json, is_active)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [
        zestId,
        'Boutique Stockist & Wholesale Pipeline',
        'Designed for independent boutiques, multi-designer outlets, and online resellers stocking fast-fashion lawn and pret kurtas.',
        'Fashion Retail & Wholesale',
        JSON.stringify({
          industry: ['Apparel', 'Women Fashion', 'Boutique Retail'],
          customer_type: 'B2B Retailers',
          location: ['Tier 1 & Tier 2 Cities Pakistan'],
          purchase_intent: ['Pret Kurtas', 'Festive Lawn Bundles']
        })
      ]
    );

    const p3Stages = [
      { name: 'Discovered Boutique', desc: 'Local boutique identified via Map Scraper or Instagram', order: 0, color: '#64748B', prob: 0.1, sla: 24 },
      { name: 'Lookbook Shared', desc: 'Digital seasonal lookbook and wholesale line-sheet sent', order: 1, color: '#4239C4', prob: 0.35, sla: 48 },
      { name: 'Sample Batch Ordered', desc: 'Trial 10-piece pack dispatched for counter display', order: 2, color: '#A73B9D', prob: 0.7, sla: 48 },
      { name: 'Active Stockist', desc: 'Regular recurring weekly re-stocking account', order: 3, color: '#10B981', prob: 1.0, sla: 0 }
    ];

    for (const s of p3Stages) {
      await db.run(
        `INSERT INTO crm_pipeline_stages (pipeline_id, name, description, stage_order, color, probability, sla_hours)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [p3Res.lastID, s.name, s.desc, s.order, s.color, s.prob, s.sla]
      );
    }

    // 4. Update existing crm_leads to link to Pipeline 1 and proper stages
    const existingLeads = await db.all('SELECT * FROM crm_leads');
    for (const lead of existingLeads) {
      let targetStageId = stageMap['New Prospect'];
      let numericScore = 75;
      let nextAction = 'Send WhatsApp Introductory Catalog';
      let leadValue = 35000;

      if (lead.status === 'Customer') {
        targetStageId = stageMap['Won / Customer'];
        numericScore = 94;
        nextAction = 'Dispatch 45-Day Recurring Re-Order Offer';
        leadValue = 120000;
      } else if (lead.status === 'Prospect') {
        targetStageId = stageMap['Interested'];
        numericScore = 84;
        nextAction = 'Follow up on Sample Batch Feedback';
        leadValue = 55000;
      } else if (lead.lead_score === 'A') {
        targetStageId = stageMap['AI Qualified'];
        numericScore = 91;
        nextAction = 'Initiate Priority WhatsApp Outreach';
        leadValue = 65000;
      }

      const scoreExplanation = `High ICP fit: Verified ${lead.category || 'Retail'} in ${lead.city || 'Pakistan'} with direct contactability (${lead.phone ? 'Phone & WhatsApp' : 'Email'}).`;

      await db.run(
        `UPDATE crm_leads SET 
          pipeline_id = ?, 
          stage_id = ?, 
          lead_score_numeric = ?, 
          lead_score_explanation = ?, 
          value = ?, 
          next_action = ?,
          country = 'Pakistan',
          ai_research_json = ?
         WHERE id = ?`,
        [
          p1Id,
          targetStageId,
          numericScore,
          scoreExplanation,
          leadValue,
          nextAction,
          JSON.stringify({
            icpMatchPercent: numericScore,
            intentSignals: ['Active local commercial footprint', 'Registered business listings', 'High customer rating'],
            fitAnalysis: 'Strong match for wholesale corporate and bulk honey distribution network.',
            recommendedApproach: 'WhatsApp message with Cash on Delivery guarantee and official lab purity certificate.'
          }),
          lead.id
        ]
      );

      // Add a realistic task for each lead
      await db.run(
        `INSERT INTO crm_tasks (lead_id, title, task_type, due_date, status, assigned_to)
         VALUES (?, ?, ?, datetime('now', '+2 days'), 'pending', 'AI Lead Agent')`,
        [lead.id, `Follow up with ${lead.name} regarding wholesale pricing`, 'follow-up']
      );

      // Add suggested outreach message
      await db.run(
        `INSERT INTO crm_outreach_messages (lead_id, channel, subject, message_body, status)
         VALUES (?, 'whatsapp', 'Wholesale Inquiry', ?, 'suggested')`,
        [
          lead.id,
          `Assalam-o-Alaikum ${lead.name}! We noticed ${lead.company || 'your store'} in ${lead.city || 'Pakistan'}. KMB Honey provides 100% lab-certified pure Sidr honey with doorstep Cash on Delivery for retail partners. Would you like our wholesale rate card?`
        ]
      );
    }

    console.log('Seeded Adaptive CRM pipelines, stages, tasks, and updated leads.');
  }
}

async function ensureApifyIntegrationData() {
  const existing = await db.get('SELECT COUNT(*) as count FROM apify_integrations');
  if (existing.count === 0) {
    console.log('Configuring server-side Apify integration with user token and actors...');

    const userToken = process.env.APIFY_API_TOKEN || '';

    await db.run(
      `INSERT INTO apify_integrations (api_key, status, last_tested_at, monthly_budget_limit, estimated_spend, user_info_json)
       VALUES (?, 'Connected', CURRENT_TIMESTAMP, 25.0, 2.14, ?)`,
      [
        userToken,
        JSON.stringify({
          username: 'marky_operator',
          plan: 'Personal Cloud ($49/mo)',
          maxConcurrency: 10,
          verified: true
        })
      ]
    );

    // Seed Actors
    const actors = [
      {
        name: 'Google Maps / Places Scraper',
        actor_id: 'compass~crawler-google-places',
        desc: 'Extract local businesses, boutiques, stores, phone numbers, addresses, and ratings across Pakistani and international cities.',
        category: 'Local Business Discovery'
      },
      {
        name: 'Website Lead & Contact Extractor',
        actor_id: 'apify~website-content-crawler',
        desc: 'Crawl company websites to discover verified emails, LinkedIn company links, WhatsApp numbers, and executive bios.',
        category: 'B2B & Web Intelligence'
      },
      {
        name: 'Instagram Profile & Business Lead Scraper',
        actor_id: 'apify~instagram-scraper',
        desc: 'Scrape business bio links, phone numbers, and follower engagement for D2C brands and boutique creators.',
        category: 'Social Commerce'
      }
    ];

    for (const a of actors) {
      await db.run(
        `INSERT INTO apify_actors (name, actor_id, description, category, enabled)
         VALUES (?, ?, ?, ?, 1)`,
        [a.name, a.actor_id, a.desc, a.category]
      );
    }

    // Seed realistic Apify Runs telemetry
    await db.run(
      `INSERT INTO apify_runs (actor_id, actor_name, run_id, status, items_collected, compute_units, estimated_usd, error_message, started_at, completed_at)
       VALUES 
       ('compass~crawler-google-places', 'Google Maps / Places Scraper', 'run_map_lhe_8912', 'SUCCEEDED', 45, 0.18, 0.42, NULL, datetime('now', '-2 hours'), datetime('now', '-1 hours')),
       ('compass~crawler-google-places', 'Google Maps / Places Scraper', 'run_map_khi_5401', 'SUCCEEDED', 38, 0.15, 0.35, NULL, datetime('now', '-1 days'), datetime('now', '-23 hours')),
       ('apify~website-content-crawler', 'Website Lead & Contact Extractor', 'run_web_isb_2210', 'SUCCEEDED', 24, 0.22, 0.51, NULL, datetime('now', '-3 days'), datetime('now', '-3 days'))`
    );

    console.log('Seeded Apify integrations, actors, and run telemetry.');
  }
}

async function seedRealisticData() {
  // 1. Seed Brands
  const brandsData = [
    {
      name: 'KMB Honey',
      company_name: 'KMB Natural Foods Pvt Ltd',
      industry: 'Organic FMCG & Health Food',
      category: 'Health & Organic Food',
      tier: 'Premium',
      description: 'Raw, unpasteurized Sidr & Berry flower honey directly sourced from Swat and Karak valleys. Offers nationwide Cash-on-Delivery with prominent presence on Daraz and Shopify.',
      target_audience: 'Health-conscious families, natural remedy seekers, Ramadan gift shoppers across Pakistan (Lahore, Karachi, Islamabad).',
      website: 'https://kmbhoney.pk',
      brand_voice: 'Authentic, Pure, Trustworthy, Health-Focused',
      tone: 'Warm, Authoritative, Sincere',
      brand_positioning: '100% Raw Unfiltered Valleys Honey vs Mass Industrial Supermarket Sugar Syrups',
      competitors: 'Marhaba Laboratories, Organic Valley PK, Salman Honey',
      usps: 'Cold-extracted, lab-tested purity certificates, zero heat processing, money-back purity guarantee',
      key_messaging: 'Taste the uncompromised purity of Swat Valleys. Authentic raw honey delivered with COD nationwide.',
      keywords: 'raw honey pakistan, sidr honey karak, pure honey lahore, organic honey swat',
      social_platforms: 'TikTok Shop, Facebook, Instagram, Daraz Mall, WhatsApp'
    },
    {
      name: 'Cydaix',
      company_name: 'Cydaix Leather Craft',
      industry: 'Fashion Accessories & Leather',
      category: 'Leather Goods & Accessories',
      tier: 'Luxury',
      description: 'Handcrafted genuine top-grain cowhide leather wallets, minimalist cardholders, and laptop sleeves designed for modern South Asian professionals.',
      target_audience: 'Young corporate executives, tech professionals, university graduates, and premium gift shoppers aged 22-45.',
      website: 'https://cydaixleather.com',
      brand_voice: 'Sleek, Minimalist, Architectural, Timeless',
      tone: 'Understated Luxury, Confident, Modern',
      brand_positioning: 'Slim handcrafted top-grain leather that replaces bulky traditional wallets for the modern urban executive.',
      competitors: 'Hub Leather, J. Fragrances & Accessories, Royal Tag',
      usps: 'Top-grain pull-up leather, RFID protection, hand-burnished edges, 3-year stitching warranty',
      key_messaging: 'Designed for the modern pocket. Luxury handcrafted leather made to patina with age.',
      keywords: 'leather wallet pakistan, minimalist cardholder, slim bifold karachi, cowhide leather gifts',
      social_platforms: 'Instagram Reels, Meta Advantage+, TikTok UGC, Google Ads'
    },
    {
      name: 'Zest Apparel PK',
      company_name: 'Zest Fashion Retail',
      industry: 'Apparel & Fast Fashion',
      category: 'Fashion & Apparel',
      tier: 'Mass',
      description: 'Fast-moving eastern pret and western fusion daily wear tailored for the Pakistani youth and collegiate demographic, thriving on TikTok live shopping.',
      target_audience: 'Gen-Z and millennial women looking for trendy kurtas and coordinates under PKR 4,000.',
      website: 'https://zestapparel.pk',
      brand_voice: 'Youthful, Energetic, Vibrant, Trendsetting',
      tone: 'Trendy, Relatable, High-Spirited',
      brand_positioning: 'Affordable everyday chic delivered in 48 hours without compromising on fabric quality.',
      competitors: 'Khaadi, Generation, Zellbury, Limelight',
      usps: 'Weekly drops, under PKR 3,990 pricing, hassle-free 7-day doorstep size exchange',
      key_messaging: 'Step out in fresh festive style every week without breaking the bank.',
      keywords: 'pret kurtas lahore, eastern wear gen-z, festive lawn suit, daily fusion wear pk',
      social_platforms: 'TikTok Live, Instagram Stories, Meta Carousel'
    },
    {
      name: 'Lumina Skincare PK',
      company_name: 'Lumina Derma Labs',
      industry: 'Beauty & Personal Care',
      category: 'Beauty & Personal Care',
      tier: 'Premium',
      description: 'Clean, halal-certified skincare formulated specifically for South Asian skin tones to tackle humidity, hyperpigmentation, and sun damage.',
      target_audience: 'Urban women and brides-to-be aged 19-35 seeking glowing, dermatologically tested skin solutions.',
      website: 'https://luminaskincare.pk',
      brand_voice: 'Clinical, Empathetic, Science-Backed, Radiant',
      tone: 'Supportive, Dermatologically Credible, Transparent',
      brand_positioning: 'Dermatologist-formulated active skincare crafted specifically for high-humidity South Asian climates.',
      competitors: 'Conatural, Vince Care, The Ordinary PK Importers',
      usps: 'Halal certified, 14-day dark spot clinical efficacy, non-comedogenic, fragrance-free options',
      key_messaging: 'Real science for radiant South Asian skin. Proven before/after results without harmful steroids.',
      keywords: 'vitamin c serum pakistan, dark spot treatment, acne hyperpigmentation lahore, halal skincare',
      social_platforms: 'Instagram Reels, TikTok UGC Reviews, Meta Advantage+'
    }
  ];

  const brandIds = {};
  for (const b of brandsData) {
    const res = await db.run(
      `INSERT INTO brands (
        name, company_name, industry, category, tier, description, website, 
        brand_voice, tone, brand_positioning, competitors, usps, key_messaging, 
        keywords, social_platforms, target_audience
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.name, b.company_name, b.industry, b.category, b.tier, b.description, b.website,
        b.brand_voice, b.tone, b.brand_positioning, b.competitors, b.usps, b.key_messaging,
        b.keywords, b.social_platforms, b.target_audience
      ]
    );
    brandIds[b.name] = res.lastID;
  }

  // 2. Seed Campaigns
  const campaignsData = [
    {
      brand_id: brandIds['KMB Honey'],
      name: 'Ramadan Raw Honey Mega Blitz',
      objective: 'Direct E-commerce Sales (ROAS 4.5x)',
      status: 'Active',
      start_date: '2026-03-01',
      end_date: '2026-04-05',
      budget: 250000,
      currency: 'PKR',
      platforms: 'TikTok Shop, Facebook, Instagram, WhatsApp Blast',
      kpi: '4.5x ROAS • PKR 450 Target CPA',
      target_geography: 'Lahore, Karachi, Islamabad, Rawalpindi',
      approval_status: 'Approved'
    },
    {
      brand_id: brandIds['KMB Honey'],
      name: 'Daraz 11.11 Early Bird Bundle',
      objective: 'Daraz Sponsored Discovery & Rank',
      status: 'Draft',
      start_date: '2026-11-01',
      end_date: '2026-11-15',
      budget: 120000,
      currency: 'PKR',
      platforms: 'Daraz Sponsored, Facebook Ads',
      kpi: 'Top 3 Keyword Rank for "Pure Honey"',
      target_geography: 'Nationwide Pakistan',
      approval_status: 'Pending Approval'
    },
    {
      brand_id: brandIds['Cydaix'],
      name: 'Winter Handcrafted Leather Drop',
      objective: 'Conversions & Brand Authority',
      status: 'Active',
      start_date: '2026-02-15',
      end_date: '2026-03-30',
      budget: 400000,
      currency: 'PKR',
      platforms: 'Instagram Reels, Meta Advantage+, Google Search',
      kpi: '3.8x Blended ROAS • High AOV Bundles',
      target_geography: 'DHA / Bahria Town (LHE, KHI, ISB)',
      approval_status: 'Approved'
    },
    {
      brand_id: brandIds['Zest Apparel PK'],
      name: 'Eid Collection Vol. 1 Teaser',
      objective: 'Conversions & Video Views',
      status: 'Active',
      start_date: '2026-03-05',
      end_date: '2026-04-10',
      budget: 650000,
      currency: 'PKR',
      platforms: 'TikTok Spark Ads, Instagram, Meta Ads',
      kpi: '5.2x ROAS on TikTok Shop Live',
      target_geography: 'Tier 1 & Tier 2 Cities Pakistan',
      approval_status: 'Approved'
    },
    {
      brand_id: brandIds['Lumina Skincare PK'],
      name: 'Clear Glow Vitamin C Serum Boost',
      objective: 'Customer Acquisition (ROAS 4x)',
      status: 'Paused',
      start_date: '2026-01-10',
      end_date: '2026-02-28',
      budget: 180000,
      currency: 'PKR',
      platforms: 'Instagram Carousel, TikTok UGC, Google Ads',
      kpi: 'PKR 650 CPA on First Time Buyers',
      target_geography: 'Major Urban Centers',
      approval_status: 'Approved'
    }
  ];

  for (const c of campaignsData) {
    await db.run(
      `INSERT INTO campaigns (
        brand_id, name, objective, status, start_date, end_date, budget, currency, 
        platforms, kpi, target_geography, approval_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        c.brand_id, c.name, c.objective, c.status, c.start_date, c.end_date, c.budget, 
        c.currency, c.platforms, c.kpi, c.target_geography, c.approval_status
      ]
    );
  }

  // 3. Seed CRM Leads
  const leadsData = [
    {
      name: 'Usman Bridal Rental',
      company: 'Usman Haute Couture',
      phone: '+92 300 8456123',
      email: 'usman.bridal@gmail.com',
      status: 'Prospect',
      category: 'Bridal & Festive Wear',
      rating: 4.8,
      lead_score: 'A',
      website: 'https://instagram.com/usmanbridal',
      city: 'Lahore',
      notes: 'Interested in wholesale honey corporate gifting sets for wedding guests. High volume potential.',
      tags: 'Wedding, High AOV, Corporate Gifting'
    },
    {
      name: 'Karachi Organic Mart',
      company: 'Organic Mart Retailers',
      phone: '+92 321 9874561',
      email: 'contact@karachiorganic.pk',
      status: 'Customer',
      category: 'Organic Foods & Honey Distributor',
      rating: 4.9,
      lead_score: 'A',
      website: 'https://karachiorganic.pk',
      city: 'Karachi',
      notes: 'Regular re-orders of 50 jars per month. Payment settled via Bank Transfer on delivery.',
      tags: 'B2B Distributor, Verified Customer, Repeat Buyer'
    },
    {
      name: 'Al-Madina Spices & Dry Fruits',
      company: 'Al-Madina Wholesale Mandi',
      phone: '+92 345 6712345',
      email: 'orders@almadinaspices.pk',
      status: 'Lead',
      category: 'Wholesale Food & Spices',
      rating: 4.5,
      lead_score: 'B',
      website: 'https://daraz.pk/shop/almadina-spices',
      city: 'Faisalabad',
      notes: 'Discovered via Google Maps scraper. Contacted via WhatsApp catalog.',
      tags: 'Wholesale, Faisalabad Hub, Cold Lead'
    },
    {
      name: 'Glow Cosmetics Rawalpindi',
      company: 'Glow Retail Group',
      phone: '+92 333 5432198',
      email: 'glow.rwp@outlook.com',
      status: 'Prospect',
      category: 'Beauty Retail & Salon Supplies',
      rating: 4.7,
      lead_score: 'B',
      website: 'https://glowcosmetics.pk',
      city: 'Rawalpindi',
      notes: 'Requested sample batch of Lumina Vitamin C Serums for salon client counter.',
      tags: 'Salon Partner, Samples Sent'
    },
    {
      name: 'E-Retail Tech Hub Peshawar',
      company: 'Tech Hub Peshawar',
      phone: '+92 312 4455667',
      email: 'support@eretailhub.com',
      status: 'Customer',
      category: 'Consumer Electronics & Gadgets',
      rating: 4.6,
      lead_score: 'A',
      website: 'https://eretailhub.com',
      city: 'Peshawar',
      notes: 'Purchased 30 Cydaix leather laptop sleeves for executive onboarding packs.',
      tags: 'Corporate, Repeat Buyer'
    },
    {
      name: 'Royal Heritage Khussa House',
      company: 'Heritage Craft Multan',
      phone: '+92 301 7766554',
      email: 'heritagekhussa@yahoo.com',
      status: 'Lead',
      category: 'Traditional Footwear',
      rating: 4.3,
      lead_score: 'C',
      website: 'https://facebook.com/heritagekhussa',
      city: 'Multan',
      notes: 'Exploratory lead. Potential cross-bundle with leather accessories.',
      tags: 'Traditional Footwear, Outreach Needed'
    }
  ];

  for (const l of leadsData) {
    const res = await db.run(
      `INSERT INTO crm_leads (
        name, company, phone, email, status, category, rating, lead_score, website, city, notes, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        l.name, l.company, l.phone, l.email, l.status, l.category, l.rating, l.lead_score, 
        l.website, l.city, l.notes, l.tags
      ]
    );
    
    // Seed initial activity for this lead
    await db.run(
      `INSERT INTO crm_activities (lead_id, activity_type, summary, details, performed_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        res.lastID, 
        'Lead Created', 
        `Imported from Map Scraper into ${l.status} pipeline`, 
        l.notes, 
        'Lead Generation Agent'
      ]
    );
  }

  // 4. Seed Competitors
  const competitorsData = [
    {
      name: 'Marhaba Laboratories',
      company: 'Marhaba Laboratories Pvt Ltd',
      url: 'https://marhaba.com.pk',
      industry: 'Herbal & FMCG',
      products: 'Honey, Rose Water, Herbal Syrups, Ispaghol',
      pricing: 'PKR 850 - PKR 1,400 (Mass Market)',
      positioning: 'Household generational trust with ubiquitous pharmacy presence',
      threat_level: 'High',
      analysis_summary: 'Dominant legacy brand in Pakistan honey and herbal health space with unmatched retail shelf space and high generational trust.',
      strengths: 'Nationwide physical pharmacy distribution, ISO certifications, household name credibility, aggressive price competition.',
      weaknesses: 'Pasteurized commercial blend, dated glass packaging, lacks premium D2C aesthetic, minimal TikTok engagement.'
    },
    {
      name: 'J. Junaid Jamshed',
      company: 'Junaid Jamshed Pvt Ltd',
      url: 'https://www.junaidjamshed.com',
      industry: 'Fashion & Fragrances',
      products: 'Pret, Unstitched, Perfumes, Men Attire, Accessories',
      pricing: 'PKR 4,500 - PKR 18,000 (Upper Middle Tier)',
      positioning: 'Premier cultural modest luxury fashion house with massive flagship stores',
      threat_level: 'High',
      analysis_summary: 'Market titan in eastern wear and fragrances with massive marketing budget and viral seasonal campaigns across TV and digital.',
      strengths: 'Omni-channel presence, 100+ stores nationwide, massive loyalty program, high digital ad saturation.',
      weaknesses: 'High overhead costs require high markup, slow delivery cycles during seasonal rush, bulky traditional accessories.'
    },
    {
      name: 'Organic Valley Pakistan',
      company: 'Organic Valley PK',
      url: 'https://organicvalleypk.com',
      industry: 'Direct to Consumer Health',
      products: 'Raw Sidr Honey, Organic Oils, Himalayan Shilajit',
      pricing: 'PKR 2,200 - PKR 4,500 (Premium)',
      positioning: 'Modern aesthetic wellness brand targeting urban DHA and Bahria Town health enthusiasts',
      threat_level: 'Medium',
      analysis_summary: 'Fast-growing digital direct-to-consumer organic brand targeting DHA and Bahria Town tier 1 consumers.',
      strengths: 'Aesthetic glass packaging, strong Instagram influencer partnerships, fluent English branding.',
      weaknesses: 'Limited retail footprint, high Cash-on-Delivery return rates reported outside Tier 1 cities.'
    },
    {
      name: 'Hub Leather',
      company: 'Hub Leather Goods',
      url: 'https://hub.com.pk',
      industry: 'Luxury Leather',
      products: 'Wallets, Briefcases, Handbags, Travel Luggage',
      pricing: 'PKR 6,500 - PKR 35,000 (Luxury)',
      positioning: 'Corporate luxury leather gifting and airport lounge outlets',
      threat_level: 'Medium',
      analysis_summary: 'High-end corporate leather brand with airport stores and luxury mall outlets across Pakistan.',
      strengths: 'Corporate gifting monopoly, premium packaging, heritage leather crafting reputation.',
      weaknesses: 'High retail pricing inaccessible to young professionals, conservative traditional wallet silhouettes.'
    }
  ];

  for (const comp of competitorsData) {
    await db.run(
      `INSERT INTO competitors (
        name, company, url, industry, products, pricing, positioning, 
        threat_level, analysis_summary, strengths, weaknesses
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        comp.name, comp.company, comp.url, comp.industry, comp.products, comp.pricing, 
        comp.positioning, comp.threat_level, comp.analysis_summary, comp.strengths, comp.weaknesses
      ]
    );
  }

  console.log('Seed data successfully inserted into SQLite.');
}
