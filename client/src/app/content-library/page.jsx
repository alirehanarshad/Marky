'use client';

import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  Copy,
  Check,
  Trash2,
  Calendar,
  Sparkles,
  Download,
  Search,
  Filter,
  LayoutGrid,
  List,
  Eye,
  Tag,
  Share2,
  FileText,
  Video,
  Megaphone,
  Mail,
  PlusCircle,
  X,
  Printer,
  Maximize2,
  Minimize2,
  Quote,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  Code,
  Lightbulb,
  RefreshCw,
  Send,
  Zap,
  Target
} from 'lucide-react';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import Portal, { useBodyScrollLock } from '@/components/ui/Portal';

const CONTENT_TYPES = [
  'All Types',
  'Competitive Strategy',
  'Video Concepts',
  'Ads',
  'Blog Content',
  'Email & WhatsApp',
  'Landing Page'
];

const PREFILL_PROMPTS = [
  { label: '🍯 Raw Honey Purity Hook', text: 'I have 100% raw unheated Sidr honey from Swat with a verified PCSIR lab purity certificate, and I want to target health-conscious families for Ramadan Sehri with Cash on Delivery.' },
  { label: '💼 RFID Leather Wallet', text: 'I have a handcrafted top-grain cowhide leather slim bifold wallet with RFID blocking and hand-burnished edges, targeting young Pakistani corporate professionals.' },
  { label: '✨ Dark Spot Vitamin C Serum', text: 'I have a clinical halal vitamin C serum with 10% Ethyl Ascorbic Acid formulated for humid climates, targeting brides and college students with a 14-day before/after proof.' },
  { label: '👗 Ramadan Pret Kurtas', text: 'I have trendy daily eastern fusion kurtas under PKR 3,990 with 48h nationwide doorstep exchange, targeting Gen-Z shoppers on TikTok.' }
];

const IDEA_FORMATS = [
  'Viral TikTok Hook & UGC Video Script',
  'Competitive Edge Matrix & Counter-Strategy',
  'High-Converting Meta Carousel Ad Copy',
  'Direct-Response Product Landing Page Copy',
  'WhatsApp Automated Nurture & Reorder Sequence',
  'Comprehensive Multi-Angle Marketing Dossier'
];

const IDEA_ANGLES = [
  'Skeptic Busters & 100% Lab Proof',
  'Emotional Heritage & Sunnah Wellness',
  'Us vs Supermarket Cheap Alternatives',
  'Urgent Limited Ramadan Pre-Order Deal',
  'Status Upgrade & Executive Quality'
];

// Rich Markdown Content Document Renderer
function MarkdownDocumentView({ content, onCopySnippet }) {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements = [];
  let currentKey = 0;
  let inList = false;
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${currentKey++}`} className="space-y-2 my-3 pl-2">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Horizontal Rule
    if (line === '---' || line === '***' || line === '___') {
      flushList();
      renderedElements.push(
        <div key={`hr-${currentKey++}`} className="my-6 border-t border-[#ECE8E3] relative flex items-center justify-center">
          <span className="bg-white px-3 text-[10px] uppercase tracking-widest text-[#9894AD] font-bold">
            ✦
          </span>
        </div>
      );
      continue;
    }

    // Heading 1
    if (line.startsWith('# ')) {
      flushList();
      const text = line.replace('# ', '').replace(/\*\*/g, '');
      renderedElements.push(
        <h1 key={`h1-${currentKey++}`} className="text-xl md:text-2xl font-black text-[#141226] tracking-tight mt-6 mb-3 flex items-center gap-2 border-b border-[#ECE8E3] pb-3">
          <span className="w-2 h-6 rounded-full bg-gradient-to-b from-[#4239C4] to-[#7A5DBB]" />
          <span>{text}</span>
        </h1>
      );
      continue;
    }

    // Heading 2
    if (line.startsWith('## ')) {
      flushList();
      const text = line.replace('## ', '').replace(/\*\*/g, '');
      renderedElements.push(
        <h2 key={`h2-${currentKey++}`} className="text-base md:text-lg font-extrabold text-[#141226] tracking-tight mt-6 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-[#7A5DBB]" />
          <span>{text}</span>
        </h2>
      );
      continue;
    }

    // Heading 3
    if (line.startsWith('### ')) {
      flushList();
      const text = line.replace('### ', '').replace(/\*\*/g, '');
      renderedElements.push(
        <h3 key={`h3-${currentKey++}`} className="text-sm md:text-base font-bold text-[#141226] mt-4 mb-2">
          {text}
        </h3>
      );
      continue;
    }

    // Blockquote / Conversion Copy Snippet Callout
    if (line.startsWith('>')) {
      flushList();
      const quoteText = line.replace(/^>\s*/, '').replace(/^"|"$/g, '').trim();
      renderedElements.push(
        <div
          key={`quote-${currentKey++}`}
          className="my-3 p-4 rounded-2xl bg-gradient-to-br from-[#4239C4]/5 via-[#7A5DBB]/5 to-transparent border border-[#7A5DBB]/30 relative overflow-hidden group hover:border-[#4239C4]/50 transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center shrink-0 mt-0.5">
                <Quote className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#4239C4] uppercase tracking-wider block">
                  High-Converting Copy Snippet
                </span>
                <p className="text-xs md:text-sm font-semibold text-[#141226] italic leading-relaxed">
                  "{quoteText}"
                </p>
              </div>
            </div>

            {onCopySnippet && (
              <button
                onClick={() => onCopySnippet(quoteText)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-white border border-[#ECE8E3] hover:bg-slate-50 text-[#4239C4] text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                title="Copy snippet"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            )}
          </div>
        </div>
      );
      continue;
    }

    // Bullet List Item
    if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
      inList = true;
      const contentText = line.replace(/^[\*\-•]\s+/, '');
      listItems.push(
        <li key={`li-${currentKey++}`} className="flex items-start gap-2 text-xs md:text-sm text-[#3E3A52] leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7A5DBB] shrink-0 mt-2" />
          <div>{renderFormattedText(contentText)}</div>
        </li>
      );
      continue;
    }

    // Numbered Item (e.g. "1. ", "2. ")
    if (/^\d+\.\s+/.test(line)) {
      flushList();
      const numMatch = line.match(/^(\d+)\.\s+/);
      const number = numMatch ? numMatch[1] : '1';
      const contentText = line.replace(/^\d+\.\s+/, '');
      renderedElements.push(
        <div key={`num-${currentKey++}`} className="flex items-start gap-3 my-2.5 p-3 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3]">
          <span className="w-6 h-6 rounded-lg bg-white text-[#4239C4] font-black text-xs flex items-center justify-center border border-[#ECE8E3] shrink-0">
            {number}
          </span>
          <div className="text-xs md:text-sm text-[#141226] leading-relaxed pt-0.5">
            {renderFormattedText(contentText)}
          </div>
        </div>
      );
      continue;
    }

    // Empty line
    if (!line) {
      flushList();
      continue;
    }

    // Regular Paragraph
    flushList();
    renderedElements.push(
      <p key={`p-${currentKey++}`} className="text-xs md:text-sm text-[#3E3A52] leading-relaxed my-2">
        {renderFormattedText(line)}
      </p>
    );
  }

  flushList();
  return <div className="space-y-1">{renderedElements}</div>;
}

// Helper to format inline bold, italic
function renderFormattedText(text) {
  if (!text) return '';

  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-extrabold text-[#141226]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-[#4239C4] font-semibold">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export default function ContentLibraryPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewFormat, setViewFormat] = useState('formatted'); // 'formatted' | 'raw'

  // Content Idea Studio Modal State
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  useBodyScrollLock(Boolean(showIdeaModal || previewItem));
  const [seedConcept, setSeedConcept] = useState('');
  const [ideaFormat, setIdeaFormat] = useState(IDEA_FORMATS[0]);
  const [ideaAngle, setIdeaAngle] = useState(IDEA_ANGLES[0]);
  const [generatingIdea, setGeneratingIdea] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState(null);
  const [ideaSaved, setIdeaSaved] = useState(false);

  // Edit with AI states for Idea Modal
  const [showAiEditBar, setShowAiEditBar] = useState(false);
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [editingWithAi, setEditingWithAi] = useState(false);
  const [aiEditSuccessMsg, setAiEditSuccessMsg] = useState(null);

  // Edit with AI states for Dossier Inspector
  const [showInspectorAiEditBar, setShowInspectorAiEditBar] = useState(false);
  const [inspectorAiEditPrompt, setInspectorAiEditPrompt] = useState('');
  const [editingInspectorWithAi, setEditingInspectorWithAi] = useState(false);
  const [inspectorAiEditSuccessMsg, setInspectorAiEditSuccessMsg] = useState(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const res = await api.getSavedContent(null, true);
      if (res.success) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('Error loading content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this saved content document?')) return;
    try {
      await api.deleteSavedContent(id);
      if (previewItem?.id === id) setPreviewItem(null);
      loadContent();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopySnippet = (snippet) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleDownloadSingle = (item) => {
    const title = (item.tool_title || 'Marketing_Document').replace(/[^a-z0-9]/gi, '_');
    const blob = new Blob([item.output_content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    if (items.length === 0) return;
    let txt = `# MarketPulse AI - Full Content Library Dossiers\n\n`;
    items.forEach((item, i) => {
      txt += `# ${i + 1}. ${item.tool_title || 'Untitled Asset'}\n`;
      txt += `**Date Created:** ${new Date(item.created_at).toLocaleDateString()}\n`;
      txt += `**Input Context:** ${item.input_summary || 'Standard Generation'}\n\n`;
      txt += `${item.output_content}\n\n---\n\n`;
    });
    const blob = new Blob([txt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MarketPulse-Full-Content-Library-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate New Content Idea from Seed Concept
  const handleGenerateContentIdea = async (e) => {
    if (e) e.preventDefault();
    if (!seedConcept.trim()) return;

    setGeneratingIdea(true);
    setIdeaSaved(false);
    try {
      const activeBrandId = typeof window !== 'undefined' ? localStorage.getItem('marketpulse_active_brand_id') : null;
      const res = await api.runTool({
        toolId: 'content-ideator',
        toolTitle: `Content Idea: ${seedConcept.substring(0, 45)}`,
        category: ideaFormat,
        inputs: {
          concept: seedConcept,
          format: ideaFormat,
          angle: ideaAngle,
          productName: seedConcept.substring(0, 30)
        },
        brandId: activeBrandId
      });

      if (res.success && res.data?.output) {
        setGeneratedIdea({
          id: Date.now(),
          tool_title: `Content Idea: ${seedConcept.substring(0, 45)}`,
          output_content: res.data.output,
          input_summary: `Seed: ${seedConcept.substring(0, 50)} | Format: ${ideaFormat}`,
          created_at: new Date().toISOString()
        });
        // Auto-refresh content list so it's instantly available in library
        loadContent();
      }
    } catch (err) {
      alert(`Generation notice: ${err.message}`);
    } finally {
      setGeneratingIdea(false);
    }
  };

  const handleSaveGeneratedIdeaToLibrary = async () => {
    if (!generatedIdea) return;
    try {
      await api.saveContent({
        tool_id: 'content-ideator',
        tool_title: generatedIdea.tool_title,
        input_summary: generatedIdea.input_summary,
        output_content: generatedIdea.output_content
      });
      setIdeaSaved(true);
      await loadContent();
      setTimeout(() => setIdeaSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Apply AI Edit to Generated Idea
  const handleApplyAiEditToGeneratedIdea = async (customPrompt) => {
    const promptToUse = (customPrompt || aiEditPrompt).trim();
    if (!promptToUse || !generatedIdea) return;

    setEditingWithAi(true);
    setAiEditSuccessMsg(null);
    try {
      const activeBrandId = typeof window !== 'undefined' ? localStorage.getItem('marketpulse_active_brand_id') : null;
      const res = await api.editContentWithAI({
        content: generatedIdea.output_content,
        prompt: promptToUse,
        title: generatedIdea.tool_title,
        brandId: activeBrandId
      });

      if (res.success && res.data?.updatedContent) {
        setGeneratedIdea({
          ...generatedIdea,
          output_content: res.data.updatedContent
        });
        setIdeaSaved(false); // Reset saved flag so user can save updated version
        setAiEditSuccessMsg(`✓ Creative direction applied: "${promptToUse}" — Strategic document updated & expanded.`);
        setAiEditPrompt('');
        setTimeout(() => setAiEditSuccessMsg(null), 6000);
      } else {
        alert(res.error || 'Failed to apply creative direction');
      }
    } catch (err) {
      console.error('Failed to edit with Marky:', err);
      alert('Error applying creative direction: ' + err.message);
    } finally {
      setEditingWithAi(false);
    }
  };

  // Apply AI Edit to Dossier Inspector
  const handleApplyAiEditToPreviewItem = async (customPrompt) => {
    const promptToUse = (customPrompt || inspectorAiEditPrompt).trim();
    if (!promptToUse || !previewItem) return;

    setEditingInspectorWithAi(true);
    setInspectorAiEditSuccessMsg(null);
    try {
      const activeBrandId = typeof window !== 'undefined' ? localStorage.getItem('marketpulse_active_brand_id') : null;
      const res = await api.editContentWithAI({
        content: previewItem.output_content,
        prompt: promptToUse,
        title: previewItem.tool_title,
        brandId: activeBrandId
      });

      if (res.success && res.data?.updatedContent) {
        const updatedDoc = {
          ...previewItem,
          output_content: res.data.updatedContent
        };
        setPreviewItem(updatedDoc);

        // If this is an existing saved item in database, auto-update it
        if (previewItem.id) {
          await api.updateSavedContent(previewItem.id, {
            output_content: res.data.updatedContent
          });
          await loadContent(); // refresh items list
        }

        setInspectorAiEditSuccessMsg(`✓ Creative direction applied: "${promptToUse}" — Dossier updated & saved.`);
        setInspectorAiEditPrompt('');
        setTimeout(() => setInspectorAiEditSuccessMsg(null), 6000);
      } else {
        alert(res.error || 'Failed to apply creative direction');
      }
    } catch (err) {
      console.error('Failed to edit preview item with Marky:', err);
      alert('Error applying creative direction: ' + err.message);
    } finally {
      setEditingInspectorWithAi(false);
    }
  };

  // Fast 1-click status switcher (Done vs Not Done)
  const handleToggleItemStatus = async (item, targetStatus) => {
    if (!item?.id) return;
    const currentIsDone = item.status === 'Done' || item.status === 'Published' || item.status === 'Approved';
    const nextStatus = targetStatus || (currentIsDone ? 'Not Done' : 'Done');

    // Optimistic instant UI update (0ms perceived latency)
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i))
    );
    if (previewItem?.id === item.id) {
      setPreviewItem((prev) => ({ ...prev, status: nextStatus }));
    }

    try {
      await api.toggleContentStatus(item.id, nextStatus);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      loadContent();
    }
  };

  // Helper to infer content type and status for items
  const getItemMetadata = (item) => {
    const title = (item.tool_title || '').toLowerCase();
    let type = 'Competitive Strategy';
    if (title.includes('tiktok') || title.includes('video') || title.includes('hook') || title.includes('script')) {
      type = 'Video Concepts';
    } else if (title.includes('ad') || title.includes('meta') || title.includes('creative')) {
      type = 'Ads';
    } else if (title.includes('whatsapp') || title.includes('email') || title.includes('nurture')) {
      type = 'Email & WhatsApp';
    } else if (title.includes('seo') || title.includes('product page') || title.includes('landing')) {
      type = 'Landing Page';
    } else if (title.includes('matrix') || title.includes('competitive') || title.includes('strategy')) {
      type = 'Competitive Strategy';
    }

    const rawStatus = item.status || 'Done';
    const isDone = rawStatus === 'Done' || rawStatus === 'Published' || rawStatus === 'Approved';
    const status = isDone ? 'Done' : 'Not Done';
    const wordCount = (item.output_content || '').trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return { type, status, rawStatus, wordCount, readingTime };
  };

  const filtered = items.filter((item) => {
    const { type, status, rawStatus } = getItemMetadata(item);

    const matchesSearch =
      (item.tool_title && item.tool_title.toLowerCase().includes(search.toLowerCase())) ||
      (item.output_content && item.output_content.toLowerCase().includes(search.toLowerCase())) ||
      (item.input_summary && item.input_summary.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedType === 'All Types' || type === selectedType;
    const matchesStatus =
      selectedStatus === 'All' ||
      status === selectedStatus ||
      rawStatus === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Header Banner */}
      <PageHeader
        badge="Autonomous Content & Intelligence Repository"
        badgeIcon={BookmarkCheck}
        title="Marketing Content Library"
        subtitle="Complete production-ready marketing assets: Competitive edge matrices, high-converting video scripts, direct-response copy snippets, and automated nurture playbooks."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportAll}
              className="flex items-center gap-1.5 px-4 py-2.5 marky-btn-secondary text-xs font-bold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All (MD)</span>
            </button>
            <button
              onClick={() => {
                setShowIdeaModal(true);
                setGeneratedIdea(null);
                setIdeaSaved(false);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 marky-btn-primary text-xs font-bold cursor-pointer shadow-md shadow-indigo-900/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate New Content Idea</span>
            </button>
          </div>
        }
      />

      {/* 2. Filter & Search Toolbar */}
      <div className="marky-card p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#6C6782] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search documents by keyword, competitor, or hook..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="marky-input w-full pl-9 pr-3.5 py-2.5 text-xs text-[#141226] border border-[#ECE8E3] rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="marky-input text-xs font-bold py-2 px-3 rounded-xl border border-[#ECE8E3] bg-white cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Done">✓ Done</option>
              <option value="Not Done">⏳ Not Done</option>
              <option value="Published">Published</option>
              <option value="Approved">Approved</option>
            </select>

            <div className="flex items-center border border-[#ECE8E3] rounded-xl p-1 bg-[#F7F6FA]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-[#4239C4]' : 'text-[#6C6782]'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-[#4239C4]' : 'text-[#6C6782]'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedType === type
                  ? 'bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] text-white shadow-xs'
                  : 'bg-[#F7F6FA] text-[#6C6782] hover:bg-slate-200/60'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Content Items: Grid or Table View */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookmarkCheck}
          title="No Content Found"
          description="Click 'Generate New Content Idea' to input your seed concept and synthesize a full strategic dossier."
          actionText="Generate New Content Idea"
          onAction={() => setShowIdeaModal(true)}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, index) => {
            const { type, status, wordCount, readingTime } = getItemMetadata(item, index);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="marky-card p-6 flex flex-col justify-between space-y-4 hover:border-[#7A5DBB]/50 hover:shadow-lg transition-all group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/25">
                      {type}
                    </span>
                    
                    {/* Interactive 1-Click Status Button (Done vs Not Done) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleItemStatus(item);
                      }}
                      title={`Click to mark as ${status === 'Done' ? 'Not Done' : 'Done'}`}
                      className={`group/status inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 border ${
                        status === 'Done'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300/80 hover:bg-emerald-100 hover:border-emerald-400'
                          : 'bg-amber-50 text-amber-800 border-amber-300/80 hover:bg-amber-100 hover:border-amber-400'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full transition-colors ${
                          status === 'Done' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      <span>{status}</span>
                      <span className="text-[10px] opacity-40 group-hover/status:opacity-100 transition-opacity">
                        ⇄
                      </span>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-[#141226] leading-snug group-hover:text-[#4239C4] transition-colors line-clamp-2">
                      {item.tool_title || 'Marketing Strategy Document'}
                    </h3>
                    {item.input_summary && (
                      <p className="text-[11px] text-[#6C6782] font-medium mt-1 line-clamp-1">
                        {item.input_summary}
                      </p>
                    )}
                  </div>

                  {/* Document Excerpt Preview */}
                  <div className="p-3.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] text-xs text-[#3E3A52] leading-relaxed max-h-36 overflow-hidden relative">
                    <div className="line-clamp-4 font-sans whitespace-pre-line">
                      {item.output_content}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#F7F6FA] to-transparent pointer-events-none" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#6C6782] font-medium pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#7A5DBB]" />
                      <strong>{readingTime} min read</strong> ({wordCount} words)
                    </span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-[#ECE8E3] flex items-center justify-between text-xs font-bold">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="text-[#4239C4] hover:text-[#372EB3] flex items-center gap-1.5 transition-colors cursor-pointer bg-[#4239C4]/8 px-3 py-1.5 rounded-lg hover:bg-[#4239C4]/15"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Full Dossier</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownloadSingle(item)}
                      className="p-1.5 text-[#6C6782] hover:text-[#4239C4] rounded-lg transition-colors cursor-pointer"
                      title="Download Markdown"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(item.output_content, item.id)}
                      className="p-1.5 text-[#6C6782] hover:text-[#4239C4] rounded-lg transition-colors cursor-pointer"
                      title="Copy Full Document"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-[#6C6782] hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="marky-card overflow-hidden border border-[#ECE8E3]">
          <div className="overflow-x-auto">
            <table className="marky-table">
              <thead>
                <tr>
                  <th>Document Dossier</th>
                  <th>Category</th>
                  <th className="text-center">Length</th>
                  <th className="text-center">Status</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => {
                  const { type, status, wordCount, readingTime } = getItemMetadata(item, index);
                  return (
                    <tr key={item.id} className="hover:bg-[#4239C4]/5 transition-colors">
                      <td className="max-w-md">
                        <div className="font-extrabold text-[#141226] text-xs">
                          {item.tool_title || 'Marketing Strategy'}
                        </div>
                        <div className="text-[11px] text-[#6C6782] truncate">
                          {item.input_summary || item.output_content?.substring(0, 80)}
                        </div>
                      </td>
                      <td>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#4239C4]/10 text-[#4239C4]">
                          {type}
                        </span>
                      </td>
                      <td className="text-center text-xs font-mono text-[#6C6782]">
                        {wordCount} words ({readingTime}m)
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleItemStatus(item)}
                          title={`Click to toggle: ${status === 'Done' ? 'Not Done' : 'Done'}`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer border ${
                            status === 'Done'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status === 'Done' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span>{status}</span>
                          <span className="text-[10px] opacity-40">⇄</span>
                        </button>
                      </td>
                      <td className="text-[#6C6782] font-mono text-xs">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 text-[#4239C4] hover:bg-[#4239C4]/10 rounded-lg"
                            title="Inspect Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadSingle(item)}
                            className="p-1.5 text-[#6C6782] hover:text-[#4239C4] rounded-lg"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCopy(item.output_content, item.id)}
                            className="p-1.5 text-[#6C6782] hover:text-[#4239C4] rounded-lg"
                            title="Copy"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-[#6C6782] hover:text-rose-600 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Interactive "Generate New Content Idea" Studio Modal */}
      {showIdeaModal && (
        <Portal>
          <div className="fixed inset-0 z-[99999] bg-[#0B091B]/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-[#ECE8E3] overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#ECE8E3] flex items-center justify-between bg-[#F7F6FA]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4239C4] to-[#7A5DBB] text-white flex items-center justify-center font-bold shadow-md shadow-indigo-900/20">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#141226] tracking-tight">
                    Generate New Content Idea
                  </h2>
                  <p className="text-xs text-[#6C6782]">
                    Input what you have — Marky will synthesize high-converting content angles, hooks, and full production copy.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIdeaModal(false)}
                className="p-2 text-[#6C6782] hover:text-[#141226] rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split view or Input -> Result flow */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!generatedIdea ? (
                /* Step 1: Input Form */
                <form onSubmit={handleGenerateContentIdea} className="space-y-5">
                  {/* Seed Concept Textarea */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-[#141226] uppercase tracking-wider">
                      1. Tell Marky What You Have (Product, Feature, Offer, or Raw Thought) *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={seedConcept}
                      onChange={(e) => setSeedConcept(e.target.value)}
                      placeholder="e.g. 'I have a 100% pure raw Sidr honey harvested from Karak with lab test certificate, and we want to sell gift packs for Ramadan with COD...'"
                      className="marky-input w-full p-3.5 text-xs text-[#141226] border border-[#ECE8E3] rounded-2xl leading-relaxed resize-none focus:ring-2 focus:ring-[#4239C4]/20"
                    />

                    {/* Quick Inspiration Chips */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-[#6C6782]">Or click to inspire with an example:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {PREFILL_PROMPTS.map((p, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setSeedConcept(p.text)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#F7F6FA] border border-[#ECE8E3] text-[#4239C4] hover:bg-[#4239C4]/10 transition-colors cursor-pointer"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Format & Channel Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-[#141226] uppercase tracking-wider">
                      2. Select Content Format / Channel Target
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {IDEA_FORMATS.map((fmt) => (
                        <button
                          type="button"
                          key={fmt}
                          onClick={() => setIdeaFormat(fmt)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                            ideaFormat === fmt
                              ? 'border-[#4239C4] bg-[#4239C4]/10 text-[#4239C4] shadow-xs'
                              : 'border-[#ECE8E3] bg-[#FCFBFA] text-[#6C6782] hover:border-[#7A5DBB]/40'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Psychological Angle */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-[#141226] uppercase tracking-wider">
                      3. Select Psychological Angle & Trigger
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {IDEA_ANGLES.map((ang) => (
                        <button
                          type="button"
                          key={ang}
                          onClick={() => setIdeaAngle(ang)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            ideaAngle === ang
                              ? 'border-[#7A5DBB] bg-[#7A5DBB]/15 text-[#4239C4]'
                              : 'border-[#ECE8E3] bg-white text-[#6C6782] hover:bg-slate-50'
                          }`}
                        >
                          {ang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#ECE8E3] flex items-center justify-between">
                    <span className="text-[11px] text-[#6C6782]">
                      Powered by Marky AI Marketing Intelligence Engine
                    </span>

                    <button
                      type="submit"
                      disabled={generatingIdea || !seedConcept.trim()}
                      className="px-6 py-3 marky-btn-primary text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-indigo-900/25 disabled:opacity-50 cursor-pointer"
                    >
                      {generatingIdea ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Synthesizing Strategic Content Idea...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Synthesize Content Idea & Blueprint</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Generated Result View */
                <div className="space-y-5 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-[#4239C4]/8 border border-[#4239C4]/25 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-extrabold text-[#4239C4] uppercase tracking-wider">
                        AI Content Idea Synthesized Successfully
                      </span>
                      <h3 className="text-sm font-black text-[#141226]">
                        {generatedIdea.tool_title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id="edit-with-marky-banner-btn"
                        onClick={() => setShowAiEditBar(!showAiEditBar)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border ${
                          showAiEditBar
                            ? 'bg-[#4239C4] text-white border-[#4239C4] shadow-md shadow-indigo-900/20'
                            : 'bg-white border-[#ECE8E3] text-[#141226] hover:border-[#4239C4] hover:text-[#4239C4] shadow-xs'
                        }`}
                      >
                        <img src="/marky-avatar.png" alt="Marky" className="w-4 h-4 object-contain filter drop-shadow-xs" />
                        <span>Edit with Marky</span>
                      </button>

                      <button
                        onClick={handleSaveGeneratedIdeaToLibrary}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          ideaSaved
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-[#4239C4] text-white hover:bg-[#372EB3]'
                        }`}
                      >
                        {ideaSaved ? <Check className="w-3.5 h-3.5" /> : <BookmarkCheck className="w-3.5 h-3.5" />}
                        <span>{ideaSaved ? 'Saved in Library!' : 'Save to Library'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setPreviewItem(generatedIdea);
                          setShowIdeaModal(false);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-[#ECE8E3] text-[#4239C4] hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Full Dossier</span>
                      </button>
                    </div>
                  </div>

                  {/* Executive Creative Director Studio - Designer Agency Aesthetic */}
                  {showAiEditBar && (
                    <div className="p-5 rounded-2xl bg-gradient-to-b from-[#FAF9FD] to-[#F3F1FA] border border-[#E2DCF7] shadow-lg shadow-indigo-900/5 space-y-3.5 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#0B091B] p-1.5 flex items-center justify-center border border-[#7A5DBB]/30 shadow-md shadow-indigo-950/20 shrink-0">
                            <img
                              src="/marky-avatar.png"
                              alt="Marky"
                              className="w-full h-full object-contain filter drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
                            />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-[#141226] tracking-tight flex items-center gap-2">
                              <span>Marky Creative Director Studio</span>
                              <span className="text-[10px] font-bold text-[#7A5DBB] bg-[#7A5DBB]/10 px-2 py-0.5 rounded-md">
                                Agency Tier
                              </span>
                            </h4>
                            <p className="text-[11px] text-[#6C6782]">
                              Direct Marky to expand strategic depth, sharpen copy, or craft custom launch deliverables.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAiEditBar(false)}
                          className="p-1.5 rounded-lg text-[#6C6782] hover:text-[#141226] hover:bg-slate-200/60 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Creative Direction Input Bar */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={aiEditPrompt}
                          onChange={(e) => setAiEditPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleApplyAiEditToGeneratedIdea();
                            }
                          }}
                          placeholder="Instruct Marky: 'Make this 2x longer with detailed objections, TikTok hooks, and WhatsApp sequence'..."
                          className="flex-1 bg-white border border-[#DDD6F3] rounded-xl px-4 py-2.5 text-xs text-[#141226] placeholder:text-[#9894AD] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#4239C4]/20 focus:border-[#4239C4]"
                        />
                        <button
                          type="button"
                          disabled={editingWithAi || !aiEditPrompt.trim()}
                          onClick={() => handleApplyAiEditToGeneratedIdea()}
                          className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#4239C4] hover:bg-[#342D9D] text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md shadow-indigo-900/20"
                        >
                          {editingWithAi ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Refining with Marky...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Apply Direction</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Executive Directives */}
                      <div className="space-y-1.5 pt-1 border-t border-[#E8E4F5]">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#6C6782]">
                          Executive Directives:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Make it 2x longer with deeper tactical steps & scripts',
                            'Inject 3 high-retention viral TikTok / Reels video hooks',
                            'Add Ramadan pre-order urgency & limited batch offer',
                            'Add 3-part automated WhatsApp closing sequence',
                            'Add COD doorstep objection-handling battlecard'
                          ].map((chipText, idx) => (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => {
                                setAiEditPrompt(chipText);
                                handleApplyAiEditToGeneratedIdea(chipText);
                              }}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white hover:bg-[#4239C4]/10 hover:text-[#4239C4] hover:border-[#4239C4]/40 text-[#3E3A52] border border-[#ECE8E3] transition-all cursor-pointer shadow-2xs text-left"
                            >
                              + {chipText}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Agency confirmation */}
                  {aiEditSuccessMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{aiEditSuccessMsg}</span>
                      </div>
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                  )}

                  {/* Rendered Document View */}
                  <div className="p-6 rounded-2xl border border-[#ECE8E3] bg-[#FCFBFA] max-h-[480px] overflow-y-auto">
                    <MarkdownDocumentView
                      content={generatedIdea.output_content}
                      onCopySnippet={handleCopySnippet}
                    />
                  </div>

                  <div className="pt-3 border-t border-[#ECE8E3] flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setGeneratedIdea(null)}
                      className="text-[#4239C4] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ← Try Another Seed Concept / Angle
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowIdeaModal(false)}
                      className="px-4 py-2 marky-btn-secondary font-bold cursor-pointer"
                    >
                      Done & Return to Library
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Portal>
    )}

      {/* 5. Full Detail Document Dossier Inspector Modal */}
      {previewItem && (
        <Portal>
          <div className="fixed inset-0 z-[99999] bg-[#0B091B]/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div
              className={`bg-white rounded-3xl w-full flex flex-col shadow-2xl border border-[#ECE8E3] overflow-hidden transition-all duration-200 my-auto ${
                isFullScreen ? 'max-w-7xl h-[92vh]' : 'max-w-4xl h-[85vh] sm:h-[88vh]'
              }`}
            >
            {/* Modal Header */}
            <div className="p-5 md:px-6 border-b border-[#ECE8E3] flex items-center justify-between bg-[#F7F6FA]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4239C4] to-[#7A5DBB] text-white flex items-center justify-center font-bold shadow-md shadow-indigo-900/20 shrink-0">
                  <BookmarkCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4239C4] bg-[#4239C4]/10 px-2 py-0.5 rounded-full">
                      Strategic Asset Dossier
                    </span>
                    <span className="text-[10px] font-mono text-[#6C6782]">
                      ID: #{previewItem.id}
                    </span>
                    {/* Interactive 1-click status badge in inspector */}
                    <button
                      type="button"
                      onClick={() => handleToggleItemStatus(previewItem)}
                      title={`Click to mark as ${previewItem.status === 'Done' || previewItem.status === 'Published' || previewItem.status === 'Approved' ? 'Not Done' : 'Done'}`}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all cursor-pointer border ${
                        previewItem.status === 'Done' || previewItem.status === 'Published' || previewItem.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        previewItem.status === 'Done' || previewItem.status === 'Published' || previewItem.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                      <span>{previewItem.status === 'Done' || previewItem.status === 'Published' || previewItem.status === 'Approved' ? 'Done' : 'Not Done'}</span>
                      <span className="text-[9px] opacity-40">⇄</span>
                    </button>
                  </div>
                  <h2 className="text-sm md:text-base font-black text-[#141226] tracking-tight line-clamp-1 mt-0.5">
                    {previewItem.tool_title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Edit with Marky button */}
                <button
                  id="inspector-edit-with-marky-btn"
                  onClick={() => setShowInspectorAiEditBar(!showInspectorAiEditBar)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border ${
                    showInspectorAiEditBar
                      ? 'bg-[#4239C4] text-white border-[#4239C4] shadow-md shadow-indigo-900/20'
                      : 'bg-white border-[#ECE8E3] text-[#141226] hover:border-[#4239C4] hover:text-[#4239C4] shadow-xs'
                  }`}
                >
                  <img src="/marky-avatar.png" alt="Marky" className="w-4 h-4 object-contain filter drop-shadow-xs" />
                  <span>Edit with Marky</span>
                </button>

                {/* Format Toggle */}
                <div className="hidden sm:flex items-center border border-[#ECE8E3] rounded-xl p-1 bg-white">
                  <button
                    onClick={() => setViewFormat('formatted')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewFormat === 'formatted' ? 'bg-[#4239C4] text-white shadow-xs' : 'text-[#6C6782]'
                    }`}
                  >
                    Formatted
                  </button>
                  <button
                    onClick={() => setViewFormat('raw')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      viewFormat === 'raw' ? 'bg-[#4239C4] text-white shadow-xs' : 'text-[#6C6782]'
                    }`}
                  >
                    <Code className="w-3 h-3" />
                    <span>Raw MD</span>
                  </button>
                </div>

                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2 text-[#6C6782] hover:text-[#141226] rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setPreviewItem(null);
                    setIsFullScreen(false);
                  }}
                  className="p-2 text-[#6C6782] hover:text-[#141226] rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Metadata Bar */}
            <div className="px-6 py-2.5 bg-[#FCFBFA] border-b border-[#ECE8E3] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6C6782]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-semibold text-[#141226]">
                  <Briefcase className="w-3.5 h-3.5 text-[#4239C4]" />
                  <span>KMB Natural Foods</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#7A5DBB]" />
                  <span>
                    {Math.max(1, Math.ceil((previewItem.output_content || '').split(/\s+/).length / 200))} min read
                  </span>
                </span>
                <span>
                  {(previewItem.output_content || '').split(/\s+/).length} words
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px]">
                <Calendar className="w-3 h-3 text-[#9894AD]" />
                <span>{new Date(previewItem.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Collapsible Inspector Creative Studio Drawer - Agency Grade */}
            {showInspectorAiEditBar && (
              <div className="p-5 bg-gradient-to-b from-[#FAF9FD] to-[#F3F1FA] border-b border-[#E2DCF7] shadow-sm space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0B091B] p-1.5 flex items-center justify-center border border-[#7A5DBB]/30 shadow-md shadow-indigo-950/20 shrink-0">
                      <img
                        src="/marky-avatar.png"
                        alt="Marky"
                        className="w-full h-full object-contain filter drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#141226] tracking-tight flex items-center gap-2">
                        <span>Marky Creative Director Studio</span>
                        <span className="text-[10px] font-bold text-[#7A5DBB] bg-[#7A5DBB]/10 px-2 py-0.5 rounded-md">
                          Agency Tier
                        </span>
                      </h4>
                      <p className="text-[11px] text-[#6C6782]">
                        Direct Marky to expand strategic depth, sharpen copy, or craft custom launch deliverables.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInspectorAiEditBar(false)}
                    className="p-1.5 rounded-lg text-[#6C6782] hover:text-[#141226] hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Creative Direction Input Bar */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={inspectorAiEditPrompt}
                    onChange={(e) => setInspectorAiEditPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleApplyAiEditToPreviewItem();
                      }
                    }}
                    placeholder="Instruct Marky: 'Make this 2x longer with detailed objections, TikTok scripts, and launch roadmap'..."
                    className="flex-1 bg-white border border-[#DDD6F3] rounded-xl px-4 py-2.5 text-xs text-[#141226] placeholder:text-[#9894AD] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#4239C4]/20 focus:border-[#4239C4]"
                  />
                  <button
                    type="button"
                    disabled={editingInspectorWithAi || !inspectorAiEditPrompt.trim()}
                    onClick={() => handleApplyAiEditToPreviewItem()}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#4239C4] hover:bg-[#342D9D] text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md shadow-indigo-900/20"
                  >
                    {editingInspectorWithAi ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Refining with Marky...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Apply Direction</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Executive Directives */}
                <div className="space-y-1.5 pt-1 border-t border-[#E8E4F5]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#6C6782]">
                    Executive Directives:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Make it 2x longer with deeper tactical steps & scripts',
                      'Inject 3 high-retention viral TikTok / Reels video hooks',
                      'Add Ramadan pre-order urgency & limited batch offer',
                      'Add 3-part automated WhatsApp closing sequence',
                      'Add COD doorstep objection-handling battlecard'
                    ].map((chipText, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setInspectorAiEditPrompt(chipText);
                          handleApplyAiEditToPreviewItem(chipText);
                        }}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white hover:bg-[#4239C4]/10 hover:text-[#4239C4] hover:border-[#4239C4]/40 text-[#3E3A52] border border-[#ECE8E3] transition-all cursor-pointer shadow-2xs text-left"
                      >
                        + {chipText}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Inspector Success notification */}
            {inspectorAiEditSuccessMsg && (
              <div className="p-3.5 bg-emerald-50/90 border-b border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{inspectorAiEditSuccessMsg}</span>
                </div>
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            )}

            {/* Notification alert on snippet copied */}
            {copiedSnippet && (
              <div className="bg-emerald-50 text-emerald-800 border-b border-emerald-200 px-6 py-2 text-xs font-bold flex items-center justify-between animate-fadeIn">
                <span>✓ High-converting copy snippet copied to clipboard!</span>
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
            )}

            {/* Document Body View */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
              {viewFormat === 'formatted' ? (
                <div className="max-w-3xl mx-auto space-y-4">
                  <MarkdownDocumentView
                    content={previewItem.output_content}
                    onCopySnippet={handleCopySnippet}
                  />
                </div>
              ) : (
                <pre className="max-w-3xl mx-auto p-4 rounded-2xl bg-[#0B091B] text-[#DCD7FF] text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {previewItem.output_content}
                </pre>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 md:px-6 border-t border-[#ECE8E3] bg-[#F7F6FA] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(previewItem.output_content, previewItem.id)}
                  className="marky-btn-primary px-4 py-2 font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === previewItem.id ? 'Copied Full Document!' : 'Copy Full Document'}</span>
                </button>

                <button
                  onClick={() => handleDownloadSingle(previewItem)}
                  className="marky-btn-secondary px-4 py-2 font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .MD</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setPreviewItem(null);
                  setIsFullScreen(false);
                }}
                className="px-4 py-2 text-[#6C6782] hover:text-[#141226] font-bold cursor-pointer hover:bg-slate-200/50 rounded-xl transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      </Portal>
    )}
  </div>
);
}
