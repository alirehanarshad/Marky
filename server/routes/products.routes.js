import { Router } from 'express';
import { db } from '../database.js';

const router = Router();

// GET all products (optionally filtered by brand_id)
router.get('/', async (req, res) => {
  try {
    const { brand_id } = req.query;
    let query = 'SELECT p.*, b.name as brand_name FROM product_profiles p LEFT JOIN brands b ON p.brand_id = b.id';
    let params = [];
    if (brand_id) {
      query += ' WHERE p.brand_id = ?';
      params.push(brand_id);
    }
    query += ' ORDER BY p.created_at DESC';

    const products = await db.all(query, params);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await db.get(
      'SELECT p.*, b.name as brand_name FROM product_profiles p LEFT JOIN brands b ON p.brand_id = b.id WHERE p.id = ?',
      [req.params.id]
    );
    if (!product) return res.status(404).json({ success: false, error: 'Product profile not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create product profile
router.post('/', async (req, res) => {
  try {
    const {
      brand_id,
      name,
      description,
      price,
      currency = 'PKR',
      features,
      benefits,
      target_audience,
      product_images,
      usp,
      offer,
      competitors,
      website_url
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Product name is required' });
    }

    const result = await db.run(
      `INSERT INTO product_profiles (brand_id, name, description, price, currency, features, benefits, target_audience, product_images, usp, offer, competitors, website_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        brand_id || null,
        name,
        description || '',
        price || 0,
        currency,
        features || '',
        benefits || '',
        target_audience || '',
        product_images || '',
        usp || '',
        offer || '',
        competitors || '',
        website_url || ''
      ]
    );

    const created = await db.get('SELECT * FROM product_profiles WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update product profile
router.put('/:id', async (req, res) => {
  try {
    const {
      brand_id,
      name,
      description,
      price,
      currency,
      features,
      benefits,
      target_audience,
      product_images,
      usp,
      offer,
      competitors,
      website_url
    } = req.body;

    await db.run(
      `UPDATE product_profiles
       SET brand_id = COALESCE(?, brand_id),
           name = COALESCE(?, name),
           description = COALESCE(?, description),
           price = COALESCE(?, price),
           currency = COALESCE(?, currency),
           features = COALESCE(?, features),
           benefits = COALESCE(?, benefits),
           target_audience = COALESCE(?, target_audience),
           product_images = COALESCE(?, product_images),
           usp = COALESCE(?, usp),
           offer = COALESCE(?, offer),
           competitors = COALESCE(?, competitors),
           website_url = COALESCE(?, website_url)
       WHERE id = ?`,
      [brand_id, name, description, price, currency, features, benefits, target_audience, product_images, usp, offer, competitors, website_url, req.params.id]
    );

    const updated = await db.get('SELECT * FROM product_profiles WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE product profile
router.delete('/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM product_profiles WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product profile deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
