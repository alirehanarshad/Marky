'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  LayoutGrid,
  Briefcase,
  Layers,
  FileSpreadsheet,
  Users,
  ShieldAlert,
  Search,
  MapPin,
  BookmarkCheck,
  CreditCard,
  HelpCircle,
  Settings,
  ChevronRight,
  Cpu,
  FileText,
  History,
  Palette,
  Sparkles,
  Video,
  Image as ImageIcon,
  Coins,
  LogOut
} from 'lucide-react';
import api from '@/lib/api';

export default function Sidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function loadUserData() {
      try {
        const cached = typeof window !== 'undefined' ? localStorage.getItem('marky_user') : null;
        if (cached) {
          try {
            setCurrentUser(JSON.parse(cached));
          } catch (e) {}
        }
        const res = await api.getMe();
        if (res.success && res.user) {
          setCurrentUser(res.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('marky_user', JSON.stringify(res.user));
          }
        }
      } catch (e) {
        // Fallback or unauthenticated
      }
    }
    loadUserData();
    if (typeof window !== 'undefined') {
      window.addEventListener('authChange', loadUserData);
      return () => window.removeEventListener('authChange', loadUserData);
    }
  }, []);

  const navSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'AI Marketing Hub', href: '/ai-hub', icon: LayoutGrid, badge: '97 Tools', badgeColor: 'bg-[#7A5DBB]/25 text-[#D1C3FF] border-[#7A5DBB]/40' },
        { name: 'Creative Studio', href: '/creative-studio', icon: Palette, badge: 'AI Studio', badgeColor: 'bg-gradient-to-r from-[#4239C4]/30 to-[#D97FA5]/30 text-[#FFC4DA] border-[#7A5DBB]/40' },
        { name: 'Marketing Strategy', href: '/marketing-strategy', icon: FileSpreadsheet, badge: 'CMO AI', badgeColor: 'bg-[#D97FA5]/20 text-[#FFC4DA] border-[#D97FA5]/30' }
      ]
    },
    {
      title: 'CREATIVE & CONTENT',
      items: [
        { name: 'Content Library', href: '/content-library', icon: BookmarkCheck },
        { name: 'Creative Gallery', href: '/creative-gallery', icon: ImageIcon, badge: 'Vault', badgeColor: 'bg-[#7A5DBB]/25 text-[#D1C3FF] border-[#7A5DBB]/40' },
        { name: 'Workforce Hub', href: '/workflows', icon: Cpu, badge: 'Automate', badgeColor: 'bg-[#4239C4]/25 text-[#A59FFF] border-[#4239C4]/40' }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Brand Profiles', href: '/brands', icon: Briefcase },
        { name: 'Campaigns', href: '/campaigns', icon: Layers },
        { name: 'CRM Pipeline', href: '/crm', icon: Users },
        { name: 'Competitors', href: '/competitors', icon: ShieldAlert }
      ]
    },
    {
      title: 'INTELLIGENCE & SCRAPERS',
      items: [
        { name: 'Meta Ads Inspector', href: '/meta-ads', icon: Search, badge: 'Spy', badgeColor: 'bg-[#7A5DBB]/25 text-[#D1C3FF] border-[#7A5DBB]/40' },
        { name: 'Map Scrapers', href: '/map-scrapers', icon: MapPin, badge: 'B2B', badgeColor: 'bg-[#4239C4]/25 text-[#A59FFF] border-[#4239C4]/40' }
      ]
    },
    {
      title: 'RESOURCES & ADMIN',
      items: [
        { name: 'Executive Reports', href: '/reports', icon: FileText, badge: 'CMO', badgeColor: 'bg-[#4A4BCF]/20 text-[#B5B6FF] border-[#4A4BCF]/30' },
        { name: 'Audit Trail', href: '/audit-logs', icon: History },
        { name: 'Settings', href: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#0B091B] text-slate-200 flex flex-col border-r border-[#1C1938] select-none shrink-0 shadow-2xl">
      {/* Marky Brand Header with Official Fluid Logo */}
      <div className="p-4 border-b border-[#1C1938] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          {/* Logo container with subtle 3D hover elevation and gentle aura */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4239C4]/30 via-[#7A5DBB]/20 to-[#F3C5A8]/20 p-1 flex items-center justify-center border border-white/10 group-hover:border-[#7A5DBB]/40 group-hover:shadow-[0_0_18px_rgba(122,93,187,0.35)] transition-all duration-300">
              <img
                src="/marky-avatar.png"
                alt="Marky"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#0B091B]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-white transition-colors">
                Marky
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-gradient-to-r from-[#4239C4]/40 to-[#A73B9D]/40 text-[#DCD7FF] border border-[#7A5DBB]/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#8E8AAB] font-medium tracking-tight">Marketing Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#6C6789]">
              {section.title}
            </h3>
            <div className="space-y-0.5 mt-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onMouseEnter={() => api.prefetchRoute(item.href)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group relative ${
                      isActive
                        ? 'bg-[#1D193E] text-white shadow-sm border border-[#7A5DBB]/30'
                        : 'text-[#B4AFCC] hover:bg-[#161332] hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gradient-to-b from-[#4239C4] via-[#7A5DBB] to-[#D97FA5]" />
                    )}

                    <div className="flex items-center gap-2.5 pl-1">
                      <Icon className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#D1C3FF]' : 'text-[#8E8AAB] group-hover:text-[#D1C3FF]'
                      }`} />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-[#D1C3FF] opacity-90" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System User & Account Menu */}
      <div className="p-3 border-t border-[#1C1938] bg-[#070613] space-y-2">
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#1D193E] to-[#131028] border border-[#7A5DBB]/30 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4239C4] to-[#7A5DBB] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.name || 'Marky Operator'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-[#4239C4]/30 text-[#D1C3FF] border border-[#7A5DBB]/30 uppercase">
                  {currentUser?.role || 'USER'}
                </span>
                <span className="text-[10px] text-[#8E8AAB] truncate">{currentUser?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Account Navigation */}
        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href="/settings"
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[#14112E] hover:bg-[#1F1B47] text-[#B4AFCC] hover:text-white text-[11px] font-semibold border border-[#1C1938] transition-colors"
          >
            <Settings className="w-3 h-3 text-[#A59FFF]" />
            <span>Settings</span>
          </Link>
          <button
            onClick={() => {
              api.logout();
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
            }}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[#14112E] hover:bg-red-950/40 text-[#B4AFCC] hover:text-red-300 text-[11px] font-semibold border border-[#1C1938] transition-colors cursor-pointer"
          >
            <LogOut className="w-3 h-3 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
