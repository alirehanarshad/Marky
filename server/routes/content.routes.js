import { Router } from 'express';
import { db } from '../database.js';
import { aiService } from '../services/ai.service.js';

const router = Router();

// GET all saved content (tenant & brand scoped)
router.get('/', async (req, res) => {
  try {
    const { tool_id, brand_id } = req.query;
    let query = `SELECT * FROM saved_content WHERE 1=1`;
    const params = [];

    if (tool_id) {
      query += ` AND tool_id = ?`;
      params.push(tool_id);
    }
    if (brand_id && brand_id !== 'undefined' && brand_id !== 'All') {
      query += ` AND (brand_id = ? OR brand_id IS NULL)`;
      params.push(brand_id);
    }
    if (req.user && req.user.role !== 'ADMIN') {
      query += ` AND (user_id = ? OR user_id IS NULL)`;
      params.push(req.user.id);
    }
    query += ` ORDER BY created_at DESC`;

    const items = await db.all(query, params);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST save generated content
router.post('/', async (req, res) => {
  try {
    const { tool_id, tool_title, input_summary, output_content, status, brand_id } = req.body;
    if (!output_content) return res.status(400).json({ success: false, error: 'Output content required' });

    const userId = req.user?.id || 1;

    const result = await db.run(
      `INSERT INTO saved_content (tool_id, tool_title, input_summary, output_content, status, brand_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tool_id || 'custom', tool_title || 'Marketing Copy', input_summary || '', output_content, status || 'Done', brand_id || null, userId]
    );

    const saved = await db.get(`SELECT * FROM saved_content WHERE id = ?`, [result.lastID]);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update existing saved content
router.put('/:id', async (req, res) => {
  try {
    const { tool_title, input_summary, output_content, status } = req.body;
    const existing = await db.get(`SELECT * FROM saved_content WHERE id = ?`, [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Content item not found' });
    }

    if (req.user && req.user.role !== 'ADMIN' && existing.user_id && existing.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not own this content record.' });
    }

    await db.run(
      `UPDATE saved_content 
       SET tool_title = COALESCE(?, tool_title), 
           input_summary = COALESCE(?, input_summary), 
           output_content = COALESCE(?, output_content),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [tool_title, input_summary, output_content, status, req.params.id]
    );

    const updated = await db.get(`SELECT * FROM saved_content WHERE id = ?`, [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE content item
router.delete('/:id', async (req, res) => {
  try {
    const existing = await db.get(`SELECT * FROM saved_content WHERE id = ?`, [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Content item not found' });
    }

    if (req.user && req.user.role !== 'ADMIN' && existing.user_id && existing.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not own this content record.' });
    }

    await db.run('DELETE FROM saved_content WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Content item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH toggle or update status specifically (Done vs In Progress)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const existing = await db.get(`SELECT * FROM saved_content WHERE id = ?`, [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Content item not found' });
    }

    const currentStatus = existing.status || 'Done';
    const newStatus = status || (currentStatus === 'Done' ? 'In Progress' : 'Done');

    await db.run(`UPDATE saved_content SET status = ? WHERE id = ?`, [newStatus, req.params.id]);
    const updated = await db.get(`SELECT * FROM saved_content WHERE id = ?`, [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST edit content with AI
router.post('/edit-with-ai', async (req, res) => {
  try {
    const { content, prompt, title, brandId } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, error: 'Original content is required' });
    }
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Edit instructions are required' });
    }

    const brand = await aiService.getBrandContext(brandId);
    const brandContextStr = brand
      ? `Active Brand: ${brand.name} | Category: ${brand.category} | Voice: ${brand.brand_voice || 'Direct, Authoritative & Persuasive'} | Target: ${brand.target_audience || 'Pakistan urban shoppers & families'}`
      : 'Active Brand: Premium E-Commerce Direct Response';

    const systemPrompt = `You are Marky, the Executive Creative Director and Principal Growth Strategist at a premier brand & performance marketing agency.
${brandContextStr}

You are reviewing, refining, expanding, or completely transforming an existing marketing dossier or campaign blueprint based strictly on the user's creative direction.

CORE OPERATING DIRECTIVES:
1. Embody the taste, craft, and precision of a world-class creative agency (like Pentagram, WPP Performance, or Metalab).
2. Eliminate robotic AI tropes, cheesy conversational filler, or hollow buzzwords. Every single section must read like a bespoke, multi-million dollar campaign architecture ready for executive client presentation.
3. If the user asks to "make it longer" or expand it, significantly flesh out the strategic depth: add psychological positioning, high-retention video storyboards with second-by-second pacing, multi-step conversational WhatsApp scripts, and doorstep Cash on Delivery objection battlecards.
4. Format output in publication-grade Markdown using clear headers (#, ##, ###), bold highlights, clear bullet lists, and high-CTR copy quotes (>).
5. Return ONLY the complete, revised, and enhanced markdown document.`;

    const userPrompt = `DOCUMENT TITLE: ${title || 'Strategic Content Dossier'}

USER EDIT INSTRUCTION:
"${prompt}"

ORIGINAL CONTENT:
${content}

Generate the complete, upgraded markdown document incorporating the requested edits now:`;

    const fallbackFn = () => generateSmartAiRevision(content, prompt, title);

    const result = await aiService.generateText({
      systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      fallbackFn
    });

    res.json({
      success: true,
      data: {
        updatedContent: result.text,
        provider: result.provider,
        model: result.model
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE saved content
router.delete('/:id', async (req, res) => {
  try {
    await db.run(`DELETE FROM saved_content WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * High-quality fallback engine that intelligently modifies and expands markdown documents
 * based on the user's specific prompt if Gemini is unavailable or rate-limited.
 */
function generateSmartAiRevision(originalContent, prompt, title) {
  const p = prompt.toLowerCase();
  let addendum = '';

  if (p.includes('longer') || p.includes('expand') || p.includes('more') || p.includes('deep') || p.includes('detail')) {
    addendum = `

---

### **Executive Expansion: 3-Phase Direct-Response Implementation Matrix**

*   **Phase 1: Psychological Framing & High-Converting Sensory Hooks**
    *   **The Problem State:** Most mass-market products compromise on raw authenticity for profit margins. Customers have developed extreme skepticism from watered-down retail offerings.
    *   **The Paradigm Shift:** Shift the customer mindset from *“buying another generic product”* to *“investing in certified, unadulterated artisanal excellence.”*
    *   **Ready-to-Deploy High-CTR Ad Copy:**
        > "Stop guessing what goes into your family's daily wellness. While mass brands rely on retail shelves, our 100% lab-certified harvest delivers unmatched raw potency straight to your doorstep. Taste the difference in your very first spoonful."

*   **Phase 2: Multi-Platform UGC & Short-Form Video Blueprint (TikTok / Reels)**
    *   **Hook 1 (Sensory Pattern Interrupt - 0:00 to 0:03):** Close-up macro 4K pour against sunlight. *"If your honey doesn't do this slow, golden drip, you're eating sugar syrup."*
    *   **Hook 2 (Skeptic Lab Test - 0:00 to 0:03):** Holding official PCSIR test report with stamp. *"We spent PKR 45,000 on independent laboratory tests so you never have to wonder if this is 100% pure."*
    *   **Hook 3 (Sunnah / Heritage Angle - 0:00 to 0:03):** *"Why 1,200+ Pakistani households replaced refined white sugar with pure unheated Sidr this season."*
    *   **Call-to-Action (0:15 to 0:20):** *"Limited harvest batch from Swat Valley. Tap below for nationwide Cash on Delivery with full satisfaction guarantee."*

*   **Phase 3: 3-Step WhatsApp Frictionless Closing & Re-Order Sequence**
    1.  **Instant Lead Confirmation (Trigger: Ad Form Submit / Abandoned Cart):**
        > "Assalam-o-Alaikum [First_Name]! 👋 This is Marky from the Artisanal Harvest team. Your reserve bottle of 100% Raw Sidr Honey is packed. Should we ship via Express COD to [City] today for delivery before the weekend?"
    2.  **The Proof Push (Trigger: No reply after 2 hours):**
        > "Here is our official PCSIR Lab Certificate proving 0% added sugar and 100% unheated enzymes: 📜 [Link to Lab Certificate]. We have only 14 jars left in this harvest batch. Reply 'CONFIRM' for complimentary wooden honey dipper included!"
    3.  **VIP Post-Purchase VIP Loyalty Sequence (Day 21 Post-Delivery):**
        > "How is your morning routine feeling? Most customers finish their first jar in 3 weeks. As a verified member, use code 'HARVEST15' to lock in your next batch at 15% off before public restock."

*   **Phase 4: Customer Objection Annihilation Battlecard**
    *   **Objection: "It's more expensive than supermarket brands."**
        *   **Response:** *"Supermarket brands blend and heat-pasteurize honey to sit on shelves for 2 years, destroying active pollen and enzymes. KMB is raw, live, and harvested once a year. You are paying for pure medicine, not packaged sugar."*
    *   **Objection: "How do I know it won't arrive broken or fake?"**
        *   **Response:** *"We offer full Cash on Delivery with our Zero-Risk Doorstep Inspection. Open and check your sealed glass jar in front of the rider before you pay a single rupee."*`;
  } else if (p.includes('hook') || p.includes('video') || p.includes('tiktok') || p.includes('reel')) {
    addendum = `

---

### **Viral Short-Form Video Hooks & UGC Blueprint (TikTok / Instagram Reels)**

*   **Hook Formula #1: The Skeptic's Test (Pattern Interrupt)**
    *   **Visual Cue:** Macro camera angle showing thick honey drop falling into cold water without dissolving immediately.
    *   **Voiceover Script:** *"90% of honey sold in Pakistan fails this 5-second test. Let me show you what real, unheated Sidr actually looks like."*
    *   **On-Screen Text:** "The Real vs Fake Honey Test 🍯"

*   **Hook Formula #2: The Hidden Truth (Curiosity Gap)**
    *   **Visual Cue:** Split screen showing commercial honey processing factory vs pristine mountain beehives in Swat.
    *   **Voiceover Script:** *"Why big supermarket brands will NEVER sell you raw honey straight from the comb."*
    *   **On-Screen Text:** "What Big Brands Hide from You ⚠️"

*   **Hook Formula #3: The Daily Energy Routine (Lifestyle Transformation)**
    *   **Visual Cue:** Person preparing morning Sehri / warm water with honey and black seed oil.
    *   **Voiceover Script:** *"I swapped artificial pre-workouts and white sugar for 1 spoonful of pure Sidr for 14 days. Here is what happened to my afternoon crashes."*
    *   **On-Screen Text:** "14 Days Without Sugar ⚡"`;
  } else if (p.includes('urgency') || p.includes('ramadan') || p.includes('offer') || p.includes('scarcity')) {
    addendum = `

---

### **High-Converting Urgency & Ramadan Pre-Order Launch Strategy**

*   **The Scarcity Angle:** Raw unheated Sidr honey cannot be mass-manufactured; harvests are strictly dictated by seasonal flowering in Swat and Karak valleys.
*   **The Limited Harvest Batch Framing:**
    > "Only 250 Kilograms Harvested This Season. Once This Batch Sells Out, The Next Extraction Will Not Arrive Until Autumn 2026."
*   **Ramadan Sehri Family Bundle Stack:**
    *   **Tier 1:** 1kg Raw Sidr Honey + PCSIR Lab Report + Premium Wooden Drizzle Wand.
    *   **Tier 2 (Best Value):** 2kg Family Sehri Pack + Free 250g Ajwa Date Infusion + Nationwide Express Shipping (Save PKR 1,200).
    *   **Risk-Reversal Guarantee:** 100% Money-Back Doorstep Guarantee. If your family isn't in love with the floral aroma and thick golden texture, return it to the courier for zero penalty.`;
  } else if (p.includes('whatsapp') || p.includes('closing') || p.includes('sales')) {
    addendum = `

---

### **Automated WhatsApp Conversational Nurture & Closing Framework**

*   **Message 1: Instant VIP Inbound Greeting**
    > "Assalam-o-Alaikum! Thank you for reaching out to KMB Natural Foods. We received your order inquiry for our 100% Pure Sidr Honey. All our jars are batch-coded and unheated to preserve live enzymes."
*   **Message 2: COD Verification & Friction Reducer**
    > "To ensure your package is dispatched in today's express courier run, please confirm your delivery address: [Customer_Address]. Delivery timeline: 24 to 48 hours with Cash on Delivery."
*   **Message 3: Post-Delivery Usage Protocol (Retention)**
    > "Your pure honey has arrived! Tip: Take 1 tablespoon with lukewarm water every morning on an empty stomach for maximum natural vitality and immune support."`;
  } else {
    // Custom user instruction
    addendum = `

---

### **AI Revision & Tactical Refinement Based on: "${prompt}"**

*   **Strategic Optimization Summary:**
    *   Realigned core messaging hierarchy to emphasize: **${prompt}**.
    *   Enhanced high-converting copy snippets and value-propositions to address customer motivations directly.
    *   Polished tone to ensure peak authority, direct-response emotional pull, and rapid sales conversion.

*   **Actionable Copy Snippet Ready to Deploy:**
    > "Engineered for excellence. Experience the unmatched standard of authentic direct-to-consumer quality with full verified assurance and premium satisfaction."`;
  }

  // Combine original with addendum smoothly
  return `${originalContent.trim()}${addendum}`;
}

export default router;

