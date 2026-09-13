import { Router } from 'express';
import { db } from '../database.js';
import { aiService } from '../services/ai.service.js';

const router = Router();

// GET all campaigns with optional filters (tenant & brand isolated)
router.get('/', async (req, res) => {
  try {
    const { brand_id, status, approval_status } = req.query;
    let query = `
      SELECT c.*, b.name as brand_name, b.category as brand_category
      FROM campaigns c
      LEFT JOIN brands b ON c.brand_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (brand_id && brand_id !== 'undefined' && brand_id !== 'All') {
      query += ` AND c.brand_id = ?`;
      params.push(brand_id);
    }
    if (status && status !== 'undefined' && status !== 'All') {
      query += ` AND c.status = ?`;
      params.push(status);
    }
    if (approval_status && approval_status !== 'undefined' && approval_status !== 'All') {
      query += ` AND c.approval_status = ?`;
      params.push(approval_status);
    }
    if (req.user && req.user.role !== 'ADMIN') {
      query += ` AND (c.user_id = ? OR b.user_id = ?)`;
      params.push(req.user.id, req.user.id);
    }

    query += ` ORDER BY c.created_at DESC`;
    const campaigns = await db.all(query, params);
    res.json({ success: true, data: campaigns });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET campaign stats for dashboard (honest real metrics, brand & tenant scoped)
router.get('/stats', async (req, res) => {
  try {
    const { brand_id } = req.query;
    let whereClause = ' WHERE 1=1 ';
    const params = [];

    if (brand_id && brand_id !== 'undefined' && brand_id !== 'All') {
      whereClause += ' AND c.brand_id = ? ';
      params.push(brand_id);
    }
    if (req.user && req.user.role !== 'ADMIN') {
      whereClause += ' AND (c.user_id = ? OR b.user_id = ?) ';
      params.push(req.user.id, req.user.id);
    }

    const totals = await db.get(`
      SELECT 
        COUNT(c.id) as total_campaigns,
        COALESCE(SUM(CASE WHEN c.status = 'Active' THEN 1 ELSE 0 END), 0) as active_campaigns,
        COALESCE(SUM(CASE WHEN c.status = 'Draft' THEN 1 ELSE 0 END), 0) as draft_campaigns,
        COALESCE(SUM(CASE WHEN c.status = 'Paused' THEN 1 ELSE 0 END), 0) as paused_campaigns,
        COALESCE(SUM(CASE WHEN c.status = 'Completed' THEN 1 ELSE 0 END), 0) as completed_campaigns,
        COALESCE(SUM(c.budget), 0) as total_budget,
        COALESCE(SUM(CASE WHEN c.status = 'Active' THEN c.budget ELSE 0 END), 0) as active_budget,
        COALESCE(SUM(CASE WHEN c.approval_status = 'Pending Approval' THEN 1 ELSE 0 END), 0) as pending_approvals_count
      FROM campaigns c
      LEFT JOIN brands b ON c.brand_id = b.id
      ${whereClause}
    `, params);

    // Budget distribution by platform
    const allCampaigns = await db.all(`
      SELECT c.platforms, c.budget 
      FROM campaigns c
      LEFT JOIN brands b ON c.brand_id = b.id
      ${whereClause} AND c.status = 'Active'
    `, params);

    const platformBreakdown = {};
    for (const c of allCampaigns) {
      const plats = (c.platforms || 'Other').split(',').map(p => p.trim());
      const share = c.budget / (plats.length || 1);
      for (const p of plats) {
        platformBreakdown[p] = (platformBreakdown[p] || 0) + share;
      }
    }

    res.json({
      success: true,
      data: {
        total_campaigns: totals?.total_campaigns || 0,
        active_campaigns: totals?.active_campaigns || 0,
        draft_campaigns: totals?.draft_campaigns || 0,
        paused_campaigns: totals?.paused_campaigns || 0,
        completed_campaigns: totals?.completed_campaigns || 0,
        total_budget: totals?.total_budget || 0,
        active_budget: totals?.active_budget || 0,
        pending_approvals_count: totals?.pending_approvals_count || 0,
        platformBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const campaign = await db.get(
      `SELECT c.*, b.name as brand_name, b.category as brand_category, b.website as brand_website, b.brand_voice, b.tone, b.usps, b.target_audience as brand_target_audience,
              b.user_id as brand_user_id
       FROM campaigns c
       LEFT JOIN brands b ON c.brand_id = b.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    if (req.user && req.user.role !== 'ADMIN' && campaign.user_id && campaign.user_id !== req.user.id && campaign.brand_user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not own this campaign.' });
    }

    res.json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/campaigns/generate-blueprint (Generate AI Multi-Platform Ad Deployment Kit)
router.post('/generate-blueprint', async (req, res) => {
  try {
    const {
      campaignId,
      brandId,
      name,
      objective = 'Sales / Direct Conversions',
      budget = 200000,
      currency = 'PKR',
      platforms = 'Meta, TikTok, Google',
      targetAudience = '',
      targetGeography = 'Lahore, Karachi, Islamabad',
      notes = ''
    } = req.body;

    // Fetch brand context
    const brand = await aiService.getBrandContext(brandId);
    const brandName = brand ? brand.name : 'E-Commerce Brand';
    const brandVoice = brand ? brand.brand_voice : 'Persuasive, Premium, Trustworthy';
    const brandUsps = brand ? brand.usps : 'Fast COD delivery, money-back guarantee';
    const brandCategory = brand ? brand.category : 'Retail & E-Commerce';

    const systemPrompt = `You are Marky, a Chief Performance Marketing Officer specializing in multi-channel paid acquisition (Meta Advantage+, TikTok Spark Ads, Google Search/PMax) and Pakistani/South Asian e-commerce unit economics.

Generate a comprehensive, production-ready, multi-platform ad deployment blueprint formatted strictly as valid JSON. Every headline, primary text, search keyword, and TikTok script must be 100% complete and ready to copy-paste directly into Meta Ads Manager, TikTok Ads Manager, and Google Ads Editor.`;

    const prompt = `Generate a complete multi-platform ad campaign deployment kit for:
- Campaign Name: ${name}
- Brand: ${brandName} (${brandCategory})
- Objective: ${objective}
- Total Allocated Budget: ${currency} ${budget}
- Platforms: ${platforms}
- Target Geography: ${targetGeography}
- Target Audience: ${targetAudience || (brand ? brand.target_audience : 'Urban online shoppers')}
- Brand Voice & USPs: ${brandVoice} | ${brandUsps}
- Additional Context/Notes: ${notes || 'Focus on high CTR, high converting copy, urgency, and Cash-on-Delivery nationwide trust.'}

Return a valid JSON object matching this exact structure:
{
  "metaAds": {
    "campaignName": string,
    "objective": string,
    "buyingType": "Auction",
    "adSet": {
      "audience": {
        "locations": [string],
        "age": string,
        "gender": string,
        "detailedInterests": [string],
        "exclusions": [string]
      },
      "placements": string,
      "optimization": string
    },
    "creatives": [
      {
        "id": string,
        "name": string,
        "angle": string,
        "primaryText": string,
        "headlines": [string],
        "descriptions": [string],
        "callToAction": string,
        "recommendedFormat": string
      }
    ],
    "utmTracking": {
      "baseUrl": string,
      "utmSource": "facebook",
      "utmMedium": "paid_social",
      "utmCampaign": string,
      "fullUrl": string
    }
  },
  "tiktokAds": {
    "campaignName": string,
    "objective": string,
    "targetAudience": {
      "locations": [string],
      "interests": [string],
      "age": string
    },
    "hooksAndScripts": [
      {
        "hookTitle": string,
        "first3Seconds": string,
        "visualDirection": string,
        "voiceoverScript": string,
        "callToAction": string,
        "hashtags": [string]
      }
    ],
    "displayName": string,
    "adText": string
  },
  "googleAds": {
    "campaignType": string,
    "biddingStrategy": string,
    "keywords": {
      "highIntentExact": [string],
      "phraseMatch": [string],
      "negativeKeywords": [string]
    },
    "rsaAssets": {
      "headlines": [string],
      "descriptions": [string]
    },
    "extensions": {
      "sitelinks": [{ "title": string, "desc": string }],
      "callouts": [string]
    }
  },
  "seoAndTags": {
    "landingPageUrl": string,
    "metaTitle": string,
    "metaDescription": string,
    "focusKeywords": [string],
    "openGraph": {
      "ogTitle": string,
      "ogDescription": string
    }
  },
  "budgetAndEconomics": {
    "totalBudget": number,
    "currency": string,
    "durationDays": number,
    "dailyBudget": number,
    "platformSplit": [
      { "platform": string, "percentage": number, "amount": number, "daily": number, "role": string }
    ],
    "unitEconomics": {
      "estimatedClicks": number,
      "estimatedAvgCpc": string,
      "projectedConversionRate": string,
      "projectedOrders": number,
      "targetCpa": string,
      "avgOrderValue": string,
      "projectedGrossRevenue": string,
      "projectedRoas": string,
      "breakEvenRoas": string
    }
  }
}`;

    const fallbackFn = () => ({
      metaAds: {
        campaignName: `${name} — Meta Advantage+ Sales Blitz`,
        objective: 'Sales / Conversions (Purchase Event)',
        buyingType: 'Auction',
        adSet: {
          audience: {
            locations: ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi'],
            age: '22 - 55',
            gender: 'All',
            detailedInterests: [`${brandCategory}`, 'Online Shopping', 'Engaged Shoppers'],
            exclusions: ['Drop-shippers', 'Job seekers']
          },
          placements: 'Advantage+ Placements (Facebook Feed, Instagram Reels, Stories)',
          optimization: 'Purchases'
        },
        creatives: [
          {
            id: 'meta_c1',
            name: 'Variation 1: High Hook & Trust Angle',
            angle: 'Purity & Verified Quality Guarantee with Cash on Delivery',
            primaryText: `Upgrade your daily standard with ${brandName}. ✨\n\nTested and verified for premium quality with fast 48-hour delivery across Pakistan.\n\n• 100% Genuine Quality Guarantee\n• Free Doorstep Delivery with Cash-on-Delivery\n• Over 10,000+ Happy Customers\n\nTap below to claim your special campaign offer today!`,
            headlines: [
              `Official ${brandName} Online`,
              'Pay Cash on Delivery (COD)',
              '100% Premium Quality Guaranteed',
              'Fast 48h Nationwide Shipping',
              'Special Campaign Offer Inside'
            ],
            descriptions: [
              'Delivered to your doorstep in 48 hours.',
              '100% money-back satisfaction guarantee.',
              'Over 10,000+ verified Pakistani customer ratings.'
            ],
            callToAction: 'Shop Now',
            recommendedFormat: '1:1 Square Ad or 9:16 Video Reel'
          }
        ],
        utmTracking: {
          baseUrl: `https://${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.pk`,
          utmSource: 'facebook',
          utmMedium: 'paid_social',
          utmCampaign: name.toLowerCase().replace(/\s+/g, '_'),
          fullUrl: `https://${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.pk?utm_source=facebook&utm_medium=paid_social&utm_campaign=${name.toLowerCase().replace(/\s+/g, '_')}`
        }
      },
      tiktokAds: {
        campaignName: `${name} — TikTok Spark Ads`,
        objective: 'Community Interaction & Website Conversions',
        targetAudience: {
          locations: ['Pakistan'],
          interests: ['Trending', 'Shopping', 'Lifestyle'],
          age: '18 - 35'
        },
        hooksAndScripts: [
          {
            hookTitle: 'Viral Hook: Real Before/After Demo',
            first3Seconds: 'Wait! If you live in Pakistan and shop online, you need to see this...',
            visualDirection: 'High-energy unboxing and direct product demonstration showing luxury finish.',
            voiceoverScript: `Stop settling for low quality products. ${brandName} delivers authentic quality with official lab certificates and cash on delivery. Tap the link below!`,
            callToAction: 'Tap Shop Now on TikTok Shop',
            hashtags: ['#TikTokMadeMeBuyIt', '#PakistanOnlineShopping', '#TrendingPK', '#DesiFinds']
          }
        ],
        displayName: brandName,
        adText: `Official drop live now. Free express delivery across Pakistan!`
      },
      googleAds: {
        campaignType: 'Google Search Ads & Performance Max',
        biddingStrategy: 'Maximize Conversions (Target CPA: PKR 550)',
        keywords: {
          highIntentExact: [`[buy ${name.toLowerCase()} online]`, `[${brandName.toLowerCase()} online shopping]`],
          phraseMatch: [`"best ${brandCategory.toLowerCase()} pakistan"`, `"${brandName.toLowerCase()} official store"`],
          negativeKeywords: ['free', 'cheap wholesale', 'jobs', 'wiki']
        },
        rsaAssets: {
          headlines: [
            brandName.slice(0, 30),
            'Official Store Online',
            'Free Nationwide Delivery',
            'Pay Cash on Delivery',
            '100% Quality Guaranteed'
          ],
          descriptions: [
            `Official collection for ${name}. Shop online with 100% verified quality guarantee.`,
            'Delivered in 48 hours across Pakistan with Cash on Delivery.'
          ]
        },
        extensions: {
          sitelinks: [{ title: 'Special Bundles', desc: 'Save up to 25% on bundle packs' }],
          callouts: ['Cash on Delivery', 'Fast 48h Shipping', '100% Authentic']
        }
      },
      seoAndTags: {
        landingPageUrl: `https://${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.pk`,
        metaTitle: `${name} | Official ${brandName} Pakistan`,
        metaDescription: `Shop ${name} online from ${brandName}. Fast doorstep Cash-on-Delivery nationwide across Pakistan with verified quality guarantee.`,
        focusKeywords: [name.toLowerCase(), brandName.toLowerCase(), 'pakistan online shopping'],
        openGraph: {
          ogTitle: `${name} — ${brandName}`,
          ogDescription: 'Official campaign drop with nationwide Cash on Delivery.'
        }
      },
      budgetAndEconomics: {
        totalBudget: Number(budget) || 200000,
        currency: currency || 'PKR',
        durationDays: 14,
        dailyBudget: Math.round((Number(budget) || 200000) / 14),
        platformSplit: [
          { platform: 'Meta Ads', percentage: 50, amount: Math.round((Number(budget) || 200000) * 0.5), daily: Math.round((Number(budget) || 200000) * 0.5 / 14), role: 'Primary Acquisition' },
          { platform: 'TikTok Video Ads', percentage: 30, amount: Math.round((Number(budget) || 200000) * 0.3), daily: Math.round((Number(budget) || 200000) * 0.3 / 14), role: 'Viral Top of Funnel' },
          { platform: 'Google Search Ads', percentage: 20, amount: Math.round((Number(budget) || 200000) * 0.2), daily: Math.round((Number(budget) || 200000) * 0.2 / 14), role: 'Search Intent' }
        ],
        unitEconomics: {
          estimatedClicks: 4600,
          estimatedAvgCpc: 'PKR 43.5',
          projectedConversionRate: '2.7%',
          projectedOrders: 124,
          targetCpa: 'PKR 1,612',
          avgOrderValue: 'PKR 6,800',
          projectedGrossRevenue: `PKR ${Number(124 * 6800).toLocaleString()}`,
          projectedRoas: '4.22x',
          breakEvenRoas: '1.65x'
        }
      }
    });

    const aiResult = await aiService.generateJSON({
      systemPrompt,
      prompt,
      fallbackFn
    });

    const blueprint = aiResult.data || fallbackFn();

    // If campaignId was provided, update the campaign record
    if (campaignId) {
      await db.run(
        'UPDATE campaigns SET blueprint_json = ?, target_audience = ?, target_geography = ? WHERE id = ?',
        [
          JSON.stringify(blueprint),
          targetAudience || (brand ? brand.target_audience : 'Online Shoppers'),
          targetGeography,
          campaignId
        ]
      );
    }

    res.json({
      success: true,
      data: blueprint,
      provider: aiResult.provider,
      model: aiResult.model
    });
  } catch (err) {
    console.error('Error in /generate-blueprint:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create campaign
router.post('/', async (req, res) => {
  try {
    const {
      brand_id,
      name,
      objective,
      status,
      start_date,
      end_date,
      budget,
      currency,
      platforms,
      kpi,
      creative,
      copy,
      landing_page,
      target_geography,
      approval_status,
      blueprint_json,
      tags,
      target_audience
    } = req.body;

    if (!name) return res.status(400).json({ success: false, error: 'Campaign name is required' });

    const userId = req.user?.id || 1;

    // Verify brand ownership if specified
    if (brand_id && req.user && req.user.role !== 'ADMIN') {
      const brand = await db.get('SELECT user_id FROM brands WHERE id = ?', [brand_id]);
      if (brand && brand.user_id && brand.user_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Cannot attach campaign to a brand you do not own.' });
      }
    }

    const formattedPlatforms = Array.isArray(platforms) ? platforms.join(', ') : (platforms || 'Meta, TikTok');

    const result = await db.run(
      `INSERT INTO campaigns (
        brand_id, name, objective, status, start_date, end_date, budget, currency, 
        platforms, kpi, creative, copy, landing_page, target_geography, approval_status,
        blueprint_json, tags, target_audience, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        brand_id || null,
        name,
        objective || 'Conversions',
        status || 'Draft',
        start_date || new Date().toISOString().split('T')[0],
        end_date || null,
        budget || 0,
        currency || 'PKR',
        formattedPlatforms,
        kpi || 'ROAS 4.0x',
        creative || '',
        copy || '',
        landing_page || '',
        target_geography || 'Lahore, Karachi, Islamabad',
        approval_status || 'Approved',
        blueprint_json ? (typeof blueprint_json === 'string' ? blueprint_json : JSON.stringify(blueprint_json)) : null,
        tags || '',
        target_audience || '',
        userId
      ]
    );

    const newCampaign = await db.get(
      `SELECT c.*, b.name as brand_name FROM campaigns c LEFT JOIN brands b ON c.brand_id = b.id WHERE c.id = ?`,
      [result.lastID]
    );

    // Log to audit trail
    await db.run(
      `INSERT INTO audit_logs (agent_name, tool_name, action, status, input_summary, output_summary)
       VALUES ('Advertising Agent', 'Campaign Manager', 'Created Campaign', 'Success', ?, ?)`,
      [name, `Campaign #${result.lastID} created with budget ${currency || 'PKR'} ${budget || 0}`]
    );

    res.status(201).json({ success: true, data: newCampaign });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update campaign
router.put('/:id', async (req, res) => {
  try {
    const fields = req.body;
    const current = await db.get(
      `SELECT c.*, b.user_id as brand_user_id FROM campaigns c LEFT JOIN brands b ON c.brand_id = b.id WHERE c.id = ?`,
      [req.params.id]
    );
    if (!current) return res.status(404).json({ success: false, error: 'Campaign not found' });

    if (req.user && req.user.role !== 'ADMIN' && current.user_id && current.user_id !== req.user.id && current.brand_user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not own this campaign.' });
    }

    const formattedPlatforms = Array.isArray(fields.platforms) ? fields.platforms.join(', ') : fields.platforms;

    await db.run(
      `UPDATE campaigns SET 
        brand_id = COALESCE(?, brand_id),
        name = COALESCE(?, name),
        objective = COALESCE(?, objective),
        status = COALESCE(?, status),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        budget = COALESCE(?, budget),
        currency = COALESCE(?, currency),
        platforms = COALESCE(?, platforms),
        kpi = COALESCE(?, kpi),
        creative = COALESCE(?, creative),
        copy = COALESCE(?, copy),
        landing_page = COALESCE(?, landing_page),
        target_geography = COALESCE(?, target_geography),
        approval_status = COALESCE(?, approval_status),
        blueprint_json = COALESCE(?, blueprint_json),
        tags = COALESCE(?, tags),
        target_audience = COALESCE(?, target_audience)
       WHERE id = ?`,
      [
        fields.brand_id,
        fields.name,
        fields.objective,
        fields.status,
        fields.start_date,
        fields.end_date,
        fields.budget,
        fields.currency,
        formattedPlatforms,
        fields.kpi,
        fields.creative,
        fields.copy,
        fields.landing_page,
        fields.target_geography,
        fields.approval_status,
        fields.blueprint_json ? (typeof fields.blueprint_json === 'string' ? fields.blueprint_json : JSON.stringify(fields.blueprint_json)) : null,
        fields.tags,
        fields.target_audience,
        req.params.id
      ]
    );

    const updated = await db.get(
      `SELECT c.*, b.name as brand_name FROM campaigns c LEFT JOIN brands b ON c.brand_id = b.id WHERE c.id = ?`,
      [req.params.id]
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE campaign
router.delete('/:id', async (req, res) => {
  try {
    const current = await db.get(
      `SELECT c.*, b.user_id as brand_user_id FROM campaigns c LEFT JOIN brands b ON c.brand_id = b.id WHERE c.id = ?`,
      [req.params.id]
    );
    if (!current) return res.status(404).json({ success: false, error: 'Campaign not found' });

    if (req.user && req.user.role !== 'ADMIN' && current.user_id && current.user_id !== req.user.id && current.brand_user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not own this campaign.' });
    }

    await db.run(`DELETE FROM campaigns WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
