'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('marky_token');
      setIsAuthenticated(Boolean(token));
    }
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B091B]/85 backdrop-blur-xl border-b border-[#1D193E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4239C4] via-[#7A5DBB] to-[#F3C5A8] p-1 flex items-center justify-center shadow-lg shadow-[#4239C4]/20 group-hover:scale-105 transition-transform">
            <img
              src="/marky-avatar.png"
              alt="Marky"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-[#D1C3FF] transition-colors">
                Marky
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-[#4239C4]/40 to-[#A73B9D]/40 text-[#D1C3FF] border border-[#7A5DBB]/40 uppercase tracking-wider">
                AI SaaS
              </span>
            </div>
            <p className="text-[10px] text-[#8E8AAB] tracking-wide uppercase font-semibold hidden sm:block">
              Marketing Intelligence
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#14112E]/60 p-1.5 rounded-full border border-[#231E4D]/80">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#4239C4] text-white shadow-md shadow-[#4239C4]/30'
                    : 'text-[#B4AFCC] hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:from-[#5145EF] hover:to-[#8E6DE0] text-white text-xs font-bold shadow-lg shadow-[#4239C4]/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-[#B4AFCC] hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4239C4] via-[#7A5DBB] to-[#D97FA5] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#4239C4]/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#B4AFCC] hover:text-white focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D0B21] border-b border-[#1D193E] px-4 pt-2 pb-6 space-y-3 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#B4AFCC] hover:text-white hover:bg-white/5"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#1D193E] flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#4239C4] text-white text-sm font-bold shadow-md text-center"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl border border-[#2A245C] text-[#D1C3FF] text-sm font-semibold text-center hover:bg-white/5"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] text-white text-sm font-bold shadow-md text-center"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
