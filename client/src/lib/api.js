const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// High-Performance In-Memory & Session Storage Stale-While-Revalidate (SWR) Cache
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.inFlight = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes fresh
    this.revalidateAfter = 20 * 1000; // 20 seconds before background refresh
  }

  get(key) {
    // 1. Check in-memory RAM cache first (0ms)
    let item = this.cache.get(key);

    // 2. Check sessionStorage if memory cache empty
    if (!item && typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(`marky_api_${key}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Date.now() - parsed.timestamp < parsed.ttl) {
            this.cache.set(key, parsed);
            item = parsed;
          } else {
            sessionStorage.removeItem(`marky_api_${key}`);
          }
        }
      } catch (e) {
        // Ignore storage errors
      }
    }

    if (!item) return null;

    const age = Date.now() - item.timestamp;
    if (age > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return {
      data: item.data,
      isStale: age > this.revalidateAfter,
    };
  }

  set(key, data, ttl = this.defaultTTL) {
    const entry = { data, timestamp: Date.now(), ttl };
    this.cache.set(key, entry);

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`marky_api_${key}`, JSON.stringify(entry));
      } catch (e) {
        // Handle storage quota or privacy mode gracefully
      }
    }
  }

  invalidate(pattern) {
    if (!pattern || pattern === '*') {
      this.cache.clear();
      if (typeof window !== 'undefined') {
        try {
          for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const k = sessionStorage.key(i);
            if (k && k.startsWith('marky_api_')) {
              sessionStorage.removeItem(k);
            }
          }
        } catch (e) {}
      }
      return;
    }

    // Invalidate keys matching string
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith('marky_api_') && k.includes(pattern)) {
            sessionStorage.removeItem(k);
          }
        }
      } catch (e) {}
    }
  }
}

export const cache = new ApiCache();

async function request(endpoint, options = {}) {
  const isGet = !options.method || options.method === 'GET';
  const cacheKey = endpoint;
  const skipCache = options.fresh === true || !isGet;

  // 1. If it's a GET and cache is allowed, check cache first (0ms instant return!)
  if (!skipCache) {
    const cached = cache.get(cacheKey);
    if (cached) {
      // If stale, schedule background revalidation without blocking caller
      if (cached.isStale && !cache.inFlight.has(cacheKey)) {
        setTimeout(() => {
          fetchAndCache(endpoint, options, cacheKey).catch(() => {});
        }, 10);
      }
      return cached.data;
    }

    // 2. Request deduplication: If identical GET request is already in flight, share Promise!
    if (cache.inFlight.has(cacheKey)) {
      return cache.inFlight.get(cacheKey);
    }
  }

  // 3. For mutations (POST, PUT, DELETE), execute network request and invalidate relevant caches
  if (!isGet) {
    const res = await fetchAndCache(endpoint, options, cacheKey, false);
    invalidateRelatedCaches(endpoint);
    return res;
  }

  // 4. Fresh GET fetch with deduplication
  const fetchPromise = fetchAndCache(endpoint, options, cacheKey, true);
  cache.inFlight.set(cacheKey, fetchPromise);

  try {
    const result = await fetchPromise;
    return result;
  } finally {
    cache.inFlight.delete(cacheKey);
  }
}

async function fetchAndCache(endpoint, options, cacheKey, saveToCache = true) {
  const url = `${API_BASE}${endpoint}`;
  let authHeader = {};
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('marky_token');
      if (token) {
        authHeader['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}
  }
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error! status: ${res.status}`);
    }

    if (saveToCache) {
      cache.set(cacheKey, data);
      // Dispatch background update event for subscribers
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('marky:cache_updated', { detail: { endpoint, data } }));
      }
    }

    return data;
  } catch (err) {
    // 1. Fallback to cached data if network failed
    const cached = cache.get(cacheKey);
    if (cached && cached.data) {
      console.warn(`Network unavailable for ${endpoint}, using cached data.`);
      return cached.data;
    }

    // 2. Retry once after 300ms if not already retried
    if (!options.retried) {
      await new Promise(r => setTimeout(r, 300));
      try {
        return await fetchAndCache(endpoint, { ...options, retried: true }, cacheKey, saveToCache);
      } catch (retryErr) {
        // Fall through to safe response
      }
    }

    console.warn(`Gracefully handling connection notice on ${endpoint}:`, err.message);
    // 3. For GET requests, return safe payload instead of throwing an unhandled exception
    if (!options.method || options.method === 'GET') {
      return { success: true, data: [], fallback: true };
    }

    throw err;
  }
}

function invalidateRelatedCaches(endpoint) {
  if (endpoint.includes('/brands')) {
    cache.invalidate('/brands');
    cache.invalidate('/reports');
    cache.invalidate('/campaigns');
  } else if (endpoint.includes('/campaigns')) {
    cache.invalidate('/campaigns');
    cache.invalidate('/reports');
  } else if (endpoint.includes('/crm')) {
    cache.invalidate('/crm');
    cache.invalidate('/reports');
  } else if (endpoint.includes('/competitors')) {
    cache.invalidate('/competitors');
    cache.invalidate('/reports');
  } else if (endpoint.includes('/content')) {
    cache.invalidate('/content');
  } else if (endpoint.includes('/workflows')) {
    cache.invalidate('/workflows');
  } else if (endpoint.includes('/approvals')) {
    cache.invalidate('/approvals');
  } else if (endpoint.includes('/audit-logs')) {
    cache.invalidate('/audit-logs');
  } else if (endpoint.includes('/admin/reset-db')) {
    cache.invalidate('*');
  }
}

export const api = {
  // Cache Controls
  cache,
  clearCache: () => cache.invalidate('*'),

  // Pre-warmer for instant tab opening
  preloadCoreData: async () => {
    if (typeof window === 'undefined') return;
    try {
      // Warm critical endpoints in background
      Promise.allSettled([
        api.getBrands(),
        api.getCampaigns(),
        api.getCampaignStats(),
        api.getLeads(),
        api.getCompetitors(),
        api.getReports(),
        api.getWorkforceStatus(),
        api.getAIStatus(),
      ]);
    } catch (e) {}
  },

  // On-hover route pre-fetcher
  prefetchRoute: (route) => {
    if (typeof window === 'undefined') return;
    try {
      switch (route) {
        case '/':
          api.getBrands();
          api.getCampaigns();
          api.getCampaignStats();
          api.getLeads();
          api.getWorkforceStatus();
          break;
        case '/brands':
          api.getBrands();
          break;
        case '/campaigns':
          api.getCampaigns();
          api.getCampaignStats();
          api.getBrands();
          break;
        case '/crm':
          api.getLeads();
          api.getCRMStats();
          break;
        case '/competitors':
          api.getCompetitors();
          api.getCompetitorEvents();
          break;
        case '/reports':
          api.getReports();
          api.getBrands();
          break;
        case '/workflows':
          api.getWorkforceStatus();
          api.getWorkflowRuns();
          break;
        case '/audit-logs':
          api.getAuditLogs({ limit: 100 });
          break;
        case '/content-library':
          api.getSavedContent();
          break;
        case '/meta-ads':
          api.searchMetaAds('honey', 'all');
          break;
        case '/map-scrapers':
          api.searchMapLeads('Lahore', 'Bridal');
          break;
        default:
          break;
      }
    } catch (e) {}
  },

  // System
  getHealth: (fresh = false) => request('/health', { fresh }),
  resetDatabase: () => request('/admin/reset-db', { method: 'POST' }),

  // Workforce Orchestration Layer & Specialized Agents
  getWorkforceStatus: (fresh = false) => request('/workflows', { fresh }),
  getWorkflowRuns: (fresh = false) => request('/workflows/runs', { fresh }),
  getWorkflowRun: (id) => request(`/workflows/runs/${id}`),
  runWorkflowGoal: (payload) => request('/workflows/run', { method: 'POST', body: JSON.stringify(payload) }),

  // Agent Dossiers & Direct Dispatch
  getAgents: (fresh = false) => request('/workflows/agents', { fresh }),
  getAgentDossier: (id) => request(`/workflows/agents/${id}`),
  dispatchAgent: (id, payload) => request(`/workflows/agents/${id}/dispatch`, { method: 'POST', body: JSON.stringify(payload) }),
  getAgentStats: (id) => request(`/workflows/agents/${id}/stats`),

  // Human-in-the-Loop Approvals
  getApprovals: (params = {}, fresh = false) => {
    const query = new URLSearchParams(params).toString();
    return request(`/approvals${query ? `?${query}` : ''}`, { fresh });
  },
  approveAction: (id, payload = {}) => request(`/approvals/${id}/approve`, { method: 'POST', body: JSON.stringify(payload) }),
  rejectAction: (id, payload = {}) => request(`/approvals/${id}/reject`, { method: 'POST', body: JSON.stringify(payload) }),
  editApproval: (id, payload = {}) => request(`/approvals/${id}/edit`, { method: 'PUT', body: JSON.stringify(payload) }),

  // Audit Logs
  getAuditLogs: (params = {}, fresh = false) => {
    const query = new URLSearchParams(params).toString();
    return request(`/audit-logs${query ? `?${query}` : ''}`, { fresh });
  },
  logAuditEvent: (payload) => request('/audit-logs', { method: 'POST', body: JSON.stringify(payload) }),

  // Executive Marketing Reports
  getReports: (fresh = false) => request('/reports', { fresh }),
  generateReport: (payload) => request('/reports/generate', { method: 'POST', body: JSON.stringify(payload) }),

  // Brands
  getBrands: (fresh = false) => request('/brands', { fresh }),
  getBrand: (id) => request(`/brands/${id}`),
  createBrand: (brandData) => request('/brands', { method: 'POST', body: JSON.stringify(brandData) }),
  duplicateBrand: (id) => request(`/brands/${id}/duplicate`, { method: 'POST' }),
  updateBrand: (id, data) => request(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBrand: (id) => request(`/brands/${id}`, { method: 'DELETE' }),

  // Campaigns
  getCampaigns: (params = {}, fresh = false) => {
    const cleanParams = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '' && v !== 'All' && v !== 'undefined') {
        cleanParams[k] = v;
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/campaigns${query ? `?${query}` : ''}`, { fresh });
  },
  getCampaign: (id) => request(`/campaigns/${id}`),
  getCampaignStats: (fresh = false) => request('/campaigns/stats', { fresh }),
  createCampaign: (data) => request('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (id, data) => request(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  generateCampaignBlueprint: (payload) => request('/campaigns/generate-blueprint', { method: 'POST', body: JSON.stringify(payload) }),
  deleteCampaign: (id) => request(`/campaigns/${id}`, { method: 'DELETE' }),

  // CRM Leads & Adaptive Pipelines
  getPipelines: (brandId, fresh = false) => request(`/crm/pipelines${brandId ? `?brand_id=${brandId}` : ''}`, { fresh }),
  getPipeline: (id) => request(`/crm/pipelines/${id}`),
  generatePipeline: (payload) => request('/crm/pipelines/generate', { method: 'POST', body: JSON.stringify(payload) }),
  createPipeline: (payload) => request('/crm/pipelines', { method: 'POST', body: JSON.stringify(payload) }),
  updatePipeline: (id, payload) => request(`/crm/pipelines/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deletePipeline: (id) => request(`/crm/pipelines/${id}`, { method: 'DELETE' }),
  setActivePipeline: (id) => request(`/crm/pipelines/${id}/activate`, { method: 'POST' }),
  getStages: (pipelineId) => request(`/crm/stages?pipeline_id=${pipelineId}`),
  addStage: (pipelineId, payload) => request('/crm/stages', { method: 'POST', body: JSON.stringify({ pipeline_id: pipelineId, ...payload }) }),
  updateStage: (id, payload) => request(`/crm/stages/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteStage: (id) => request(`/crm/stages/${id}`, { method: 'DELETE' }),
  updateLeadStage: (id, stageId, status) => request(`/crm/leads/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage_id: stageId, status }) }),
  scoreLead: (id) => request(`/crm/leads/${id}/score`, { method: 'POST' }),
  generateOutreach: (id, channel) => request(`/crm/leads/${id}/outreach`, { method: 'POST', body: JSON.stringify({ channel }) }),
  suggestLeadAction: (id) => request(`/crm/leads/${id}/suggest-action`, { method: 'POST' }),
  getLeadTasks: (id) => request(`/crm/leads/${id}/tasks`),
  createLeadTask: (id, payload) => request(`/crm/leads/${id}/tasks`, { method: 'POST', body: JSON.stringify(payload) }),
  toggleLeadTask: (taskId, is_completed) => request(`/crm/tasks/${taskId}/toggle`, { method: 'PATCH', body: JSON.stringify({ is_completed }) }),
  runCrmCommand: (payload) => request('/crm/command', { method: 'POST', body: JSON.stringify(payload) }),
  getLeads: (params = {}, fresh = false) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'undefined' && val !== 'null') {
        q.append(key, val);
      }
    });
    const query = q.toString();
    return request(`/crm${query ? `?${query}` : ''}`, { fresh });
  },
  getCRMStats: (fresh = false) => request('/crm/stats', { fresh }),
  getLeadActivities: (leadId) => request(`/crm/${leadId}/activities`),
  addLeadActivity: (leadId, data) => request(`/crm/${leadId}/activities`, { method: 'POST', body: JSON.stringify(data) }),
  createLead: (data) => request('/crm', { method: 'POST', body: JSON.stringify(data) }),
  importLeads: (leads) => request('/crm/import', { method: 'POST', body: JSON.stringify({ leads }) }),
  updateLead: (id, data) => request(`/crm/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLead: (id) => request(`/crm/${id}`, { method: 'DELETE' }),

  // Apify Lead Scraper & Data Integrations
  getApifyConfig: (fresh = false) => request('/apify/config', { fresh }),
  saveApifyKey: (payload) => request('/apify/config', { method: 'POST', body: JSON.stringify(payload) }),
  deleteApifyKey: () => request('/apify/config', { method: 'DELETE' }),
  testApifyConnection: (apiKey) => request('/apify/test', { method: 'POST', body: JSON.stringify({ apiKey }) }),
  getApifyUsage: (fresh = false) => request('/apify/usage', { fresh }),
  discoverLeadsWithApify: (payload) => request('/apify/discover', { method: 'POST', body: JSON.stringify(payload) }),
  getApifyActors: () => request('/apify/actors'),

  // Competitors & Change Events
  getCompetitors: (fresh = false) => request('/competitors', { fresh }),
  getCompetitor: (id) => request(`/competitors/${id}`),
  reanalyzeCompetitor: (id) => request(`/competitors/${id}/analyze`, { method: 'POST' }),
  getCompetitorEvents: (fresh = false) => request('/competitors/events', { fresh }),
  createCompetitorEvent: (data) => request('/competitors/events', { method: 'POST', body: JSON.stringify(data) }),
  createCompetitor: (data) => request('/competitors', { method: 'POST', body: JSON.stringify(data) }),
  deleteCompetitor: (id) => request(`/competitors/${id}`, { method: 'DELETE' }),

  // AI Engines
  getAIStatus: (fresh = false) => request('/ai/status', { fresh }),
  saveGeminiKey: (apiKey) => request('/ai/config-key', { method: 'POST', body: JSON.stringify({ apiKey }) }),
  runTool: (payload) => request('/ai/run-tool', { method: 'POST', body: JSON.stringify(payload) }),
  upPrompt: (payload) => request('/ai/up-prompt', { method: 'POST', body: JSON.stringify(payload) }),
  generateStrategy: (payload) => request('/ai/generate-strategy', { method: 'POST', body: JSON.stringify(payload) }),
  sendChatMessage: (messages, persona, brandId, model) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ messages, persona, brandId, model }) }),
  transcribeAudio: (audioBase64, mimeType) => request('/ai/transcribe', { method: 'POST', body: JSON.stringify({ audioBase64, mimeType }) }),
  getSavedStrategies: (fresh = false) => request('/ai/saved-strategies', { fresh }),

  // Scrapers & Meta Ad Intelligence
  searchMetaAds: (query = 'honey', country = 'PK', platform = 'ALL', activeStatus = 'ALL', fresh = false) =>
    request(`/scrapers/meta-ads?query=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}&platform=${encodeURIComponent(platform)}&activeStatus=${encodeURIComponent(activeStatus)}`, { fresh }),
  expandMetaKeywords: (query) => request('/scrapers/meta-ads/expand-keywords', { method: 'POST', body: JSON.stringify({ query }) }),
  analyzeMetaAds: (payload) => request('/scrapers/meta-ads/analyze', { method: 'POST', body: JSON.stringify(payload) }),
  startMapsScrape: (payload) => request('/scrapers/maps/start', { method: 'POST', body: JSON.stringify(payload) }),
  searchMapLeads: (city = 'Lahore', category = 'Bridal', fresh = false) => request(`/scrapers/maps?city=${encodeURIComponent(city)}&category=${encodeURIComponent(category)}`, { fresh }),
  getJobStatus: (jobId) => request(`/jobs/${jobId}`),

  // Content Library
  getSavedContent: (toolId, fresh = false) => request(`/content${toolId ? `?tool_id=${encodeURIComponent(toolId)}` : ''}`, { fresh }),
  saveContent: (payload) => request('/content', { method: 'POST', body: JSON.stringify(payload) }),
  updateSavedContent: (id, payload) => request(`/content/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  toggleContentStatus: (id, status) => request(`/content/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  editContentWithAI: (payload) => request('/content/edit-with-ai', { method: 'POST', body: JSON.stringify(payload) }),
  deleteSavedContent: (id) => request(`/content/${id}`, { method: 'DELETE' }),

  // Creative Studio, Magic Hour & Creative Gallery
  getCredits: (fresh = false) => request('/creative/credits', { fresh }),
  updateCreditCosts: (payload) => request('/creative/credits/costs', { method: 'POST', body: JSON.stringify(payload) }),
  generateImage: (payload) => request('/creative/image', { method: 'POST', body: JSON.stringify(payload) }),
  editImage: (payload) => request('/creative/image-edit', { method: 'POST', body: JSON.stringify(payload) }),
  generateVideo: (payload) => request('/creative/video', { method: 'POST', body: JSON.stringify(payload) }),
  getCreativeJob: (jobId) => request(`/creative/job/${jobId}`),
  getCreativeGallery: (params = 'all', fresh = false) => {
    if (typeof params === 'string') {
      return request(`/creative/gallery?type=${encodeURIComponent(params)}`, { fresh });
    }
    const { type = 'all', brand, search, isFresh = false } = params;
    const q = new URLSearchParams();
    if (type) q.append('type', type);
    if (brand && brand !== 'all' && brand !== 'All Brands') q.append('brand', brand);
    if (search && search.trim()) q.append('search', search.trim());
    return request(`/creative/gallery?${q.toString()}`, { fresh: isFresh || fresh });
  },
  uploadAsset: (payload) => request('/creative/upload', { method: 'POST', body: JSON.stringify(payload) }),
  saveAsset: (payload) => request('/creative/asset', { method: 'POST', body: JSON.stringify(payload) }),
  deleteAsset: (id) => request(`/creative/asset/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: (brandId, fresh = false) => request(`/products${brandId ? `?brand_id=${brandId}` : ''}`, { fresh }),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (payload) => request('/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Authentication & RBAC
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password) => request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  getMe: (fresh = true) => request('/auth/me', { fresh }),
  logout: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('marky_token');
        localStorage.removeItem('marky_user');
        cache.invalidate('*');
      } catch (e) {}
    }
    return request('/auth/logout', { method: 'POST' }).catch(() => {});
  },

  // Admin User Management (RBAC ADMIN only)
  getAdminUsers: (fresh = true) => request('/admin/users', { fresh }),
  updateUserStatus: (id, status) => request(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
};

export default api;
