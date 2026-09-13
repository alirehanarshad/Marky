'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Megaphone,
  Video,
  FileText,
  Tag,
  Users,
  Edit3,
  Globe,
  Award,
  Calendar,
  Mail,
  Calculator,
  Image as ImageIcon,
  MessageSquare,
  Layers,
  ArrowRight
} from 'lucide-react';
import { TOOL_CATEGORIES, MARKETING_TOOLS } from '@/lib/tools-data';
import ToolRunnerModal from '@/components/ToolRunnerModal';
import PageHeader from '@/components/ui/PageHeader';

// Icon map for tool cards
const ICON_COMPONENTS = {
  Megaphone,
  Video,
  Search,
  ShoppingBag: Megaphone,
  Repeat: Layers,
  Layers,
  PlayCircle: Video,
  Hash: Tag,
  Share2: Users,
  MessageSquare,
  Send: Mail,
  Package: FileText,
  FileText,
  Zap: Sparkles,
  Gift: Award,
  Tag,
  Code: FileText,
  FileCode: FileText,
  Users,
  ShieldAlert: Users,
  HelpCircle: MessageSquare,
  Edit3,
  Sliders: Layers,
  Clock: Calendar,
  Globe,
  Sparkles,
  Award,
  Smile: Users,
  FileCheck: FileText,
  Calendar,
  Camera: Video,
  Mail,
  Calculator,
  Percent: Calculator,
  Image: ImageIcon,
  CheckCircle: Award
};

export default function AIHubPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter tools by category and search
  const filteredTools = MARKETING_TOOLS.filter((tool) => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.badge && tool.badge.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenTool = (tool) => {
    setActiveTool(tool);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Header Banner */}
      <PageHeader
        badge="Universal AI Tool Runner Engine"
        badgeIcon={Sparkles}
        title="AI Marketing Hub (97+ Tools)"
        description="Comprehensive e-commerce marketing operations: generate winning Meta ad copy, viral TikTok video hooks, Daraz SEO listings, and margin models powered by Google Gemini."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/marketing-strategy"
              className="px-4 py-2 marky-btn-primary text-xs font-bold flex items-center gap-1.5"
            >
              <span>CMO Strategy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        }
      />

      {/* 2. Filter and Search Bar */}
      <div className="marky-card p-4 space-y-3">
        {/* Search input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#6C6782] absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search 97+ marketing tools by name, platform, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="marky-input w-full pl-10 pr-4 py-2 text-xs"
          />
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {TOOL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#4239C4] text-white shadow-xs'
                    : 'bg-[#F7F6FA] text-[#6C6782] border border-[#ECE8E3] hover:bg-white hover:text-[#141226]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Tools Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-[#6C6782]">
            Showing <span className="text-[#141226] font-extrabold">{filteredTools.length}</span> tools in <span className="text-[#4239C4] font-bold">{selectedCategory}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => {
            const Icon = ICON_COMPONENTS[tool.icon] || Sparkles;

            return (
              <div
                key={tool.id}
                onClick={() => handleOpenTool(tool)}
                className="marky-card p-5 flex flex-col justify-between cursor-pointer group hover:border-[#7A5DBB]/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#4239C4]/10 border border-[#7A5DBB]/20 text-[#4239C4] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#4239C4] group-hover:text-white transition-all duration-200 shadow-xs">
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {tool.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#141226] group-hover:text-[#4239C4] transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-[#6C6782] mt-1 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#ECE8E3] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#4239C4] bg-[#4239C4]/10 px-2.5 py-0.5 rounded-full">
                    {tool.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tools/${tool.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] font-bold text-[#6C6782] hover:text-[#4239C4] px-2 py-0.5 rounded-md hover:bg-[#F7F6FA] transition-colors"
                      title="Open Dedicated Page"
                    >
                      Studio Page
                    </Link>
                    <span className="text-xs font-bold text-[#4239C4] group-hover:text-[#372EB3] flex items-center gap-1">
                      <span>Quick Run</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Universal Dynamic Tool Runner Modal */}
      <ToolRunnerModal
        tool={activeTool}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
