import { Router } from 'express';
import { db } from '../database.js';

const router = Router();

// GET all brands with summary stats
router.get('/', async (req, res) => {
  try {
    const brands = await db.all(`
      SELECT b.*, 
             COUNT(c.id) as campaigns_count,
             COALESCE(SUM(CASE WHEN c.status = 'Active' THEN c.budget ELSE 0 END), 0) as active_budget
      FROM brands b
      LEFT JOIN campaigns c ON b.id = c.brand_id
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `);
    res.json({ success: true, data: brands });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET brand by ID with its campaigns
router.get('/:id', async (req, res) => {
  try {
    const brand = await db.get(`SELECT * FROM brands WHERE id = ?`, [req.params.id]);
    if (!brand) return res.status(404).json({ success: false, error: 'Brand not found' });
    
    const campaigns = await db.all(`SELECT * FROM campaigns WHERE brand_id = ?`, [req.params.id]);
    res.json({ success: true, data: { ...brand, campaigns } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create brand with full profile fields
router.post('/', async (req, res) => {
  try {
    const {
      name,
      company_name,
      industry,
      category,
      tier,
      description,
      website,
      product_service,
      product_category,
      pricing,
      target_audience,
      target_locations,
      brand_voice,
      tone,
      brand_positioning,
      competitors,
      usps,
      key_messaging,
      keywords,
      social_platforms,
      marketing_goals,
      business_goals
    } = req.body;

    if (!name) return res.status(400).json({ success: false, error: 'Brand name is required' });

    const result = await db.run(
      `INSERT INTO brands (
        name, company_name, industry, category, tier, description, website,
        product_service, product_category, pricing, target_audience, target_locations,
        brand_voice, tone, brand_positioning, competitors, usps, key_messaging,
        keywords, social_platforms, marketing_goals, business_goals
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        company_name || name,
        industry || 'E-Commerce',
        category || 'General Retail',
        tier || 'Mass',
        description || '',
        website || '',
        product_service || '',
        product_category || '',
        pricing || '',
        target_audience || '',
        target_locations || 'Pakistan (Nationwide)',
        brand_voice || 'Professional, Direct & Engaging',
        tone || 'Confident',
        brand_positioning || '',
        competitors || '',
        usps || '',
        key_messaging || '',
        keywords || '',
        social_platforms || 'TikTok, Facebook, Instagram, Daraz',
        marketing_goals || 'Rapid scale & 4x ROAS',
        business_goals || 'Customer acquisition & low CAC'
      ]
    );

    const newBrand = await db.get(`SELECT * FROM brands WHERE id = ?`, [result.lastID]);

    // Log to audit trail
    await db.run(
      `INSERT INTO audit_logs (agent_name, tool_name, action, status, input_summary, output_summary)
       VALUES ('Strategy Agent', 'Brand Profile Manager', 'Created Brand Profile', 'Success', ?, ?)`,
      [name, `New brand workspace initialized with ID #${result.lastID}`]
    );

    res.status(201).json({ success: true, data: newBrand });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST duplicate brand
router.post('/:id/duplicate', async (req, res) => {
  try {
    const orig = await db.get(`SELECT * FROM brands WHERE id = ?`, [req.params.id]);
    if (!orig) return res.status(404).json({ success: false, error: 'Original brand not found' });

    const dupName = `${orig.name} (Copy)`;
    const result = await db.run(
      `INSERT INTO brands (
        name, company_name, industry, category, tier, description, website,
        product_service, product_category, pricing, target_audience, target_locations,
        brand_voice, tone, brand_positioning, competitors, usps, key_messaging,
        keywords, social_platforms, marketing_goals, business_goals
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dupName,
        orig.company_name,
        orig.industry,
        orig.category,
        orig.tier,
        orig.description,
        orig.website,
        orig.product_service,
        orig.product_category,
        orig.pricing,
        orig.target_audience,
        orig.target_locations,
        orig.brand_voice,
        orig.tone,
        orig.brand_positioning,
        orig.competitors,
        orig.usps,
        orig.key_messaging,
        orig.keywords,
        orig.social_platforms,
        orig.marketing_goals,
        orig.business_goals
      ]
    );

    const duplicated = await db.get(`SELECT * FROM brands WHERE id = ?`, [result.lastID]);
    res.status(201).json({ success: true, data: duplicated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update brand
router.put('/:id', async (req, res) => {
  try {
    const fields = req.body;
    const current = await db.get(`SELECT * FROM brands WHERE id = ?`, [req.params.id]);
    if (!current) return res.status(404).json({ success: false, error: 'Brand not found' });

    await db.run(
      `UPDATE brands SET 
        name = COALESCE(?, name),
        company_name = COALESCE(?, company_name),
        industry = COALESCE(?, industry),
        category = COALESCE(?, category),
        tier = COALESCE(?, tier),
        description = COALESCE(?, description),
        website = COALESCE(?, website),
        product_service = COALESCE(?, product_service),
        product_category = COALESCE(?, product_category),
        pricing = COALESCE(?, pricing),
        target_audience = COALESCE(?, target_audience),
        target_locations = COALESCE(?, target_locations),
        brand_voice = COALESCE(?, brand_voice),
        tone = COALESCE(?, tone),
        brand_positioning = COALESCE(?, brand_positioning),
        competitors = COALESCE(?, competitors),
        usps = COALESCE(?, usps),
        key_messaging = COALESCE(?, key_messaging),
        keywords = COALESCE(?, keywords),
        social_platforms = COALESCE(?, social_platforms),
        marketing_goals = COALESCE(?, marketing_goals),
        business_goals = COALESCE(?, business_goals)
       WHERE id = ?`,
      [
        fields.name,
        fields.company_name,
        fields.industry,
        fields.category,
        fields.tier,
        fields.description,
        fields.website,
        fields.product_service,
        fields.product_category,
        fields.pricing,
        fields.target_audience,
        fields.target_locations,
        fields.brand_voice,
        fields.tone,
        fields.brand_positioning,
        fields.competitors,
        fields.usps,
        fields.key_messaging,
        fields.keywords,
        fields.social_platforms,
        fields.marketing_goals,
        fields.business_goals,
        req.params.id
      ]
    );

    const updated = await db.get(`SELECT * FROM brands WHERE id = ?`, [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE brand
router.delete('/:id', async (req, res) => {
  try {
    await db.run(`DELETE FROM campaigns WHERE brand_id = ?`, [req.params.id]);
    await db.run(`DELETE FROM brands WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Brand deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
