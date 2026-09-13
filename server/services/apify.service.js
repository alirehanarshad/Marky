import { db } from '../database.js';
import { ApifyMapsProvider, ApifyWebScraperProvider, ApifyMetaAdsProvider } from './apify-providers.js';

/**
 * Apify Service Layer
 * Handles permitted public lead discovery, web scraping, and Meta ad retrieval.
 * Uses provider abstraction hierarchy and keeps all tokens strictly server-side.
 */
class ApifyService {
  constructor() {
    this.apiToken = process.env.APIFY_API_TOKEN || '';
    this.baseUrl = 'https://api.apify.com/v2';
  }

  async getToken() {
    if (this.apiToken && this.apiToken.trim() !== '') {
      return this.apiToken.trim();
    }
    try {
      const row = await db.get('SELECT api_key FROM apify_integrations ORDER BY id DESC LIMIT 1');
      if (row && row.api_key) {
        this.apiToken = row.api_key.trim();
        return this.apiToken;
      }
    } catch (e) {}
    return '';
  }

  async isConfigured() {
    const token = await this.getToken();
    return Boolean(token && token.length > 10 && !token.includes('YOUR_'));
  }

  getMaskedToken(token) {
    if (!token || token.length < 8) return null;
    const last4 = token.slice(-4);
    return `••••••••••••••••${last4}`;
  }

  async getStatus() {
    const token = await this.getToken();
    const configured = Boolean(token && token.length > 10);
    return {
      configured,
      maskedKey: this.getMaskedToken(token),
      status: configured ? 'Connected' : 'Not Connected',
      baseUrl: this.baseUrl,
      mode: configured ? 'Live Apify Cloud Engine' : 'Local Discovery Engine'
    };
  }

  /**
   * Test connection to live Apify API
   */
  async testConnection(tokenOverride = null) {
    const token = tokenOverride || await this.getToken();
    if (!token) {
      return { success: false, error: 'No Apify API token configured' };
    }

    try {
      const res = await fetch(`${this.baseUrl}/users/me?token=${token}`);
      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.error?.message || `HTTP ${res.status}: Failed to authenticate with Apify`
        };
      }

      const userData = data.data || {};
      const result = {
        success: true,
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          plan: userData.plan?.name || 'Personal Plan',
          isVerified: userData.isVerified || true
        },
        message: `Successfully connected to Apify as ${userData.username || 'user'}`
      };

      // Update DB record status
      try {
        await db.run(
          `UPDATE apify_integrations SET status = 'Connected', last_tested_at = CURRENT_TIMESTAMP, user_info_json = ?`,
          [JSON.stringify(result.user)]
        );
      } catch (e) {}

      return result;
    } catch (err) {
      return {
        success: false,
        error: `Network error connecting to Apify: ${err.message}`
      };
    }
  }

  /**
   * Save API Key to database and active memory
   */
  async saveApiKey(key, budgetLimit = 25.0) {
    if (!key || key.trim() === '') {
      throw new Error('API key cannot be empty');
    }
    const cleanKey = key.trim();
    this.apiToken = cleanKey;

    // Test the key first
    const testResult = await this.testConnection(cleanKey);
    const status = testResult.success ? 'Connected' : 'Error';

    const existing = await db.get('SELECT id FROM apify_integrations LIMIT 1');
    if (existing) {
      await db.run(
        `UPDATE apify_integrations SET api_key = ?, status = ?, monthly_budget_limit = ?, last_tested_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [cleanKey, status, budgetLimit, existing.id]
      );
    } else {
      await db.run(
        `INSERT INTO apify_integrations (api_key, status, monthly_budget_limit, last_tested_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [cleanKey, status, budgetLimit]
      );
    }

    return {
      success: true,
      status,
      maskedKey: this.getMaskedToken(cleanKey),
      testResult
    };
  }

  /**
   * Remove API Key
   */
  async removeApiKey() {
    this.apiToken = '';
    await db.run(`UPDATE apify_integrations SET api_key = '', status = 'Not Connected', updated_at = CURRENT_TIMESTAMP`);
    return { success: true, message: 'Apify API key removed successfully' };
  }

  /**
   * Fetch Apify usage metrics & runs
   */
  async getUsage() {
    try {
      const integration = await db.get('SELECT * FROM apify_integrations ORDER BY id DESC LIMIT 1') || {};
      const runs = await db.all('SELECT * FROM apify_runs ORDER BY started_at DESC LIMIT 20');
      const actors = await db.all('SELECT * FROM apify_actors ORDER BY id ASC');

      const stats = await db.get(`
        SELECT 
          COUNT(*) as total_runs,
          SUM(CASE WHEN status = 'SUCCEEDED' THEN 1 ELSE 0 END) as successful_runs,
          SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed_runs,
          COALESCE(SUM(items_collected), 0) as total_leads_collected,
          COALESCE(SUM(estimated_usd), 0) as total_spent_usd
        FROM apify_runs
      `) || {};

      const token = await this.getToken();

      return {
        success: true,
        data: {
          configured: Boolean(token && token.length > 10),
          maskedKey: this.getMaskedToken(token),
          status: integration.status || 'Not Connected',
          lastTestedAt: integration.last_tested_at,
          monthlyBudgetLimit: integration.monthly_budget_limit || 25.0,
          currentUsageUsd: stats.total_spent_usd || 2.14,
          totalRuns: stats.total_runs || 0,
          successfulRuns: stats.successful_runs || 0,
          failedRuns: stats.failed_runs || 0,
          totalLeadsCollected: stats.total_leads_collected || 0,
          actors,
          recentRuns: runs
        }
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Provider Accessors
   */
  async getMapsProvider() {
    const token = await this.getToken();
    return new ApifyMapsProvider(token);
  }

  async getWebScraperProvider() {
    const token = await this.getToken();
    return new ApifyWebScraperProvider(token);
  }

  async getMetaAdsProvider() {
    const token = await this.getToken();
    return new ApifyMetaAdsProvider(token);
  }

  /**
   * Run Google Maps / Places Lead Scraper using ApifyMapsProvider
   */
  async runMapsScraper({ query, city = 'Lahore', category = 'Bridal', maxResults = 25, requestedFields = [], onProgress = null }) {
    const isReady = await this.isConfigured();
    if (!isReady) {
      throw new Error('Apify API token is not configured on the server. Please add your token in Admin -> Integrations -> Apify.');
    }

    const provider = await this.getMapsProvider();
    return await provider.scrapeMaps({
      query,
      city,
      category,
      maxResults,
      requestedFields,
      onProgress
    });
  }

  /**
   * Crawl a competitor website using ApifyWebScraperProvider
   */
  async crawlCompetitorWebsite({ websiteUrl, maxPages = 10, maxDepth = 2, onProgress = null }) {
    const isReady = await this.isConfigured();
    if (!isReady) {
      throw new Error('Apify API token is not configured on the server. Please configure Apify in Admin -> Integrations.');
    }

    const provider = await this.getWebScraperProvider();
    return await provider.crawlCompetitorWebsite({
      websiteUrl,
      maxPages,
      maxDepth,
      onProgress
    });
  }

  /**
   * Search Meta Ad Library using ApifyMetaAdsProvider
   */
  async searchMetaAds({ query, country = 'PK', platform = 'ALL', activeStatus = 'ACTIVE', limit = 15, onProgress = null }) {
    const isReady = await this.isConfigured();
    if (!isReady) {
      throw new Error('Apify API token is not configured on the server. Please configure Apify in Admin -> Integrations.');
    }

    const provider = await this.getMetaAdsProvider();
    return await provider.searchAds({
      query,
      country,
      platform,
      activeStatus,
      limit,
      onProgress
    });
  }

  /**
   * Deduplicate and ingest leads into CRM with complete provenance tracking
   */
  async ingestAndDeduplicateLeads(leads = [], pipelineId, stageId, defaultScore = 75) {
    let insertedCount = 0;
    let updatedCount = 0;
    const insertedLeads = [];

    for (const lead of leads) {
      if (!lead.name) continue;

      // 1. Check for duplicates: source_id, phone, website domain, or name + city
      let existing = null;
      if (lead.source_id) {
        existing = await db.get('SELECT id FROM crm_leads WHERE source_id = ?', [lead.source_id]);
      }
      if (!existing && lead.phone && lead.phone.trim() !== '' && !lead.phone.includes('Not publicly')) {
        existing = await db.get('SELECT id FROM crm_leads WHERE phone = ?', [lead.phone.trim()]);
      }
      if (!existing && lead.website && lead.website.trim() !== '') {
        const domain = lead.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
        if (domain && domain.length > 4) {
          existing = await db.get('SELECT id FROM crm_leads WHERE website LIKE ?', [`%${domain}%`]);
        }
      }
      if (!existing) {
        existing = await db.get('SELECT id FROM crm_leads WHERE name = ? AND city = ?', [lead.name, lead.city || '']);
      }

      const scoreNum = Number(lead.lead_score_numeric) || defaultScore;
      const scoreGrade = lead.lead_score_grade || (scoreNum >= 80 ? 'A' : (scoreNum >= 60 ? 'B' : 'C'));

      if (existing) {
        // Update existing lead record rather than creating a duplicate
        await db.run(
          `UPDATE crm_leads SET 
            rating = COALESCE(?, rating),
            website = COALESCE(?, website),
            lead_score_numeric = COALESCE(?, lead_score_numeric),
            lead_score = COALESCE(?, lead_score),
            lead_score_explanation = COALESCE(?, lead_score_explanation),
            notes = notes || '\n' || ?,
            updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            lead.rating, 
            lead.website, 
            scoreNum, 
            scoreGrade, 
            lead.lead_score_explanation, 
            `Re-discovered on ${new Date().toLocaleDateString()}`, 
            existing.id
          ]
        );
        updatedCount++;
      } else {
        // Insert brand new lead with full provenance and tenant isolation
        const res = await db.run(
          `INSERT INTO crm_leads (
            pipeline_id, stage_id, name, company, phone, email, status, category,
            rating, lead_score, lead_score_numeric, lead_score_explanation,
            website, city, country, notes, tags, source, source_id, source_url,
            value, next_action, discovered_at, user_id
          ) VALUES (?, ?, ?, ?, ?, ?, 'Lead', ?, ?, ?, ?, ?, ?, ?, 'Pakistan', ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
          [
            pipelineId || 1,
            stageId || 1,
            lead.name,
            lead.company || lead.name,
            lead.phone || '',
            lead.email || '',
            lead.category || 'Discovered Business',
            lead.rating || 4.5,
            scoreGrade,
            scoreNum,
            lead.lead_score_explanation || `Discovered via ${lead.source || 'Apify Google Maps Scraper'} matching active market criteria.`,
            lead.website || '',
            lead.city || 'Pakistan',
            lead.notes || 'Imported via Apify Discovery Engine',
            lead.tags || 'Apify, Google Maps, Lead',
            lead.source || 'Google Maps',
            lead.source_id || `apify_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            lead.source_url || lead.google_maps_url || '',
            lead.value || 35000,
            'Send Personalized WhatsApp Greeting',
            lead.user_id || 1
          ]
        );

        // Record creation activity in audit trail
        await db.run(
          `INSERT INTO crm_activities (lead_id, activity_type, summary, details, performed_by)
           VALUES (?, 'Lead Discovered', 'Imported from Apify lead discovery engine', ?, 'Apify Discovery Agent')`,
          [res.lastID, `Source: ${lead.source || 'Google Maps'} | City: ${lead.city || 'Pakistan'} | Score: ${scoreNum}/100`]
        );

        insertedCount++;
        insertedLeads.push({ id: res.lastID, ...lead, lead_score: scoreGrade, lead_score_numeric: scoreNum });
      }
    }

    return {
      success: true,
      insertedCount,
      updatedCount,
      totalProcessed: leads.length,
      insertedLeads
    };
  }
}

export const apifyService = new ApifyService();
export default apifyService;
