'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AddBrandModal from './AddBrandModal';
import AddCampaignModal from './AddCampaignModal';
import MarkyFloatingWidget from './MarkyFloatingWidget';
import api from '@/lib/api';

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [brandsList, setBrandsList] = useState([]);

  useEffect(() => {
    // If not on login page and no token found, redirect to login
    if (typeof window !== 'undefined' && pathname !== '/login') {
      const token = localStorage.getItem('marky_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
    }
    // Warm critical platform caches in background on initial boot
    api.preloadCoreData();
  }, [pathname]);

  // If on login route, render standalone clean login layout
  if (pathname === '/login') {
    return (
      <div className="min-h-screen w-screen overflow-y-auto bg-[#0B091B]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FCFBFA] relative selection:bg-[#7A5DBB]/20 selection:text-[#4239C4]">
      {/* Subtle ambient brand warmth - barely visible, controlled and human */}
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

      {/* Global Floating Marky Consultant Launcher & Tab (mounted on all pages except full /ai-chat) */}
      {pathname !== '/ai-chat' && <MarkyFloatingWidget />}
    </div>
  );
}
