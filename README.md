# Marky — MarketPulse AI

> **Senior AI Marketing Consultant & Multi-Platform Marketing Operations Platform**

Marky is an autonomous marketing intelligence, campaign orchestration, and AI consulting platform built for modern multi-channel e-commerce brands (Meta Ads, TikTok Shop, Google Ads, Daraz, and Shopify).

---

## 🚀 Key Features

- **Marky AI Consultant (`/ai-chat`)**: Context-aware AI CMO & growth strategist with voice dictation, text-to-speech, and persistent short-term memory.
- **Global Copilot Widget**: Floating strategic assistant accessible anywhere across the dashboard.
- **Multi-Brand & Campaign Command**: Manage omnichannel budgets, ROAS milestones, acquisition velocity, and campaign structures.
- **97 Specialized Marketing Tools**: Built-in prompt engineering frameworks for ad copy, SEO, landing page teardowns, email sequences, and market intelligence.
- **Lead Pipeline & CRM**: Inbound/outbound prospect management with qualification scoring.
- **Creative Studio & Asset Generator**: AI-assisted copy, image generation prompts, and conversion hooks.
- **Competitor Intelligence**: Live threat monitoring, positioning analysis, and counter-strategies.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, Recharts
- **Backend**: Node.js, Express, SQLite3, Google Generative AI (Gemini 2.5 / 3.x Flash)
- **Architecture**: Modular client-server with RESTful API endpoints and synchronized state

---

## 🏁 Quick Start

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Installation
Install dependencies across both client and server:
```bash
npm run install:all
```

### 3. Environment Setup
Configure your environment variables in `server/.env`:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Running the Application
Start the backend API server:
```bash
npm run dev:server
```

In another terminal, start the Next.js frontend:
```bash
npm run dev:client
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
MIT
