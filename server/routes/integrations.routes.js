import { Router } from 'express';
import { db } from '../database.js';
import { cryptoService } from '../services/crypto.service.js';
import { createRateLimiter } from '../middleware/security.middleware.js';

const router = Router();

const integrationRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many integration requests. Please slow down.'
});

// Supported Provider Catalog Metadata
const PROVIDER_CATALOG = [
  // 1. AI LLM & Intelligence
  {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'ai_llm',
    category: 'AI & LLM Providers',
    description: 'Foundation intelligence for CMO strategy synthesis, ad copywriting, and competitor analysis.',
    fields: [{ key: 'apiKey', label: 'Gemini API Key', type: 'password', placeholder: 'AQ.Ab8...' }],
    capabilities: ['Strategic Playbooks', 'Ad Blueprint Kits', 'Agent Swarm Reasoning'],
    docsUrl: 'https://aistudio.google.com'
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT-4o)',
    type: 'ai_llm',
    category: 'AI & LLM Providers',
    description: 'Direct GPT-4o model integration for high-converting direct response copywriting.',
    fields: [{ key: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-proj-...' }],
    capabilities: ['Direct Response Copywriting', 'SEO Synthesis', 'Function Calling'],
    docsUrl: 'https://platform.openai.com'
  },
  {
    id: 'groq',
    name: 'Groq Cloud (Llama 3.3)',
    type: 'ai_llm',
    category: 'AI & LLM Providers',
    description: 'Ultra-low latency Llama-3.3-70b inference for instant tool execution and chat.',
    fields: [{ key: 'apiKey', label: 'Groq API Key', type: 'password', placeholder: 'gsk_...' }],
    capabilities: ['Instant Speed Inference', 'Real-Time Chat', 'Structured Extraction'],
    docsUrl: 'https://console.groq.com'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude 3.5',
    type: 'ai_llm',
    category: 'AI & LLM Providers',
    description: 'Advanced long-form brand persona synthesis and nuance-rich creative writing.',
    fields: [{ key: 'apiKey', label: 'Anthropic API Key', type: 'password', placeholder: 'sk-ant-...' }],
    capabilities: ['Nuanced Brand Voice', 'Long-Context Ingestion', 'Audit Reviews'],
    docsUrl: 'https://console.anthropic.com'
  },

  // 2. AI Image & Creative Generation
  {
    id: 'edenai',
    name: 'Eden AI Creative Hub',
    type: 'ai_image',
    category: 'Image & Creative Engines',
    description: 'Unified gateway providing commercial image generation via Stability AI, DALL-E 3, and Replicate.',
    fields: [{ key: 'apiKey', label: 'Eden AI API Key', type: 'password', placeholder: 'sk-eden-live-...' }],
    capabilities: ['Photorealistic Products', 'Aspect Ratio Control', 'Video Generation'],
    docsUrl: 'https://www.edenai.co'
  },
  {
    id: 'stability',
    name: 'Stability AI (SD3)',
    type: 'ai_image',
    category: 'Image & Creative Engines',
    description: 'Stable Diffusion 3 Ultra for cinematic commercial ad backgrounds and packaging.',
    fields: [{ key: 'apiKey', label: 'Stability API Key', type: 'password', placeholder: 'sk-...' }],
    capabilities: ['Cinematic Rendering', 'Packaging Mockups', 'Photorealism'],
    docsUrl: 'https://platform.stability.ai'
  },

  // 3. Database & Backend Providers
  {
    id: 'supabase',
    name: 'Supabase Cloud',
    type: 'database',
    category: 'Database & Backend',
    description: 'PostgreSQL-compatible real-time database and storage connector for client marketing records.',
    fields: [
      { key: 'projectUrl', label: 'Supabase Project URL', type: 'text', placeholder: 'https://xyzcompany.supabase.co' },
      { key: 'anonKey', label: 'Supabase Anon/Public Key', type: 'password', placeholder: 'eyJhbGciOiJIUzI1NiIsInR5c...' }
    ],
    capabilities: ['Cloud PostgreSQL', 'Row-Level Security', 'Storage Buckets'],
    docsUrl: 'https://supabase.com'
  },
  {
    id: 'firebase',
    name: 'Google Firebase',
    type: 'database',
    category: 'Database & Backend',
    description: 'Firestore real-time event pipeline and enterprise analytics event streaming connector.',
    fields: [
      { key: 'projectId', label: 'Project ID', type: 'text', placeholder: 'my-marky-project' },
      { key: 'apiKey', label: 'Firebase Web API Key', type: 'password', placeholder: 'AIzaSy...' }
    ],
    capabilities: ['Realtime Firestore', 'Mobile Event Streaming', 'Cloud Functions'],
    docsUrl: 'https://firebase.google.com'
  },
  {
    id: 'postgres',
    name: 'Self-Hosted PostgreSQL',
    type: 'database',
    category: 'Database & Backend',
    description: 'Direct encrypted connection string for external relational databases.',
    fields: [
      { key: 'connectionString', label: 'PostgreSQL Connection URL', type: 'password', placeholder: 'postgresql://user:pass@host:5432/dbname' }
    ],
    capabilities: ['Direct SQL Access', 'Dedicated Cluster', 'Enterprise Isolation'],
    docsUrl: 'https://www.postgresql.org'
  },

  // 4. Connect Apps & Channels
  {
    id: 'meta_ads',
    name: 'Meta Ads Manager',
    type: 'connected_app',
    category: 'Advertising Channels',
    description: 'Automated direct synchronization of generated ad blueprints into Meta Ad Sets.',
    fields: [
      { key: 'adAccountId', label: 'Meta Ad Account ID', type: 'text', placeholder: 'act_1234567890' },
      { key: 'accessToken', label: 'System User Access Token', type: 'password', placeholder: 'EAAB...' }
    ],
    capabilities: ['Advantage+ Campaigns', 'Ad Creative Upload', 'Spend Optimization'],
    docsUrl: 'https://developers.facebook.com'
  },
  {
    id: 'shopify',
    name: 'Shopify Storefront',
    type: 'connected_app',
    category: 'E-Commerce Platforms',
    description: 'Sync product descriptions, customer order histories, and automated COD verification webhooks.',
    fields: [
      { key: 'storeDomain', label: 'Shopify Store Domain', type: 'text', placeholder: 'my-store.myshopify.com' },
      { key: 'adminToken', label: 'Admin API Access Token', type: 'password', placeholder: 'shpat_...' }
    ],
    capabilities: ['Product Sync', 'Abandoned Cart Hooks', 'COD Order Verification'],
    docsUrl: 'https://shopify.dev'
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    type: 'connected_app',
    category: 'CRM & Pipeline',
    description: 'Two-way lead sync between Marky High-Intent Lead Pipeline and HubSpot Contacts.',
    fields: [
      { key: 'accessToken', label: 'HubSpot Private App Token', type: 'password', placeholder: 'pat-na1-...' }
    ],
    capabilities: ['Deal Pipeline Sync', 'Lead Score Mapping', 'Contact Enrichment'],
    docsUrl: 'https://developers.hubspot.com'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Cloud API',
    type: 'connected_app',
    category: 'Communication & Outreach',
    description: 'Automated Cash-on-Delivery (COD) order confirmation templates to reduce return rates by 40%.',
    fields: [
      { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', placeholder: '109876543210' },
      { key: 'accessToken', label: 'Permanent System User Token', type: 'password', placeholder: 'EAAW...' }
    ],
    capabilities: ['COD Order Confirmation', 'Abandoned Cart Recovery', 'Interactive Buttons'],
    docsUrl: 'https://developers.facebook.com/docs/whatsapp'
  }
];

// GET /api/integrations — List all supported providers with user's connection status
router.get('/', integrationRateLimiter, async (req, res) => {
  try {
    const userId = req.user?.id || 1;

    const userRows = await db.all(
      `SELECT provider_id, provider_type, display_name, credentials_encrypted, status, capabilities_json, metadata_json, last_tested_at, updated_at
       FROM user_integrations WHERE user_id = ?`,
      [userId]
    );

    const userMap = new Map();
    userRows.forEach(row => {
      let maskedCreds = {};
      try {
        const decrypted = JSON.parse(cryptoService.decrypt(row.credentials_encrypted) || '{}');
        Object.keys(decrypted).forEach(key => {
          maskedCreds[key] = cryptoService.maskSecret(decrypted[key]);
        });
      } catch (e) {
        maskedCreds = { key: '••••••••' };
      }

      userMap.set(row.provider_id, {
        status: row.status,
        maskedCredentials: maskedCreds,
        lastTestedAt: row.last_tested_at,
        updatedAt: row.updated_at
      });
    });

    // Merge with master catalog so client receives full rich suite
    const merged = PROVIDER_CATALOG.map(item => {
      const userConfig = userMap.get(item.id);
      return {
        ...item,
        status: userConfig ? userConfig.status : 'NOT_CONNECTED',
        isConfigured: Boolean(userConfig),
        maskedCredentials: userConfig?.maskedCredentials || null,
        lastTestedAt: userConfig?.lastTestedAt || null
      };
    });

    res.json({ success: true, count: merged.length, data: merged });
  } catch (err) {
    console.error('[Integrations] Error listing providers:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/integrations/:providerId/save — Encrypt & Save Provider Credentials
router.post('/:providerId/save', integrationRateLimiter, async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { providerId } = req.params;
    const { credentials = {}, metadata = {} } = req.body;

    const catalogEntry = PROVIDER_CATALOG.find(p => p.id === providerId);
    if (!catalogEntry) {
      return res.status(404).json({ success: false, error: `Provider "${providerId}" is not recognized by the system.` });
    }

    if (Object.keys(credentials).length === 0) {
      return res.status(400).json({ success: false, error: 'Credentials payload cannot be empty.' });
    }

    // Encrypt credentials at rest with AES-256-GCM
    const encrypted = cryptoService.encrypt(JSON.stringify(credentials));

    // Upsert into user_integrations
    await db.run(
      `INSERT INTO user_integrations (user_id, provider_id, provider_type, display_name, credentials_encrypted, status, capabilities_json, metadata_json, updated_at)
       VALUES (?, ?, ?, ?, ?, 'CONNECTED', ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, provider_id) DO UPDATE SET
         credentials_encrypted = excluded.credentials_encrypted,
         status = 'CONNECTED',
         metadata_json = excluded.metadata_json,
         updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        providerId,
        catalogEntry.type,
        catalogEntry.name,
        encrypted,
        JSON.stringify(catalogEntry.capabilities),
        JSON.stringify(metadata)
      ]
    );

    // Compute masked representation for safe frontend response
    const masked = {};
    Object.keys(credentials).forEach(k => {
      masked[k] = cryptoService.maskSecret(credentials[k]);
    });

    res.json({
      success: true,
      message: `${catalogEntry.name} successfully connected and encrypted at rest.`,
      data: {
        providerId,
        name: catalogEntry.name,
        status: 'CONNECTED',
        maskedCredentials: masked
      }
    });
  } catch (err) {
    console.error(`[Integrations] Save error for ${req.params.providerId}:`, err.message);
    res.status(500).json({ success: false, error: 'Failed to securely save provider credentials.' });
  }
});

// POST /api/integrations/:providerId/test — Live Authenticated Connection Probe
router.post('/:providerId/test', integrationRateLimiter, async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { providerId } = req.params;
    let credentials = req.body.credentials;

    // If credentials not passed in body, fetch from encrypted database record
    if (!credentials || Object.keys(credentials).length === 0) {
      const row = await db.get(
        `SELECT credentials_encrypted FROM user_integrations WHERE user_id = ? AND provider_id = ?`,
        [userId, providerId]
      );
      if (!row) {
        return res.status(400).json({ success: false, error: 'No stored credentials found. Please provide credentials to test.' });
      }
      credentials = JSON.parse(cryptoService.decrypt(row.credentials_encrypted) || '{}');
    }

    let isConnected = false;
    let detailMessage = 'Connected successfully';

    // ── Probing Engine by Provider ──
    try {
      if (providerId === 'gemini') {
        const key = credentials.apiKey;
        if (!key) throw new Error('Gemini API key is required.');
        const probeRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (probeRes.ok) {
          isConnected = true;
          detailMessage = 'Google Gemini API connection authenticated and live.';
        } else {
          const errData = await probeRes.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${probeRes.status} unauthorized.`);
        }
      } else if (providerId === 'groq') {
        const key = credentials.apiKey;
        if (!key) throw new Error('Groq API key is required.');
        const probeRes = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` }
        });
        if (probeRes.ok) {
          isConnected = true;
          detailMessage = 'Groq Cloud inference engine authenticated.';
        } else {
          throw new Error(`HTTP ${probeRes.status} Groq authentication failed.`);
        }
      } else if (providerId === 'openai') {
        const key = credentials.apiKey;
        if (!key) throw new Error('OpenAI API key is required.');
        const probeRes = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` }
        });
        if (probeRes.ok) {
          isConnected = true;
          detailMessage = 'OpenAI API connection authenticated.';
        } else {
          throw new Error(`HTTP ${probeRes.status} OpenAI authorization rejected.`);
        }
      } else if (providerId === 'edenai') {
        const key = credentials.apiKey;
        if (!key) throw new Error('Eden AI API key is required.');
        const probeRes = await fetch('https://api.edenai.run/v2/info/user', {
          headers: { 'Authorization': `Bearer ${key}` }
        });
        if (probeRes.ok) {
          isConnected = true;
          detailMessage = 'Eden AI image generation hub connected.';
        } else {
          throw new Error(`HTTP ${probeRes.status} Eden AI authentication failed.`);
        }
      } else if (providerId === 'supabase') {
        const url = credentials.projectUrl;
        if (!url || !url.startsWith('https://')) throw new Error('Valid HTTPS Supabase project URL is required.');
        const probeRes = await fetch(`${url}/rest/v1/`, {
          headers: { 'apikey': credentials.anonKey || '' }
        });
        // 200 or 401/400 implies Supabase endpoint is actively reachable
        if (probeRes.status < 500) {
          isConnected = true;
          detailMessage = 'Supabase project endpoint verified and reachable.';
        } else {
          throw new Error(`Supabase project endpoint returned status ${probeRes.status}.`);
        }
      } else {
        // Universal schema validation for webhook/token connectors
        const hasValues = Object.values(credentials).every(v => typeof v === 'string' && v.trim().length > 0);
        if (hasValues) {
          isConnected = true;
          detailMessage = 'Connection parameters format and schema validated.';
        } else {
          throw new Error('Incomplete connection configuration.');
        }
      }
    } catch (testErr) {
      isConnected = false;
      detailMessage = testErr.message;
    }

    // Update status in DB
    const newStatus = isConnected ? 'CONNECTED' : 'ERROR';
    await db.run(
      `UPDATE user_integrations SET status = ?, last_tested_at = CURRENT_TIMESTAMP WHERE user_id = ? AND provider_id = ?`,
      [newStatus, userId, providerId]
    );

    if (isConnected) {
      res.json({ success: true, status: 'CONNECTED', message: detailMessage });
    } else {
      res.status(400).json({ success: false, status: 'ERROR', error: `Connection failed: ${detailMessage}` });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Connection test execution failed.' });
  }
});

// DELETE /api/integrations/:providerId — Revoke & Disconnect Provider
router.delete('/:providerId', integrationRateLimiter, async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { providerId } = req.params;

    const result = await db.run(
      `DELETE FROM user_integrations WHERE user_id = ? AND provider_id = ?`,
      [userId, providerId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Provider integration not found or already removed.' });
    }

    res.json({
      success: true,
      message: `Provider "${providerId}" disconnected and stored credentials permanently deleted.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
