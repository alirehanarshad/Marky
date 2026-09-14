'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Download,
  BookmarkPlus,
  RefreshCw,
  Clock,
  Briefcase,
  Package,
  Layers,
  Trash2,
  Share2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { MARKETING_TOOLS } from '@/lib/tools-data';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';

export default function ToolRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const tool = MARKETING_TOOLS.find((t) => t.id === slug);

  const [formInputs, setFormInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [provider, setProvider] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [recentRuns, setRecentRuns] = useState([]);
  const [copiedSection, setCopiedSection] = useState('');

  useEffect(() => {
    const activeBrand = typeof window !== 'undefined' ? localStorage.getItem('marketpulse_active_brand_id') : '';
    if (activeBrand) {
      setSelectedBrandId(activeBrand);
    }

    api.getBrands().then((res) => {
      if (res.success) setBrands(res.data || []);
    }).catch(() => {});

    loadProducts(activeBrand);

    // Fetch previous runs of this tool from saved content
    if (slug) {
      api.getSavedContent(slug).then((res) => {
        if (res.success) setRecentRuns(res.data || []);
      }).catch(() => {});
    }
  }, [slug]);

  const loadProducts = async (brandId) => {
    try {
      const res = await api.getProducts(brandId || undefined);
      if (res.success) setProducts(res.data || []);
    } catch (e) {}
  };

  const handleBrandSelect = (brandId) => {
    setSelectedBrandId(brandId);
    setSelectedProductId('');
    loadProducts(brandId);
  };

  if (!tool) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-extrabold text-[#141226]">Tool Not Found</h2>
        <p className="text-sm text-[#6C6782]">The requested MARKY tool could not be located in the registry.</p>
        <Link href="/ai-hub" className="marky-btn-primary inline-flex items-center gap-2 text-xs">
          <ArrowLeft className="w-4 h-4" /> Back to 97 Tools Hub
        </Link>
      </div>
    );
  }

  const handleInputChange = (key, value) => {
    setFormInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectProduct = (prodId) => {
    setSelectedProductId(prodId);
    if (!prodId) return;
    const prod = products.find((p) => String(p.id) === String(prodId));
    if (prod) {
      setFormInputs((prev) => ({
        ...prev,
        productName: prod.name || prev.productName,
        productDescription: prod.description || prev.productDescription,
        targetAudience: prod.target_audience || prev.targetAudience,
        keyBenefits: prod.benefits || prev.keyBenefits,
        features: prod.features || prev.features,
        usp: prod.usp || prev.usp,
        offer: prod.offer || prev.offer,
        sellingPrice: prod.price || prev.sellingPrice,
        pricePoint: prod.price || prev.pricePoint
      }));
    }
  };

  const handleRunTool = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setOutput('');
    setSaved(false);

    try {
      const activeBrandId = selectedBrandId || (typeof window !== 'undefined' ? localStorage.getItem('marketpulse_active_brand_id') : null);
      const res = await api.runTool({
        toolId: tool.id,
        toolTitle: tool.name,
        category: tool.category,
        inputs: formInputs,
        brandId: activeBrandId,
        productId: selectedProductId
      });

      if (res.success) {
        setOutput(res.data.output);
        setProvider(res.data.provider);
        // Refresh recent runs
        api.getSavedContent(slug).then((r) => {
          if (r.success) setRecentRuns(r.data || []);
        });
      } else {
        setError(res.error || 'Failed to generate output');
      }
    } catch (err) {
      setError(err.message || 'Error executing tool runner');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLibrary = async () => {
    if (!output) return;
    try {
      await api.saveContent({
        tool_id: tool.id,
        tool_title: tool.name,
        input_summary: JSON.stringify(formInputs).substring(0, 150),
        output_content: output
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('Failed to save to library:', e);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.id}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6C6782]">
          <Link href="/ai-hub" className="hover:text-[#4239C4] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> All 97 Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#4239C4] font-bold">{tool.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#141226] font-bold">{tool.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {tool.badge && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#4239C4]/10 text-[#4239C4] border border-[#4239C4]/20">
              {tool.badge}
            </span>
          )}
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#0B091B] text-white">
            {tool.providerType === 'calculator' ? 'Deterministic Engine' : '1 Credit'}
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="marky-card p-6 bg-gradient-to-r from-white via-[#FCFBFA] to-[#F7F6FA] border-l-4 border-l-[#4239C4]">
        <h1 className="text-xl font-extrabold text-[#141226] tracking-tight">{tool.name}</h1>
        <p className="text-xs text-[#6C6782] mt-1 max-w-3xl leading-relaxed">{tool.description}</p>
      </div>

      {/* Split-Screen Studio View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Context Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="marky-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E3]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#141226]">
                Input Configuration
              </h2>
              <span className="text-[11px] text-[#6C6782] flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#7A5DBB]" />
                {tool.providerType === 'calculator' ? 'Instant calculation' : '~2s generation'}
              </span>
            </div>

            {/* Brand & Product Auto-Fill Pickers */}
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3]">
              <div>
                <label className="text-[10px] font-bold text-[#6C6782] uppercase flex items-center gap-1 mb-1">
                  <Briefcase className="w-3 h-3 text-[#4239C4]" /> Brand Context
                </label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => handleBrandSelect(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#ECE8E3] bg-white text-[#141226] font-medium"
                >
                  <option value="">General Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#6C6782] uppercase flex items-center gap-1 mb-1">
                  <Package className="w-3 h-3 text-[#7A5DBB]" /> Preload Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#ECE8E3] bg-white text-[#141226] font-medium"
                >
                  <option value="">Select Product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dynamic Inputs Form */}
            <form onSubmit={handleRunTool} className="space-y-4">
              {(tool.inputs || []).map((input) => (
                <div key={input.key} className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#141226]">
                    {input.label}
                  </label>
                  {input.type === 'textarea' || input.label.toLowerCase().includes('copy') || input.label.toLowerCase().includes('features') || input.label.toLowerCase().includes('objection') ? (
                    <textarea
                      rows={3}
                      placeholder={input.placeholder}
                      value={formInputs[input.key] || ''}
                      onChange={(e) => handleInputChange(input.key, e.target.value)}
                      className="marky-input w-full text-xs p-3 rounded-xl border border-[#ECE8E3] bg-white resize-none"
                      required
                    />
                  ) : (
                    <input
                      type={input.type || 'text'}
                      placeholder={input.placeholder}
                      value={formInputs[input.key] || ''}
                      onChange={(e) => handleInputChange(input.key, e.target.value)}
                      className="marky-input w-full text-xs p-2.5 rounded-xl border border-[#ECE8E3] bg-white"
                      required
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:opacity-95 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing MARKY Tool Engine...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate with MARKY</span>
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

          {/* Previous Tool Runs History */}
          {recentRuns.length > 0 && (
            <div className="marky-card p-4 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6C6782]">
                Past Generations ({recentRuns.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentRuns.slice(0, 5).map((run) => (
                  <div
                    key={run.id}
                    onClick={() => setOutput(run.output_content)}
                    className="p-2.5 rounded-lg border border-[#ECE8E3] hover:border-[#7A5DBB]/40 bg-[#FCFBFA] hover:bg-white cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#6C6782] mb-1">
                      <span>{new Date(run.created_at).toLocaleDateString()}</span>
                      <span className="text-[#4239C4] font-bold">View</span>
                    </div>
                    <p className="text-xs text-[#141226] font-medium line-clamp-1">
                      {run.input_summary || 'Generated Asset'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Structured Output Console (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="marky-card p-5 flex flex-col h-full min-h-[550px] bg-white">
            {/* Output Header with Real Action Buttons */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#ECE8E3]">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#141226]">
                  Tool Output Result
                </h2>
                {provider && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#4239C4]/10 text-[#4239C4] border border-[#4239C4]/20">
                    {provider}
                  </span>
                )}
              </div>

              {output && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleRunTool()}
                    disabled={loading}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#4239C4]/10 hover:bg-[#4239C4]/20 text-[#4239C4] rounded-lg transition-colors cursor-pointer border border-[#4239C4]/20"
                    title="Regenerate"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleSaveToLibrary}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#7A5DBB]/10 hover:bg-[#7A5DBB]/20 text-[#7A5DBB] rounded-lg transition-colors border border-[#7A5DBB]/20 cursor-pointer"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{saved ? 'Saved!' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-1 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Download Markdown"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setOutput('')}
                    className="p-1 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Clear"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Output Body */}
            <div className="flex-1 overflow-y-auto p-5 rounded-2xl border border-[#ECE8E3] bg-[#FCFBFA] text-xs leading-relaxed text-[#141226]">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-[#4239C4]/20 border-t-[#4239C4] animate-spin"></div>
                    <Sparkles className="w-5 h-5 text-[#7A5DBB] absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-[#141226]">Generating specialized marketing asset...</p>
                  <p className="text-xs text-[#6C6782]">Executing dedicated {tool.name} engine with active brand context</p>
                </div>
              ) : output ? (
                <div className="space-y-4 font-sans select-text">
                  <ToolMarkdownView content={output} onCopySnippet={(txt) => {
                    navigator.clipboard.writeText(txt);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 text-[#8E8AAB] space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#4239C4]/10 border border-[#7A5DBB]/20 flex items-center justify-center text-[#4239C4]">
                    <Layers className="w-7 h-7" />
                  </div>
                  <p className="font-bold text-sm text-[#141226]">Independent First-Class Tool Ready</p>
                  <p className="text-xs max-w-sm text-[#6C6782]">
                    Configure your parameters on the left and click <strong>Generate with MARKY</strong> to create professional direct-response creative assets.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Rich Markdown Content Document Renderer
function ToolMarkdownView({ content, onCopySnippet }) {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements = [];
  let currentKey = 0;
  let inList = false;
  let listItems = [];
  let inTable = false;
  let tableRows = [];

  const flushList = () => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${currentKey++}`} className="space-y-1.5 my-3 pl-2">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const dataRows = tableRows.slice(1);
      renderedElements.push(
        <div key={`table-${currentKey++}`} className="my-4 overflow-x-auto rounded-xl border border-[#ECE8E3]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F7F6FA] border-b border-[#ECE8E3]">
                {headerRow.map((cell, cIdx) => (
                  <th key={cIdx} className="px-3.5 py-2.5 font-bold text-[#141226]">
                    {renderInlineText(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE8E3] bg-white">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#FCFBFA]">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2 text-[#3E3A52]">
                      {renderInlineText(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Table row detection
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList();
      if (/^\|[\s\-:|]+\|$/.test(line)) {
        // Table separator row, ignore
        continue;
      }
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      inTable = true;
      tableRows.push(cells);
      continue;
    } else {
      flushTable();
    }

    // Horizontal Rule
    if (line === '---' || line === '***' || line === '___') {
      flushList();
      renderedElements.push(
        <div key={`hr-${currentKey++}`} className="my-4 border-t border-[#ECE8E3] relative flex items-center justify-center">
          <span className="bg-white px-2.5 text-[9px] uppercase tracking-widest text-[#9894AD] font-bold">✦</span>
        </div>
      );
      continue;
    }

    // Heading 1
    if (line.startsWith('# ')) {
      flushList();
      const text = line.replace('# ', '').replace(/\*\*/g, '');
      renderedElements.push(
        <h1 key={`h1-${currentKey++}`} className="text-lg md:text-xl font-black text-[#141226] tracking-tight mt-4 mb-2 flex items-center gap-2 border-b border-[#ECE8E3] pb-2">
          <span className="w-2 h-5 rounded-full bg-gradient-to-b from-[#4239C4] to-[#7A5DBB]" />
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
        <h2 key={`h2-${currentKey++}`} className="text-sm md:text-base font-extrabold text-[#141226] tracking-tight mt-4 mb-1.5 flex items-center gap-2">
          <span className="w-1.5 h-3.5 rounded-full bg-[#7A5DBB]" />
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
        <h3 key={`h3-${currentKey++}`} className="text-xs md:text-sm font-bold text-[#4239C4] mt-3 mb-1">
          {text}
        </h3>
      );
      continue;
    }

    // Blockquote / Ad Copy Snippet Callout
    if (line.startsWith('>')) {
      flushList();
      const quoteText = line.replace(/^>\s*/, '').replace(/^"|"$/g, '').trim();
      renderedElements.push(
        <div
          key={`quote-${currentKey++}`}
          className="my-2.5 p-3.5 rounded-xl bg-gradient-to-br from-[#4239C4]/5 via-[#7A5DBB]/5 to-transparent border border-[#7A5DBB]/30 relative overflow-hidden group hover:border-[#4239C4]/50 transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold text-[#4239C4] uppercase tracking-wider block">
                Copy Creative Snippet
              </span>
              <p className="text-xs font-semibold text-[#141226] italic leading-relaxed">
                "{quoteText}"
              </p>
            </div>

            {onCopySnippet && (
              <button
                type="button"
                onClick={() => onCopySnippet(quoteText)}
                className="opacity-80 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-white border border-[#ECE8E3] hover:bg-slate-50 text-[#4239C4] text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
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
        <li key={`li-${currentKey++}`} className="flex items-start gap-2 text-xs text-[#3E3A52] leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7A5DBB] shrink-0 mt-1.5" />
          <div>{renderInlineText(contentText)}</div>
        </li>
      );
      continue;
    }

    // Numbered Item
    if (/^\d+\.\s+/.test(line)) {
      flushList();
      const numMatch = line.match(/^(\d+)\.\s+/);
      const number = numMatch ? numMatch[1] : '1';
      const contentText = line.replace(/^\d+\.\s+/, '');
      renderedElements.push(
        <div key={`num-${currentKey++}`} className="flex items-start gap-2.5 my-1.5 p-2 rounded-lg bg-[#F7F6FA] border border-[#ECE8E3]">
          <span className="w-5 h-5 rounded-md bg-white text-[#4239C4] font-black text-[10px] flex items-center justify-center border border-[#ECE8E3] shrink-0">
            {number}
          </span>
          <div className="text-xs text-[#141226] leading-relaxed pt-0.5">
            {renderInlineText(contentText)}
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
      <p key={`p-${currentKey++}`} className="text-xs text-[#3E3A52] leading-relaxed my-1.5">
        {renderInlineText(line)}
      </p>
    );
  }

  flushList();
  flushTable();
  return <div className="space-y-1">{renderedElements}</div>;
}

// Helper to format inline bold, italic, code
function renderInlineText(text) {
  if (!text) return '';
  // Split on bold markdown **...**
  const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-extrabold text-[#141226]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-[#4239C4] font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
