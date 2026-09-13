// MARKY — 97 AI Marketing Tools Registry
// Each tool is independently selectable and executable.
// providerType: 'text' (LLM), 'calculator' (deterministic), 'image', 'video'

export const TOOL_CATEGORIES = [
  'All',
  'Advertising',
  'Social Media',
  'E-Commerce',
  'SEO',
  'Copywriting',
  'Market Research',
  'Email Marketing',
  'Content',
  'Analytics',
  'Creative Studio'
];

export const MARKETING_TOOLS = [
  // ═══════════════════════════════════════════════════════════
  // 1–6. ADVERTISING
  // ═══════════════════════════════════════════════════════════
  {
    id: 'fb-ad-copy',
    name: 'Facebook & Instagram Ad Copy',
    category: 'Advertising',
    description: 'High-converting direct-response ad copy with hook, body, and CTA tailored for Meta Ads Advantage+.',
    badge: 'High ROAS',
    icon: 'Megaphone',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g., KMB Sidr Honey' },
      { key: 'targetAudience', label: 'Target Audience', placeholder: 'e.g., Pakistani health-conscious families' },
      { key: 'keyBenefits', label: 'Key Benefits', placeholder: 'e.g., 100% pure raw honey, cash on delivery, lab certified' },
      { key: 'offer', label: 'Offer / CTA', placeholder: 'e.g., Free shipping on orders over PKR 3000' },
      { key: 'tone', label: 'Tone', placeholder: 'e.g., Urgent & Authentic, Luxury, or Problem-Agitate' }
    ]
  },
  {
    id: 'tiktok-hook-script',
    name: 'TikTok Video Hook & Script',
    category: 'Advertising',
    description: 'Viral 3-second scroll-stopping hooks and 25-second UGC video script with visual cue directions.',
    badge: 'Viral',
    icon: 'Video',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g., Cydaix Leather Cardholder' },
      { key: 'targetAudience', label: 'Audience', placeholder: 'e.g., University students and young professionals' },
      { key: 'hookStyle', label: 'Hook Style', placeholder: 'e.g., Curiosity, Controversy, or "Stop making this mistake"' },
      { key: 'offer', label: 'Special Offer / CTA', placeholder: 'e.g., Flat 20% off + Free Shipping' }
    ]
  },
  {
    id: 'google-search-ads',
    name: 'Google Search Ads Headlines',
    category: 'Advertising',
    description: 'High CTR Responsive Search Ads (RSA) headlines and descriptions with exact keyword match intent.',
    badge: 'Popular',
    icon: 'Search',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product or Service', placeholder: 'e.g., Bridal Dress Rental Lahore' },
      { key: 'keywords', label: 'Target Search Keywords', placeholder: 'e.g., bridal rent lahore, designer lehenga rental' },
      { key: 'uniqueSellingPoint', label: 'USP', placeholder: 'e.g., 500+ curated designer dresses, instant fitting' }
    ]
  },
  {
    id: 'daraz-sponsored-ad',
    name: 'Daraz Sponsored Product Pitch',
    category: 'Advertising',
    description: 'Daraz keyword targeting tags and sponsored banner pitch designed to win search placement.',
    badge: 'Daraz VIP',
    icon: 'ShoppingBag',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g., Lumina Vitamin C Face Serum' },
      { key: 'category', label: 'Daraz Category', placeholder: 'e.g., Health & Beauty > Skin Care' },
      { key: 'pricePoint', label: 'Price (PKR)', placeholder: 'e.g., 1850' }
    ]
  },
  {
    id: 'retargeting-ad-angles',
    name: 'Cart Abandonment Retargeting Ads',
    category: 'Advertising',
    description: 'High-urgency retargeting ads addressing COD doubts, price hesitation, and delivery trust.',
    badge: 'High ROAS',
    icon: 'Repeat',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g., Handcrafted Leather Boots' },
      { key: 'objection', label: 'Primary Buyer Objection', placeholder: 'e.g., Wondering if size fits or fear of online scams' },
      { key: 'incentive', label: 'Closing Incentive', placeholder: 'e.g., Free exchange guarantee + 10% coupon code' }
    ]
  },
  {
    id: 'ig-carousel-copy',
    name: 'Instagram Carousel Ad Slides',
    category: 'Advertising',
    description: 'Multi-slide storytelling copy that keeps users swiping from hook slide to final checkout offer.',
    badge: 'PRO',
    icon: 'Layers',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product / Brand', placeholder: 'e.g., Organic Cold-Pressed Hair Oil' },
      { key: 'coreProblem', label: 'Problem Being Solved', placeholder: 'e.g., Hair thinning and split ends' },
      { key: 'numberOfSlides', label: 'Slide Count', placeholder: 'e.g., 5 Slides' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 7–11. SOCIAL MEDIA
  // ═══════════════════════════════════════════════════════════
  {
    id: 'viral-reel-script',
    name: 'Instagram Reel & Shorts Script',
    category: 'Social Media',
    description: 'Engaging short-form video breakdown with B-roll instructions, captions, and sound recommendation.',
    badge: 'Viral',
    icon: 'PlayCircle',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product / Topic', placeholder: 'e.g., Daily office essentials for Pakistani men' },
      { key: 'vibe', label: 'Vibe', placeholder: 'e.g., Aesthetic minimalist, Fast-paced vlog, or Satirical' }
    ]
  },
  {
    id: 'tiktok-caption-hashtags',
    name: 'TikTok Captions & SEO Hashtags',
    category: 'Social Media',
    description: 'Algorithm-optimized captions with trending keyword tags to trigger the TikTok search engine.',
    badge: 'Popular',
    icon: 'Hash',
    providerType: 'text',
    inputs: [
      { key: 'videoTopic', label: 'What happens in the video?', placeholder: 'e.g., Packing orders for customer in Karachi' },
      { key: 'targetRegion', label: 'Country / City', placeholder: 'e.g., Pakistan, Lahore, Karachi' }
    ]
  },
  {
    id: 'linkedin-thought-leadership',
    name: 'LinkedIn E-Commerce Founder Post',
    category: 'Social Media',
    description: 'High-engagement personal brand stories, e-commerce milestones, and supply chain lessons.',
    badge: 'PRO',
    icon: 'Share2',
    providerType: 'text',
    inputs: [
      { key: 'topic', label: 'Topic or Lesson', placeholder: 'e.g., How we scaled our D2C brand to PKR 10M revenue without VC funding' },
      { key: 'keyTakeaway', label: 'Key Takeaway', placeholder: 'e.g., Cash on delivery management is harder than ad buying' }
    ]
  },
  {
    id: 'twitter-thread-generator',
    name: 'X / Twitter Growth Thread',
    category: 'Social Media',
    description: 'Gripping 7-tweet breakdown that establishes authority and drives profile visits.',
    badge: 'Viral',
    icon: 'MessageSquare',
    providerType: 'text',
    inputs: [
      { key: 'threadTopic', label: 'Core Subject', placeholder: 'e.g., 5 psychological marketing tricks Daraz sellers use' },
      { key: 'targetAudience', label: 'Audience', placeholder: 'e.g., Marketers, founders, and students' }
    ]
  },
  {
    id: 'influencer-outreach-dm',
    name: 'Influencer PR Collab DM Pitch',
    category: 'Social Media',
    description: 'Personalized, non-spammy DM pitch to local lifestyle micro-influencers offering PR packages.',
    badge: 'PRO',
    icon: 'Send',
    providerType: 'text',
    inputs: [
      { key: 'brandName', label: 'Your Brand Name', placeholder: 'e.g., Cydaix Leather' },
      { key: 'influencerNiche', label: 'Influencer Niche', placeholder: 'e.g., Menswear & Tech Lifestyle (10k-50k followers)' },
      { key: 'giftOffer', label: 'What are you sending?', placeholder: 'e.g., Personalized embossed leather wallet' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 12–16. E-COMMERCE
  // ═══════════════════════════════════════════════════════════
  {
    id: 'daraz-product-listing',
    name: 'Daraz Product Title & SEO Bullets',
    category: 'E-Commerce',
    description: 'Algorithm-ranked product title, highlight bullets, and search keyword attributes for Daraz PK.',
    badge: 'Daraz VIP',
    icon: 'Package',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g., Stainless Steel Insulated Tumbler 500ml' },
      { key: 'keyFeatures', label: 'Main Features', placeholder: 'e.g., Keeps cold 24h, leak-proof lid, food grade 304 steel' },
      { key: 'warranty', label: 'Warranty / Delivery', placeholder: 'e.g., 7 days replacement, COD nationwide' }
    ]
  },
  {
    id: 'shopify-product-description',
    name: 'Shopify High-Converting Description',
    category: 'E-Commerce',
    description: 'Compelling sales copy using formatting, emotional triggers, unboxing details, and FAQs.',
    badge: 'Popular',
    icon: 'FileText',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g., Sidr Pure Honey 1KG Jar' },
      { key: 'targetCustomer', label: 'Ideal Customer', placeholder: 'e.g., Families looking for pure winter immunity boost' },
      { key: 'ingredients', label: 'Ingredients / Material', placeholder: 'e.g., 100% Wild Berry Blossom Raw Honey' }
    ]
  },
  {
    id: 'feature-to-benefit',
    name: 'Feature-to-Benefit Translator',
    category: 'E-Commerce',
    description: 'Transforms boring technical specs into visceral emotional benefits that make people click "Buy".',
    badge: 'PRO',
    icon: 'Zap',
    providerType: 'text',
    inputs: [
      { key: 'features', label: 'List your technical features', placeholder: 'e.g., 0.8mm top-grain leather, YKK brass zippers, RFID blocking lining' }
    ]
  },
  {
    id: 'unboxing-script',
    name: 'E-Commerce Unboxing Experience Script',
    category: 'E-Commerce',
    description: 'Step-by-step unboxing script for customer UGC, including packaging cards and thank-you notes.',
    badge: 'New',
    icon: 'Gift',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g., Luxury Bridal Khussa Box' },
      { key: 'boxElements', label: 'What is inside the package?', placeholder: 'e.g., Silk dustbag, handwritten card, extra heel pads' }
    ]
  },
  {
    id: 'ecommerce-seo-keywords',
    name: 'E-Commerce Keyword Cluster Generator',
    category: 'E-Commerce',
    description: 'High commercial-intent keyword clusters categorized into Buyer Intent, Informational, and Long-Tail.',
    badge: 'SEO Pro',
    icon: 'Tag',
    providerType: 'text',
    inputs: [
      { key: 'productNiche', label: 'Product Niche / Category', placeholder: 'e.g., Organic Raw Honey Pakistan' },
      { key: 'targetCountry', label: 'Target Country', placeholder: 'e.g., Pakistan (Karachi, Lahore, Islamabad)' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 17–19. SEO
  // ═══════════════════════════════════════════════════════════
  {
    id: 'meta-tags-generator',
    name: 'SEO Meta Titles & Descriptions',
    category: 'SEO',
    description: 'Click-optimized SERP title tags (<60 chars) and meta descriptions (<155 chars) with power words.',
    badge: 'PRO',
    icon: 'Code',
    providerType: 'text',
    inputs: [
      { key: 'pageTopic', label: 'Page Title / Product', placeholder: 'e.g., Pure Sidr Honey Online in Pakistan' },
      { key: 'primaryKeyword', label: 'Main Keyword', placeholder: 'e.g., buy pure honey pakistan' }
    ]
  },
  {
    id: 'blog-outline-organic',
    name: 'Traffic-Driving Blog Post Outline',
    category: 'SEO',
    description: 'Comprehensive H2/H3 blog architecture designed to rank on Google and funnel readers to products.',
    badge: 'Popular',
    icon: 'FileCode',
    providerType: 'text',
    inputs: [
      { key: 'targetKeyword', label: 'Search Keyword', placeholder: 'e.g., how to test pure honey at home' },
      { key: 'productToPromote', label: 'Your Product to Plug', placeholder: 'e.g., KMB Raw Sidr Honey' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 19–21. MARKET RESEARCH
  // ═══════════════════════════════════════════════════════════
  {
    id: 'buyer-persona-builder',
    name: 'Deep Buyer Persona Architect',
    category: 'Market Research',
    description: 'Detailed demographic, psychographic, and emotional profile of your most profitable customer segment.',
    badge: 'Essential',
    icon: 'Users',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product', placeholder: 'e.g., Handmade Pure Leather Backpack' },
      { key: 'priceRange', label: 'Price Point', placeholder: 'e.g., PKR 8,500 - 12,000' },
      { key: 'targetMarket', label: 'Target Market', placeholder: 'e.g., Urban professionals aged 22-35 in Pakistan' }
    ]
  },
  {
    id: 'competitor-swot-generator',
    name: 'Competitor SWOT & Teardown Matrix',
    category: 'Market Research',
    description: 'Deep SWOT analysis highlighting competitors\' blind spots, ad fatigue, and your unfair advantage.',
    badge: 'PRO',
    icon: 'ShieldAlert',
    providerType: 'text',
    inputs: [
      { key: 'yourBrand', label: 'Your Brand', placeholder: 'e.g., KMB Honey' },
      { key: 'competitorBrand', label: 'Competitor Brand', placeholder: 'e.g., Marhaba Laboratories' },
      { key: 'market', label: 'Market / Category', placeholder: 'e.g., Natural Health Products Pakistan' }
    ]
  },
  {
    id: 'customer-pain-point-matrix',
    name: 'Customer Pain Points & Objections',
    category: 'Market Research',
    description: 'Maps out top 5 hidden anxieties, skepticism triggers, and exact copy answers to eliminate friction.',
    badge: 'High ROAS',
    icon: 'HelpCircle',
    providerType: 'text',
    inputs: [
      { key: 'productCategory', label: 'Product / Niche', placeholder: 'e.g., Buying stitched festive dresses online' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 22–26. COPYWRITING
  // ═══════════════════════════════════════════════════════════
  {
    id: 'pas-framework-copy',
    name: 'Problem-Agitate-Solve (PAS) Copy',
    category: 'Copywriting',
    description: 'The golden copywriting framework that stirs customer pain points before positioning your product as the hero.',
    badge: 'Popular',
    icon: 'Edit3',
    providerType: 'text',
    inputs: [
      { key: 'problem', label: 'The Pain Point', placeholder: 'e.g., Fake counterfeit cosmetics damaging skin' },
      { key: 'solution', label: 'Your Product', placeholder: 'e.g., Lumina Halal Certified Derma Skincare' }
    ]
  },
  {
    id: 'aida-framework-copy',
    name: 'Attention-Interest-Desire-Action (AIDA)',
    category: 'Copywriting',
    description: 'Classic high-converting sales blueprint for landing pages, advertorials, and long-form posts.',
    badge: 'Essential',
    icon: 'Sliders',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g., Usman Bridal Couture Rental' },
      { key: 'audience', label: 'Target Audience', placeholder: 'e.g., Brides looking for luxury dresses on sensible budget' }
    ]
  },
  {
    id: 'scarcity-urgency-banners',
    name: 'Scarcity & Urgency Promo Banners',
    category: 'Copywriting',
    description: 'Punchy countdown and header banner copy that triggers immediate checkout action.',
    badge: 'High ROAS',
    icon: 'Clock',
    providerType: 'text',
    inputs: [
      { key: 'saleType', label: 'Sale Occasion', placeholder: 'e.g., Ramadan Midnight Flash Sale' },
      { key: 'discount', label: 'Discount / Deal', placeholder: 'e.g., Flat 30% Off + Free COD Shipping' }
    ]
  },
  {
    id: 'roman-urdu-ad-copy',
    name: 'Roman Urdu & English Localizer',
    category: 'Copywriting',
    description: 'Transcreates English marketing copy into colloquial, culturally grounded Roman Urdu for Pakistani audiences.',
    badge: 'Pakistan VIP',
    icon: 'Globe',
    providerType: 'text',
    inputs: [
      { key: 'englishCopy', label: 'English Copy or Message', placeholder: 'e.g., Pure raw honey delivered to your doorstep with cash on delivery' },
      { key: 'targetStyle', label: 'Style / Dialect', placeholder: 'e.g., Casual Social Media, Authentic Punjabi touch, or Karachi youth' }
    ]
  },
  {
    id: 'cultural-angle-generator',
    name: 'Festive & Cultural Hook Angles',
    category: 'Copywriting',
    description: 'Generates localized campaign angles for Ramadan, Eid, Wedding Season, and Independence Day.',
    badge: 'Pakistan VIP',
    icon: 'Sparkles',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g., Premium Leather Cardholder' },
      { key: 'occasion', label: 'Festival / Season', placeholder: 'e.g., Eid Gifting / Shaadi Season Groomsmen Gift' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 27–29. E-COMMERCE (STORE TOOLS)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'value-proposition-builder',
    name: 'E-Commerce Value Proposition',
    category: 'E-Commerce',
    description: 'Crystal-clear homepage hero statements that explain why customers should buy from you instead of others.',
    badge: 'Essential',
    icon: 'Award',
    providerType: 'text',
    inputs: [
      { key: 'brandName', label: 'Brand Name', placeholder: 'e.g., Cydaix' },
      { key: 'industry', label: 'Industry', placeholder: 'e.g., Handcrafted Leather Accessories' },
      { key: 'targetUser', label: 'Who is it for?', placeholder: 'e.g., Ambitious corporate professionals' }
    ]
  },
  {
    id: 'review-response-assistant',
    name: 'Customer Review & Complaint Responder',
    category: 'E-Commerce',
    description: 'Polite, brand-strengthening replies for 5-star praise or angry delivery delay complaints.',
    badge: 'Popular',
    icon: 'Smile',
    providerType: 'text',
    inputs: [
      { key: 'reviewText', label: 'Customer Review / Comment', placeholder: 'e.g., Courier arrived 2 days late but product was good' },
      { key: 'sentiment', label: 'Sentiment', placeholder: 'e.g., Mixed / Minor Complaint' }
    ]
  },
  {
    id: 'return-cod-policy-generator',
    name: 'Cash-on-Delivery & Return Policy',
    category: 'E-Commerce',
    description: 'Clear, legal-sounding yet friendly Pakistani COD terms, parcel opening policy, and exchange rules.',
    badge: 'PRO',
    icon: 'FileCheck',
    providerType: 'text',
    inputs: [
      { key: 'brandName', label: 'Store Name', placeholder: 'e.g., KMB Honey Online' },
      { key: 'exchangeDays', label: 'Exchange Window', placeholder: 'e.g., 7 Days Hassle-Free Exchange' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 30–31. CONTENT
  // ═══════════════════════════════════════════════════════════
  {
    id: 'content-calendar-30days',
    name: '30-Day Social Content Calendar',
    category: 'Content',
    description: 'Full monthly roadmap balancing educational reels, behind-the-scenes, customer proof, and direct sales posts.',
    badge: 'Popular',
    icon: 'Calendar',
    providerType: 'text',
    inputs: [
      { key: 'brandNiche', label: 'Brand / Industry', placeholder: 'e.g., D2C Skincare & Beauty' },
      { key: 'targetMonth', label: 'Month / Focus', placeholder: 'e.g., Ramadan Pre-Eid Prep' }
    ]
  },
  {
    id: 'ugc-creator-brief',
    name: 'TikTok / UGC Creator Brief',
    category: 'Content',
    description: 'Clear 1-page guideline to send content creators, outlining dos, don\'ts, lighting, and required lines.',
    badge: 'PRO',
    icon: 'Camera',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g., Lumina Vitamin C Serum' },
      { key: 'mandatoryPhrase', label: 'Mandatory Words / CTA', placeholder: 'e.g., "Use code GLOW10 on Cash on Delivery"' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 32–33. EMAIL MARKETING (existing)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'abandoned-cart-email-flow',
    name: 'Abandoned Cart 3-Part Email Flow',
    category: 'Email Marketing',
    description: 'Sequenced emails: 1hr Reminder, 24hr Social Proof & FAQ, and 48hr Expiring Discount.',
    badge: 'High ROAS',
    icon: 'Mail',
    providerType: 'text',
    inputs: [
      { key: 'storeName', label: 'Store Name', placeholder: 'e.g., Cydaix Leather' },
      { key: 'productCategory', label: 'Product Category', placeholder: 'e.g., Wallets & Accessories' },
      { key: 'discountOffer', label: 'Last-Chance Discount', placeholder: 'e.g., 10% Off with code COMEBACK10' }
    ]
  },
  {
    id: 'vip-flash-sale-broadcast',
    name: 'VIP WhatsApp & Email Broadcast',
    category: 'Email Marketing',
    description: 'Direct, high-urgency message designed for WhatsApp bulk campaigns or email subscriber lists.',
    badge: 'Viral',
    icon: 'Send',
    providerType: 'text',
    inputs: [
      { key: 'dealDetails', label: 'Offer Details', placeholder: 'e.g., Buy 1 Get 1 Free on all Sidr Honey Jars' },
      { key: 'deadline', label: 'Deadline', placeholder: 'e.g., Next 24 Hours Only' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 34–35. ANALYTICS (CALCULATORS)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'roas-calculator-tool',
    name: 'Break-Even ROAS & CPA Calculator',
    category: 'Analytics',
    description: 'Instant mathematical breakdown of gross margins, break-even ROAS, and max customer acquisition cost.',
    badge: 'Essential',
    icon: 'Calculator',
    providerType: 'calculator',
    inputs: [
      { key: 'price', label: 'Selling Price (PKR)', placeholder: '3500' },
      { key: 'cost', label: 'Product Cost / COGS (PKR)', placeholder: '1200' },
      { key: 'adSpend', label: 'Expected Daily Ad Spend (PKR)', placeholder: '5000' }
    ]
  },
  {
    id: 'discount-margin-calculator',
    name: 'Sale Discount & Profit Estimator',
    category: 'Analytics',
    description: 'Calculates true net profit after factoring in product discount, courier COD fee, and packaging costs.',
    badge: 'PRO',
    icon: 'Percent',
    providerType: 'calculator',
    inputs: [
      { key: 'price', label: 'Original Retail Price', placeholder: '4000' },
      { key: 'cost', label: 'COGS', placeholder: '1500' },
      { key: 'discount', label: 'Discount Percentage (%)', placeholder: '25' },
      { key: 'courierFee', label: 'Average Courier Fee (PKR)', placeholder: '250' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 36. IMAGE PROMPTS / CREATIVE
  // ═══════════════════════════════════════════════════════════
  {
    id: 'midjourney-ecommerce-prompt',
    name: 'Midjourney & Ideogram Product Shot Prompt',
    category: 'Creative Studio',
    description: 'Studio lighting, 8k commercial photography prompt templates for high-converting product hero shots.',
    badge: 'AI VIP',
    icon: 'Image',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product / Object', placeholder: 'e.g., Amber glass honey jar with wooden dipper' },
      { key: 'setting', label: 'Setting / Background', placeholder: 'e.g., Minimalist warm kitchen marble counter, morning sunlight' },
      { key: 'cameraStyle', label: 'Aesthetic', placeholder: 'e.g., Hasselblad macro lens, soft cinematic bokeh, luxury commercial' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 37–38. COPYWRITING (STRATEGY)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'offer-bundling-strategist',
    name: 'Irresistible Offer & Bundle Architect',
    category: 'Copywriting',
    description: 'Creates tiered bundles (Good, Better, Best) to explode Average Order Value (AOV) on your store.',
    badge: 'High ROAS',
    icon: 'Layers',
    providerType: 'text',
    inputs: [
      { key: 'coreProduct', label: 'Main Hero Product', placeholder: 'e.g., 500g Sidr Raw Honey' },
      { key: 'price', label: 'Price', placeholder: 'PKR 2,200' },
      { key: 'availableAccessories', label: 'Potential Add-ons', placeholder: 'e.g., Wooden honey dipper, herbal tea box, royal jelly' }
    ]
  },
  {
    id: 'slogan-tagline-generator',
    name: 'Catchy E-Commerce Slogans & Taglines',
    category: 'Copywriting',
    description: 'Memorable, punchy brand taglines for packaging boxes, website headers, and tape branding.',
    badge: 'Popular',
    icon: 'CheckCircle',
    providerType: 'text',
    inputs: [
      { key: 'brandName', label: 'Brand Name', placeholder: 'e.g., Zest Apparel' },
      { key: 'vibe', label: 'Brand Identity', placeholder: 'e.g., Fast, vibrant, budget-friendly festive style' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 39–45. CONVERSION & STRATEGY (NEW TOOLS)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'landing-page-optimizer',
    name: 'Landing Page Conversion Optimizer',
    category: 'Copywriting',
    description: 'Analyzes your landing page structure and rewrites headlines, CTAs, and trust sections for maximum conversions.',
    badge: 'High ROAS',
    icon: 'Layout',
    providerType: 'text',
    inputs: [
      { key: 'currentHeadline', label: 'Current Headline', placeholder: 'e.g., Welcome to Our Store' },
      { key: 'productName', label: 'Product / Service', placeholder: 'e.g., Premium Sidr Honey' },
      { key: 'targetAudience', label: 'Target Audience', placeholder: 'e.g., Health-conscious families' },
      { key: 'currentCTA', label: 'Current CTA Text', placeholder: 'e.g., Buy Now' }
    ]
  },
  {
    id: 'homepage-hero-generator',
    name: 'Homepage Hero Section Generator',
    category: 'Copywriting',
    description: 'Creates an attention-grabbing hero section with headline, subheadline, CTA, and trust badges.',
    badge: 'Essential',
    icon: 'Monitor',
    providerType: 'text',
    inputs: [
      { key: 'brandName', label: 'Brand Name', placeholder: 'e.g., Cydaix' },
      { key: 'mainProduct', label: 'Hero Product / Service', placeholder: 'e.g., Handcrafted Italian Leather Goods' },
      { key: 'usp', label: 'Unique Selling Proposition', placeholder: 'e.g., Made by master artisans, 100-year warranty' },
      { key: 'audience', label: 'Target Audience', placeholder: 'e.g., Executive professionals aged 25-45' }
    ]
  },
  {
    id: 'product-launch-planner',
    name: 'Product Launch Campaign Planner',
    category: 'Market Research',
    description: 'Full pre-launch to post-launch timeline with channel strategy, content plan, and KPI targets.',
    badge: 'PRO',
    icon: 'Rocket',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g., KMB Manuka Honey Collection' },
      { key: 'launchDate', label: 'Launch Date', placeholder: 'e.g., March 15, 2025' },
      { key: 'budget', label: 'Marketing Budget', placeholder: 'e.g., PKR 200,000' },
      { key: 'channels', label: 'Primary Channels', placeholder: 'e.g., Instagram, TikTok, WhatsApp' }
    ]
  },
  {
    id: 'marketing-campaign-brief',
    name: 'Marketing Campaign Brief',
    category: 'Market Research',
    description: 'Structured campaign brief with objectives, audience, messaging, channels, timeline, and success metrics.',
    badge: 'Essential',
    icon: 'ClipboardList',
    providerType: 'text',
    inputs: [
      { key: 'campaignName', label: 'Campaign Name', placeholder: 'e.g., Ramadan Essentials 2025' },
      { key: 'objective', label: 'Primary Objective', placeholder: 'e.g., Drive 500 new orders via WhatsApp + Meta Ads' },
      { key: 'budget', label: 'Budget', placeholder: 'e.g., PKR 150,000' },
      { key: 'duration', label: 'Duration', placeholder: 'e.g., 30 days' }
    ]
  },
  {
    id: 'full-funnel-strategy',
    name: 'Full-Funnel Marketing Strategy',
    category: 'Market Research',
    description: 'Complete TOFU → MOFU → BOFU strategy with content types, ad formats, and conversion tactics per stage.',
    badge: 'PRO',
    icon: 'TrendingUp',
    providerType: 'text',
    inputs: [
      { key: 'brandName', label: 'Brand Name', placeholder: 'e.g., KMB Honey' },
      { key: 'product', label: 'Core Product', placeholder: 'e.g., Premium Raw Sidr Honey' },
      { key: 'monthlyBudget', label: 'Monthly Ad Budget', placeholder: 'e.g., PKR 100,000' },
      { key: 'primaryChannel', label: 'Primary Channel', placeholder: 'e.g., Meta Ads + WhatsApp' }
    ]
  },
  {
    id: 'customer-journey-mapper',
    name: 'Customer Journey Mapper',
    category: 'Market Research',
    description: 'Maps the complete customer journey from awareness to repeat purchase with touchpoints and content needs.',
    badge: 'Essential',
    icon: 'Map',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product / Service', placeholder: 'e.g., Organic Hair Oil' },
      { key: 'targetAudience', label: 'Target Audience', placeholder: 'e.g., Women aged 20-35 with hair concerns' },
      { key: 'primaryChannel', label: 'Primary Sales Channel', placeholder: 'e.g., Instagram → WhatsApp → COD' }
    ]
  },
  {
    id: 'marketing-funnel-architect',
    name: 'Marketing Funnel Architect',
    category: 'Market Research',
    description: 'Designs a complete marketing funnel with lead magnets, nurture sequences, and conversion triggers.',
    badge: 'PRO',
    icon: 'Filter',
    providerType: 'text',
    inputs: [
      { key: 'businessType', label: 'Business Type', placeholder: 'e.g., D2C E-Commerce, SaaS, or Service' },
      { key: 'product', label: 'Product / Service', placeholder: 'e.g., Premium Leather Goods' },
      { key: 'averageOrderValue', label: 'Average Order Value', placeholder: 'e.g., PKR 5,000' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 46–47. LEAD GENERATION
  // ═══════════════════════════════════════════════════════════
  {
    id: 'lead-magnet-creator',
    name: 'Lead Magnet Creator',
    category: 'Market Research',
    description: 'Designs irresistible lead magnets (guides, checklists, calculators) to capture emails and WhatsApp contacts.',
    badge: 'Essential',
    icon: 'Magnet',
    providerType: 'text',
    inputs: [
      { key: 'industry', label: 'Industry / Niche', placeholder: 'e.g., Natural Health & Wellness' },
      { key: 'targetAudience', label: 'Target Audience', placeholder: 'e.g., Health-conscious mothers aged 25-40' },
      { key: 'goal', label: 'Goal', placeholder: 'e.g., Build WhatsApp subscriber list' }
    ]
  },
  {
    id: 'lead-nurture-sequence',
    name: 'Lead Nurture Sequence',
    category: 'Email Marketing',
    description: '5-part email/WhatsApp nurture sequence that builds trust, educates, and converts cold leads to buyers.',
    badge: 'High ROAS',
    icon: 'GitBranch',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product / Service', placeholder: 'e.g., Organic Sidr Honey' },
      { key: 'leadSource', label: 'Lead Source', placeholder: 'e.g., Instagram Ad → Landing Page' },
      { key: 'mainObjection', label: 'Main Buyer Objection', placeholder: 'e.g., Is this really pure honey?' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 48–54. OUTREACH & SALES EMAILS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'cold-email-campaign',
    name: 'Cold Email Campaign Generator',
    category: 'Email Marketing',
    description: 'Multi-step cold email sequence with personalization hooks, value props, and soft CTAs.',
    badge: 'B2B',
    icon: 'Mail',
    providerType: 'text',
    inputs: [
      { key: 'yourCompany', label: 'Your Company', placeholder: 'e.g., Marky AI' },
      { key: 'targetRole', label: 'Target Role', placeholder: 'e.g., Marketing Manager at D2C brands' },
      { key: 'valueProposition', label: 'What You Offer', placeholder: 'e.g., 97 AI marketing tools in one platform' },
      { key: 'cta', label: 'Desired Action', placeholder: 'e.g., Book a 15-min demo call' }
    ]
  },
  {
    id: 'cold-dm-outreach',
    name: 'Cold DM Outreach Generator',
    category: 'Social Media',
    description: 'Non-spammy Instagram/LinkedIn DM sequences for partnership, wholesale, or collaboration outreach.',
    badge: 'B2B',
    icon: 'MessageCircle',
    providerType: 'text',
    inputs: [
      { key: 'yourBrand', label: 'Your Brand', placeholder: 'e.g., Cydaix Leather' },
      { key: 'targetPerson', label: 'Who are you DM-ing?', placeholder: 'e.g., Boutique store owners in Lahore' },
      { key: 'offer', label: 'What are you offering?', placeholder: 'e.g., Wholesale partnership with 40% margins' }
    ]
  },
  {
    id: 'b2b-sales-email',
    name: 'B2B Sales Email Writer',
    category: 'Email Marketing',
    description: 'Professional B2B sales emails that open doors with enterprise buyers, procurement teams, and decision-makers.',
    badge: 'B2B',
    icon: 'Briefcase',
    providerType: 'text',
    inputs: [
      { key: 'product', label: 'Product / Service', placeholder: 'e.g., AI-Powered Marketing Automation' },
      { key: 'targetCompany', label: 'Target Company Type', placeholder: 'e.g., Mid-size e-commerce brands doing PKR 5M+/mo' },
      { key: 'differentiator', label: 'Key Differentiator', placeholder: 'e.g., 97 specialized tools vs generic ChatGPT' }
    ]
  },
  {
    id: 'sales-followup-sequence',
    name: 'Sales Follow-Up Sequence',
    category: 'Email Marketing',
    description: '4-step follow-up sequence that keeps you top-of-mind without being annoying.',
    badge: 'PRO',
    icon: 'RefreshCw',
    providerType: 'text',
    inputs: [
      { key: 'context', label: 'What happened before?', placeholder: 'e.g., Had a demo call, they said they need to think about it' },
      { key: 'product', label: 'Product / Service', placeholder: 'e.g., Marketing automation software' },
      { key: 'timeline', label: 'Follow-up Timeline', placeholder: 'e.g., Day 2, Day 5, Day 10, Day 21' }
    ]
  },
  {
    id: 'meeting-booking-email',
    name: 'Meeting Booking Email',
    category: 'Email Marketing',
    description: 'Concise, high-conversion emails designed to get prospects to book a meeting or demo call.',
    badge: 'B2B',
    icon: 'CalendarCheck',
    providerType: 'text',
    inputs: [
      { key: 'purpose', label: 'Meeting Purpose', placeholder: 'e.g., Product demo for new AI marketing suite' },
      { key: 'recipientRole', label: 'Recipient Role', placeholder: 'e.g., Head of Marketing at fashion brand' },
      { key: 'valueHook', label: 'Value Hook', placeholder: 'e.g., How we helped a similar brand cut CAC by 40%' }
    ]
  },
  {
    id: 'linkedin-outreach-sequence',
    name: 'LinkedIn Outreach Sequence',
    category: 'Social Media',
    description: '3-step LinkedIn connection request + follow-up message sequence for B2B lead generation.',
    badge: 'B2B',
    icon: 'Linkedin',
    providerType: 'text',
    inputs: [
      { key: 'yourRole', label: 'Your Role / Title', placeholder: 'e.g., Founder at Marky AI' },
      { key: 'targetRole', label: 'Target Person Role', placeholder: 'e.g., CMO at mid-size D2C brands' },
      { key: 'sharedContext', label: 'Common Ground', placeholder: 'e.g., Both attended TEDx Lahore or same industry group' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 54–56. WHATSAPP
  // ═══════════════════════════════════════════════════════════
  {
    id: 'whatsapp-sales-sequence',
    name: 'WhatsApp Sales Sequence',
    category: 'Email Marketing',
    description: 'Conversational WhatsApp sales scripts with greeting, product pitch, objection handling, and close.',
    badge: 'Pakistan VIP',
    icon: 'MessageSquare',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g., KMB Premium Sidr Honey' },
      { key: 'pricePoint', label: 'Price', placeholder: 'e.g., PKR 2,200' },
      { key: 'commonObjection', label: 'Common Objection', placeholder: 'e.g., Price too high, delivery trust, purity doubt' }
    ]
  },
  {
    id: 'whatsapp-abandoned-cart',
    name: 'WhatsApp Abandoned Cart Recovery',
    category: 'Email Marketing',
    description: 'Friendly WhatsApp messages to recover abandoned carts with personalization and urgency.',
    badge: 'High ROAS',
    icon: 'ShoppingCart',
    providerType: 'text',
    inputs: [
      { key: 'storeName', label: 'Store Name', placeholder: 'e.g., Cydaix' },
      { key: 'product', label: 'Abandoned Product', placeholder: 'e.g., Leather Bifold Wallet' },
      { key: 'incentive', label: 'Recovery Incentive', placeholder: 'e.g., Free shipping if you complete in 2 hours' }
    ]
  },
  {
    id: 'whatsapp-order-confirmation',
    name: 'WhatsApp Order Confirmation Copy',
    category: 'E-Commerce',
    description: 'Professional order confirmation messages with delivery timeline, tracking, and upsell opportunity.',
    badge: 'Essential',
    icon: 'CheckSquare',
    providerType: 'text',
    inputs: [
      { key: 'storeName', label: 'Store Name', placeholder: 'e.g., KMB Honey' },
      { key: 'deliveryTime', label: 'Delivery Timeline', placeholder: 'e.g., 3-5 business days nationwide' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 57–63. EMAIL MARKETING (ADVANCED)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'email-subject-lines',
    name: 'Email Subject Line Generator',
    category: 'Email Marketing',
    description: 'High open-rate subject lines using curiosity, urgency, personalization, and FOMO psychology.',
    badge: 'Popular',
    icon: 'AtSign',
    providerType: 'text',
    inputs: [
      { key: 'emailPurpose', label: 'Email Purpose', placeholder: 'e.g., Flash sale announcement, new product launch, cart recovery' },
      { key: 'audience', label: 'Audience', placeholder: 'e.g., Existing customers who bought honey' },
      { key: 'count', label: 'How many subject lines?', placeholder: 'e.g., 10' }
    ]
  },
  {
    id: 'promotional-email-campaign',
    name: 'Promotional Email Campaign',
    category: 'Email Marketing',
    description: 'Complete promotional email with subject, preview text, body copy, CTA, and PS line.',
    badge: 'High ROAS',
    icon: 'Mail',
    providerType: 'text',
    inputs: [
      { key: 'promotion', label: 'Promotion Details', placeholder: 'e.g., Eid Sale — 25% off all products' },
      { key: 'brandName', label: 'Brand Name', placeholder: 'e.g., KMB Honey' },
      { key: 'deadline', label: 'Offer Deadline', placeholder: 'e.g., Ends midnight Friday' }
    ]
  },
  {
    id: 'welcome-email-series',
    name: 'Welcome Email Series',
    category: 'Email Marketing',
    description: '3-part welcome sequence: brand introduction, social proof, and first-purchase incentive.',
    badge: 'Essential',
    icon: 'Heart',
    providerType: 'text',
    inputs: [
      { key: 'brandName', label: 'Brand Name', placeholder: 'e.g., Cydaix' },
      { key: 'brandStory', label: 'Brand Story (1 sentence)', placeholder: 'e.g., Handcrafted leather goods by master artisans since 2020' },
      { key: 'firstPurchaseOffer', label: 'First Purchase Offer', placeholder: 'e.g., 15% off with code WELCOME15' }
    ]
  },
  {
    id: 'product-launch-email-sequence',
    name: 'Product Launch Email Sequence',
    category: 'Email Marketing',
    description: '5-email launch sequence: teaser, reveal, social proof, urgency, and last chance.',
    badge: 'PRO',
    icon: 'Rocket',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'New Product', placeholder: 'e.g., KMB Manuka Honey' },
      { key: 'launchDate', label: 'Launch Date', placeholder: 'e.g., March 15' },
      { key: 'earlyBirdOffer', label: 'Early Bird Offer', placeholder: 'e.g., 20% off for first 100 orders' }
    ]
  },
  {
    id: 'newsletter-content-planner',
    name: 'Newsletter Content Planner',
    category: 'Email Marketing',
    description: 'Monthly newsletter content calendar with topic ideas, segments, and send schedule.',
    badge: 'Popular',
    icon: 'Newspaper',
    providerType: 'text',
    inputs: [
      { key: 'industry', label: 'Industry', placeholder: 'e.g., Natural Health & Wellness' },
      { key: 'audienceSize', label: 'List Size', placeholder: 'e.g., 5,000 subscribers' },
      { key: 'frequency', label: 'Send Frequency', placeholder: 'e.g., Weekly' }
    ]
  },
  {
    id: 'email-personalization-engine',
    name: 'Email Personalization Engine',
    category: 'Email Marketing',
    description: 'Dynamic email copy with merge tags, segmentation logic, and personalized product recommendations.',
    badge: 'PRO',
    icon: 'UserCheck',
    providerType: 'text',
    inputs: [
      { key: 'emailType', label: 'Email Type', placeholder: 'e.g., Post-purchase follow-up' },
      { key: 'segments', label: 'Customer Segments', placeholder: 'e.g., First-time buyers, VIP repeat customers, dormant 60+ days' },
      { key: 'product', label: 'Product Category', placeholder: 'e.g., Honey & Wellness' }
    ]
  },
  {
    id: 'email-ab-test-generator',
    name: 'Email A/B Test Generator',
    category: 'Email Marketing',
    description: 'Creates A/B test variants for subject lines, preview text, CTAs, and body copy with hypothesis.',
    badge: 'Analytics',
    icon: 'GitBranch',
    providerType: 'text',
    inputs: [
      { key: 'originalEmail', label: 'Original Email Subject/CTA', placeholder: 'e.g., Subject: Your order is waiting!' },
      { key: 'testGoal', label: 'What do you want to improve?', placeholder: 'e.g., Open rate, Click-through rate, or Conversion rate' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 64–69. ADVERTISING (GOOGLE & YOUTUBE)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'google-shopping-ad',
    name: 'Google Shopping Ad Copy',
    category: 'Advertising',
    description: 'Optimized product titles, descriptions, and custom labels for Google Shopping/Merchant Center feeds.',
    badge: 'Google Pro',
    icon: 'ShoppingBag',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g., Premium Sidr Honey 500g' },
      { key: 'price', label: 'Price', placeholder: 'e.g., PKR 2,200' },
      { key: 'category', label: 'Google Product Category', placeholder: 'e.g., Food > Honey' },
      { key: 'keyFeatures', label: 'Key Features', placeholder: 'e.g., Raw, Unheated, Lab-Certified Pure' }
    ]
  },
  {
    id: 'pmax-asset-generator',
    name: 'Performance Max Asset Generator',
    category: 'Advertising',
    description: 'Complete set of headlines, long headlines, descriptions, and creative concepts for Google PMax campaigns.',
    badge: 'Google Pro',
    icon: 'Maximize2',
    providerType: 'text',
    inputs: [
      { key: 'businessName', label: 'Business Name', placeholder: 'e.g., KMB Honey' },
      { key: 'product', label: 'Product / Service', placeholder: 'e.g., Premium Raw Honey Collection' },
      { key: 'targetAudience', label: 'Target Audience', placeholder: 'e.g., Health-conscious families in Pakistan' },
      { key: 'goal', label: 'Campaign Goal', placeholder: 'e.g., Maximize online sales' }
    ]
  },
  {
    id: 'youtube-ad-script',
    name: 'YouTube Ad Script',
    category: 'Advertising',
    description: 'Complete 15-30 second YouTube pre-roll/in-stream ad script with hook, value prop, and CTA.',
    badge: 'Video',
    icon: 'Youtube',
    providerType: 'text',
    inputs: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g., KMB Premium Sidr Honey' },
      { key: 'duration', label: 'Ad Duration', placeholder: 'e.g., 15 seconds, 30 seconds, or 60 seconds' },
      { key: 'hook', label: 'Opening Hook Style', placeholder: 'e.g., Question, Bold Claim, or Problem Statement' },
      { key: 'cta', label: 'Call to Action', placeholder: 'e.g., Visit our website, Order now on WhatsApp' }
    ]
  },
  {
    id: 'youtube-title-generator',
    name: 'YouTube Video Title Generator',
    category: 'Content',
    description: 'Click-worthy YouTube video titles optimized for search and browse discovery.',
    badge: 'Popular',
    icon: 'Youtube',
    providerType: 'text',
    inputs: [
      { key: 'videoTopic', label: 'Video Topic', placeholder: 'e.g., How to start a honey business in Pakistan' },
      { key: 'targetKeyword', label: 'Target Keyword', placeholder: 'e.g., honey business pakistan' },
      { key: 'count', label: 'Number of Titles', placeholder: 'e.g., 10' }
    ]
  },
  {
    id: 'youtube-description-seo',
    name: 'YouTube Description & SEO',
    category: 'Content',
    description: 'SEO-optimized YouTube description with timestamps, keywords, links, and engagement hooks.',
    badge: 'SEO Pro',
    icon: 'FileText',
    providerType: 'text',
    inputs: [
      { key: 'videoTitle', label: 'Video Title', placeholder: 'e.g., How I Built a PKR 10M Honey Brand' },
      { key: 'videoSummary', label: 'Video Summary', placeholder: 'e.g., Sharing my journey from 0 to 10M monthly revenue selling pure honey' },
      { key: 'keywords', label: 'Target Keywords', placeholder: 'e.g., honey business, e-commerce pakistan, pure honey' }
    ]
  },
  {
    id: 'youtube-thumbnail-concept',
    name: 'YouTube Thumbnail Concept',
    category: 'Creative Studio',
    description: 'Thumbnail design brief with text, expression, background, and color psychology for maximum CTR.',
    badge: 'Creative',
    icon: 'Image',
    providerType: 'text',
    inputs: [
      { key: 'videoTitle', label: 'Video Title', placeholder: 'e.g., I Tested 5 Honey Brands — Only 1 Was Real' },
      { key: 'thumbnailStyle', label: 'Style', placeholder: 'e.g., Shocked face, comparison split, or bold text overlay' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 70–74. META AD ADVANCED
  // ═══════════════════════════════════════════════════════════
  {
    id: 'meta-ad-creative-brief',
    name: 'Meta Ad Creative Brief',
    category: 'Advertising',
    description: 'Complete creative brief for designers/creators with concept, copy, format, audience, and KPIs.',
    badge: 'PRO',
    icon: 'FileText',
    providerType: 'text',
    inputs: [
      { key: 'product', label: 'Product', placeholder: 'e.g., KMB Sidr Honey' },
      { key: 'objective', label: 'Campaign Objective', placeholder: 'e.g., Conversions — Purchase' },
      { key: 'format', label: 'Ad Format', placeholder: 'e.g., Carousel, Single Image, Video, or Reel' },
      { key: 'audience', label: 'Target Audience', placeholder: 'e.g., Pakistani mothers aged 28-45' }
    ]
  },
  {
    id: 'meta-ad-ab-test',
    name: 'Meta Ad A/B Test Generator',
    category: 'Advertising',
    description: 'Creates A/B test variants for Meta ad copy, headlines, and creative concepts with clear hypotheses.',
    badge: 'Analytics',
    icon: 'GitBranch',
    providerType: 'text',
    inputs: [
      { key: 'originalAd', label: 'Original Ad Copy', placeholder: 'Paste your current ad text here...' },
      { key: 'testElement', label: 'What to test?', placeholder: 'e.g., Hook, CTA, Social proof angle, or Offer framing' }
    ]
  },
  {
    id: 'ad-hook-generator',
    name: 'Ad Hook Generator',
    category: 'Advertising',
    description: 'Generates 10+ scroll-stopping opening hooks for ads using curiosity, pain, authority, and FOMO triggers.',
    badge: 'Viral',
    icon: 'Anchor',
    providerType: 'text',
    inputs: [
      { key: 'product', label: 'Product', placeholder: 'e.g., Raw Sidr Honey' },
      { key: 'audience', label: 'Audience', placeholder: 'e.g., Health-conscious Pakistani families' },
      { key: 'platform', label: 'Platform', placeholder: 'e.g., Facebook, Instagram, or TikTok' }
    ]
  },
  {
    id: 'ad-angle-generator',
    name: 'Ad Angle Generator',
    category: 'Advertising',
    description: 'Creates multiple unique ad angles (social proof, authority, fear, aspiration) for creative testing.',
    badge: 'PRO',
    icon: 'Compass',
    providerType: 'text',
    inputs: [
      { key: 'product', label: 'Product', placeholder: 'e.g., Leather Bifold Wallet' },
      { key: 'audience', label: 'Audience', placeholder: 'e.g., Young professionals aged 22-35' },
      { key: 'count', label: 'Number of Angles', placeholder: 'e.g., 5' }
    ]
  },
  {
    id: 'ad-creative-concept',
    name: 'Ad Creative Concept Generator',
    category: 'Creative Studio',
    description: 'Full visual + copy concept for ad creatives including layout, imagery, typography, and messaging.',
    badge: 'Creative',
    icon: 'Palette',
    providerType: 'text',
    inputs: [
      { key: 'product', label: 'Product', placeholder: 'e.g., Premium Honey Gift Box' },
      { key: 'platform', label: 'Platform', placeholder: 'e.g., Instagram Feed, Stories, or TikTok' },
      { key: 'style', label: 'Visual Style', placeholder: 'e.g., Minimalist luxury, UGC-style, or Bold typography' },
      { key: 'objective', label: 'Objective', placeholder: 'e.g., Drive purchases, Brand awareness, or Engagement' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 75–82. ANALYTICS & OPTIMIZATION
  // ═══════════════════════════════════════════════════════════
  {
    id: 'ad-fatigue-detector',
    name: 'Ad Fatigue Detector',
    category: 'Analytics',
    description: 'Analyzes your ad metrics to identify fatigue signals and suggests creative refresh strategies.',
    badge: 'Analytics',
    icon: 'AlertTriangle',
    providerType: 'text',
    inputs: [
      { key: 'adAge', label: 'How long has the ad been running?', placeholder: 'e.g., 21 days' },
      { key: 'ctrTrend', label: 'CTR Trend', placeholder: 'e.g., Started at 3.2%, now at 1.8%' },
      { key: 'cpaTrend', label: 'CPA Trend', placeholder: 'e.g., Started at PKR 350, now at PKR 580' },
      { key: 'frequency', label: 'Frequency', placeholder: 'e.g., 4.2' }
    ]
  },
  {
    id: 'roas-optimization-planner',
    name: 'ROAS Optimization Planner',
    category: 'Analytics',
    description: 'Strategic recommendations to improve ROAS based on your current campaign data and margins.',
    badge: 'High ROAS',
    icon: 'TrendingUp',
    providerType: 'text',
    inputs: [
      { key: 'currentROAS', label: 'Current ROAS', placeholder: 'e.g., 2.1x' },
      { key: 'targetROAS', label: 'Target ROAS', placeholder: 'e.g., 4x' },
      { key: 'adSpend', label: 'Monthly Ad Spend', placeholder: 'e.g., PKR 200,000' },
      { key: 'product', label: 'Product', placeholder: 'e.g., Premium Honey' }
    ]
  },
  {
    id: 'cpa-reduction-strategist',
    name: 'CPA Reduction Strategist',
    category: 'Analytics',
    description: 'Tactical plan to reduce cost per acquisition through audience, creative, and funnel optimizations.',
    badge: 'PRO',
    icon: 'ArrowDownCircle',
    providerType: 'text',
    inputs: [
      { key: 'currentCPA', label: 'Current CPA', placeholder: 'e.g., PKR 650' },
      { key: 'targetCPA', label: 'Target CPA', placeholder: 'e.g., PKR 350' },
      { key: 'platform', label: 'Ad Platform', placeholder: 'e.g., Meta Ads' },
      { key: 'audienceSize', label: 'Audience Size', placeholder: 'e.g., 2M people' }
    ]
  },
  {
    id: 'conversion-rate-optimizer',
    name: 'Conversion Rate Optimizer',
    category: 'Analytics',
    description: 'Page-by-page conversion optimization recommendations for your e-commerce funnel.',
    badge: 'Essential',
    icon: 'Target',
    providerType: 'text',
    inputs: [
      { key: 'currentCR', label: 'Current Conversion Rate', placeholder: 'e.g., 1.8%' },
      { key: 'pageType', label: 'Page Type', placeholder: 'e.g., Product page, Landing page, or Checkout' },
      { key: 'traffic', label: 'Monthly Traffic', placeholder: 'e.g., 15,000 visitors' }
    ]
  },
  {
    id: 'ab-testing-hypothesis',
    name: 'A/B Testing Hypothesis Generator',
    category: 'Analytics',
    description: 'Creates structured A/B test hypotheses with variables, expected outcomes, and success metrics.',
    badge: 'Analytics',
    icon: 'Beaker',
    providerType: 'text',
    inputs: [
      { key: 'pageOrElement', label: 'What are you testing?', placeholder: 'e.g., Product page hero section' },
      { key: 'currentPerformance', label: 'Current Performance', placeholder: 'e.g., 2.1% conversion rate' },
      { key: 'changeIdea', label: 'Change Idea', placeholder: 'e.g., Add video testimonial above the fold' }
    ]
  },
  {
    id: 'landing-page-audit',
    name: 'Landing Page Audit',
    category: 'Analytics',
    description: 'Comprehensive landing page audit covering headline, CTA, trust elements, speed, and mobile UX.',
    badge: 'PRO',
    icon: 'ClipboardCheck',
    providerType: 'text',
    inputs: [
      { key: 'url', label: 'Landing Page URL', placeholder: 'e.g., https://kmbhoney.com/sidr-honey' },
      { key: 'goal', label: 'Page Goal', placeholder: 'e.g., Purchase, Lead capture, or WhatsApp inquiry' }
    ]
  },
  {
    id: 'checkout-conversion-audit',
    name: 'Checkout Conversion Audit',
    category: 'Analytics',
    description: 'Identifies friction points in your checkout flow and provides tactical fixes to reduce cart abandonment.',
    badge: 'High ROAS',
    icon: 'ShoppingCart',
    providerType: 'text',
    inputs: [
      { key: 'platform', label: 'E-Commerce Platform', placeholder: 'e.g., Shopify, WooCommerce, or Custom' },
      { key: 'cartAbandonRate', label: 'Cart Abandon Rate', placeholder: 'e.g., 72%' },
      { key: 'paymentMethods', label: 'Payment Methods', placeholder: 'e.g., COD, JazzCash, Credit Card' }
    ]
  },
  {
    id: 'website-copy-audit',
    name: 'Website Copy Audit',
    category: 'Analytics',
    description: 'Reviews website copy for clarity, persuasion, SEO, and conversion optimization opportunities.',
    badge: 'PRO',
    icon: 'FileSearch',
    providerType: 'text',
    inputs: [
      { key: 'url', label: 'Website URL', placeholder: 'e.g., https://cydaix.com' },
      { key: 'businessGoal', label: 'Primary Business Goal', placeholder: 'e.g., Drive online sales of leather goods' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 83–92. SEO ADVANCED
  // ═══════════════════════════════════════════════════════════
  {
    id: 'seo-content-brief',
    name: 'SEO Content Brief',
    category: 'SEO',
    description: 'Complete content brief with target keyword, search intent, outline, word count, and internal linking plan.',
    badge: 'SEO Pro',
    icon: 'FileText',
    providerType: 'text',
    inputs: [
      { key: 'targetKeyword', label: 'Target Keyword', placeholder: 'e.g., best raw honey in pakistan' },
      { key: 'contentType', label: 'Content Type', placeholder: 'e.g., Blog post, Listicle, or Guide' },
      { key: 'wordCount', label: 'Target Word Count', placeholder: 'e.g., 2,000 words' }
    ]
  },
  {
    id: 'seo-competitor-gap',
    name: 'SEO Competitor Gap Analysis',
    category: 'SEO',
    description: 'AI-estimated content gap analysis identifying topics your competitors rank for that you don\'t.',
    badge: 'PRO',
    icon: 'BarChart2',
    providerType: 'text',
    inputs: [
      { key: 'yourSite', label: 'Your Website', placeholder: 'e.g., kmbhoney.com' },
      { key: 'competitors', label: 'Competitor Websites', placeholder: 'e.g., marhaba.com.pk, hamdard.com.pk' },
      { key: 'niche', label: 'Niche', placeholder: 'e.g., Natural honey and health products' }
    ]
  },
  {
    id: 'internal-linking-strategy',
    name: 'Internal Linking Strategy',
    category: 'SEO',
    description: 'Maps out internal linking architecture to distribute page authority and improve crawlability.',
    badge: 'SEO Pro',
    icon: 'Link',
    providerType: 'text',
    inputs: [
      { key: 'siteStructure', label: 'Main Pages / Categories', placeholder: 'e.g., Home, Shop, Blog, About, Contact' },
      { key: 'topPages', label: 'Most Important Pages', placeholder: 'e.g., /sidr-honey, /manuka-honey, /honey-gift-box' }
    ]
  },
  {
    id: 'featured-snippet-optimizer',
    name: 'Featured Snippet Optimizer',
    category: 'SEO',
    description: 'Restructures content to win Google\'s Position Zero featured snippets (paragraphs, lists, tables).',
    badge: 'SEO Pro',
    icon: 'Award',
    providerType: 'text',
    inputs: [
      { key: 'targetQuery', label: 'Target Search Query', placeholder: 'e.g., how to identify pure honey' },
      { key: 'currentContent', label: 'Your Current Content (paste paragraph)', placeholder: 'Paste your current answer here...' }
    ]
  },
  {
    id: 'local-seo-optimizer',
    name: 'Local SEO Optimizer',
    category: 'SEO',
    description: 'Local SEO recommendations for Google Business Profile, citations, reviews, and local keywords.',
    badge: 'Essential',
    icon: 'MapPin',
    providerType: 'text',
    inputs: [
      { key: 'businessName', label: 'Business Name', placeholder: 'e.g., KMB Honey Store' },
      { key: 'city', label: 'City', placeholder: 'e.g., Lahore' },
      { key: 'category', label: 'Business Category', placeholder: 'e.g., Health Food Store' }
    ]
  },
  {
    id: 'gbp-posts',
    name: 'Google Business Profile Posts',
    category: 'SEO',
    description: 'Engaging Google Business Profile posts for offers, events, products, and updates.',
    badge: 'Local SEO',
    icon: 'MapPin',
    providerType: 'text',
    inputs: [
      { key: 'businessName', label: 'Business Name', placeholder: 'e.g., KMB Honey' },
      { key: 'postType', label: 'Post Type', placeholder: 'e.g., Offer, Event, Product highlight, or What\'s New' },
      { key: 'details', label: 'Post Details', placeholder: 'e.g., 20% off all honey products this weekend' }
    ]
  },
  {
    id: 'backlink-opportunity-finder',
    name: 'E-Commerce Backlink Opportunity Finder',
    category: 'SEO',
    description: 'AI-generated list of backlink opportunities including guest posts, directories, and partnership ideas.',
    badge: 'PRO',
    icon: 'ExternalLink',
    providerType: 'text',
    inputs: [
      { key: 'website', label: 'Your Website', placeholder: 'e.g., kmbhoney.com' },
      { key: 'niche', label: 'Niche', placeholder: 'e.g., Natural health products, organic food' },
      { key: 'country', label: 'Target Country', placeholder: 'e.g., Pakistan' }
    ]
  },
  {
    id: 'search-intent-classifier',
    name: 'Search Intent Classifier',
    category: 'SEO',
    description: 'Classifies keywords by search intent (Informational, Navigational, Commercial, Transactional).',
    badge: 'SEO Pro',
    icon: 'Crosshair',
    providerType: 'text',
    inputs: [
      { key: 'keywords', label: 'Keywords (one per line)', placeholder: 'e.g.:\nbuy pure honey online\nhow to test honey purity\nKMB honey price\nbest honey brand pakistan' }
    ]
  },
  {
    id: 'keyword-difficulty-analyzer',
    name: 'Keyword Difficulty Analyzer',
    category: 'SEO',
    description: 'AI-estimated keyword difficulty assessment with ranking feasibility and content recommendations.',
    badge: 'Analytics',
    icon: 'BarChart',
    providerType: 'text',
    inputs: [
      { key: 'keywords', label: 'Keywords to Analyze', placeholder: 'e.g., pure honey pakistan, sidr honey price, organic honey lahore' },
      { key: 'domainAuthority', label: 'Your Domain Age/Authority', placeholder: 'e.g., New site (6 months), or Established (3+ years)' }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 92–97. CONTENT & BRAND
  // ═══════════════════════════════════════════════════════════
  {
    id: 'content-refresh-planner',
    name: 'Content Refresh Planner',
    category: 'Content',
    description: 'Identifies which existing content to update, merge, or delete for maximum SEO impact.',
    badge: 'SEO Pro',
    icon: 'RefreshCw',
    providerType: 'text',
    inputs: [
      { key: 'contentList', label: 'List of Existing Content (titles)', placeholder: 'e.g.:\nBest Honey Brands 2024\nHow to Use Honey for Immunity\n5 Benefits of Sidr Honey' },
      { key: 'goal', label: 'Goal', placeholder: 'e.g., Increase organic traffic by 50%' }
    ]
  },
  {
    id: 'content-repurposing-engine',
    name: 'Content Repurposing Engine',
    category: 'Content',
    description: 'Transforms one piece of content into 10+ formats: social posts, emails, threads, reels scripts, and more.',
    badge: 'Popular',
    icon: 'Repeat',
    providerType: 'text',
    inputs: [
      { key: 'originalContent', label: 'Original Content (paste text or summary)', placeholder: 'Paste your blog post, video transcript, or article summary...' },
      { key: 'platforms', label: 'Target Platforms', placeholder: 'e.g., Instagram, TikTok, LinkedIn, Email, Twitter' }
    ]
  },
  {
    id: 'brand-voice-architect',
    name: 'Brand Voice Architect',
    category: 'Market Research',
    description: 'Defines your brand voice, tone, vocabulary, and communication personality across all channels.',
    badge: 'Essential',
    icon: 'Mic',
    providerType: 'text',
    inputs: [
      { key: 'brandName', label: 'Brand Name', placeholder: 'e.g., Cydaix' },
      { key: 'industry', label: 'Industry', placeholder: 'e.g., Premium Leather Goods' },
      { key: 'values', label: 'Brand Values', placeholder: 'e.g., Craftsmanship, Authenticity, Modern Heritage' },
      { key: 'audience', label: 'Target Audience', placeholder: 'e.g., Urban professionals aged 25-40' }
    ]
  },
  {
    id: 'brand-messaging-framework',
    name: 'Brand Messaging Framework',
    category: 'Market Research',
    description: 'Complete messaging hierarchy with tagline, elevator pitch, value props, and proof points.',
    badge: 'PRO',
    icon: 'AlignLeft',
    providerType: 'text',
    inputs: [
      { key: 'brandName', label: 'Brand Name', placeholder: 'e.g., KMB Honey' },
      { key: 'category', label: 'Category', placeholder: 'e.g., Premium Natural Health Products' },
      { key: 'differentiator', label: 'Key Differentiator', placeholder: 'e.g., Only PCSIR lab-certified pure Sidr honey in Pakistan' }
    ]
  },
  {
    id: 'brand-positioning-strategist',
    name: 'Brand Positioning Strategist',
    category: 'Market Research',
    description: 'Defines your competitive positioning with positioning statement, perceptual map, and gap analysis.',
    badge: 'Essential',
    icon: 'Crosshair',
    providerType: 'text',
    inputs: [
      { key: 'brandName', label: 'Brand Name', placeholder: 'e.g., Cydaix' },
      { key: 'competitors', label: 'Top 3 Competitors', placeholder: 'e.g., Jafferjees, Insignia, Charles & Keith' },
      { key: 'pricePosition', label: 'Price Position', placeholder: 'e.g., Premium (PKR 5,000-12,000)' },
      { key: 'targetMarket', label: 'Target Market', placeholder: 'e.g., Urban Pakistani professionals' }
    ]
  },
  {
    id: 'usp-generator',
    name: 'Unique Selling Proposition Generator',
    category: 'Market Research',
    description: 'Creates a compelling, defensible USP that separates your brand from every competitor in your market.',
    badge: 'Essential',
    icon: 'Star',
    providerType: 'text',
    inputs: [
      { key: 'brandName', label: 'Brand Name', placeholder: 'e.g., KMB Honey' },
      { key: 'product', label: 'Core Product / Service', placeholder: 'e.g., Pure Raw Sidr Honey' },
      { key: 'competitors', label: 'Main Competitors', placeholder: 'e.g., Marhaba, Hamdard, Langense' },
      { key: 'whatMakesYouDifferent', label: 'What Makes You Different?', placeholder: 'e.g., Direct from beekeepers, lab-certified, premium glass packaging' }
    ]
  }
];
