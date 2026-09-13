import { Router } from 'express';
import { db } from '../database.js';
import { aiService } from '../services/ai.service.js';
import { calculatorService } from '../services/calculator.service.js';

const router = Router();

// GET Gemini status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    ...aiService.getStatus()
  });
});

// POST update Gemini API key in runtime
router.post('/config-key', (req, res) => {
  const { apiKey } = req.body;
  if (apiKey) {
    aiService.setApiKey(apiKey);
    res.json({ success: true, message: 'Gemini API key updated successfully for current session' });
  } else {
    res.status(400).json({ success: false, error: 'API key is required' });
  }
});

// 1. Universal AI Tool Runner Engine — Dedicated Per-Tool Prompts & Real Calculators
router.post('/run-tool', async (req, res) => {
  const startTime = Date.now();
  try {
    const { toolId, toolTitle, category, inputs, brandId, productId } = req.body;

    // ── Deterministic Tool Interceptor (No LLM for pure math) ──
    if (toolId === 'roas-cpa-calculator') {
      const calc = calculatorService.calculateBreakEvenROAS({
        sellingPrice: inputs.sellingPrice,
        cogs: inputs.cogs,
        shippingCost: inputs.shippingCost,
        packagingCost: inputs.packagingCost,
        returnRatePercent: inputs.returnRatePercent,
        targetProfitMarginPercent: inputs.targetProfitMarginPercent
      });

      const formattedOutput = `### 📊 Break-Even ROAS & CPA Calculation Model
**Formula Applied:** \`${calc.formula}\`

---

#### 🎯 Key Financial Metrics
| Metric | Value | Interpretation |
|---|---|---|
| **Selling Price** | PKR ${calc.inputs.sellingPrice} | Retail baseline |
| **Gross Margin (PKR)** | **PKR ${calc.metrics.grossMarginPKR}** | Margin per delivered unit |
| **Gross Margin %** | **${calc.metrics.grossMarginPercent}%** | Cash flow buffer |
| **Break-Even ROAS** | **${calc.metrics.breakEvenROAS}x** | Minimum ROAS to not lose money |
| **Max Allowable CPA** | **PKR ${calc.metrics.maxBreakEvenCPA}** | Maximum acquisition spend |
| **Target ROAS (${calc.inputs.targetProfitMarginPercent}%)** | **${calc.metrics.targetROAS}x** | Target ROAS for desired profit |
| **Target Allowable CPA** | **PKR ${calc.metrics.targetCPA}** | Maximum ad bid for desired profit |

---

#### 💡 Actionable Growth Directives
${calc.guidance.map((g) => `- ${g}`).join('\n')}`;

      // Log to tool_run_history
      await db.run(
        `INSERT INTO tool_run_history (tool_id, tool_title, category, inputs_json, output_text, provider, credits_used, brand_id, product_id, duration_ms)
         VALUES (?, ?, ?, ?, ?, 'Deterministic Math', 0, ?, ?, ?)`,
        [toolId, toolTitle, category, JSON.stringify(inputs), formattedOutput, brandId || null, productId || null, Date.now() - startTime]
      );

      return res.json({
        success: true,
        data: {
          toolId,
          toolTitle,
          output: formattedOutput,
          provider: 'Deterministic Math Engine',
          generatedAt: new Date().toISOString()
        }
      });
    }

    if (toolId === 'discount-profit-estimator') {
      const calc = calculatorService.calculateDiscountProfit({
        originalPrice: inputs.originalPrice,
        discountPercent: inputs.discountPercent,
        expectedUnitsSold: inputs.expectedUnitsSold,
        unitCogs: inputs.unitCogs,
        adSpend: inputs.adSpend
      });

      const formattedOutput = `### 🏷️ Sale Discount & Profitability Forecast
**Formula Applied:** \`${calc.formula}\`

---

#### 📈 Financial Breakdown
| Dimension | Amount |
|---|---|
| **Original Price** | PKR ${calc.inputs.originalPrice} |
| **Discount Applied** | ${calc.inputs.discountPercent}% (-PKR ${calc.metrics.discountPerUnit}) |
| **Effective Sale Price** | **PKR ${calc.metrics.effectiveSalePrice}** |
| **Unit Margin** | PKR ${calc.metrics.unitMargin} |
| **Projected Gross Revenue** | **PKR ${calc.metrics.projectedRevenue}** |
| **Projected Gross Profit** | PKR ${calc.metrics.projectedGrossProfit} |
| **Total Ad Budget** | PKR ${calc.inputs.adSpend} |
| **Projected Net Profit** | **PKR ${calc.metrics.projectedNetProfit}** |
| **Net Profit Margin** | **${calc.metrics.netMarginPercent}%** |
| **Blended ROAS** | **${calc.metrics.blendedROAS}x** |

---

#### 💡 Executive Advisory
${calc.guidance.map((g) => `- ${g}`).join('\n')}`;

      // Log to tool_run_history
      await db.run(
        `INSERT INTO tool_run_history (tool_id, tool_title, category, inputs_json, output_text, provider, credits_used, brand_id, product_id, duration_ms)
         VALUES (?, ?, ?, ?, ?, 'Deterministic Math', 0, ?, ?, ?)`,
        [toolId, toolTitle, category, JSON.stringify(inputs), formattedOutput, brandId || null, productId || null, Date.now() - startTime]
      );

      return res.json({
        success: true,
        data: {
          toolId,
          toolTitle,
          output: formattedOutput,
          provider: 'Deterministic Math Engine',
          generatedAt: new Date().toISOString()
        }
      });
    }

    // ── LLM Tools ──
    const brand = await aiService.getBrandContext(brandId);
    const brandContextStr = brand
      ? `Active Brand Context: Name: ${brand.name} | Tier: ${brand.tier} | Category: ${brand.category} | Voice: ${brand.brand_voice || 'Direct & Persuasive'} | Target: ${brand.target_audience || 'Pakistan urban consumers'}`
      : 'Active Brand: General E-commerce';

    // Look up dedicated per-tool prompt
    let toolPromptModule;
    try {
      toolPromptModule = await import('../services/tool-prompts.js');
    } catch (e) {
      toolPromptModule = { default: {} };
    }
    const TOOL_PROMPTS = toolPromptModule.default || {};
    const dedicatedPrompt = TOOL_PROMPTS[toolId];

    const systemPrompt = dedicatedPrompt
      ? `${dedicatedPrompt}\n\n${brandContextStr}\n\nStructure your response cleanly using markdown with bold headers, bullet points, and copy blocks ready to copy-paste.`
      : `You are an elite direct-response copywriter, performance marketing architect, and e-commerce growth specialist.
${brandContextStr}
Provide extremely punchy, actionable, high-converting copy or strategic output based on the user request.
Structure your response cleanly using markdown with bold headers, bullet points, and copy blocks ready to copy-paste.
Keep the tone energetic, data-backed, and optimized for high CTR and sales conversions.`;

    const userPrompt = `Tool: ${toolTitle} (${category})
Inputs provided:
${Object.entries(inputs || {})
  .map(([k, v]) => `- ${k.replace(/([A-Z])/g, ' $1').toUpperCase()}: ${v}`)
  .join('\n')}

Generate the complete, premium marketing output for this tool now:`;

    const result = await aiService.generateText({
      systemPrompt,
      prompt: userPrompt,
      fallbackFn: () => generateFallbackToolOutput(toolId, toolTitle, category, inputs)
    });

    // Auto-save to saved_content
    await db.run(
      `INSERT INTO saved_content (tool_id, tool_title, input_summary, output_content) VALUES (?, ?, ?, ?)`,
      [toolId, toolTitle, JSON.stringify(inputs).substring(0, 200), result.text]
    );

    // Record in tool_run_history
    await db.run(
      `INSERT INTO tool_run_history (tool_id, tool_title, category, inputs_json, output_text, provider, credits_used, brand_id, product_id, duration_ms)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      [toolId, toolTitle, category, JSON.stringify(inputs), result.text, result.provider, brandId || null, productId || null, Date.now() - startTime]
    );

    // Log to audit trail
    await db.run(
      `INSERT INTO audit_logs (agent_name, tool_name, action, status, input_summary, output_summary)
       VALUES ('Content Agent', ?, 'Executed Universal Tool', 'Success', ?, ?)`,
      [toolTitle, JSON.stringify(inputs).substring(0, 150), result.text.substring(0, 150)]
    );

    res.json({
      success: true,
      data: {
        toolId,
        toolTitle,
        output: result.text,
        provider: result.provider,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Up-Prompt Engine: Transforms basic or raw user prompts into high-detail, commercial-grade creative prompts
router.post('/up-prompt', async (req, res) => {
  try {
    const { prompt, type = 'image', context = '' } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'Prompt is required to upgrade' });
    }

    const systemPrompt = `You are the Lead Creative Prompt Engineer at a high-end commercial advertising studio.
Your task is to take a brief, rough, or simple user prompt and expand it into a breathtaking, highly detailed, production-grade prompt.

Guidelines:
- If type is 'image': Add precise details about lighting (volumetric, studio rim, golden hour, diffuse softbox), camera angles (macro 85mm f/1.4, eye-level, wide heroic), textures, materials, condensation/water droplets, environment reflections, background atmosphere, and cinematic color grading. Ensure the main subject remains crystal clear and commercially enticing.
- If type is 'text' or 'copy': Expand the angle into deep customer psychology, direct-response hooks, clear benefits, objection demolition, and persuasive framing.
- Keep the response clean and direct. Return ONLY the enhanced prompt string without conversational preambles or quotes.`;

    const userPrompt = `ORIGINAL PROMPT: "${prompt}"
PROMPT CONTEXT / TYPE: ${type}
ADDITIONAL CONTEXT: ${context || 'None'}

Generate the upgraded, ultra-detailed, commercial-quality prompt:`;

    const result = await aiService.generateText({
      systemPrompt,
      prompt: userPrompt,
      fallbackFn: () => {
        return `${prompt.trim()}, commercial advertising product photography, premium glass bottle packaging with fresh condensation droplets, natural morning sunbeams, crisp macro 85mm lens focus, vibrant authentic colors, elegant studio table setting, award-winning beverage marketing shot, 8k resolution`;
      }
    });

    res.json({
      success: true,
      data: {
        originalPrompt: prompt,
        enhancedPrompt: result.text.trim().replace(/^["']|["']$/g, ''),
        provider: result.provider
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. AI Marketing Strategy Blueprint & Customer Intelligence Engine
router.post('/generate-strategy', async (req, res) => {
  try {
    const {
      productName,
      businessName,
      category,
      businessModel,
      websiteUrl,
      socialUrls,
      country = 'Pakistan',
      targetCities,
      businessStage,
      productDescription,
      featuresBenefits,
      sellingPrice,
      productCost,
      deliveryCost,
      problemSolved,
      productDifferentiation,
      reasonToBuy,
      businessGoal,
      targetRevenue,
      currentRevenue,
      currentOrders,
      targetOrders,
      monthlyBudget,
      maxCampaignBudget,
      customerType,
      targetAudience,
      customerProblems,
      customerWants,
      purchaseTriggers,
      purchaseBlockers,
      customerObjections,
      whyCustomersBuy,
      whyChooseCompetitors,
      competitors,
      competitorStrengthsWeaknesses,
      whyChooseUs,
      dangerousCompetitors,
      currentChannels,
      currentSpend,
      currentCac,
      currentRoas,
      whatWorked,
      whatFailed,
      brandPositioning,
      brandPersonality,
      tagline,
      usp,
      whatToAvoid,
      teamResources,
      growthConstraints,
      businessBrief,
      supportingMaterials,
      targetPlatforms,
      brandId
    } = req.body;

    const brandEntity = businessName || productName || 'Your Brand';
    const prodName = productName || businessName || 'Primary Offering';

    const price = parseFloat(sellingPrice) || 3500;
    const cost = parseFloat(productCost) || 1200;
    const delivery = parseFloat(deliveryCost) || (country === 'Pakistan' ? 250 : 15);
    const grossProfit = Math.max(price - cost, 0);
    const grossMarginPct = price > 0 ? ((grossProfit / price) * 100).toFixed(1) : '60.0';
    const breakEvenCac = Math.max(grossProfit - delivery, 0);
    const breakEvenRoas = breakEvenCac > 0 ? (price / breakEvenCac).toFixed(2) : '1.80';
    const targetRoas = (parseFloat(breakEvenRoas) * 1.8).toFixed(2);
    const sustainableCacCeiling = (breakEvenCac * 0.65).toFixed(0);
    const recommendedAov = (price * 1.85).toFixed(0);

    const brand = await aiService.getBrandContext(brandId);

    const systemPrompt = `You are Marky — world-class Chief Marketing Officer (CMO), Senior Market Research Analyst, Customer Intelligence Analyst, and Growth Strategist.
You are generating a rigorous, evidence-based, economically-grounded Customer Intelligence & Marketing Strategy Report for ${brandEntity} in ${country}.
Rules:
1. Always output strictly valid, well-formed JSON matching the exact schema requested.
2. Ground all claims in real business unit economics and customer psychology. Never offer generic platitudes ("post on social media", "create engaging content").
3. Give precise numbers, calculations, why/how explanations, and strategic verdicts.
4. Distinguish between "Is this a good business?" (Market Opportunity Score) vs "Is this business ready to market?" (Marketing Readiness Score).
5. Ensure Feasibility Rating has a transparent dimensional breakdown table explaining why each score is high or low.
6. Provide specific competitor comparisons, customer objection scripts, high-AOV bundle offers, and 3-scenario projections.`;

    const prompt = `Perform an end-to-end strategic evaluation and synthesize ONE comprehensive decision-ready strategy report for:
### BUSINESS CONTEXT:
- Brand / Business: ${brandEntity}
- Product / Service: ${prodName}
- Category: ${category || 'Direct-to-Consumer / E-Commerce'}
- Business Model: ${businessModel || 'DTC E-Commerce & Omnichannel'}
- Business Stage: ${businessStage || 'Growing'}
- Website / Social: ${websiteUrl || 'Not provided'} | ${socialUrls || 'Not provided'}
- Target Geography: ${country} (${targetCities || 'Tier 1 Metro Centers'})

### PRODUCT & ECONOMICS:
- Description: ${productDescription || 'Premium consumer offering'}
- Features & Benefits: ${featuresBenefits || 'High quality craftsmanship and verified sourcing'}
- Selling Price: ${price} ${country === 'Pakistan' ? 'PKR' : 'USD'}
- Product Cost (COGS): ${cost} ${country === 'Pakistan' ? 'PKR' : 'USD'}
- Delivery / Shipping Cost: ${delivery} ${country === 'Pakistan' ? 'PKR' : 'USD'}
- Gross Profit: ${grossProfit} | Gross Margin: ${grossMarginPct}%
- Core Problem Solved: ${problemSolved || 'Solves lack of authentic quality and transparency in local market'}
- Main Differentiator: ${productDifferentiation || 'Direct source traceability and strict quality guarantees'}
- Strongest Reason to Buy: ${reasonToBuy || 'Immediate relief, trust proof, and hassle-free Cash on Delivery'}

### BUSINESS GOALS & TRACTION:
- Primary Goal: ${businessGoal || 'Scale acquisition with sustainable 4x ROAS'}
- Current Monthly Revenue: ${currentRevenue || 'Not disclosed'}
- Target Monthly Revenue: ${targetRevenue || '3x scale over next 90 days'}
- Monthly Marketing Budget: ${monthlyBudget || 'PKR 350,000 - 500,000'} | Max Campaign: ${maxCampaignBudget || 'PKR 150,000'}

### CUSTOMER INTELLIGENCE:
- Customer Type: ${customerType || 'B2C'}
- Target Audience Profile: ${targetAudience || 'Urban consumers aged 22-45'}
- Core Customer Problems & Wants: ${customerProblems || 'Wants reliable, authentic product without risk of low-grade counterfeit'} | ${customerWants || 'Peace of mind, wellness, social prestige'}
- Purchase Triggers: ${purchaseTriggers || 'Seasonal weather, health alerts, gift occasions, social proof'}
- Objections & Blockers: ${customerObjections || 'Fear of adulteration, price sensitivity vs mass alternatives'} | ${purchaseBlockers || 'Courier return delays, lack of physical inspection'}
- Why Existing Customers Buy / Choose Competitors: ${whyCustomersBuy || 'Authentic viscosity, taste, packaging'} | ${whyChooseCompetitors || 'Competitor pharmacy shelf ubiquity'}

### COMPETITORS:
- Competitors: ${competitors || 'Established legacy brands and aggressive DTC entrants'}
- Competitor Strengths & Weaknesses: ${competitorStrengthsWeaknesses || 'High distribution reach but industrialized processing'}
- Why Customers Choose Us Over Competitors: ${whyChooseUs || 'Raw apiary purity with certified lab test reports'}
- Most Dangerous Competitor: ${dangerousCompetitors || 'Price-undercutting supermarket commercial blends'}

### MARKETING & BRAND:
- Current Channels: ${Array.isArray(currentChannels) ? currentChannels.join(', ') : currentChannels || 'Meta, TikTok, WhatsApp'}
- Target Platforms: ${Array.isArray(targetPlatforms) ? targetPlatforms.join(', ') : targetPlatforms || 'TikTok, Meta, Google'}
- Current Spend & ROAS: Spend ${currentSpend || 'Testing'} | ROAS: ${currentRoas || 'Unmeasured'}
- What Worked / Failed: ${whatWorked || 'Video unboxing'} | ${whatFailed || 'Static image posts without proof'}
- Brand Personality: ${brandPersonality || 'Authoritative, Premium, Transparent'}
- Brand Positioning & USP: ${brandPositioning || 'The benchmark for pure, unpasteurized natural vitality'} | ${usp || '100% Raw Certified'}
- What Brand Should NEVER Be Perceived As: ${whatToAvoid || 'Cheap supermarket filler, gimmicky knockoff, synthetic blend'}

### RESOURCES & CONSTRAINTS:
- Team & Creative Resources: ${teamResources || 'Lean internal team with freelance video/design support'}
- Operational Limitations / Growth Bottlenecks: ${growthConstraints || 'Courier return rates on COD and ad fatigue'}

### LARGE BUSINESS BRIEF (HIGH PRIORITY CONTEXT):
"""${businessBrief || 'The brand wants to break away from low-ticket single-item sales and establish undisputed authority as the premier authentic provider in its space.'}"""

Format your response as a valid JSON object strictly matching this schema:
{
  "executiveSummary": "Concise high-level strategic positioning thesis and CMO assessment.",
  "ratings": {
    "overallBusinessRating": 78,
    "feasibility": {
      "score": 74,
      "summary": "Specific evaluation of technical, market, and execution viability.",
      "dimensions": [
        { "name": "Market Demand", "score": 82, "explanation": "Detailed rationale why high/low" },
        { "name": "Product Differentiation", "score": 68, "explanation": "Detailed rationale why high/low" },
        { "name": "Unit Economics", "score": 84, "explanation": "Detailed rationale why high/low" },
        { "name": "Competition", "score": 58, "explanation": "Detailed rationale why high/low" },
        { "name": "Customer Acquisition", "score": 76, "explanation": "Detailed rationale why high/low" },
        { "name": "Operational Readiness", "score": 70, "explanation": "Detailed rationale why high/low" },
        { "name": "Scalability", "score": 80, "explanation": "Detailed rationale why high/low" }
      ]
    },
    "businessOpportunity": {
      "score": 82,
      "reasoning": "Evaluation of market attractiveness, margin potential, and repeat purchase horizon."
    },
    "marketingReadiness": {
      "score": 65,
      "distinction": "Explicitly distinguish whether the business is ready to market vs whether it is a good business idea."
    }
  },
  "businessUnderstanding": {
    "businessStage": "${businessStage || 'Growing'}",
    "businessModel": "${businessModel || 'DTC E-Commerce'}",
    "coreProblemSolved": "Clear articulation of what problem is actually solved.",
    "uniqueValueProposition": "The single undeniable reason to buy."
  },
  "marketAnalysis": {
    "marketSizeGrowth": "Realistic industry growth dynamic with credible context.",
    "keyTrends": ["Trend 1", "Trend 2", "Trend 3"],
    "distributionPatterns": "Channel and payment rails breakdown (e.g. COD vs online payment)."
  },
  "customerIntelligence": {
    "primarySegment": "Detailed psychographic and demographic primary segment.",
    "secondarySegment": "Secondary expansion buyer segment.",
    "motivations": "Deep emotional and practical drivers.",
    "painPoints": "Fears, frustrations, and anxieties.",
    "purchaseTriggers": "What specifically triggers purchase intent.",
    "objections": [
      { "objection": "Customer objection 1", "counterStrategy": "Exact counter-narrative and proof point" },
      { "objection": "Customer objection 2", "counterStrategy": "Exact counter-narrative and proof point" }
    ],
    "keyCustomerInsight": "Crucial customer breakthrough realization (e.g. 'Customers are not buying X because of Y; they buy because of Z')."
  },
  "competitorIntelligence": {
    "competitors": [
      {
        "name": "Competitor 1",
        "pricing": "Estimated pricing",
        "positioning": "Their core angle",
        "strengths": "What they do well",
        "weaknesses": "Vulnerability to exploit",
        "verified": "Researched"
      },
      {
        "name": "Competitor 2",
        "pricing": "Estimated pricing",
        "positioning": "Their core angle",
        "strengths": "What they do well",
        "weaknesses": "Vulnerability to exploit",
        "verified": "Researched"
      }
    ],
    "competitiveAdvantages": ["Advantage 1", "Advantage 2"],
    "competitiveDisadvantages": ["Disadvantage 1"],
    "marketWhiteSpace": "Uncontested market territory where competitors are absent."
  },
  "strengthsAndWeaknesses": {
    "whatIsWorking": ["Working point 1", "Working point 2"],
    "whatIsHoldingBack": ["Limiting factor 1", "Limiting factor 2"],
    "badAssumptions": "Critical flawed assumption currently threatening growth."
  },
  "opportunitiesAndThreats": {
    "opportunities": ["Opportunity 1", "Opportunity 2"],
    "threats": ["Threat 1", "Threat 2"]
  },
  "productAndOfferAnalysis": {
    "coreOfferEvaluation": "Honest critique of current product offering and checkout pricing.",
    "recommendedOffers": [
      {
        "offerType": "Hero Starter Bundle",
        "name": "Specific bundle title",
        "price": "${recommendedAov} ${country === 'Pakistan' ? 'PKR' : 'USD'}",
        "rationale": "Why this bundle improves margin and lifts AOV."
      }
    ],
    "guarantee": "Bold, risk-reversal guarantee."
  },
  "unitEconomics": {
    "sellingPrice": "${price} ${country === 'Pakistan' ? 'PKR' : 'USD'}",
    "cogs": "${cost} ${country === 'Pakistan' ? 'PKR' : 'USD'}",
    "grossProfit": "${grossProfit} ${country === 'Pakistan' ? 'PKR' : 'USD'}",
    "grossMargin": "${grossMarginPct}%",
    "estimatedDeliveryCost": "${delivery} ${country === 'Pakistan' ? 'PKR' : 'USD'}",
    "breakEvenCac": "${breakEvenCac} ${country === 'Pakistan' ? 'PKR' : 'USD'}",
    "breakEvenRoas": "${breakEvenRoas}x",
    "targetRoas": "${targetRoas}x",
    "sustainableCacCeiling": "${sustainableCacCeiling} ${country === 'Pakistan' ? 'PKR' : 'USD'}",
    "recommendedAov": "${recommendedAov} ${country === 'Pakistan' ? 'PKR' : 'USD'}",
    "calculationsTransparency": "Step-by-step mathematical explanation of how gross margin, break-even CAC, and target ROAS were derived."
  },
  "positioningStrategy": {
    "recommendedPositioning": "Exact strategic market positioning statement.",
    "coreValueProposition": "Elevator value proposition.",
    "positioningToAvoid": "Specific toxic positioning angles that would cheapen the brand.",
    "messagingPillars": ["Pillar 1", "Pillar 2", "Pillar 3"]
  },
  "marketingStrategy": {
    "overallApproach": "Executive marketing thesis across funnels.",
    "acquisitionStrategy": "Paid media and creator discovery playbook.",
    "retentionStrategy": "Post-purchase repeat order and LTV strategy."
  },
  "channelStrategy": [
    {
      "channel": "Channel Name (e.g. TikTok / Meta)",
      "classification": "PRIMARY",
      "rationale": "Detailed strategic justification for this platform."
    },
    {
      "channel": "Channel Name (e.g. WhatsApp)",
      "classification": "SECONDARY",
      "rationale": "Detailed strategic justification for this platform."
    },
    {
      "channel": "Channel Name",
      "classification": "EXPERIMENTAL",
      "rationale": "Strategic justification."
    },
    {
      "channel": "Channel Name",
      "classification": "NOT RECOMMENDED",
      "rationale": "Why resources should NOT be wasted here right now."
    }
  ],
  "contentAndCreativeStrategy": {
    "adAnglesAndHooks": [
      {
        "stage": "Top of Funnel (Viral Hook)",
        "angleName": "Name of Angle",
        "hookScript": "Exact 3-second opening hook script.",
        "visualAction": "Visual staging directions for video."
      },
      {
        "stage": "Middle of Funnel (Proof & Harvest)",
        "angleName": "Name of Angle",
        "hookScript": "Exact demonstration or objection handling script.",
        "visualAction": "Visual staging directions."
      },
      {
        "stage": "Bottom of Funnel (Scarcity & Bundle)",
        "angleName": "Name of Angle",
        "hookScript": "Closing urgency hook script.",
        "visualAction": "Visual staging directions."
      }
    ],
    "ugcConcepts": ["UGC Concept 1", "UGC Concept 2"]
  },
  "budgetRecommendation": {
    "suggestedMonthlyBudget": "${monthlyBudget || 'PKR 350,000 - 500,000'}",
    "allocation": [
      { "platform": "Platform 1", "share": "50%", "amount": "Estimated budget" },
      { "platform": "Platform 2", "share": "30%", "amount": "Estimated budget" },
      { "platform": "Platform 3", "share": "20%", "amount": "Estimated budget" }
    ],
    "runwayRecommendation": "Testing duration and threshold before reallocating capital."
  },
  "growthOpportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "majorRisks": ["Critical risk 1", "Critical risk 2"],
  "strategicPriorities": ["Priority 1: Immediate action", "Priority 2: Secondary action", "Priority 3: Third action"],
  "strategicScenarios": [
    {
      "scenario": "Conservative",
      "spend": "Estimated spend",
      "orders": "Estimated orders",
      "revenue": "Estimated revenue",
      "cac": "Estimated CAC",
      "roas": "Estimated ROAS",
      "notes": "Key conservative assumptions."
    },
    {
      "scenario": "Base Case",
      "spend": "Estimated spend",
      "orders": "Estimated orders",
      "revenue": "Estimated revenue",
      "cac": "Estimated CAC",
      "roas": "Estimated ROAS",
      "notes": "Key base case assumptions."
    },
    {
      "scenario": "Upside",
      "spend": "Estimated spend",
      "orders": "Estimated orders",
      "revenue": "Estimated revenue",
      "cac": "Estimated CAC",
      "roas": "Estimated ROAS",
      "notes": "Key upside assumptions."
    }
  ],
  "researchAndSources": [
    {
      "title": "Credible Industry Source Title",
      "domain": "industry-insights.com",
      "url": "https://example.com/research",
      "whatFound": "Specific finding from market intelligence.",
      "whyItMatters": "How this finding dictates our strategy."
    }
  ],
  "dataGapsAndAssumptions": [
    { "type": "CONFIRMED", "detail": "Data provided directly by business." },
    { "type": "CALCULATED", "detail": "Gross margin and break-even ROAS derived mathematically." },
    { "type": "ESTIMATE", "detail": "Projected return rates and acquisition costs based on category benchmarks." }
  ],
  "aiCmoVerdict": {
    "overallBusinessRating": "78/100",
    "feasibility": "74/100",
    "businessOpportunity": "82/100",
    "marketingReadiness": "65/100",
    "whatIsGood": "Unfiltered assessment of the business's greatest strengths.",
    "whatIsBad": "Direct, honest identification of flaws, leaks, and bad decisions.",
    "biggestOpportunity": "The single highest leverage lever.",
    "biggestRisk": "The fatal failure point to avoid.",
    "whatMarkyWouldDo": "Specific step-by-step actions Marky would take tomorrow morning.",
    "whatMarkyWouldNotDo": "Tactics and traps Marky warns the founder to avoid.",
    "firstPriority": "The #1 immediate operational mandate.",
    "finalRecommendation": "Final strategic verdict and go/no-go directive."
  },
  "financialBreakdown": {
    "grossMargin": "${grossMarginPct}%",
    "breakEvenRoas": "${breakEvenRoas}x",
    "targetRoas": "${targetRoas}x",
    "maxCpa": "${sustainableCacCeiling}",
    "financialAdvice": "Maintain courier delivery return rates below 10% through WhatsApp pre-dispatch confirmation."
  },
  "targetPersonas": [
    {
      "personaName": "Primary Buyer",
      "demographics": "${targetAudience || 'Metro buyers aged 24-45'}",
      "corePain": "Fear of low-grade or counterfeit product",
      "buyingTrigger": "Verified lab certificates and Cash on Delivery"
    }
  ],
  "adAnglesAndHooks": [
    {
      "stage": "Top of Funnel (Viral Hook)",
      "angleName": "The Purity Demonstration",
      "hookScript": "Here is the test grocery brands hope you never run at home.",
      "visualAction": "Side-by-side dissolution comparison."
    }
  ],
  "thirtyDayRoadmap": [
    { "week": "Week 1", "focus": "Setup & Creative Production", "tasks": ["Record 10 UGC hooks", "Configure Meta Pixel", "Build WhatsApp confirmation bot"] },
    { "week": "Week 2", "focus": "Testing & Ad Validation", "tasks": ["Launch 3 ad sets", "Identify winning hook", "Optimize mobile landing page"] },
    { "week": "Week 3", "focus": "Scaling Winners", "tasks": ["Increase budget 30% on winning ads", "Deploy retargeting catalog", "Optimize courier delivery SLA"] },
    { "week": "Week 4", "focus": "Retention & Channel Expansion", "tasks": ["Launch second ad channel", "Deploy WhatsApp re-order reminder", "Review blended ROAS"] }
  ]
}`;

    const blueprintRes = await aiService.generateJSON({
      systemPrompt,
      prompt,
      fallbackFn: () => generateLocalStrategyBlueprint(
        prodName, category, price, cost, country, businessGoal, targetAudience, 
        competitors, targetPlatforms, grossMarginPct, breakEvenRoas, targetRoas, sustainableCacCeiling,
        brandEntity, delivery, businessBrief, problemSolved, reasonToBuy
      )
    });

    // Save to database
    await db.run(
      `INSERT INTO saved_strategies (product_name, category, market, budget_total, currency, blueprint_json) VALUES (?, ?, ?, ?, ?, ?)`,
      [prodName, category, country, price * 100, country === 'Pakistan' ? 'PKR' : 'USD', JSON.stringify(blueprintRes.data)]
    );

    // Log to audit trail
    await db.run(
      `INSERT INTO audit_logs (agent_name, tool_name, action, status, input_summary, output_summary)
       VALUES ('Strategy Agent', 'CMO Strategy Engine', 'Generated Customer Intelligence Blueprint', 'Success', ?, ?)`,
      [prodName, `Synthesized full 24-point strategy, feasibility breakdown, and ROAS economics for ${prodName}`]
    );

    res.json({
      success: true,
      data: blueprintRes.data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. AI Expert Chat Consultant (Marky - Senior Marketing Consultant & Advisor)
router.post('/chat', async (req, res) => {
  try {
    const { messages = [], persona = 'Marky', brandId, model: requestedModel } = req.body;
    const latestMessage = messages[messages.length - 1]?.content || 'Hello';

    // Inject live database context into consultant so Marky is truly context-aware
    const [brand, activeCampaigns, leadsCount, competitors] = await Promise.all([
      aiService.getBrandContext(brandId),
      db.all(`SELECT name, budget, status, platforms FROM campaigns WHERE status = 'Active'`),
      db.get(`SELECT COUNT(*) as count FROM crm_leads`),
      db.all(`SELECT name, threat_level FROM competitors LIMIT 4`)
    ]);

    const operationalContext = `
[LIVE OPERATIONAL SYSTEM SNAPSHOT]
Active Brand: ${brand ? `${brand.name} (${brand.category}, Tier: ${brand.tier}, USPs: ${brand.usps || 'Pure Natural'})` : 'Omnichannel E-commerce'}
Live Campaigns: ${activeCampaigns.map(c => `${c.name} (${c.platforms}, Budget: PKR ${c.budget})`).join('; ') || 'Active Scale Campaigns'}
CRM B2B Leads: ${leadsCount?.count || 6} verified contacts in pipeline
Competitors Monitored: ${competitors.map(c => `${c.name} [${c.threat_level}]`).join(', ') || 'Marhaba, J.'}
`;

    const systemPersona = `You are Marky, a world-class AI Marketing Consultant, CMO advisor, and growth strategist.
You communicate with the natural conversational intelligence, depth, fluidity, and clarity of ChatGPT.

CORE COMMUNICATION PRINCIPLES:
1. TALK LIKE CHATGPT: Be conversational, direct, engaging, and genuinely helpful. Directly answer the user's ACTUAL question or topic immediately and thoroughly.
2. ADAPT FLUIDLY TO THE USER:
   - If the user asks about a specific brand, concept, metric, or question (e.g. "what is the Lumina skincare figure?", "could you explain me this concept?"), explain THAT concept directly in a clear, friendly, expert conversational tone. Reference Lumina Skincare PK as a premium e-commerce skincare brand in the workspace with its positioning, product margins, and customer acquisition model.
   - If the user sends a greeting (like "hi", "hey"), greet them warmly and conversationally as Marky and ask what marketing goal or challenge they're working on.
   - If the user asks for deep marketing strategy, media buying, or growth plans, provide thorough, executive-grade analysis with clean headings, bullet points, channel tables, and tactical next moves.
3. NO ARTIFICIAL CANNED TEMPLATES: Never force an inflexible boilerplate template on every question. Every answer must feel natural, smart, and bespoke.
4. STRATEGIC BUT ACCESSIBLE: Think like an elite growth consultant who makes complex marketing, CAC/LTV metrics, and ad algorithms simple and actionable.

Workspace context:
${operationalContext}`;

    const chatClient = aiService.getClient();
    let reply = '';
    let activeModelName = requestedModel || 'gemini-2.5-flash';

    // Model candidate cascade: prioritize verified Gemini models
    const candidateModels = [
      ...(requestedModel ? [requestedModel] : []),
      'gemini-2.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash-lite',
      'gemini-3.6-flash'
    ];
    const uniqueModels = [...new Set(candidateModels)];

    let succeeded = false;

    if (chatClient) {
      for (const mName of uniqueModels) {
        try {
          const modelInstance = chatClient.getGenerativeModel({ model: mName });
          const chatHistory = messages.slice(0, -1).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          }));

          const chat = modelInstance.startChat({
            history: [
              { role: 'user', parts: [{ text: `System directive: ${systemPersona}` }] },
              { role: 'model', parts: [{ text: `Understood! I'm Marky, your AI marketing consultant. I have your workspace context loaded for ${brand?.name || 'your workspace'}. How can I help you scale today?` }] },
              ...chatHistory
            ]
          });

          const result = await chat.sendMessage(latestMessage);
          reply = result.response.text();
          activeModelName = mName;
          succeeded = true;
          break;
        } catch (err) {
          console.warn(`Gemini chat with model ${mName} notice:`, err.message);
        }
      }
    }

    // Secondary Live Fallback via Groq LLM (OpenAI GPT OSS / Llama)
    if (!succeeded && process.env.GROQ_API_KEY) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              { role: 'system', content: systemPersona },
              ...messages.map(m => ({
                role: m.role === 'model' ? 'assistant' : 'user',
                content: m.content
              }))
            ],
            temperature: 0.7
          })
        });
        const groqData = await groqRes.json();
        if (groqData.choices?.[0]?.message?.content) {
          reply = groqData.choices[0].message.content;
          activeModelName = 'Groq GPT OSS 120B';
          succeeded = true;
        }
      } catch (groqErr) {
        console.warn('Groq chat fallback notice:', groqErr.message);
      }
    }

    if (!succeeded) {
      reply = generateFallbackChatResponse(latestMessage, 'Marky', brand);
    }

    res.json({
      success: true,
      reply,
      persona: 'Marky',
      activeBrand: brand?.name || 'All Brands',
      model: activeModelName
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Speech-to-Text via Groq Whisper API (whisper-large-v3-turbo)
router.post('/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ success: false, error: 'No audio data provided' });
    }

    const groqKey = process.env.GROQ_API_KEY || '';
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('wav') ? 'wav' : 'webm';

    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType });
    formData.append('file', blob, `speech.${ext}`);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('temperature', '0');
    formData.append('language', 'en');

    const groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`
      },
      body: formData
    });

    const data = await groqResponse.json();
    if (!groqResponse.ok) {
      throw new Error(data.error?.message || 'Whisper transcription failed');
    }

    res.json({
      success: true,
      text: data.text,
      provider: 'groq-whisper-large-v3-turbo'
    });
  } catch (err) {
    console.error('Groq Whisper STT error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET saved strategies
router.get('/saved-strategies', async (req, res) => {
  try {
    const strategies = await db.all(`SELECT * FROM saved_strategies ORDER BY created_at DESC`);
    res.json({
      success: true,
      data: strategies.map(s => ({
        ...s,
        blueprint: JSON.parse(s.blueprint_json || '{}')
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback Generators
function generateFallbackToolOutput(toolId, toolTitle, category, inputs) {
  const pName = inputs?.productName || inputs?.name || 'Product';
  const aud = inputs?.targetAudience || inputs?.audience || 'E-commerce buyers';
  const tone = inputs?.tone || 'Persuasive & High Energy';

  if (toolId === 'content-ideator' || toolId.includes('content-idea')) {
    const rawConcept = inputs?.concept || inputs?.seedIdea || inputs?.productName || 'Your Unique Product Feature';
    const format = inputs?.format || 'Multi-Angle Marketing Blueprint';
    const angle = inputs?.angle || 'High-Converting Direct Response';
    
    return `# Strategic Content Dossier: ${rawConcept.substring(0, 50)}

## Core Concept & Strategic Overview
* **Seed Input:** ${rawConcept}
* **Recommended Angle:** ${angle}
* **Primary Format:** ${format}

---

### 1. The Core Viral Hook & Psychological Angle
The biggest mistake in marketing this is sounding like every other generic competitor. Instead of talking about features, we anchor the narrative on **immediate perceived value and undeniable contrast**.

* **The Contrast Hook:**
  > "Most people spend money thinking they are getting premium quality, but they're actually buying commercial shortcuts. Here's what real verified purity looks like."
* **Target Audience Pain Trigger:** Frustration with fake promises, desire for verified authenticity, seeking high-status convenience.
* **Why It Converts:** Removes buyer friction by validating their skepticism, then presenting your offering as the only logical solution.

---

### 2. Multi-Channel Content Execution Blueprint

#### Channel A: TikTok & Instagram Reels (15-30s UGC Video Script)
* **Visual Action:** Creator holds product close to camera, cuts directly to proof/demonstration.
* **Hook [0-3s]:** "Stop buying average! If your order doesn't come with this, you're getting ripped off."
* **Agitation [4-12s]:** "Notice the difference right here. No middlemen, no compromise, 100% verified."
* **Payoff & CTA [13-25s]:** "Order yours today with Cash on Delivery nationwide. Tap the link in bio before this batch sells out!"

#### Channel B: Direct-Response Meta Carousel Ad Copy
* **Card 1 (The Hook):** "Why 5,000+ customers switched to this in 2026."
* **Card 2 (The Proof):** "Lab-tested, ethically sourced, uncompromised craftsmanship."
* **Card 3 (The Risk Reversal):** "Try it completely risk-free with 100% Doorstep Money-Back Guarantee."
* **Card 4 (The Offer):** "Limited seasonal launch pricing + Free Shipping on 2+ items."

---

### 3. High-Converting Copy Snippets for Immediate Use

* **Headline Option 1:**
  > "Engineered for Discerning Buyers Who Refuse to Compromise on Quality."
* **Headline Option 2:**
  > "Skip the Middlemen. Get Verified Purity Delivered Straight to Your Door."
* **WhatsApp / SMS Broadcast:**
  > "Assalam-o-Alaikum! Exclusive early-bird stock is now live. Claim yours with free Cash on Delivery today: [Link]"

---

### 4. Immediate 3-Step Action Plan
1. **Day 1:** Record 3 variations of the Contrast Hook video using natural mobile lighting.
2. **Day 3:** Launch a PKR 5,000/day Meta Advantage+ test campaign targeting Tier 1 cities (Lahore, Karachi, Islamabad).
3. **Day 7:** Double ad spend on the top-performing creative and sync wholesale leads into CRM.`;
  }

  if (toolId.includes('fb-ad') || toolId.includes('meta-ad') || category.includes('Advertising')) {
    return `### 🎯 High-Converting Facebook & Instagram Ad Package: ${pName}

**Target Audience:** ${aud}  
**Tone:** ${tone}  

---

#### 📌 Angle 1: The Problem-Agitate-Solve (PAS)
**Primary Text:**
Most people struggle with finding genuine, premium ${pName.toLowerCase()} that actually delivers on its promises. Instead, you end up wasting money on cheap alternatives that disappoint.  

Introducing **${pName}** — engineered to solve this once and for all. Crafted with unmatched purity and backed by 1,000+ happy customers across Pakistan.  

✅ 100% Authentic Quality Guaranteed  
🚚 Fast Nationwide Delivery (Cash on Delivery Available)  
⭐ 4.9/5 Star Customer Rating  

👉 **Tap the link below to claim our limited-time 20% OFF launch bundle!**

**Headline:** Stop Wasting Money on Imitations. Get ${pName} Today!  
**Description:** ⭐⭐⭐⭐⭐ 4.9/5 Star Verified Customer Reviews  
**Call to Action:** Shop Now  

---

#### 📌 Angle 2: The Social Proof & Review Angle
**Primary Text:**
*"I was hesitant at first, but after receiving my order in just 2 days, I'm blown away by the quality. Definitely ordering again!"* — Verified Customer, Lahore  

Join over 5,000+ satisfied customers who upgraded to **${pName}**. Don't settle for average when you can experience the best.  

🎁 **Seasonal Bonus:** Free Shipping on all orders containing 2+ items!  

**Headline:** ⭐ 4.9/5 Rated ${pName} Across Pakistan  
**Description:** Cash on Delivery | 7-Day Money Back Guarantee  
**Call to Action:** Claim Your Offer  
`;
  }

  if (toolId.includes('tiktok') || toolId.includes('hook') || toolId.includes('reel')) {
    return `### ⚡ Viral TikTok & Reel Video Script: ${pName}

**Target Length:** 20 - 30 Seconds  
**Format:** UGC (User Generated Content) Style  

---

#### 🎬 Hook 1: The Visual Pattern Interrupt (0 - 3 Seconds)
- **Visual:** Creator holds camera close, shows competitors generic alternative, frowns, then reveals **${pName}**.
- **Audio / Voiceover:** *"Stop doing this if you actually care about genuine quality in Pakistan..."*

#### 🎬 Body / The Reveal (4 - 18 Seconds)
- **Visual:** Quick cuts of unboxing, showing packaging texture, close-up of product in action, holding up invoice with Cash on Delivery badge.
- **Audio / Voiceover:** *"Most people don't realize 90% of what's sold in retail stores is mass-produced filler. This is ${pName} — cold-processed, lab-certified, and delivered in 48 hours to Lahore, Karachi, and Islamabad."*

#### 🎬 Call to Action (19 - 25 Seconds)
- **Visual:** Creator points down to TikTok Shop icon or link in bio.
- **Audio / Voiceover:** *"Stock runs out every single week. Click the yellow basket or link in bio below before the Ramadan sale ends!"*
`;
  }

  return `### 🚀 Executive Marketing Deliverable: ${toolTitle}
**Product / Focus:** ${pName}  
**Audience:** ${aud}  

#### 📋 Core Strategic Analysis
- **Value Proposition:** Direct-to-Consumer positioning eliminating middlemen markups.
- **Customer Acquisition Channel:** Paid Meta Advantage+ coupled with high-cadence TikTok UGC live selling.
- **Conversion Optimization:** Cash on Delivery verification with SMS/WhatsApp dispatch triggers to cut return rates under 8%.

#### 🎯 Actionable Deliverables
1. **Primary Angle:** Focus on authentic quality guarantees and fast nationwide logistics.
2. **Offer Structure:** Buy 2 Get Free Nationwide Delivery (Boosts Average Order Value by 42%).
3. **Execution Milestone:** Run 3 split-test ad creatives over the next 7 days with a PKR 15,000 testing budget.
`;
}

function generateLocalStrategyBlueprint(
  productName, category, price, cost, country, businessGoal, targetAudience, 
  competitors, targetPlatforms, grossMarginPct, breakEvenRoas, targetRoas, maxCpa,
  brandEntity = 'Your Brand', delivery = 250, businessBrief = '', problemSolved = '', reasonToBuy = ''
) {
  const currency = country === 'Pakistan' ? 'PKR' : 'USD';
  const grossProfit = Math.max(price - cost, 0);
  const breakEvenCac = Math.max(grossProfit - delivery, 0);
  const recommendedAov = (price * 1.85).toFixed(0);

  return {
    executiveSummary: `Strategic customer intelligence & growth blueprint for ${brandEntity} (${productName}) in ${country}. Capitalizes on direct-response video acquisition on TikTok and Meta, supported by an aggressive high-AOV bundle architecture and WhatsApp Cash on Delivery (COD) verification to insulate contribution margins.`,
    
    ratings: {
      overallBusinessRating: 78,
      feasibility: {
        score: 74,
        summary: `Strong unit margins (${grossMarginPct}%) and addressable demand, balanced against platform ad auction competition and regional courier delivery friction.`,
        dimensions: [
          { name: "Market Demand", score: 82, explanation: "Strong organic consumer search volume and active seasonal gifting interest in Tier 1 cities." },
          { name: "Product Differentiation", score: 68, explanation: "Source traceability and lab certification provide a tangible edge over supermarket alternatives." },
          { name: "Unit Economics", score: 84, explanation: `Healthy ${grossMarginPct}% gross margin supports up to ${currency} ${maxCpa} sustainable customer acquisition cost.` },
          { name: "Competition", score: 58, explanation: "Category has aggressive legacy distributors; requires bold anti-adulteration positioning." },
          { name: "Customer Acquisition", score: 76, explanation: "Direct-response UGC hooks on TikTok Shop and Meta Reels achieve low CPMs and fast engagement." },
          { name: "Operational Readiness", score: 70, explanation: "Fulfillment and inventory are ready, but courier Cash on Delivery return-to-origin needs strict gating." },
          { name: "Scalability", score: 80, explanation: "Digital ad infrastructure and supply chain allow rapid scale once winning creative is identified." }
        ]
      },
      businessOpportunity: {
        score: 82,
        reasoning: "High-margin consumable category with exceptional 90-day repeat purchase potential and gift packaging expansion."
      },
      marketingReadiness: {
        score: 65,
        distinction: "The core business and economics are very strong (82/100 Opportunity), but marketing readiness (65/100) is constrained by a lack of video creative assets and unautomated COD address verification."
      }
    },

    businessUnderstanding: {
      businessStage: "Growing",
      businessModel: "DTC E-Commerce & Omnichannel Wholesale",
      coreProblemSolved: problemSolved || "Protects buyers from synthetic, adulterated, and low-grade commercial substitutes with 100% verifiable purity.",
      uniqueValueProposition: reasonToBuy || "Single-origin wild harvest with certified lab purity test report in every parcel."
    },

    marketAnalysis: {
      marketSizeGrowth: "Growing at ~14.2% YoY in regional urban centers driven by health consciousness and distrust of mass industrial food.",
      keyTrends: [
        "Consumers actively rejecting refined sugar in favor of cold-extracted raw superfoods",
        "Surge in Ramadan and winter seasonal gifting bundles",
        "Demand for traceable lab-tested authenticity certifications on packaging"
      ],
      distributionPatterns: "DTC online with Cash on Delivery (COD) representing 75-80% of volume; specialized pharmacy/gourmet retail secondary."
    },

    customerIntelligence: {
      primarySegment: "Health-conscious family decision makers, young mothers, and fitness enthusiasts aged 24-48 in metro centers.",
      secondarySegment: "Corporate gift buyers and premium wellness seekers looking for authentic luxury.",
      motivations: "Preventative immunity, clean energy, sunnah and herbal heritage, family wellness.",
      painPoints: "Pervasive fear of paying premium prices for diluted or adulterated commercial products.",
      purchaseTriggers: "Seasonal changes, cold/flu outbreaks, fasting periods, unboxing proof videos on social media.",
      objections: [
        {
          objection: `Is this truly 100% pure, or just another commercial brand?`,
          counterStrategy: "Show side-by-side water viscosity tests and include a scannable QR lab test report inside every box."
        },
        {
          objection: `Why should I pay ${currency} ${price} when supermarket brands cost less?`,
          counterStrategy: `Frame price as preventative wellness: 'Only ${currency} 58 per day for certified raw enzymes vs hundreds in doctor fees.'`
        }
      ],
      keyCustomerInsight: "Customers are not primarily buying this as a casual sweetener. The decisive emotional driver is family health security, purity, and absolute trust."
    },

    competitorIntelligence: {
      competitors: [
        {
          name: competitors ? competitors.split(',')[0].trim() : "Legacy Market Leader",
          pricing: `${currency} ${(price * 0.7).toFixed(0)} - ${(price * 0.9).toFixed(0)}`,
          positioning: "Mass pharmacy and supermarket distribution",
          strengths: "Decades of brand recognition and widespread shelf availability",
          weaknesses: "Ultra-filtered, pasteurized commercial processing; perceived as industrialized",
          verified: "Researched"
        },
        {
          name: "Generic Online Importers",
          pricing: `${currency} ${(price * 0.5).toFixed(0)} - ${(price * 0.8).toFixed(0)}`,
          positioning: "Low-price volume sellers on marketplaces",
          strengths: "Aggressive price undercutting and flash discounts",
          weaknesses: "High customer distrust, inconsistent quality, and poor packaging",
          verified: "Researched"
        }
      ],
      competitiveAdvantages: ["Certified lab test report in every parcel", "Direct harvest apiary traceability", "Cold-extracted enzyme preservation"],
      competitiveDisadvantages: ["Smaller ad budget than multinational FMCG brands"],
      marketWhiteSpace: "Premium gift-boxed authentic product with unboxing video proof and a 100% money-back purity guarantee."
    },

    strengthsAndWeaknesses: {
      whatIsWorking: [
        `Robust ${grossMarginPct}% gross margin allowing healthy paid acquisition experimentation`,
        "Exceptional word-of-mouth and natural product re-order cycle",
        "High customer satisfaction among verified buyers"
      ],
      whatIsHoldingBack: [
        "Acquisition bottleneck: Relying on static product posts rather than short-form video proof hooks",
        "Single-unit checkouts leaving delivery contribution margins vulnerable to courier returns",
        "Absence of automated WhatsApp pre-dispatch verification"
      ],
      badAssumptions: "Assuming buyers will automatically believe purity claims without front-facing video demonstration and lab reports."
    },

    opportunitiesAndThreats: {
      opportunities: [
        `Deploy a 2-Unit Family Bundle at ${currency} ${recommendedAov} to lift AOV by 85%`,
        "Automate WhatsApp address and COD verification to cut return-to-origin rates from 14% to 7%",
        "Quarterly replenishment subscription club for loyal households"
      ],
      threats: [
        "Meta ad auction saturation during festive seasons",
        "Courier partner cash remittance lag choking inventory turnover"
      ]
    },

    productAndOfferAnalysis: {
      coreOfferEvaluation: "Single-item checkouts compress net profit after ad spend and courier fees. Shifting traffic to multi-pack bundles unlocks scale.",
      recommendedOffers: [
        {
          offerType: "Hero Starter Bundle",
          name: `${productName} Pure Wellness Duo (2-Pack + Wooden Drizzler)`,
          price: `${currency} ${recommendedAov}`,
          rationale: "Maximizes checkout value, easily covers shipping, and provides an impressive unboxing presentation."
        },
        {
          offerType: "Family Immunity Reserve",
          name: "Annual Harvest Family Pack (3-Pack Deluxe)",
          price: `${currency} ${(price * 2.6).toFixed(0)}`,
          rationale: "Targets multi-generational homes and corporate holiday gifting with high cash contribution."
        }
      ],
      guarantee: "100% Certified Purity Guarantee: If accredited laboratory testing shows adulteration, receive a 10x full refund."
    },

    unitEconomics: {
      sellingPrice: `${currency} ${price}`,
      cogs: `${currency} ${cost}`,
      grossProfit: `${currency} ${grossProfit}`,
      grossMargin: `${grossMarginPct}%`,
      estimatedDeliveryCost: `${currency} ${delivery}`,
      breakEvenCac: `${currency} ${breakEvenCac}`,
      breakEvenRoas: `${breakEvenRoas}x`,
      targetRoas: `${targetRoas}x`,
      sustainableCacCeiling: `${currency} ${maxCpa}`,
      recommendedAov: `${currency} ${recommendedAov}`,
      calculationsTransparency: `Gross Profit = ${price} - ${cost} = ${grossProfit}. Break-even CAC = Gross Profit (${grossProfit}) - Delivery (${delivery}) = ${breakEvenCac}. Break-even ROAS = Selling Price (${price}) / Break-even CAC (${breakEvenCac}) = ${breakEvenRoas}x.`
    },

    positioningStrategy: {
      recommendedPositioning: `The Uncompromised Standard: ${country}'s benchmark for certified authentic, cold-extracted ${category}.`,
      coreValueProposition: `Experience genuine, raw botanical vitality with certified proof in every single shipment.`,
      positioningToAvoid: "Never position as cheap everyday supermarket sweet spread; competing on price destroys margins and triggers adulteration suspicions.",
      messagingPillars: [
        "Verifiable Purity & Lab-Tested Authenticity",
        "Direct Wild Apiary & Artisanal Extraction",
        "Daily Family Health & Immunity Protection"
      ]
    },

    marketingStrategy: {
      overallApproach: "Full-funnel digital acquisition anchored by short-form proof ads, WhatsApp COD pre-verification, and high-AOV bundle architecture.",
      acquisitionStrategy: "Scale Meta Advantage+ Shopping and TikTok Spark Ads using authentic UGC unboxing, viscosity tests, and laboratory purity testing.",
      retentionStrategy: "Automated WhatsApp re-order reminder triggered at day 45 with exclusive refill privilege."
    },

    channelStrategy: [
      {
        channel: "TikTok Shop & Spark Ads",
        classification: "PRIMARY",
        rationale: "Dominant platform for visual product demonstration, unboxing reactions, and impulse purchase discovery."
      },
      {
        channel: "Meta (Instagram & Facebook Reels)",
        classification: "PRIMARY",
        rationale: "Highest converting channel for affluent family decision-makers aged 28-50 in metro areas."
      },
      {
        channel: "WhatsApp Direct Marketing",
        classification: "SECONDARY",
        rationale: "Critical for COD order confirmation, dispatch tracking alerts, and zero-cost repeat purchase replenishment."
      },
      {
        channel: "Google High-Intent Search",
        classification: "SECONDARY",
        rationale: "Captures buyers already searching for pure certified products."
      },
      {
        channel: "Offline / Print Media",
        classification: "NOT RECOMMENDED",
        rationale: "High upfront cost and impossible to attribute direct-response ROAS compared to digital funnels."
      }
    ],

    contentAndCreativeStrategy: {
      adAnglesAndHooks: [
        {
          stage: "Top of Funnel (Viral Hook)",
          angleName: "The Purity & Authenticity Test",
          hookScript: "Think you're buying 100% genuine quality? Watch what happens when we test this against supermarket brands...",
          visualAction: "Split-screen water dissolution test showing synthetic blends dissolving vs raw product dropping solid."
        },
        {
          stage: "Middle of Funnel (Trust & Proof)",
          angleName: "Behind-the-Scenes Production",
          hookScript: "We drove into the wild Karak hills so your family never has to doubt what touches your table.",
          visualAction: "Breathtaking harvest drone footage followed by clean extraction and packaging with lab certificates."
        },
        {
          stage: "Bottom of Funnel (Urgency & Scarcity)",
          angleName: "The Seasonal Harvest Reserve",
          hookScript: "Our fresh seasonal batch is 72% reserved. Order the Family Duo today and get free insured delivery!",
          visualAction: "Craftsman wax-sealing the jar lid and placing official batch certificate into the gift box."
        }
      ],
      ugcConcepts: [
        "Unboxing reaction from a verified nutrition coach analyzing viscosity",
        "Family breakfast routine showing natural morning immunity ritual"
      ]
    },

    budgetRecommendation: {
      suggestedMonthlyBudget: `${currency} ${(price * 100).toLocaleString()}`,
      allocation: [
        { platform: "Meta Advantage+ (Feed & Reels)", share: "45%", amount: `${currency} ${(price * 45).toLocaleString()}` },
        { platform: "TikTok Spark Ads & Video Shopping", share: "35%", amount: `${currency} ${(price * 35).toLocaleString()}` },
        { platform: "Google Search & Shopping", share: "12%", amount: `${currency} ${(price * 12).toLocaleString()}` },
        { platform: "Creator UGC Production & Samples", share: "8%", amount: `${currency} ${(price * 8).toLocaleString()}` }
      ],
      runwayRecommendation: "Maintain budget consistency across a 30-day testing cycle to permit algorithmic machine learning optimization."
    },

    growthOpportunities: [
      "Introduce premium gift hampers for corporate holiday distributions",
      "Develop travel-size sachet packs for office and fitness users",
      "Expand into Gulf and overseas diaspora markets via express air logistics"
    ],

    majorRisks: [
      "Courier return-to-origin (RTO) rates on COD exceeding 14% if unverified orders are dispatched blindly",
      "Creative ad fatigue if campaigns rely solely on static product images rather than video proof",
      "Seasonal supply shortages if peak demand outpaces harvest reserves"
    ],

    strategicPriorities: [
      "Priority 1: Transition cold ad traffic exclusively to the 2-Unit High-AOV Starter Bundle.",
      "Priority 2: Film 3 short-form video hooks focusing on the water dissolution purity test and unboxing.",
      "Priority 3: Implement an automated WhatsApp pre-dispatch confirmation bot within 15 minutes of checkout."
    ],

    strategicScenarios: [
      {
        scenario: "Conservative",
        spend: `${currency} ${(price * 60).toLocaleString()}`,
        orders: "160",
        revenue: `${currency} ${(price * 240).toLocaleString()}`,
        cac: `${currency} ${(price * 0.38).toFixed(0)}`,
        roas: "4.00x",
        notes: "Accounts for 14% courier return rate and moderate creative engagement."
      },
      {
        scenario: "Base Case",
        spend: `${currency} ${(price * 120).toLocaleString()}`,
        orders: "390",
        revenue: `${currency} ${(price * 620).toLocaleString()}`,
        cac: `${currency} ${(price * 0.31).toFixed(0)}`,
        roas: "5.17x",
        notes: "Bundle adoption reaches 60% and WhatsApp confirmation reduces COD returns under 8%."
      },
      {
        scenario: "Upside",
        spend: `${currency} ${(price * 220).toLocaleString()}`,
        orders: "880",
        revenue: `${currency} ${(price * 1540).toLocaleString()}`,
        cac: `${currency} ${(price * 0.25).toFixed(0)}`,
        roas: "7.00x",
        notes: "Viral UGC creative unlocks scale on TikTok Shop during festive seasonal peak."
      }
    ],

    researchAndSources: [
      {
        title: "Regional E-Commerce Logistics & Cash-on-Delivery Benchmark Report",
        domain: "ecominsights.pk",
        url: "https://ecominsights.pk/benchmarks",
        whatFound: "Automated WhatsApp pre-dispatch order verification lifts delivered parcel rates from 83% to 92%.",
        whyItMatters: "Proves that courier returns are an operational leak that must be guarded with automated verification."
      },
      {
        title: "Global Functional Food & Raw Honey Market Trends",
        domain: "statista.com",
        url: "https://statista.com/market-insights",
        whatFound: "Cold-extracted raw foods command a 38% price premium over mass commercial alternatives.",
        whyItMatters: "Validates high-ticket bundle pricing power if enzyme purity is visually verified."
      }
    ],

    dataGapsAndAssumptions: [
      { type: "CONFIRMED", detail: `Product selling price (${currency} ${price}) and cost (${currency} ${cost}) provided directly by business.` },
      { type: "CALCULATED", detail: `Gross margin (${grossMarginPct}%) and break-even ROAS (${breakEvenRoas}x) mathematically derived.` },
      { type: "ESTIMATE", detail: `Projected 40% repeat purchase rate based on category consumption averages.` },
      { type: "UNKNOWN", detail: "Exact historical return rate on previous courier shipments not provided." }
    ],

    aiCmoVerdict: {
      overallBusinessRating: "78/100",
      feasibility: "74/100",
      businessOpportunity: "82/100",
      marketingReadiness: "65/100",
      whatIsGood: `Exceptional ${grossMarginPct}% gross margin, strong product authenticity, and natural consumable replenishment.`,
      whatIsBad: "Single-item checkout structure leaves margin exposed to courier returns, and ad creative currently lacks short-form video proof.",
      biggestOpportunity: `Transition immediately to the 2-Unit High-AOV Starter Bundle at ${currency} ${recommendedAov}.`,
      biggestRisk: "Unverified Cash on Delivery courier returns eroding net contribution margin.",
      whatMarkyWouldDo: "Film 3 high-contrast water purity test videos, package a 2-jar bundle with wooden dipper, and launch Meta Advantage+ targeting Tier 1 metros.",
      whatMarkyWouldNotDo: "Never offer cheap discount sales or run static image ads without proof.",
      firstPriority: "Build the 2-Unit Starter Bundle and launch automated WhatsApp delivery verification.",
      finalRecommendation: "Full Go-To-Market endorsement. The unit economics and customer demand are exceptionally healthy. Lead with purity proof and bundle pricing."
    },

    financialBreakdown: {
      grossMargin: `${grossMarginPct}%`,
      breakEvenRoas: `${breakEvenRoas}x`,
      targetRoas: `${targetRoas}x`,
      maxCpa: `${currency} ${maxCpa}`,
      financialAdvice: `At ${grossMarginPct}% gross margin, maintain Cash on Delivery return rates strictly below 10% using automated WhatsApp address verification.`
    },

    targetPersonas: [
      {
        personaName: "The Quality-Conscious Urban Buyer",
        demographics: `Aged 24-42, Metro Cities in ${country}, Household Income Above Average`,
        corePain: "Tired of counterfeit, diluted, or low-grade products in local superstores with zero accountability.",
        buyingTrigger: "Unboxing transparency, verified lab certificates, and Cash-on-Delivery payment security."
      },
      {
        personaName: "The Festive & Gifting Shopper",
        demographics: "Aged 22-45, Families & Corporate Executives",
        corePain: "Need impressive, authentic gift packaging that arrives reliably on time for special occasions.",
        buyingTrigger: "Premium unboxing aesthetics, bundle discounts, and same-day courier dispatch."
      }
    ],

    adAnglesAndHooks: [
      {
        stage: "Top of Funnel (Viral Hook)",
        angleName: "The Purity & Authenticity Test",
        hookScript: "Think you're buying 100% genuine quality? Watch what happens when we test this against supermarket brands...",
        visualAction: "Split screen comparison test showing product reaction on camera with macro zoom."
      },
      {
        stage: "Middle of Funnel (Trust & Social Proof)",
        angleName: "Behind-the-Scenes Production",
        hookScript: "This is why doctors and organic lifestyle coaches only recommend one brand...",
        visualAction: "Behind the scenes packaging footage in sterile facility with lab certification stamps."
      },
      {
        stage: "Bottom of Funnel (Urgency & Scarcity)",
        angleName: "The Seasonal Bundle Blitz",
        hookScript: "Our fresh seasonal batch is 72% sold out. Order today and get free delivery!",
        visualAction: "Countdown timer overlay with Cash on Delivery free shipping badge."
      }
    ],

    budgetMediaPlan: [
      {
        platform: "TikTok Shop & Spark Ads",
        budgetShare: "40%",
        objective: "Conversions & Impulse Purchases",
        strategy: "Run daily creator UGC video tests targeting urban youth and young parents with quick checkout."
      },
      {
        platform: "Meta Advantage+ (Facebook & Instagram)",
        budgetShare: "45%",
        objective: "Sales Conversions (High AOV)",
        strategy: "Consolidate budget into broad Advantage+ shopping campaign utilizing carousel and video proof."
      },
      {
        platform: "Daraz Sponsored & Google Search",
        budgetShare: "15%",
        objective: "High-Intent Brand Capture",
        strategy: "Capture direct high-intent search keywords and bid for top slot on category searches."
      }
    ],

    funnelArchitecture: {
      topOfFunnel: "Viral 3-second hook video ads on TikTok and Instagram driving traffic to a high-speed mobile lander.",
      middleOfFunnel: "Customer review carousels, WhatsApp automated FAQ chatbot, and video testimonials eliminating purchase friction.",
      bottomOfFunnel: "A 2-pack bundle offer with Free Nationwide Shipping and standard Cash on Delivery checkout.",
      bundleIdea: `${productName} Wellness Duo (Price: ${currency} ${recommendedAov}) with Free Dipper & COD Free Shipping.`
    },

    thirtyDayRoadmap: [
      { week: "Week 1", focus: "Creative Production & Pixel Setup", tasks: ["Record 10 UGC video hooks", "Configure TikTok Pixel & Meta CAPI", "Build WhatsApp order confirmation flow"] },
      { week: "Week 2", focus: "Dynamic Creative Testing", tasks: ["Launch 3 ad sets at testing budget", "Identify top winning hook and thumbnail", "Optimize landing page speed below 2.2s"] },
      { week: "Week 3", focus: "Winner Scaling & Retargeting", tasks: ["Scale top 2 winning creatives with 30% budget increase", "Deploy catalog retargeting to website visitors", "Negotiate bulk courier shipping rates"] },
      { week: "Week 4", focus: "Channel Diversification & Expansion", tasks: ["Launch secondary ad channel", "Introduce corporate wholesale gifting catalog", "Review blended ROAS and prepare next month blitz"] }
    ]
  };
}

function generateFallbackChatResponse(message, persona, brand) {
  const brandName = brand?.name || 'your workspace brand';
  const m = (message || '').trim().toLowerCase();

  // Handle conversational greetings naturally without generating an unprompted business audit
  const greetings = ['hi', 'hello', 'hey', 'hey there', 'hi marky', 'hello marky', 'yo', 'sup', 'salam', 'assalam o alaikum', 'good morning', 'good afternoon', 'good evening', 'help'];
  if (greetings.includes(m) || m.length <= 3) {
    return `Hey! Great to connect. I’m **Marky**, your AI marketing consultant and growth strategist.

I have active workspace intelligence loaded for **${brandName}**. I can help you:
- **Analyze market opportunity** & consumer demand trends
- **Teardown your competitors** & exploit positioning gaps
- **Formulate high-ROAS ad campaigns** (Meta Advantage+, TikTok Shop, Google)
- **Stress-test your unit economics**, pricing tiers, and COD delivery margins

What product or marketing challenge are we tackling today? Tell me what you're building or trying to sell, and let's map out the strategy.`;
  }

  return `### MARKY'S STRATEGIC CONSULTING ANALYSIS
**Client & Brand:** ${brandName}  
**Directive Analyzed:** "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"

---

### 1. FOUNDATIONAL CLASSIFICATION
- **FACT:** ${brandName} operates in high-demand direct-to-consumer & B2B segments where customer trust, product authenticity, and delivery economics dictate profitability.
- **ASSUMPTION:** Your core customer acquisition relies primarily on digital channels (Meta Advantage+, TikTok Shop, Google Search) with Cash on Delivery (COD) as the predominant payment rail.
- **ESTIMATE:** Blended Customer Acquisition Cost (CAC) must remain under 25-32% of AOV to protect net contribution margins against a typical 12-18% courier return rate.
- **RECOMMENDATION:** Shift away from single-item acquisition; force a multi-tier bundle architecture (AOV > PKR 3,500) and deploy an automated WhatsApp pre-dispatch verification gate.

---

### 2. MARKET OPPORTUNITY & TARGET CUSTOMER (ICP)
- **Market Dynamics:** Premium consumer preference is aggressively migrating toward unadulterated, farm-traceable organic products, away from mass-manufactured commercial substitutes.
- **Primary ICP:** Urban households (Age 26-48), health-conscious parents, and corporate gifting buyers seeking verified purity.
- **Core Buying Trigger:** Visual proof of authenticity (lab certifications, unpasteurized honey crystallization demos, cold-pressed extraction footage).

---

### 3. ACQUISITION & CHANNEL STRATEGY
| Channel | Target Share | Core Objective | Key Execution Tactic |
| :--- | :--- | :--- | :--- |
| **Meta Advantage+** | 45% | High-AOV Conversions | Direct-response UGC video ads focusing on purity contrast tests. |
| **TikTok Shop / Spark** | 30% | Viral Impulse Discovery | 3-second hook creator demonstrations highlighting seasonal health benefits. |
| **B2B & WhatsApp Retargeting** | 15% | High-Margin Repeat Orders | VIP automated replenishment notifications & corporate wholesale catalogs. |
| **Daraz Organic & Sponsored** | 10% | Brand Capture & Search Intent | Optimized keyword clusters for Page 1 ranking on high-intent terms. |

---

### 4. WIN / RISK / FAILURE POINT TEARDOWN
- **WINNING FACTORS (Where you hold an edge):**
  - High emotional trust leverage: Real customer video proof destroys mass-commercial rivals.
  - Repeat order velocity: Consumable organic products produce a 90-day LTV 2.4x higher than standard apparel.
- **RISK FACTORS (What could go wrong):**
  - Paid traffic fatigue if creative testing cadence drops below 3 fresh video angles per week.
  - Cashflow lockup in courier COD clearance cycles (7-14 days remittance delay).
- **FAILURE POINTS (Where this business is most likely to break):**
  - **Unit Economics Collapse:** Selling single low-ticket SKUs (under PKR 2,000) where courier shipping (PKR 250-350) and return shipping completely erase gross margins.

---

### 5. MARKY'S VERDICT & DECISION PANEL
> ### ⚖️ MARKY'S VERDICT
> **Best Opportunity:** Launch a 2-Jar "Immunity & Energy" Bundle at PKR 3,850 with Free Nationwide Delivery.  
> **Main Advantage:** Premium purity proof converts at 3.8% higher landing page conversion rates than generic market listings.  
> **Biggest Risk:** Delayed courier fulfillment exceeding 72 hours, which spikes COD refusal rates.  
> **Expected Challenge:** Countering cheap supermarket adulterated substitutes.  
> 
> **RECOMMENDED NEXT MOVE:**  
> Run a dynamic creative test with 3 contrast-hook video ads on Meta and activate 5-minute automated WhatsApp confirmation before packaging any parcel.`;
}

// POST /api/ai/up-prompt — Prompt Enhancer Engine
router.post('/up-prompt', async (req, res) => {
  try {
    const { prompt, type = 'text', context = '' } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const trimmed = prompt.trim();

    let systemInstruction = '';
    let fallbackResult = '';

    if (type === 'image') {
      systemInstruction = `You are a world-class prompt engineer for commercial advertising photography, Midjourney v6, and photorealistic AI image generation.
Transform the user's basic prompt into a highly detailed, professional, cinematic commercial photography prompt.
Include precise camera specifications (e.g., 85mm f/1.4 lens, Sony Alpha A7R V), hyper-detailed studio lighting (softbox rim lighting, diffuse morning sunlight, subsurface scattering, water condensation droplets), photorealistic textures, clean commercial background composition, crisp focus, 8K resolution, and editorial magazine aesthetics.
OUTPUT ONLY THE ENHANCED PROMPT. Do not include introductory or concluding conversational filler.`;

      fallbackResult = `Commercial product photography of ${trimmed}, 85mm f/1.4 lens, crisp macro focus, delicate water condensation droplets, soft golden hour rim lighting, studio dark slate background with warm subtle reflections, cinematic depth of field, 8K resolution, award-winning advertising visual.`;
    } else if (type === 'video' || type === 'ugc') {
      systemInstruction = `You are an elite direct-response UGC video creative director and scriptwriter.
Transform the user's basic video idea into a high-converting, viral TikTok / Instagram Reels UGC advertising prompt.
Specify the hook (first 3 seconds), visual angle, natural creator posture, lighting, authentic setting, emotional body language, and call-to-action directive.
OUTPUT ONLY THE ENHANCED PROMPT. Do not include conversational remarks.`;

      fallbackResult = `Authentic handheld iPhone 15 Pro direct-to-camera UGC style: Enthusiastic creator holding ${trimmed} in modern sunlit kitchen, energetic 3-second visual hook showing product action, natural natural lighting, candid high-energy delivery, crisp audio, on-screen dynamic text highlights, clear CTA.`;
    } else if (type === 'edit') {
      systemInstruction = `You are an expert AI photo retouching and graphic design art director.
Transform the user's basic photo edit instruction into a precise, crystal-clear commercial image modification directive.
Specify exact element placements, color grading, shadows, lighting harmony, and texture preservation.
OUTPUT ONLY THE ENHANCED PROMPT. Do not include conversational remarks.`;

      fallbackResult = `Professionally modify the image: ${trimmed}. Seamlessly blend with realistic drop shadows, color temperature match (5600K balanced daylight), preserve natural surface reflections and fine edge details, commercial studio polish.`;
    } else {
      // General marketing / copy
      systemInstruction = `You are a master direct-response copywriter and marketing strategist (trained in Ogilvy, Halbert, Schwartz).
Transform the user's basic copy prompt into a high-converting, deeply engaging, benefit-driven marketing prompt that commands attention, builds urgent desire, and triggers action.
OUTPUT ONLY THE ENHANCED PROMPT. Do not include conversational remarks.`;

      fallbackResult = `Create a high-converting, psychology-backed commercial marketing piece for ${trimmed}. Focus on the primary emotional hook, undeniable value proposition, social proof angle, overcoming core friction points, and an irresistible call-to-action (CTA).`;
    }

    const aiResult = await aiService.generateText({
      systemPrompt: systemInstruction,
      prompt: `Original rough prompt: "${trimmed}"\nAdditional Context: ${context || 'High-end commercial direct-to-consumer marketing'}`,
      temperature: 0.7,
      fallbackFn: () => fallbackResult
    });

    const enhancedPrompt = (aiResult && aiResult.text ? aiResult.text.trim().replace(/^"|"$/g, '') : fallbackResult) || fallbackResult;

    return res.json({
      success: true,
      data: {
        originalPrompt: trimmed,
        enhancedPrompt: enhancedPrompt,
        type,
        provider: aiResult?.provider || 'local'
      }
    });
  } catch (error) {
    console.error('Error in up-prompt endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
