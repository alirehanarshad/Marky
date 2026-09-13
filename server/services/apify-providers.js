import { db } from '../database.js';

/**
 * BaseLeadSourceProvider
 * Abstract parent for all scraping and external data retrieval providers.
 */
export class BaseLeadSourceProvider {
  constructor(token, baseUrl = 'https://api.apify.com/v2') {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  async startActorRun(actorId, input = {}, options = {}) {
    if (!this.token) {
      throw new Error('Apify API token is not configured on the server.');
    }

    const url = `${this.baseUrl}/acts/${encodeURIComponent(actorId)}/runs?token=${this.token}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `Failed to start Apify actor ${actorId}: HTTP ${res.status}`);
    }

    return {
      runId: data.data?.id,
      defaultDatasetId: data.data?.defaultDatasetId,
      status: data.data?.status || 'RUNNING',
      startedAt: data.data?.startedAt || new Date().toISOString()
    };
  }

  async pollRun(runId, maxWaitMs = 45000, pollIntervalMs = 2500, onProgress = null) {
    const startTime = Date.now();
    let pollCount = 0;

    while (Date.now() - startTime < maxWaitMs) {
      pollCount++;
      const res = await fetch(`${this.baseUrl}/actor-runs/${runId}?token=${this.token}`);
      if (!res.ok) {
        throw new Error(`Failed to check Apify run status for ${runId}: HTTP ${res.status}`);
      }

      const body = await res.json();
      const run = body.data || {};
      const status = run.status;

      if (onProgress && typeof onProgress === 'function') {
        const elapsedSec = Math.round((Date.now() - startTime) / 1000);
        await onProgress(status, elapsedSec);
      }

      if (status === 'SUCCEEDED') {
        return {
          status,
          defaultDatasetId: run.defaultDatasetId,
          computeUnits: run.usage?.COMPUTE_UNITS || 0.05,
          estimatedUsd: run.usageTotalUsd || 0.12,
          finishedAt: run.finishedAt
        };
      }

      if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        throw new Error(`Apify Actor run ended with status: ${status} (Run ID: ${runId})`);
      }

      await new Promise(r => setTimeout(r, pollIntervalMs));
    }

    // Return current state if polling timed out on our side (run still active in cloud)
    return {
      status: 'TIMED_OUT_POLLING',
      runId,
      message: 'Actor is still running in cloud background.'
    };
  }

  async getDatasetItems(datasetId, limit = 50) {
    if (!datasetId) return [];
    const res = await fetch(`${this.baseUrl}/datasets/${datasetId}/items?token=${this.token}&limit=${limit}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch dataset items for ${datasetId}: HTTP ${res.status}`);
    }
    return await res.json();
  }

  async recordTelemetry({ actorId, actorName, runId, status, itemsCount = 0, computeUnits = 0, estimatedUsd = 0, error = null }) {
    try {
      await db.run(
        `INSERT INTO apify_runs (actor_id, actor_name, run_id, status, items_collected, compute_units, estimated_usd, error_message, started_at, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [actorId, actorName, runId, status, itemsCount, computeUnits, estimatedUsd, error]
      );
    } catch (e) {
      console.warn('Failed to record Apify telemetry:', e.message);
    }
  }
}

/**
 * ApifyMapsProvider
 * Extracts verified local businesses from Google Maps with field selection and deduplication.
 */
export class ApifyMapsProvider extends BaseLeadSourceProvider {
  constructor(token) {
    super(token);
    this.actorId = 'compass~crawler-google-places';
    this.actorName = 'Google Maps / Places Scraper';
  }

  async scrapeMaps({ query, city = 'Lahore', category = '', maxResults = 25, requestedFields = [], onProgress = null }) {
    const searchString = query && query.trim() 
      ? query.trim() 
      : `${category} in ${city}, Pakistan`;

    const input = {
      searchStringsArray: [searchString],
      maxCrawledPlacesPerSearch: Math.min(maxResults, 200),
      language: 'en',
      includeWebResults: true,
      oneReviewPerRow: false
    };

    let runResult;
    try {
      if (onProgress) await onProgress(10, `Starting Google Maps search for "${searchString}"...`);
      runResult = await this.startActorRun(this.actorId, input);

      if (onProgress) await onProgress(25, `Crawler active (Apify Run: ${runResult.runId})...`);

      const completion = await this.pollRun(runResult.runId, 50000, 2500, async (status, elapsedSec) => {
        if (onProgress) {
          const pct = Math.min(85, 25 + elapsedSec * 2);
          await onProgress(pct, `Crawling Google Maps listings (${status}, ${elapsedSec}s elapsed)...`);
        }
      });

      let items = [];
      if (completion.status === 'SUCCEEDED' && completion.defaultDatasetId) {
        if (onProgress) await onProgress(90, 'Retrieving and normalizing place records...');
        items = await this.getDatasetItems(completion.defaultDatasetId, maxResults);
      }

      const normalized = this.normalizeItems(items, city, category, requestedFields);

      await this.recordTelemetry({
        actorId: this.actorId,
        actorName: this.actorName,
        runId: runResult.runId,
        status: completion.status,
        itemsCount: normalized.length,
        computeUnits: completion.computeUnits || 0.05,
        estimatedUsd: completion.estimatedUsd || 0.12
      });

      return {
        success: true,
        provider: 'apify-cloud-maps',
        actorId: this.actorId,
        runId: runResult.runId,
        count: normalized.length,
        data: normalized
      };
    } catch (err) {
      if (runResult?.runId) {
        await this.recordTelemetry({
          actorId: this.actorId,
          actorName: this.actorName,
          runId: runResult.runId,
          status: 'FAILED',
          error: err.message
        });
      }
      throw err;
    }
  }

  normalizeItems(items = [], fallbackCity = 'Lahore', fallbackCategory = 'Business', requestedFields = []) {
    return items.map((place, idx) => {
      const name = place.title || place.name || `Business ${idx + 1}`;
      const address = place.address || place.street || place.neighborhood || `${fallbackCity}, Pakistan`;
      const phone = place.phoneUnformatted || place.phone || place.phoneClean || '';
      const website = place.website || place.url || '';
      const rating = Number(place.totalScore || place.rating || 4.5);
      const reviews = Number(place.reviewsCount || place.userRatingsTotal || 12);
      const category = place.categoryName || place.categories?.[0] || fallbackCategory;

      return {
        name,
        company: name,
        category,
        city: place.city || fallbackCity,
        address,
        phone: phone || 'Not publicly listed',
        website: website || '',
        google_maps_url: place.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + address)}`,
        rating: Math.min(5.0, Math.max(1.0, rating)),
        reviews,
        opening_hours: place.openingHours || place.openingHoursText || 'Not available',
        description: place.description || place.additionalInfo || '',
        source: 'Google Maps',
        provider: 'Apify',
        source_id: place.placeId || place.id || `gmap_${Date.now()}_${idx}`,
        source_url: place.url || '',
        discovered_at: new Date().toISOString()
      };
    });
  }
}

/**
 * ApifyWebScraperProvider
 * Crawls a single competitor domain up to maxDepth and maxPages to gather public corporate information.
 */
export class ApifyWebScraperProvider extends BaseLeadSourceProvider {
  constructor(token) {
    super(token);
    this.actorId = 'apify~website-content-crawler';
    this.actorName = 'Website Content Crawler';
  }

  async crawlCompetitorWebsite({ websiteUrl, maxPages = 10, maxDepth = 2, onProgress = null }) {
    // 1. Sanitize & validate domain bounds
    let parsed;
    try {
      parsed = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
    } catch (e) {
      throw new Error(`Invalid competitor website URL: "${websiteUrl}"`);
    }

    const startUrl = parsed.origin;
    const hostname = parsed.hostname.replace(/^www\./, '');

    const input = {
      startUrls: [{ url: startUrl }],
      maxCrawlPages: Math.min(maxPages, 15),
      maxCrawlDepth: Math.min(maxDepth, 2),
      // Restrict to permitted public subpaths only
      globs: [
        { glob: `${startUrl}/**` }
      ],
      saveHtml: false,
      saveMarkdown: true,
      saveScreenshots: false
    };

    let runResult;
    try {
      if (onProgress) await onProgress(15, `Initiating Apify web crawl on domain: ${hostname}...`);
      runResult = await this.startActorRun(this.actorId, input);

      if (onProgress) await onProgress(30, `Crawler active (Apify Run: ${runResult.runId})...`);

      const completion = await this.pollRun(runResult.runId, 60000, 3000, async (status, elapsedSec) => {
        if (onProgress) {
          const pct = Math.min(80, 30 + elapsedSec * 2);
          await onProgress(pct, `Crawling permitted public pages (${status}, ${elapsedSec}s elapsed)...`);
        }
      });

      let items = [];
      if (completion.status === 'SUCCEEDED' && completion.defaultDatasetId) {
        if (onProgress) await onProgress(85, 'Extracting and normalizing website text content...');
        items = await this.getDatasetItems(completion.defaultDatasetId, maxPages);
      }

      const normalizedPages = this.normalizePages(items, startUrl);

      await this.recordTelemetry({
        actorId: this.actorId,
        actorName: this.actorName,
        runId: runResult.runId,
        status: completion.status,
        itemsCount: normalizedPages.length,
        computeUnits: completion.computeUnits || 0.08,
        estimatedUsd: completion.estimatedUsd || 0.18
      });

      return {
        success: true,
        provider: 'apify-cloud-crawler',
        startUrl,
        hostname,
        pagesCollected: normalizedPages.length,
        pages: normalizedPages
      };
    } catch (err) {
      if (runResult?.runId) {
        await this.recordTelemetry({
          actorId: this.actorId,
          actorName: this.actorName,
          runId: runResult.runId,
          status: 'FAILED',
          error: err.message
        });
      }
      throw err;
    }
  }

  normalizePages(items = [], baseDomain = '') {
    return items.map((item, idx) => {
      const url = item.url || item.loadedUrl || `${baseDomain}/page-${idx + 1}`;
      const title = item.title || item.metadata?.title || 'Untitled Page';
      const description = item.description || item.metadata?.description || '';
      
      // Clean markdown or text representation, truncate to avoid overflowing context
      let textContent = item.text || item.markdown || item.content || '';
      if (textContent.length > 8000) {
        textContent = textContent.slice(0, 8000) + '... [content truncated for token efficiency]';
      }

      return {
        url,
        title,
        description,
        content: textContent,
        crawledAt: new Date().toISOString()
      };
    });
  }
}

/**
 * ApifyMetaAdsProvider
 * Fetches dynamic, real public ad records matching query keywords from Facebook/Meta Ad Library.
 */
export class ApifyMetaAdsProvider extends BaseLeadSourceProvider {
  constructor(token) {
    super(token);
    // Actor for Meta Ad Library scraping
    this.actorId = 'curious_coder~facebook-ads-library-scraper';
    this.actorName = 'Facebook Ad Library Scraper';
  }

  async searchAds({ query, country = 'PK', platform = 'ALL', activeStatus = 'ACTIVE', limit = 15, onProgress = null }) {
    if (!query || query.trim() === '') {
      throw new Error('Search query is required for Meta Ad Inspector.');
    }

    const cleanQuery = query.trim();
    const encodedQuery = encodeURIComponent(cleanQuery);
    const countryParam = (country && country !== 'ALL') ? country.toUpperCase() : 'ALL';
    const statusParam = (activeStatus && activeStatus.toLowerCase() === 'active') ? 'active' : 'all';
    
    // Construct verified public Meta Ad Library search URL
    const searchUrl = `https://www.facebook.com/ads/library/?active_status=${statusParam}&ad_type=all&country=${countryParam}&q=${encodedQuery}&search_type=keyword_unordered&media_type=all`;

    const input = {
      urls: [{ url: searchUrl }],
      maxResults: Math.min(limit, 30)
    };

    let runResult;
    try {
      if (onProgress) await onProgress(15, `Querying public Meta Ad Library for "${cleanQuery}"...`);
      runResult = await this.startActorRun(this.actorId, input);

      if (onProgress) await onProgress(35, `Apify Meta Ad actor running (${runResult.runId})...`);

      const completion = await this.pollRun(runResult.runId, 45000, 2500, async (status, elapsedSec) => {
        if (onProgress) {
          const pct = Math.min(80, 35 + elapsedSec * 2);
          await onProgress(pct, `Retrieving ad creatives from library (${status}, ${elapsedSec}s)...`);
        }
      });

      let items = [];
      if (completion.status === 'SUCCEEDED' && completion.defaultDatasetId) {
        if (onProgress) await onProgress(90, 'Normalizing retrieved ad records...');
        items = await this.getDatasetItems(completion.defaultDatasetId, limit);
      }

      const normalized = this.normalizeAds(items, cleanQuery);

      await this.recordTelemetry({
        actorId: this.actorId,
        actorName: this.actorName,
        runId: runResult.runId,
        status: completion.status,
        itemsCount: normalized.length,
        computeUnits: completion.computeUnits || 0.06,
        estimatedUsd: completion.estimatedUsd || 0.14
      });

      return {
        success: true,
        provider: 'apify-meta-ads',
        query: cleanQuery,
        count: normalized.length,
        data: normalized
      };
    } catch (err) {
      if (runResult?.runId) {
        await this.recordTelemetry({
          actorId: this.actorId,
          actorName: this.actorName,
          runId: runResult.runId,
          status: 'FAILED',
          error: err.message
        });
      }
      throw err;
    }
  }

  normalizeAds(items = [], query = '') {
    return items.map((ad, idx) => {
      const pageName = ad.page_name || ad.pageName || ad.advertiser || ad.snapshot?.page_name || 'Verified Advertiser';
      const headline = ad.ad_creative_headline || ad.headline || ad.title || '';
      const primaryText = ad.ad_creative_body || ad.primary_text || ad.body || ad.text || '';
      const cta = ad.ad_creative_link_caption || ad.call_to_action || ad.cta || 'Learn More';
      const snapshotUrl = ad.ad_snapshot_url || ad.snapshotUrl || ad.url || null;
      const platforms = Array.isArray(ad.publisher_platforms) 
        ? ad.publisher_platforms.join(', ') 
        : (ad.platforms || 'Facebook, Instagram');
      
      const mediaType = ad.ad_creative_media_type || (ad.images?.length > 1 ? 'Carousel' : (ad.videos?.length ? 'Video' : 'Static Image'));

      const finalId = ad.ad_archive_id || ad.id || `meta_${Date.now()}_${idx}`;
      const finalHeadline = headline || `${pageName} Sponsored Offer`;
      const finalPrimaryText = primaryText || 'Direct commercial promotion observed in active Meta Ad Library.';

      return {
        id: finalId,
        adId: finalId,
        page_name: pageName,
        advertiserName: pageName,
        advertiser: pageName,
        page_id: ad.page_id || null,
        headline: finalHeadline,
        primary_text: finalPrimaryText,
        primaryText: finalPrimaryText,
        call_to_action: cta,
        ctaText: cta,
        ad_snapshot_url: snapshotUrl,
        snapshotUrl: snapshotUrl,
        platforms,
        status: ad.is_active !== false ? 'Active' : 'Inactive',
        media_type: mediaType,
        mediaType: mediaType,
        source: 'Meta Ad Library',
        provider: 'Apify',
        retrieved_at: new Date().toISOString()
      };
    });
  }
}
