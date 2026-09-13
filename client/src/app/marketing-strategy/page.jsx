'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  Copy,
  Check,
  Download,
  Layers,
  DollarSign,
  TrendingUp,
  Target,
  Megaphone,
  ShoppingBag,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  BarChart3,
  Award,
  BookOpen,
  Compass,
  AlertTriangle,
  FileText,
  ExternalLink,
  Printer,
  Sparkles,
  Clock
} from 'lucide-react';
import api from '@/lib/api';

export default function MarketingStrategyPage() {
  const [formData, setFormData] = useState({
    // 1. Business Basics
    businessName: 'KMB Honey Pakistan',
    productName: 'KMB Pure Sidr Raw Honey',
    category: 'Health & Organic Food',
    businessModel: 'DTC E-Commerce & Omnichannel',
    websiteUrl: 'https://kmbhoney.pk',
    socialUrls: '@kmbhoneypk (Instagram, TikTok)',
    country: 'Pakistan',
    targetCities: 'Lahore, Karachi, Islamabad & Rawalpindi',
    businessStage: 'Growing',

    // 2. Product & Economics
    productDescription: 'Single-origin wild raw Sidr honey harvested from Karak apiaries, unheated and unfiltered with certified lab purity test reports in every parcel.',
    featuresBenefits: '100% pure raw enzymes, immune defense, zero added glucose, rich thick viscosity, certified laboratory purity.',
    sellingPrice: 3500,
    productCost: 1200,
    deliveryCost: 250,
    problemSolved: 'Pervasive market fear of buying commercial honey adulterated with industrial sugar syrup and chemicals.',
    productDifferentiation: 'Independent laboratory test report placed inside every order; direct harvest from protected Karak wild blossom apiaries.',
    reasonToBuy: 'Guaranteed 100% raw unadulterated Sidr honey with a 10x money-back guarantee if proven otherwise.',

    // 3. Business Goals & Targets
    businessGoal: 'Scale acquisition to 4.5x ROAS and establish #1 authority in pure raw honey across Pakistan',
    targetRevenue: 'PKR 8,500,000 / month',
    currentRevenue: 'PKR 2,400,000 / month',
    currentOrders: '680 orders / month',
    targetOrders: '2,200 orders / month',
    monthlyBudget: 'PKR 450,000',
    maxCampaignBudget: 'PKR 150,000',

    // 4. Customer Intelligence
    customerType: 'B2C',
    targetAudience: 'Health-conscious families, wellness enthusiasts, fasting/Ramadan shoppers, and mothers seeking natural remedies aged 26-52 in major urban hubs.',
    customerProblems: 'Distrust of supermarket honey; recurring colds/flu in winter; children consuming refined sugar.',
    customerWants: 'Verified authentic natural superfood that provides real medicinal benefits and immunity protection.',
    purchaseTriggers: 'Winter illness onset, Ramadan gifting, unboxing videos showing water dissolution viscosity tests.',
    purchaseBlockers: 'High price tag compared to supermarket commercial brands; fear of fake parcel contents on Cash on Delivery.',
    customerObjections: 'How do I know this is actually 100% pure? Why should I pay PKR 3,500 for honey?',
    whyCustomersBuy: 'Authentic aroma, thick golden texture, and peace of mind from lab certificate.',
    whyChooseCompetitors: 'Competitors are available immediately on local pharmacy and grocery shelves.',

    // 5. Competitor Intelligence
    competitors: 'Marhaba Laboratories, Organic Valley PK, Salman Honey, Pure Harvest',
    competitorStrengthsWeaknesses: 'Marhaba has 30-year legacy pharmacy distribution but processed perception; Organic Valley has good branding but high stock-outs.',
    whyChooseUs: 'Certified wild apiary raw grading with direct harvest transparency and no commercial heating.',
    dangerousCompetitors: 'Cheap commercial brands selling at PKR 1,200 by blending corn syrup.',

    // 6. Current Marketing
    currentChannels: ['Meta Facebook', 'Instagram', 'TikTok', 'WhatsApp Marketing'],
    currentSpend: 'PKR 200,000 / month',
    currentCac: 'PKR 980',
    currentRoas: '3.60x',
    whatWorked: 'Short-form TikTok and Instagram video hooks showing the water drop test and comb extraction.',
    whatFailed: 'Static product images and discount discount banners (attracted low-intent shoppers who cancelled COD).',

    // 7. Brand Intelligence & Constraints
    brandPositioning: 'The Uncompromised Benchmark for Pure Raw Harvest in Pakistan.',
    brandPersonality: 'Premium',
    tagline: 'Purity You Can Taste, Authenticity You Can Test.',
    usp: '100% Raw Wild Sidr with Accredited Lab Report in Every Shipment.',
    whatToAvoid: 'Never position as a cheap everyday syrup or mass-discount grocery item; do not look like a generic marketplace drop-shipper.',
    teamResources: 'Internal founder + 2 packing staff + freelance UGC video creator and media buyer.',
    growthConstraints: 'High Cash on Delivery courier return rates (14%) and cash remittance delays from couriers.',

    // 8. Large Business Brief
    businessBrief: 'We are trying to transition from a small artisanal producer into a nationally recognized wellness brand. We want to stop selling single jars at PKR 3,500 where courier costs and return rates eat our margins, and instead sell premium 2-jar bundles (PKR 5,990) with free wooden drizzlers. We need a strategy to scale Meta and TikTok profitably while slashing our COD return rates.',

    // 9. Target Platforms
    targetPlatforms: ['TikTok', 'Meta Facebook', 'Instagram', 'WhatsApp Marketing', 'Google Search & Shopping']
  });

  const [openSections, setOpenSections] = useState({
    basics: true,
    product: true,
    goals: false,
    customers: false,
    competitors: false,
    marketing: false,
    brand: false,
    brief: true,
    platforms: false
  });

  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  // Loading Progress & Estimated Time State
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [estimatedSecondsRemaining, setEstimatedSecondsRemaining] = useState(16);
  const [loadingStage, setLoadingStage] = useState('Ingesting business parameters & analyzing unit margins...');

  useEffect(() => {
    let timer = null;
    let startTime = Date.now();

    if (loading) {
      setProgress(6);
      setElapsedSeconds(0);
      setEstimatedSecondsRemaining(16);
      setLoadingStage('Ingesting business parameters & analyzing unit margins...');

      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(elapsed);
        const estRemaining = Math.max(1, 16 - elapsed);
        setEstimatedSecondsRemaining(estRemaining);

        setProgress((prev) => {
          if (prev >= 95) {
            return Math.min(98, prev + 0.25);
          }
          const increment = Math.max(0.6, (96 - prev) * 0.08);
          const nextVal = Math.min(96, prev + increment);

          if (nextVal < 20) {
            setLoadingStage('Ingesting business parameters & analyzing unit margins...');
          } else if (nextVal < 40) {
            setLoadingStage('Scanning competitor moats & identifying market white space...');
          } else if (nextVal < 62) {
            setLoadingStage('Deconstructing customer psychology & objection playbooks...');
          } else if (nextVal < 80) {
            setLoadingStage('Calculating 7-dimension feasibility & marketing readiness...');
          } else if (nextVal < 92) {
            setLoadingStage('Formulating channel media mix, viral hooks & offers...');
          } else {
            setLoadingStage('Finalizing AI CMO strategic verdict & executive blueprint...');
          }

          return nextVal;
        });
      }, 300);
    } else {
      if (timer) clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [loading]);

  const platformOptions = [
    'TikTok',
    'Meta Facebook',
    'Instagram',
    'Daraz Sponsored Products',
    'Google Search & Shopping',
    'WhatsApp Marketing',
    'YouTube Shorts',
    'LinkedIn B2B'
  ];

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePlatformToggle = (plat) => {
    setFormData((prev) => {
      const exists = prev.targetPlatforms.includes(plat);
      return {
        ...prev,
        targetPlatforms: exists
          ? prev.targetPlatforms.filter((p) => p !== plat)
          : [...prev.targetPlatforms, plat]
      };
    });
  };

  const handlePresetFill = (presetType) => {
    if (presetType === 'honey') {
      setFormData({
        businessName: 'KMB Honey Pakistan',
        productName: 'KMB Pure Sidr Raw Honey',
        category: 'Health & Organic Food',
        businessModel: 'DTC E-Commerce & Omnichannel',
        websiteUrl: 'https://kmbhoney.pk',
        socialUrls: '@kmbhoneypk',
        country: 'Pakistan',
        targetCities: 'Lahore, Karachi, Islamabad & Rawalpindi',
        businessStage: 'Growing',
        productDescription: 'Single-origin wild raw Sidr honey harvested from Karak apiaries, unheated and unfiltered with certified lab purity test reports in every parcel.',
        featuresBenefits: '100% pure raw enzymes, immune defense, zero added glucose, rich thick viscosity, certified laboratory purity.',
        sellingPrice: 3500,
        productCost: 1200,
        deliveryCost: 250,
        problemSolved: 'Pervasive market fear of buying commercial honey adulterated with industrial sugar syrup and chemicals.',
        productDifferentiation: 'Independent laboratory test report placed inside every order; direct harvest from protected Karak wild blossom apiaries.',
        reasonToBuy: 'Guaranteed 100% raw unadulterated Sidr honey with a 10x money-back guarantee if proven otherwise.',
        businessGoal: 'Scale acquisition to 4.5x ROAS and establish #1 authority in pure raw honey across Pakistan',
        targetRevenue: 'PKR 8,500,000 / month',
        currentRevenue: 'PKR 2,400,000 / month',
        currentOrders: '680 orders / month',
        targetOrders: '2,200 orders / month',
        monthlyBudget: 'PKR 450,000',
        maxCampaignBudget: 'PKR 150,000',
        customerType: 'B2C',
        targetAudience: 'Health-conscious families, wellness enthusiasts, fasting/Ramadan shoppers, and mothers seeking natural remedies aged 26-52 in major urban hubs.',
        customerProblems: 'Distrust of supermarket honey; recurring colds/flu in winter; children consuming refined sugar.',
        customerWants: 'Verified authentic natural superfood that provides real medicinal benefits and immunity protection.',
        purchaseTriggers: 'Winter illness onset, Ramadan gifting, unboxing videos showing water dissolution viscosity tests.',
        purchaseBlockers: 'High price tag compared to supermarket commercial brands; fear of fake parcel contents on Cash on Delivery.',
        customerObjections: 'How do I know this is actually 100% pure? Why should I pay PKR 3,500 for honey?',
        whyCustomersBuy: 'Authentic aroma, thick golden texture, and peace of mind from lab certificate.',
        whyChooseCompetitors: 'Competitors are available immediately on local pharmacy and grocery shelves.',
        competitors: 'Marhaba Laboratories, Organic Valley PK, Salman Honey, Pure Harvest',
        competitorStrengthsWeaknesses: 'Marhaba has 30-year legacy pharmacy distribution but processed perception; Organic Valley has good branding but high stock-outs.',
        whyChooseUs: 'Certified wild apiary raw grading with direct harvest transparency and no commercial heating.',
        dangerousCompetitors: 'Cheap commercial brands selling at PKR 1,200 by blending corn syrup.',
        currentChannels: ['Meta Facebook', 'Instagram', 'TikTok', 'WhatsApp Marketing'],
        currentSpend: 'PKR 200,000 / month',
        currentCac: 'PKR 980',
        currentRoas: '3.60x',
        whatWorked: 'Short-form TikTok and Instagram video hooks showing the water drop test and comb extraction.',
        whatFailed: 'Static product images and discount discount banners (attracted low-intent shoppers who cancelled COD).',
        brandPositioning: 'The Uncompromised Benchmark for Pure Raw Harvest in Pakistan.',
        brandPersonality: 'Premium',
        tagline: 'Purity You Can Taste, Authenticity You Can Test.',
        usp: '100% Raw Wild Sidr with Accredited Lab Report in Every Shipment.',
        whatToAvoid: 'Never position as a cheap everyday syrup or mass-discount grocery item; do not look like a generic marketplace drop-shipper.',
        teamResources: 'Internal founder + 2 packing staff + freelance UGC video creator and media buyer.',
        growthConstraints: 'High Cash on Delivery courier return rates (14%) and cash remittance delays from couriers.',
        businessBrief: 'We are trying to transition from a small artisanal producer into a nationally recognized wellness brand. We want to stop selling single jars at PKR 3,500 where courier costs and return rates eat our margins, and instead sell premium 2-jar bundles (PKR 5,990) with free wooden drizzlers. We need a strategy to scale Meta and TikTok profitably while slashing our COD return rates.',
        targetPlatforms: ['TikTok', 'Meta Facebook', 'Instagram', 'WhatsApp Marketing', 'Google Search & Shopping']
      });
    } else if (presetType === 'leather') {
      setFormData({
        businessName: 'Cydaix Leather Goods',
        productName: 'Cydaix Handcrafted Bifold Wallet',
        category: 'Leather Goods & Accessories',
        businessModel: 'DTC E-Commerce & Bespoke Gifting',
        websiteUrl: 'https://cydaix.com',
        socialUrls: '@cydaixleather',
        country: 'Pakistan',
        targetCities: 'Karachi, Lahore, Islamabad',
        businessStage: 'Early Revenue',
        productDescription: 'Full-grain vegetable-tanned cowhide wallet, hand-stitched with waxed polyester thread and burnished beeswax edges.',
        featuresBenefits: 'Ages into a rich patina over time, lifetime stitching warranty, RFID blocking liner, slim minimalist profile.',
        sellingPrice: 4800,
        productCost: 1600,
        deliveryCost: 250,
        problemSolved: 'Men carrying bulky, cheap bonded-leather wallets that peel, crack, and fall apart within 6 months.',
        productDifferentiation: 'Pure vegetable-tanned full-grain leather that looks better with age, backed by a 5-year replacement guarantee.',
        reasonToBuy: 'Elevate your daily carry with authentic artisanal leatherwork at direct-to-consumer value.',
        businessGoal: 'Build luxury DTC brand authority & lower customer acquisition cost below PKR 1,100',
        targetRevenue: 'PKR 4,000,000 / month',
        currentRevenue: 'PKR 950,000 / month',
        currentOrders: '200 orders / month',
        targetOrders: '850 orders / month',
        monthlyBudget: 'PKR 300,000',
        maxCampaignBudget: 'PKR 100,000',
        customerType: 'B2C',
        targetAudience: 'Corporate professionals, tech workers, young executives, and university graduates aged 22-45 who value subtle luxury and craftsmanship.',
        customerProblems: 'Cheap faux leather peeling; poor quality zippers; lack of stylish gift items for men.',
        customerWants: 'A wallet that feels luxurious in hand, smells like genuine leather, and doesn’t bulge out in tailored trousers.',
        purchaseTriggers: 'Father’s Day, graduation, promotions, birthdays, self-reward before starting a new job.',
        purchaseBlockers: 'Doubts over whether it is genuine full-grain leather or synthetic split leather.',
        customerObjections: 'Is this real leather or synthetic? Why does it cost PKR 4,800 when local bazaars sell wallets for PKR 1,500?',
        whyCustomersBuy: 'The genuine leather aroma, premium presentation box, and durable saddle stitching.',
        whyChooseCompetitors: 'Hub Leather and J. have massive physical showroom networks in high-end shopping malls.',
        competitors: 'Hub Leather, J. Fragrances & Accessories, Royal Tag Leather',
        competitorStrengthsWeaknesses: 'Hub has physical prestige but 3x price tags (PKR 12,000+); J. sells mass imported bonded leather.',
        whyChooseUs: 'Hand-burnished artisanal grade at 40% of mall prices with free custom initial engraving.',
        dangerousCompetitors: 'Cheap marketplace counterfeits on Daraz claiming to be leather at PKR 999.',
        currentChannels: ['Instagram', 'Meta Facebook', 'TikTok'],
        currentSpend: 'PKR 120,000 / month',
        currentCac: 'PKR 1,450',
        currentRoas: '3.31x',
        whatWorked: 'Macro camera videos showing the leather burnishing process and scratch resistance test.',
        whatFailed: 'Broad audience image carousel ads without leather sound (ASMR) or tactile demonstration.',
        brandPositioning: 'Understated Modern Luxury for the Discerning Professional.',
        brandPersonality: 'Luxury',
        tagline: 'Crafted to Outlast You.',
        usp: 'Full-Grain Vegetable Tanned Leather with Lifetime Craftsmanship Guarantee.',
        whatToAvoid: 'Never position as discount clearance leather or trendy streetwear; avoid tacky brass hardware.',
        teamResources: 'Founder + master leather craftsman workshop + 1 social media manager.',
        growthConstraints: 'Handmade production volume ceiling (max 1,500 units/mo) and creative production velocity.',
        businessBrief: 'Cydaix is built for men who appreciate heritage materials and minimalist design. We want to dominate corporate and anniversary gifting in Pakistan with personalized name embossing, and expand our line into matching cardholders and passport sleeves to lift lifetime value.',
        targetPlatforms: ['Instagram', 'Meta Facebook', 'TikTok', 'Google Search & Shopping']
      });
    }
  };

  const handleGenerateStrategy = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.generateStrategy(formData);
      if (res.success) {
        setProgress(100);
        setEstimatedSecondsRemaining(0);
        setLoadingStage('Strategy complete! Rendering decision-ready report...');
        setTimeout(() => {
          setBlueprint(res.data);
          setLoading(false);
        }, 450);
      } else {
        setError(res.error || 'Failed to synthesize customer intelligence strategy');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Error executing Marky strategic engine');
      setLoading(false);
    }
  };

  const handleCopyBlueprint = () => {
    if (!blueprint) return;
    const text = JSON.stringify(blueprint, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!blueprint) return;
    let md = `# Marky Customer Intelligence & Strategy Report: ${formData.productName}\n\n`;
    md += `## 1. Executive Summary\n${blueprint.executiveSummary}\n\n`;
    md += `## 2. Ratings & Health\n`;
    md += `- Overall Business Rating: ${blueprint.ratings?.overallBusinessRating || 78}/100\n`;
    md += `- Feasibility Score: ${blueprint.ratings?.feasibility?.score || 74}/100\n`;
    md += `- Business Opportunity Score: ${blueprint.ratings?.businessOpportunity?.score || 82}/100\n`;
    md += `- Marketing Readiness Score: ${blueprint.ratings?.marketingReadiness?.score || 65}/100\n\n`;
    
    md += `## 3. Feasibility Dimensions Breakdown\n`;
    (blueprint.ratings?.feasibility?.dimensions || []).forEach(d => {
      md += `- **${d.name} (${d.score}/100):** ${d.explanation}\n`;
    });
    md += `\n`;

    md += `## 4. Customer Intelligence\n`;
    md += `- **Primary Segment:** ${blueprint.customerIntelligence?.primarySegment}\n`;
    md += `- **Motivations:** ${blueprint.customerIntelligence?.motivations}\n`;
    md += `- **Key Customer Insight:** ${blueprint.customerIntelligence?.keyCustomerInsight}\n\n`;

    md += `## 5. Unit Economics & Calculations\n`;
    md += `- Selling Price: ${blueprint.unitEconomics?.sellingPrice}\n`;
    md += `- COGS: ${blueprint.unitEconomics?.cogs}\n`;
    md += `- Gross Margin: ${blueprint.unitEconomics?.grossMargin}\n`;
    md += `- Break-Even ROAS: ${blueprint.unitEconomics?.breakEvenRoas}\n`;
    md += `- Target ROAS: ${blueprint.unitEconomics?.targetRoas}\n`;
    md += `- Max Sustainable CAC: ${blueprint.unitEconomics?.sustainableCacCeiling}\n`;
    md += `- Calculations: ${blueprint.unitEconomics?.calculationsTransparency}\n\n`;

    md += `## 6. AI CMO Verdict\n`;
    md += `- **What is Good:** ${blueprint.aiCmoVerdict?.whatIsGood}\n`;
    md += `- **What is Bad:** ${blueprint.aiCmoVerdict?.whatIsBad}\n`;
    md += `- **What Marky Would Do:** ${blueprint.aiCmoVerdict?.whatMarkyWouldDo}\n`;
    md += `- **What Marky Would NOT Do:** ${blueprint.aiCmoVerdict?.whatMarkyWouldNotDo}\n`;
    md += `- **First Priority:** ${blueprint.aiCmoVerdict?.firstPriority}\n`;
    md += `- **Final Recommendation:** ${blueprint.aiCmoVerdict?.finalRecommendation}\n\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Marky-Strategy-${formData.productName.replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeployToCampaign = async () => {
    if (!blueprint) return;
    try {
      await api.createCampaign({
        name: `${formData.productName} High-ROAS Launch`,
        objective: formData.businessGoal || 'Conversions',
        status: 'Active',
        budget: formData.sellingPrice * 50,
        currency: formData.country === 'Pakistan' ? 'PKR' : 'USD',
        platforms: formData.targetPlatforms,
        kpi: `Target ROAS: ${blueprint.unitEconomics?.targetRoas || '4.0x'}`,
        target_geography: formData.country === 'Pakistan' ? (formData.targetCities || 'Tier 1 Metros') : 'Nationwide',
        approval_status: 'Approved'
      });

      const hooksSummary = (blueprint.contentAndCreativeStrategy?.adAnglesAndHooks || blueprint.adAnglesAndHooks || [])
        .map(h => `### ${h.stage}: ${h.angleName}\n- Hook: "${h.hookScript}"\n- Visual: ${h.visualAction}`)
        .join('\n\n');

      if (hooksSummary) {
        await api.saveContent({
          tool_id: 'ai-strategy-ad-hooks',
          tool_title: `Ad Hooks: ${formData.productName}`,
          input_summary: formData.productName,
          output_content: hooksSummary
        });
      }

      alert(`Success! Strategy deployed as an Active Campaign with viral ad hooks saved into your Content Library.`);
    } catch (err) {
      alert(`Deployment error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Header Banner (Marky Signature Obsidian-Purple Theme) */}
      <div className="bg-[#0B091B] rounded-3xl p-6 md:p-8 text-white shadow-2xl border border-[#1C1938] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Subtle fluid ribbon ambient glow derived from Marky palette */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-[#4239C4]/30 via-[#7A5DBB]/20 to-[#F3C5A8]/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-60 h-60 rounded-full bg-gradient-to-tr from-[#D97FA5]/20 to-transparent blur-2xl pointer-events-none" />

        <div className="space-y-2 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4239C4]/20 text-[#D1C3FF] text-xs font-bold border border-[#7A5DBB]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#D1C3FF]" />
            <span>CMO Full-Funnel Architecture</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            AI Marketing Strategy Generator
          </h1>
          <p className="text-xs md:text-sm text-[#B4AFCC] leading-relaxed">
            Generate executive-grade marketing blueprints for Daraz, TikTok Shop, Meta, and Shopify with real unit economics, buyer personas, ad scripts, and 30-day execution roadmaps.
          </p>
        </div>

        {/* Quick Demo Fill Presets */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <span className="text-[11px] font-bold text-[#D1C3FF]/80 uppercase tracking-wider">Presets:</span>
          <button
            type="button"
            onClick={() => handlePresetFill('honey')}
            className="px-3 py-1.5 rounded-xl bg-[#171434] hover:bg-[#221D4B] text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer shadow-xs"
          >
            🍯 KMB Honey (Mass/Premium)
          </button>
          <button
            type="button"
            onClick={() => handlePresetFill('leather')}
            className="px-3 py-1.5 rounded-xl bg-[#171434] hover:bg-[#221D4B] text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer shadow-xs"
          >
            💼 Cydaix Leather (Luxury)
          </button>
        </div>
      </div>

      {/* 2. Main Grid: Input Form on Left (5 cols) & Strategy Report on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Deep Business & Customer Intelligence Input Form */}
        <div className="lg:col-span-5 card-glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Campaign & Product Specifications</h3>
              <p className="text-[11px] text-slate-500">Provide deep context for Marky's research & intelligence engine</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/30">
              Input Form
            </span>
          </div>

          <form onSubmit={handleGenerateStrategy} className="space-y-4">
            
            {/* Section 1: Business Basics */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('basics')}
                className="w-full px-4 py-2.5 bg-slate-50 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-100/80 transition-colors"
              >
                <span>1. Business Basics & Stage</span>
                {openSections.basics ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              {openSections.basics && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Business Name</label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-[#7A5DBB] focus:ring-1 focus:ring-[#7A5DBB]/30 focus:outline-hidden"
                        placeholder="e.g. Lumina Labs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Product / Service Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.productName}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-[#7A5DBB] focus:ring-1 focus:ring-[#7A5DBB]/30 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Product Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option>Health & Organic Food</option>
                        <option>Leather Goods & Accessories</option>
                        <option>Fashion & Apparel</option>
                        <option>Beauty & Personal Care</option>
                        <option>Consumer Electronics</option>
                        <option>Home & Living</option>
                        <option>SaaS & Digital Products</option>
                        <option>B2B Services & Consulting</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Business Stage</label>
                      <select
                        value={formData.businessStage}
                        onChange={(e) => setFormData({ ...formData, businessStage: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option>Idea</option>
                        <option>Pre-launch</option>
                        <option>MVP</option>
                        <option>Early Revenue</option>
                        <option>Growing</option>
                        <option>Established</option>
                        <option>Expansion</option>
                        <option>Relaunch</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Country / Market</label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option>Pakistan</option>
                        <option>United Arab Emirates</option>
                        <option>Saudi Arabia</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Cities / Regions</label>
                      <input
                        type="text"
                        value={formData.targetCities}
                        onChange={(e) => setFormData({ ...formData, targetCities: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                        placeholder="Lahore, Karachi, Islamabad"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Website URL</label>
                      <input
                        type="text"
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Social Handles</label>
                      <input
                        type="text"
                        value={formData.socialUrls}
                        onChange={(e) => setFormData({ ...formData, socialUrls: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                        placeholder="@handle"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Product, Economics & Problem Solved */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('product')}
                className="w-full px-4 py-2.5 bg-slate-50 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-100/80 transition-colors"
              >
                <span>2. Product, Economics & Problem Solved</span>
                {openSections.product ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              {openSections.product && (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">What exactly are you selling? (Detailed Description)</label>
                    <textarea
                      rows={2}
                      value={formData.productDescription}
                      onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-[#7A5DBB] focus:ring-1 focus:ring-[#7A5DBB]/30 focus:outline-hidden"
                      placeholder="Describe what the product does, materials, packaging, features..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Selling Price ({formData.country === 'Pakistan' ? 'PKR' : 'USD'})</label>
                      <input
                        type="number"
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">COGS / Unit Cost</label>
                      <input
                        type="number"
                        value={formData.productCost}
                        onChange={(e) => setFormData({ ...formData, productCost: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Delivery Cost</label>
                      <input
                        type="number"
                        value={formData.deliveryCost}
                        onChange={(e) => setFormData({ ...formData, deliveryCost: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">What problem does this product solve?</label>
                    <input
                      type="text"
                      value={formData.problemSolved}
                      onChange={(e) => setFormData({ ...formData, problemSolved: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      placeholder="The exact frustration or dilemma customers face..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">What makes it different?</label>
                      <input
                        type="text"
                        value={formData.productDifferentiation}
                        onChange={(e) => setFormData({ ...formData, productDifferentiation: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                        placeholder="Raw batch traceability, warranty..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Strongest reason to buy?</label>
                      <input
                        type="text"
                        value={formData.reasonToBuy}
                        onChange={(e) => setFormData({ ...formData, reasonToBuy: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                        placeholder="100% lab certified, money-back..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Business Goals & Targets */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('goals')}
                className="w-full px-4 py-2.5 bg-slate-50 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-100/80 transition-colors"
              >
                <span>3. Business Goals & Metrics</span>
                {openSections.goals ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              {openSections.goals && (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Primary Business Goal</label>
                    <input
                      type="text"
                      value={formData.businessGoal}
                      onChange={(e) => setFormData({ ...formData, businessGoal: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      placeholder="e.g. Launch DTC channel and reach 4x ROAS"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Monthly Revenue</label>
                      <input
                        type="text"
                        value={formData.currentRevenue}
                        onChange={(e) => setFormData({ ...formData, currentRevenue: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                        placeholder="PKR 1,500,000 (or I don't know)"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Monthly Revenue</label>
                      <input
                        type="text"
                        value={formData.targetRevenue}
                        onChange={(e) => setFormData({ ...formData, targetRevenue: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                        placeholder="PKR 5,000,000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Monthly Marketing Budget</label>
                      <input
                        type="text"
                        value={formData.monthlyBudget}
                        onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                        placeholder="PKR 350,000"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Max Campaign Budget</label>
                      <input
                        type="text"
                        value={formData.maxCampaignBudget}
                        onChange={(e) => setFormData({ ...formData, maxCampaignBudget: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                        placeholder="PKR 100,000"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Customer Intelligence & Objections */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('customers')}
                className="w-full px-4 py-2.5 bg-slate-50 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-100/80 transition-colors"
              >
                <span>4. Customer Intelligence & Objections</span>
                {openSections.customers ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              {openSections.customers && (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Audience Profile</label>
                    <textarea
                      rows={2}
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      placeholder="Age, profession, city, psychographics..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">What stops them from purchasing? (Objections)</label>
                    <input
                      type="text"
                      value={formData.customerObjections}
                      onChange={(e) => setFormData({ ...formData, customerObjections: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      placeholder="e.g. Is it fake? Is price too high? Delivery delay?"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">What triggers a purchase?</label>
                      <input
                        type="text"
                        value={formData.purchaseTriggers}
                        onChange={(e) => setFormData({ ...formData, purchaseTriggers: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                        placeholder="Seasonal gifts, sudden illness, proof video..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Why do existing buyers buy?</label>
                      <input
                        type="text"
                        value={formData.whyCustomersBuy}
                        onChange={(e) => setFormData({ ...formData, whyCustomersBuy: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                        placeholder="Taste, trust, packaging..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 5: Competitor Intelligence */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('competitors')}
                className="w-full px-4 py-2.5 bg-slate-50 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-100/80 transition-colors"
              >
                <span>5. Competitor Intelligence</span>
                {openSections.competitors ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              {openSections.competitors && (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Competitor Names</label>
                    <input
                      type="text"
                      value={formData.competitors}
                      onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      placeholder="e.g. Brand A, Brand B, Brand C"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Known Competitor Strengths & Weaknesses</label>
                    <input
                      type="text"
                      value={formData.competitorStrengthsWeaknesses}
                      onChange={(e) => setFormData({ ...formData, competitorStrengthsWeaknesses: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      placeholder="Big distribution but industrial quality..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Why choose you instead?</label>
                      <input
                        type="text"
                        value={formData.whyChooseUs}
                        onChange={(e) => setFormData({ ...formData, whyChooseUs: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                        placeholder="Direct harvest, lab proof..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Most dangerous rivals?</label>
                      <input
                        type="text"
                        value={formData.dangerousCompetitors}
                        onChange={(e) => setFormData({ ...formData, dangerousCompetitors: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                        placeholder="Cheap adulterated sellers..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 6: Brand Intelligence & Constraints */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('brand')}
                className="w-full px-4 py-2.5 bg-slate-50 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-100/80 transition-colors"
              >
                <span>6. Brand Intelligence & Restrictions</span>
                {openSections.brand ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              {openSections.brand && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Brand Personality</label>
                      <select
                        value={formData.brandPersonality}
                        onChange={(e) => setFormData({ ...formData, brandPersonality: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option>Premium</option>
                        <option>Affordable</option>
                        <option>Professional</option>
                        <option>Friendly</option>
                        <option>Technical</option>
                        <option>Innovative</option>
                        <option>Luxury</option>
                        <option>Bold</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tagline / Hook</label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                        placeholder="Purity you can taste..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">What should your brand NEVER be perceived as?</label>
                    <input
                      type="text"
                      value={formData.whatToAvoid}
                      onChange={(e) => setFormData({ ...formData, whatToAvoid: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      placeholder="Cheap syrup, generic knockoff, discount bargain..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Team Resources & Growth Constraints</label>
                    <input
                      type="text"
                      value={formData.growthConstraints}
                      onChange={(e) => setFormData({ ...formData, growthConstraints: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      placeholder="High COD returns, courier delays, limited video creative..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 7: Large Business Brief ("Tell Marky Everything About Your Business") */}
            <div className="border-2 border-[#7A5DBB]/40 rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="px-4 py-2.5 bg-[#7A5DBB]/10 border-b border-[#7A5DBB]/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7A5DBB] animate-pulse"></span>
                  <label className="text-xs font-extrabold text-[#241B4B]">
                    Tell Marky Everything About Your Business (Large Brief)
                  </label>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4239C4]/15 text-[#4239C4]">
                  Highest Priority Context
                </span>
              </div>
              <div className="p-3.5 space-y-1.5">
                <textarea
                  rows={4}
                  value={formData.businessBrief}
                  onChange={(e) => setFormData({ ...formData, businessBrief: e.target.value })}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:border-[#7A5DBB] focus:ring-1 focus:ring-[#7A5DBB]/30 focus:outline-hidden leading-relaxed text-slate-800"
                  placeholder="Describe your product, customers, previous results, what worked, what failed, unit margins, customer complaints, vision, and concerns. Marky synthesizes all of this with the structured data above."
                />
                <p className="text-[10px] text-slate-500 italic">
                  Marky combines this deep narrative with all financial calculations and market trends.
                </p>
              </div>
            </div>

            {/* Section 8: Target Ad Platforms */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Ad Platforms</label>
              <div className="flex flex-wrap gap-1.5">
                {platformOptions.map((p) => {
                  const isChecked = formData.targetPlatforms.includes(p);
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => handlePlatformToggle(p)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-[#4239C4] text-white border-[#4239C4] shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#4239C4] via-[#7A5DBB] to-[#D97FA5] hover:opacity-95 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md shadow-[#4239C4]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Customer Intelligence & Strategy Report...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Generate Full Marketing Strategy Report</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Complete Decision-Ready Strategy Report */}
        <div className="lg:col-span-7 space-y-4">
          {loading && (
            <div className="card-glass rounded-2xl p-8 md:p-12 text-center space-y-6 min-h-[480px] flex flex-col items-center justify-center border border-[#7A5DBB]/20 shadow-xl relative overflow-hidden animate-fadeIn">
              {/* Subtle ambient brand glow */}
              <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-gradient-to-br from-[#4239C4]/20 via-[#7A5DBB]/15 to-[#D97FA5]/15 blur-3xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-gradient-to-tr from-[#D97FA5]/15 to-transparent blur-3xl pointer-events-none" />

              {/* Pulsing Marky container */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4239C4]/20 via-[#7A5DBB]/20 to-[#D97FA5]/20 text-[#4239C4] flex items-center justify-center animate-pulse border border-[#7A5DBB]/30 shadow-inner relative z-10">
                <RefreshCw className="w-7 h-7 animate-spin text-[#4239C4]" />
              </div>

              <div className="space-y-1.5 max-w-md relative z-10">
                <h4 className="text-lg font-black text-slate-900 tracking-tight">Marky Is Analyzing Your Business</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Evaluating unit economics, deconstructing competitor moats, calculating break-even ROAS thresholds, and formulating multi-channel acquisition roadmaps...
                </p>
              </div>

              {/* Animated Progress Line & Time Tracker Box */}
              <div className="w-full max-w-md space-y-3 p-4.5 rounded-2xl bg-white/95 border border-[#7A5DBB]/25 shadow-sm relative z-10">
                {/* Header row: Stage text & % */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 truncate font-bold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-[#4239C4] animate-ping shrink-0" />
                    <span className="truncate">{loadingStage}</span>
                  </div>
                  <span className="text-xs font-black text-[#4239C4] font-mono shrink-0">
                    {Math.round(progress)}%
                  </span>
                </div>

                {/* Progress bar track & fill line */}
                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80 shadow-inner relative">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4239C4] via-[#7A5DBB] to-[#D97FA5] transition-all duration-300 ease-out relative shadow-xs"
                    style={{ width: `${Math.min(100, Math.max(4, progress))}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
                  </div>
                </div>

                {/* Footer row: Estimated time remaining & elapsed */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-[#7A5DBB]" />
                    <span>
                      Estimated time: <strong className="text-[#241B4B]">~{estimatedSecondsRemaining}s remaining</strong>
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {elapsedSeconds}s elapsed
                  </span>
                </div>
              </div>

              {/* Synthesis badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4239C4]/10 text-[#4239C4] text-xs font-bold border border-[#7A5DBB]/30 relative z-10 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#7A5DBB]" />
                <span>Synthesizing Feasibility & Decision Matrix Behind the Scenes</span>
              </div>
            </div>
          )}

          {!loading && !blueprint && (
            <div className="card-glass rounded-2xl p-12 text-center space-y-4 min-h-[460px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center border border-[#7A5DBB]/20">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-base font-bold text-slate-900">Ready to Generate Blueprint</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Configure your business and product details on the left or select a quick preset, then click Generate to synthesize a complete 24-point marketing strategy report.
                </p>
              </div>
            </div>
          )}

          {!loading && blueprint && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Output Action Bar */}
              <div className="card-glass rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4239C4] animate-pulse"></span>
                    <h2 className="text-sm font-bold text-slate-900">
                      Strategy Report: <span className="text-[#4239C4]">{formData.productName}</span>
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Synthesized by Marky Strategy Engine • Evidence-Based Executive Advisory
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeployToCampaign}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#181335] hover:bg-[#251D4E] text-white rounded-xl shadow-xs transition-colors cursor-pointer border border-[#7A5DBB]/30"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#D1C3FF]" />
                    <span>Deploy to Campaign</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyBlueprint}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#4239C4]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#4239C4] hover:bg-[#362eb0] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export .md</span>
                  </button>
                </div>
              </div>

              {/* 4 Executive Ratings Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Business Rating</span>
                  <p className="text-2xl font-black text-slate-900">
                    {blueprint.ratings?.overallBusinessRating || 78}<span className="text-xs font-normal text-slate-400">/100</span>
                  </p>
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/20">
                    High Viability
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Feasibility Rating</span>
                  <p className="text-2xl font-black text-slate-900">
                    {blueprint.ratings?.feasibility?.score || 74}<span className="text-xs font-normal text-slate-400">/100</span>
                  </p>
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    Calculated Basis
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A5DBB]">Business Opportunity</span>
                  <p className="text-2xl font-black text-[#4239C4]">
                    {blueprint.ratings?.businessOpportunity?.score || 82}<span className="text-xs font-normal text-[#7A5DBB]/60">/100</span>
                  </p>
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/20">
                    High Demand
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Marketing Readiness</span>
                  <p className="text-2xl font-black text-amber-700">
                    {blueprint.ratings?.marketingReadiness?.score || 65}<span className="text-xs font-normal text-amber-400">/100</span>
                  </p>
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-100">
                    Prep Required
                  </span>
                </div>
              </div>

              {/* Feasibility Breakdown Table (Essential Evidence-Based Breakdown) */}
              {blueprint.ratings?.feasibility?.dimensions && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#4239C4]" />
                      <h4 className="text-xs font-bold text-slate-900">Feasibility Breakdown Table (Transparent Assessment)</h4>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">Weighted Dimension Scores</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase">
                          <th className="pb-2">Dimension</th>
                          <th className="pb-2 text-right">Score</th>
                          <th className="pb-2 pl-4">Why the Score is High or Low</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {blueprint.ratings.feasibility.dimensions.map((dim, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2 font-bold text-slate-800 whitespace-nowrap">{dim.name}</td>
                            <td className="py-2 text-right">
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                                dim.score >= 75 ? 'bg-[#4239C4]/10 text-[#4239C4]' :
                                dim.score >= 60 ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {dim.score}/100
                              </span>
                            </td>
                            <td className="py-2 pl-4 text-slate-600 leading-relaxed text-[11px]">{dim.explanation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {blueprint.ratings?.marketingReadiness?.distinction && (
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-[11px] text-amber-950 leading-relaxed flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Market Opportunity vs Marketing Readiness: </strong>
                        {blueprint.ratings.marketingReadiness.distinction}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* What is Working vs What is Holding Back & Bad Assumptions */}
              {blueprint.strengthsAndWeaknesses && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-[#4239C4]/5 border border-[#7A5DBB]/30 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#241B4B] flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-[#4239C4]" />
                      What is Working
                    </span>
                    <ul className="text-xs text-slate-800 space-y-1.5 pl-4 list-disc">
                      {(blueprint.strengthsAndWeaknesses.whatIsWorking || []).map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      What is Holding the Business Back
                    </span>
                    <ul className="text-xs text-rose-950 space-y-1.5 pl-4 list-disc">
                      {(blueprint.strengthsAndWeaknesses.whatIsHoldingBack || []).map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Blueprint Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-1">
                {[
                  { id: 'summary', label: '1. Executive Summary & Verdict', icon: Award },
                  { id: 'customers', label: '2. Customer Intelligence', icon: Target },
                  { id: 'competitors', label: '3. Competitor Radar', icon: Compass },
                  { id: 'economics', label: '4. Unit Economics', icon: DollarSign },
                  { id: 'positioning', label: '5. Positioning & Offer', icon: ShoppingBag },
                  { id: 'channels', label: '6. Channels & Media Plan', icon: Megaphone },
                  { id: 'angles', label: '7. Ad Hooks & Scripts', icon: FileText },
                  { id: 'scenarios', label: '8. Strategic Scenarios', icon: TrendingUp },
                  { id: 'research', label: '9. Research & Sources', icon: BookOpen }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold whitespace-nowrap rounded-t-xl transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-white text-[#4239C4] border-t-2 border-[#4239C4] shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Panes */}
              <div className="card-glass rounded-2xl p-6 min-h-[400px] text-xs text-slate-800 space-y-5">
                
                {/* 1. Summary & AI CMO Verdict */}
                {activeTab === 'summary' && (
                  <div className="space-y-5 leading-relaxed">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 mb-1">Executive Positioning Thesis</h4>
                      <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                        {blueprint.executiveSummary}
                      </p>
                    </div>

                    {/* AI CMO Verdict Box */}
                    {blueprint.aiCmoVerdict && (
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-[#0B091B] text-white border border-[#2B2754] space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-[#D1C3FF]" />
                            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">AI CMO Verdict</h4>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4239C4]/25 text-[#D1C3FF] border border-[#7A5DBB]/40">
                            Final Recommendation
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                            <span className="text-[10px] font-extrabold uppercase text-[#A59FFF]">What Marky Would Do</span>
                            <p className="text-slate-200 leading-relaxed">{blueprint.aiCmoVerdict.whatMarkyWouldDo}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                            <span className="text-[10px] font-extrabold uppercase text-rose-400">What Marky Would NOT Do</span>
                            <p className="text-slate-200 leading-relaxed">{blueprint.aiCmoVerdict.whatMarkyWouldNotDo}</p>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#4239C4]/15 border border-[#7A5DBB]/30 space-y-1">
                          <span className="text-[10px] font-extrabold uppercase text-[#D1C3FF]">#1 Immediate Priority</span>
                          <p className="text-white font-medium">{blueprint.aiCmoVerdict.firstPriority}</p>
                        </div>

                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400">Final Strategic Recommendation</span>
                          <p className="text-slate-200 leading-relaxed italic">{blueprint.aiCmoVerdict.finalRecommendation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Customer Intelligence */}
                {activeTab === 'customers' && blueprint.customerIntelligence && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#4239C4]/10 border border-[#7A5DBB]/30 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-[#7A5DBB]">Crucial Customer Insight</span>
                      <p className="text-sm font-bold text-[#241B4B]">{blueprint.customerIntelligence.keyCustomerInsight}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <h5 className="font-bold text-slate-900 text-xs uppercase text-slate-500">Primary Segment Profile</h5>
                        <p className="text-slate-700 leading-relaxed">{blueprint.customerIntelligence.primarySegment}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <h5 className="font-bold text-slate-900 text-xs uppercase text-slate-500">Core Motivations & Desires</h5>
                        <p className="text-slate-700 leading-relaxed">{blueprint.customerIntelligence.motivations}</p>
                      </div>
                    </div>

                    {blueprint.customerIntelligence.objections && (
                      <div className="space-y-2 pt-2">
                        <h5 className="font-bold text-slate-900 text-xs">Customer Objections & Counter-Strategies</h5>
                        <div className="space-y-2">
                          {blueprint.customerIntelligence.objections.map((obj, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                              <p className="text-rose-950 font-bold">❌ Objection: "{obj.objection}"</p>
                              <p className="text-slate-800 font-medium pl-4 border-l-2 border-[#7A5DBB]">
                                ✔ Strategy: {obj.counterStrategy}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Competitor Intelligence */}
                {activeTab === 'competitors' && blueprint.competitorIntelligence && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="font-extrabold text-sm text-slate-900">Competitor Comparison & Market White Space</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        Competitive Radar
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(blueprint.competitorIntelligence.competitors || []).map((comp, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-slate-900 text-sm">{comp.name}</h5>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {comp.pricing}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px]"><strong className="text-slate-700">Positioning:</strong> {comp.positioning}</p>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                            <p className="text-slate-600"><strong className="text-[#4239C4]">Strength:</strong> {comp.strengths}</p>
                            <p className="text-slate-600"><strong className="text-rose-700">Weakness:</strong> {comp.weaknesses}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {blueprint.competitorIntelligence.marketWhiteSpace && (
                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1">
                        <strong className="text-blue-900 text-xs uppercase tracking-wider block">Identified Market White Space:</strong>
                        <p className="leading-relaxed">{blueprint.competitorIntelligence.marketWhiteSpace}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Unit Economics */}
                {activeTab === 'economics' && blueprint.unitEconomics && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-slate-900">Transparent Unit Economics & CAC Ceiling</h4>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Selling Price</span>
                        <p className="text-base font-extrabold text-slate-900">{blueprint.unitEconomics.sellingPrice}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">COGS / Unit Cost</span>
                        <p className="text-base font-extrabold text-slate-900">{blueprint.unitEconomics.cogs}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#4239C4]/10 border border-[#7A5DBB]/30 space-y-0.5">
                        <span className="text-[10px] font-bold text-[#7A5DBB] uppercase">Gross Margin</span>
                        <p className="text-base font-extrabold text-[#4239C4]">{blueprint.unitEconomics.grossMargin}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Break-Even ROAS</span>
                        <p className="text-base font-extrabold text-slate-900">{blueprint.unitEconomics.breakEvenRoas}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-900">Mathematical Calculation Basis:</span>
                      <p className="text-slate-600 leading-relaxed font-mono text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {blueprint.unitEconomics.calculationsTransparency}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Sustainable CAC Ceiling</span>
                        <p className="text-lg font-black text-slate-900">{blueprint.unitEconomics.sustainableCacCeiling}</p>
                        <p className="text-[10px] text-slate-500">Max allowable cost per acquisition before margin decay.</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#4239C4]/10 border border-[#7A5DBB]/30 space-y-1">
                        <span className="text-[10px] font-bold text-[#7A5DBB] uppercase">Target AOV Recommendation</span>
                        <p className="text-lg font-black text-[#4239C4]">{blueprint.unitEconomics.recommendedAov}</p>
                        <p className="text-[10px] text-[#7A5DBB]">Forces basket size above single-jar risk threshold.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Positioning & Offer Strategy */}
                {activeTab === 'positioning' && (
                  <div className="space-y-4">
                    {blueprint.positioningStrategy && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400">Recommended Market Positioning</span>
                        <p className="text-sm font-bold text-slate-900">{blueprint.positioningStrategy.recommendedPositioning}</p>
                        <p className="text-slate-600 text-xs">{blueprint.positioningStrategy.coreValueProposition}</p>
                      </div>
                    )}

                    {blueprint.productAndOfferAnalysis?.recommendedOffers && (
                      <div className="space-y-2 pt-2">
                        <h5 className="font-bold text-slate-900 text-xs">High-AOV Offer Funnel Architecture</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {blueprint.productAndOfferAnalysis.recommendedOffers.map((off, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#4239C4]/10 text-[#4239C4]">
                                {off.offerType}
                              </span>
                              <h6 className="font-bold text-slate-900 text-sm">{off.name}</h6>
                              <p className="text-[#4239C4] font-extrabold text-sm">{off.price}</p>
                              <p className="text-slate-600 text-[11px] leading-relaxed">{off.rationale}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {blueprint.positioningStrategy?.positioningToAvoid && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                        <strong className="text-rose-900 text-xs uppercase tracking-wider block">Positioning Angles to Avoid:</strong>
                        <p className="text-[11px] leading-relaxed">{blueprint.positioningStrategy.positioningToAvoid}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Channels & Media Allocation */}
                {activeTab === 'channels' && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-slate-900">Platform Prioritization & Channel Classification</h4>
                    
                    <div className="space-y-2.5">
                      {(blueprint.channelStrategy || []).map((ch, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h5 className="font-bold text-slate-900 text-xs">{ch.channel}</h5>
                            <p className="text-slate-600 text-[11px] leading-relaxed">{ch.rationale}</p>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${
                            ch.classification === 'PRIMARY' ? 'bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/30' :
                            ch.classification === 'SECONDARY' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                            ch.classification === 'EXPERIMENTAL' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}>
                            {ch.classification}
                          </span>
                        </div>
                      ))}
                    </div>

                    {blueprint.budgetRecommendation?.allocation && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 pt-3">
                        <h5 className="font-bold text-slate-900 text-xs">Recommended Budget Allocation</h5>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {blueprint.budgetRecommendation.allocation.map((b, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-center space-y-0.5">
                              <span className="text-[10px] text-slate-500 block truncate">{b.platform}</span>
                              <span className="text-sm font-extrabold text-slate-900">{b.share}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. Ad Hooks & Viral Scripts */}
                {activeTab === 'angles' && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-slate-900">Direct-Response Ad Angles & First 3-Second Hooks</h4>
                    
                    <div className="space-y-3">
                      {(blueprint.contentAndCreativeStrategy?.adAnglesAndHooks || blueprint.adAnglesAndHooks || []).map((ang, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#4239C4]/10 text-[#4239C4]">
                              {ang.stage}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{ang.angleName}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-bold text-[#7A5DBB] uppercase">3-Second Opening Script:</span>
                            <p className="text-slate-900 font-bold text-xs italic">"{ang.hookScript}"</p>
                          </div>
                          <div className="text-[11px] text-slate-600">
                            <strong className="text-slate-700">Visual Staging:</strong> {ang.visualAction}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. Strategic Scenarios */}
                {activeTab === 'scenarios' && blueprint.strategicScenarios && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="font-extrabold text-sm text-slate-900">30-Day Growth Projections (Conservative / Base / Upside)</h4>
                      <span className="text-[10px] font-medium text-slate-500">Labelled Projections</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {blueprint.strategicScenarios.map((sc, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border space-y-2.5 ${
                          sc.scenario === 'Base Case' ? 'bg-[#4239C4]/5 border-[#7A5DBB]/30' : 'bg-white border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <h5 className="font-extrabold text-slate-900 text-sm">{sc.scenario}</h5>
                            <span className="text-xs font-bold text-[#4239C4]">{sc.roas} ROAS</span>
                          </div>
                          <div className="space-y-1 text-xs text-slate-700">
                            <p><strong className="text-slate-500">Est. Spend:</strong> {sc.spend}</p>
                            <p><strong className="text-slate-500">Est. Orders:</strong> {sc.orders}</p>
                            <p><strong className="text-slate-500">Revenue:</strong> <span className="font-bold text-slate-900">{sc.revenue}</span></p>
                            <p><strong className="text-slate-500">Est. CAC:</strong> {sc.cac}</p>
                          </div>
                          <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100 leading-snug">
                            {sc.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. Research & Sources */}
                {activeTab === 'research' && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-slate-900">Research & External Sources</h4>
                    
                    <div className="space-y-2.5">
                      {(blueprint.researchAndSources || []).map((src, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-slate-900 text-xs">{src.title}</h5>
                            <span className="text-[10px] font-mono text-slate-400">{src.domain}</span>
                          </div>
                          <p className="text-[11px] text-slate-600"><strong className="text-slate-700">Finding:</strong> {src.whatFound}</p>
                          <p className="text-[11px] text-[#4239C4]"><strong className="text-[#241B4B]">Why it matters:</strong> {src.whyItMatters}</p>
                        </div>
                      ))}
                    </div>

                    {blueprint.dataGapsAndAssumptions && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <h5 className="font-bold text-slate-900 text-xs">Information Quality & Data Gaps</h5>
                        <div className="space-y-1.5">
                          {blueprint.dataGapsAndAssumptions.map((gap, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider ${
                                gap.type === 'CONFIRMED' ? 'bg-[#4239C4]/10 text-[#4239C4]' :
                                gap.type === 'CALCULATED' ? 'bg-blue-100 text-blue-800' :
                                gap.type === 'ESTIMATE' ? 'bg-amber-100 text-amber-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {gap.type}
                              </span>
                              <span>{gap.detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
