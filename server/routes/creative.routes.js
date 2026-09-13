import { Router } from 'express';
import { db } from '../database.js';
import { creativeProvider } from '../services/creative-provider.js';

const router = Router();

// GET credit balance & current costs
router.get('/credits', async (req, res) => {
  try {
    let credits = await db.get('SELECT * FROM user_credits WHERE user_id = ?', ['default_marky_user']);
    if (!credits) {
      await db.run(
        'INSERT INTO user_credits (user_id, balance, total_spent, image_cost_credits, video_5sec_cost_credits) VALUES (?, 500, 0, 5, 120)',
        ['default_marky_user']
      );
      credits = await db.get('SELECT * FROM user_credits WHERE user_id = ?', ['default_marky_user']);
    }
    res.json({
      success: true,
      balance: credits.balance,
      totalSpent: credits.total_spent,
      costs: {
        imageCostCredits: credits.image_cost_credits,
        videoCostCredits: credits.video_5sec_cost_credits
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST update credit costs (Admin)
router.post('/credits/costs', async (req, res) => {
  try {
    const { imageCostCredits, videoCostCredits } = req.body;
    await db.run(
      'UPDATE user_credits SET image_cost_credits = ?, video_5sec_cost_credits = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [imageCostCredits || 5, videoCostCredits || 120, 'default_marky_user']
    );
    res.json({ success: true, message: 'Pricing model updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper to deduct credits safely
async function deductCredits(cost, jobType) {
  const credits = await db.get('SELECT balance, total_spent FROM user_credits WHERE user_id = ?', ['default_marky_user']);
  const currentBalance = credits ? credits.balance : 500;
  
  if (currentBalance < cost) {
    throw new Error(`Insufficient credits. Required: ${cost}, Available: ${currentBalance}`);
  }

  const newBalance = currentBalance - cost;
  const newSpent = (credits ? credits.total_spent : 0) + cost;

  await db.run(
    'UPDATE user_credits SET balance = ?, total_spent = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
    [newBalance, newSpent, 'default_marky_user']
  );

  return { previousBalance: currentBalance, remainingBalance: newBalance, cost };
}

// 1. POST /api/creative/image
router.post('/image', async (req, res) => {
  try {
    const { prompt, negativePrompt, aspectRatio = '1:1', style = 'Photorealistic', brandContext = '', count = 1, attachedAsset } = req.body;
    
    // Fetch current image cost
    const creditsRow = await db.get('SELECT image_cost_credits FROM user_credits WHERE user_id = ?', ['default_marky_user']);
    const unitCost = creditsRow?.image_cost_credits || 5;
    const totalCost = unitCost * (Number(count) || 1);

    // Deduct credits before generating
    const creditResult = await deductCredits(totalCost, 'image');

    const result = await creativeProvider.generateImage({
      prompt,
      negativePrompt,
      aspectRatio,
      style,
      brandContext,
      attachedAsset
    });

    // Record job in creative_jobs
    await db.run(
      `INSERT INTO creative_jobs (job_id, job_type, prompt, provider, status, credits_deducted, result_url, metadata)
       VALUES (?, 'image', ?, ?, ?, ?, ?, ?)`,
      [
        result.jobId,
        prompt,
        result.provider,
        result.status,
        totalCost,
        result.imageUrl,
        JSON.stringify({ aspectRatio, style, negativePrompt })
      ]
    );

    res.json({
      success: true,
      data: {
        jobId: result.jobId,
        imageUrl: result.imageUrl,
        aspectRatio,
        style,
        creditsDeducted: totalCost,
        remainingCredits: creditResult.remainingBalance,
        provider: result.provider
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 2. POST /api/creative/image-edit
router.post('/image-edit', async (req, res) => {
  try {
    const { imageUrl, editInstruction, backgroundReplacement, objectRemoval, objectAddition, brandColors } = req.body;

    const creditsRow = await db.get('SELECT image_cost_credits FROM user_credits WHERE user_id = ?', ['default_marky_user']);
    const cost = creditsRow?.image_cost_credits || 5;

    const creditResult = await deductCredits(cost, 'image-edit');

    const result = await creativeProvider.editImage({
      imageUrl,
      editInstruction,
      backgroundReplacement,
      objectRemoval,
      objectAddition,
      brandColors
    });

    await db.run(
      `INSERT INTO creative_jobs (job_id, job_type, prompt, provider, status, credits_deducted, result_url, input_media_url, metadata)
       VALUES (?, 'image-edit', ?, ?, ?, ?, ?, ?, ?)`,
      [
        result.jobId,
        editInstruction,
        result.provider,
        result.status,
        cost,
        result.editedUrl,
        imageUrl,
        JSON.stringify({ backgroundReplacement, objectRemoval, objectAddition })
      ]
    );

    res.json({
      success: true,
      data: {
        jobId: result.jobId,
        originalUrl: imageUrl,
        editedUrl: result.editedUrl,
        creditsDeducted: cost,
        remainingCredits: creditResult.remainingBalance,
        provider: result.provider
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 3. POST /api/creative/video (Wan 2.2 / 480p 5s 9:16 ~120 credits)
router.post('/video', async (req, res) => {
  try {
    const { prompt, inputImageUrl, duration = 5, resolution = '480p', aspectRatio = '9:16', mode = 'motion' } = req.body;

    // Enforce account limitation: 480p maximum default
    const enforcedResolution = resolution === '720p' ? '480p' : resolution;

    const creditsRow = await db.get('SELECT video_5sec_cost_credits FROM user_credits WHERE user_id = ?', ['default_marky_user']);
    const cost = creditsRow?.video_5sec_cost_credits || 120;

    const creditResult = await deductCredits(cost, 'video');

    const result = await creativeProvider.generateVideo({
      prompt,
      inputImageUrl,
      duration: 5,
      resolution: enforcedResolution,
      aspectRatio,
      mode
    });

    await db.run(
      `INSERT INTO creative_jobs (job_id, job_type, prompt, provider, status, model, duration, resolution, aspect_ratio, credits_deducted, result_url, input_media_url, metadata)
       VALUES (?, 'video', ?, ?, ?, 'wan-2.2', 5, ?, ?, ?, ?, ?, ?)`,
      [
        result.jobId,
        prompt,
        result.provider,
        result.status,
        enforcedResolution,
        aspectRatio,
        cost,
        result.videoUrl,
        inputImageUrl,
        JSON.stringify({ mode })
      ]
    );

    res.json({
      success: true,
      data: {
        jobId: result.jobId,
        videoUrl: result.videoUrl,
        duration: 5,
        resolution: enforcedResolution,
        aspectRatio,
        creditsDeducted: cost,
        remainingCredits: creditResult.remainingBalance,
        provider: result.provider
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. GET /api/creative/job/:id
router.get('/job/:id', async (req, res) => {
  try {
    const job = await db.get('SELECT * FROM creative_jobs WHERE job_id = ?', [req.params.id]);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    if (job.status === 'processing' || job.status === 'pending') {
      const liveStatus = await creativeProvider.getJobStatus(job.job_id);
      if (liveStatus.status && liveStatus.status !== job.status) {
        await db.run(
          'UPDATE creative_jobs SET status = ?, result_url = COALESCE(?, result_url), updated_at = CURRENT_TIMESTAMP WHERE job_id = ?',
          [liveStatus.status, liveStatus.video_url || liveStatus.image_url, job.job_id]
        );
        job.status = liveStatus.status;
        if (liveStatus.video_url) job.result_url = liveStatus.video_url;
      }
    }

    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. GET /api/creative/gallery (Creative Asset Vault & Library)
router.get('/gallery', async (req, res) => {
  try {
    const { type = 'all', brand, search, limit = 100 } = req.query;
    let query = 'SELECT * FROM creative_jobs WHERE 1=1';
    let params = [];

    // Filter by type
    if (type && type !== 'all') {
      if (type === 'image') {
        query += " AND (job_type = 'image' OR job_type = 'upload-image')";
      } else if (type === 'video') {
        query += " AND (job_type = 'video' OR job_type = 'assembled-video' OR job_type = 'upload-video' OR job_type = 'ugc-video')";
      } else if (type === 'upload') {
        query += " AND (job_type LIKE 'upload%' OR provider = 'User Upload')";
      } else if (type === 'assembled') {
        query += " AND (job_type = 'assembled-video' OR job_type = 'assembled')";
      } else if (type === 'edit') {
        query += " AND (job_type = 'image-edit' OR job_type = 'edit')";
      } else if (type === 'badge' || type === 'svg') {
        query += " AND (job_type = 'badge' OR metadata LIKE '%badge%' OR metadata LIKE '%seal%')";
      } else {
        query += ' AND job_type = ?';
        params.push(type);
      }
    }

    // Filter by search query
    if (search && search.trim()) {
      query += ' AND (prompt LIKE ? OR provider LIKE ? OR metadata LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    // Filter by brand
    if (brand && brand !== 'all' && brand !== 'All Brands') {
      query += ' AND (prompt LIKE ? OR metadata LIKE ?)';
      const b = `%${brand.trim()}%`;
      params.push(b, b);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Number(limit) || 100);

    const items = await db.all(query, params);
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. POST /api/creative/upload (Upload any custom media: image, video, audio, etc.)
router.post('/upload', async (req, res) => {
  try {
    const {
      name,
      type = 'image/jpeg',
      size = 0,
      dataUrl,
      url,
      brand = 'All Brands',
      category = 'Custom Upload',
      tags = [],
      prompt
    } = req.body;

    const mediaUrl = url || dataUrl;
    if (!mediaUrl) {
      return res.status(400).json({ success: false, error: 'Media URL or file dataUrl is required' });
    }

    let jobType = 'upload';
    if (type.startsWith('video/')) jobType = 'upload-video';
    else if (type.startsWith('image/')) jobType = 'upload-image';
    else if (type.startsWith('audio/')) jobType = 'upload-audio';

    const jobId = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const assetTitle = prompt || name || 'Custom Uploaded Asset';

    const metadata = JSON.stringify({
      fileName: name || 'uploaded-file',
      fileSize: size,
      mimeType: type,
      brand,
      category,
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      uploadedAt: new Date().toISOString()
    });

    await db.run(
      `INSERT INTO creative_jobs (job_id, job_type, prompt, provider, status, credits_deducted, result_url, metadata)
       VALUES (?, ?, ?, 'User Upload', 'completed', 0, ?, ?)`,
      [jobId, jobType, assetTitle, mediaUrl, metadata]
    );

    const savedAsset = await db.get('SELECT * FROM creative_jobs WHERE job_id = ?', [jobId]);
    res.status(201).json({ success: true, data: savedAsset, message: 'Asset uploaded and stored successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. POST /api/creative/asset (Store any generated or assembled creative asset)
router.post('/asset', async (req, res) => {
  try {
    const {
      title,
      prompt,
      jobType = 'image',
      resultUrl,
      inputMediaUrl,
      provider = 'MarketPulse Studio',
      model,
      duration = 5,
      resolution = '480p',
      aspectRatio = '1:1',
      creditsDeducted = 0,
      metadata = {},
      brand = 'All Brands'
    } = req.body;

    if (!resultUrl) {
      return res.status(400).json({ success: false, error: 'Result URL is required' });
    }

    const jobId = `asset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const assetPrompt = title || prompt || 'Creative Studio Asset';

    const fullMetadata = JSON.stringify({
      ...metadata,
      brand,
      savedAt: new Date().toISOString()
    });

    await db.run(
      `INSERT INTO creative_jobs (job_id, job_type, prompt, provider, status, model, duration, resolution, aspect_ratio, credits_deducted, result_url, input_media_url, metadata)
       VALUES (?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        jobId,
        jobType,
        assetPrompt,
        provider,
        model || null,
        duration || 5,
        resolution || '480p',
        aspectRatio || '1:1',
        creditsDeducted || 0,
        resultUrl,
        inputMediaUrl || null,
        fullMetadata
      ]
    );

    const savedAsset = await db.get('SELECT * FROM creative_jobs WHERE job_id = ?', [jobId]);
    res.status(201).json({ success: true, data: savedAsset, message: 'Asset saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. DELETE /api/creative/asset/:id
router.delete('/asset/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.get('SELECT * FROM creative_jobs WHERE id = ? OR job_id = ?', [id, id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }

    await db.run('DELETE FROM creative_jobs WHERE id = ? OR job_id = ?', [id, id]);
    res.json({ success: true, message: 'Asset deleted successfully from gallery' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
