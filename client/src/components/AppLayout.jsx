'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AddBrandModal from './AddBrandModal';
import AddCampaignModal from './AddCampaignModal';
import MarkyFloatingWidget from './MarkyFloatingWidget';
import PublicNavbar from './public/PublicNavbar';
import PublicFooter from './public/PublicFooter';
import api from '@/lib/api';

const PUBLIC_ROUTES = ['/', '/pricing', '/about', '/contact', '/login', '/register'];

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [brandsList, setBrandsList] = useState([]);
  const [isClient, setIsClient] = useState(false);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthPageRoute = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    setIsClient(true);
    // If on a private authenticated route and no token found, redirect to login with return path
    if (typeof window !== 'undefined' && !isPublicRoute) {
      const token = localStorage.getItem('marky_token');
      if (!token) {
        window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
        return;
      }
    }

    // Warm critical platform caches in background only if authenticated
    if (!isPublicRoute) {
      api.preloadCoreData();
    }
  }, [pathname, isPublicRoute]);

  // 1. Dedicated Full-Screen Login & Register Pages
  if (isAuthPageRoute) {
    return (
      <div className="min-h-screen w-screen overflow-y-auto bg-[#0B091B]">
        {children}
      </div>
    );
  }

  // 2. Public Marketing Website Layout (Home, Pricing, About, Contact)
  if (isPublicRoute) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-[#0B091B] text-white selection:bg-[#7A5DBB]/30 selection:text-[#D1C3FF]">
        <PublicNavbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <PublicFooter />
      </div>
    );
  }

  // 3. Authenticated Application Workspace (Dashboard, AI Hub, CRM, Settings, etc.)
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FCFBFA] relative selection:bg-[#7A5DBB]/20 selection:text-[#4239C4]">
      {/* Subtle ambient brand warmth */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute -top-40 right-10 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-[#4239C4]/6 via-[#A73B9D]/4 to-[#F3C5A8]/5 blur-3xl" />
        <div className="absolute -bottom-40 left-60 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#7A5DBB]/4 via-[#D97FA5]/4 to-transparent blur-3xl" />
      </div>

      {/* Deep Studio Marky Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-1">
        <Navbar
          onOpenAddBrand={() => setShowAddBrand(true)}
          onOpenAddCampaign={() => setShowAddCampaign(true)}
        />

        <main className="flex-1 overflow-y-auto bg-[#FCFBFA]/90 p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <AddBrandModal
        isOpen={showAddBrand}
        onClose={() => setShowAddBrand(false)}
        onCreated={(newBrand) => {
          setBrandsList((prev) => [newBrand, ...prev]);
          api.clearCache();
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('brandSelected'));
        }}
      />

      <AddCampaignModal
        isOpen={showAddCampaign}
        onClose={() => setShowAddCampaign(false)}
        brands={brandsList}
        onCreated={() => {
          api.clearCache();
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('brandSelected'));
        }}
      />

      {/* Global Floating Marky Consultant Launcher & Tab */}
      {pathname !== '/ai-chat' && <MarkyFloatingWidget />}
    </div>
  );
}
