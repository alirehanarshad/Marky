import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Download,
  BookmarkPlus,
  RefreshCw,
  Clock,
  Layers,
  Trash2,
  Coins,
  Briefcase,
  Package
} from 'lucide-react';
import api from '../lib/api';
import UpPromptButton from './ui/UpPromptButton';

export default function ToolRunnerModal({ tool, isOpen, onClose, onSavedToLibrary }) {
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
  const [copiedSection, setCopiedSection] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Get initial active brand from local storage if available
      const activeBrand = typeof window !== 'undefined' ? localStorage.getItem('marketpulse_active_brand_id') : '';
      if (activeBrand) {
        setSelectedBrandId(activeBrand);
      }

      api.getBrands().then((res) => {
        if (res.success) setBrands(res.data || []);
      }).catch(() => {});

      loadProducts(activeBrand);
    }
  }, [isOpen]);

  const loadProducts = async (brandId) => {
    try {
      const res = await api.getProducts(brandId || undefined);
      if (res.success) {
        setProducts(res.data || []);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    }
  };

  const handleBrandSelect = (brandId) => {
    setSelectedBrandId(brandId);
    setSelectedProductId('');
    loadProducts(brandId);
  };

  if (!isOpen || !tool) return null;

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
      } else {
        setError(res.error || 'Failed to generate output');
      }
    } catch (err) {
      setError(err.message || 'Error executing tool runner');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleRunTool();
  };

  const handleDeleteOutput = () => {
    setOutput('');
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
      if (onSavedToLibrary) onSavedToLibrary();
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
    <div className="fixed inset-0 z-50 bg-[#0B091B]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#ECE8E3] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-[#ECE8E3] flex items-center justify-between bg-[#F7F6FA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4239C4] to-[#7A5DBB] text-white flex items-center justify-center shadow-md shadow-indigo-900/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#141226]">{tool.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4239C4]/10 text-[#4239C4] border border-[#4239C4]/20">
                  {tool.category}
                </span>
                {tool.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0B091B] text-white">
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6C6782] mt-0.5">{tool.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split view (Form on left, Output on right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#ECE8E3]">
          
          {/* Left: Input Form (5 cols) */}
          <div className="lg:col-span-5 p-5 space-y-4 bg-[#FCFBFA]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6C6782]">
                Tool Parameters
              </h3>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-[#7A5DBB]" /> {tool.providerType === 'calculator' ? 'Deterministic math' : '~2s generation'}
              </span>
            </div>

            {/* Profile Auto-Injectors */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3]">
              <div>
                <label className="text-[10px] font-bold text-[#6C6782] uppercase flex items-center gap-1 mb-1">
                  <Briefcase className="w-3 h-3 text-[#4239C4]" /> Brand Context
                </label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => handleBrandSelect(e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg border border-[#ECE8E3] bg-white text-[#141226] font-medium"
                >
                  <option value="">General Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#6C6782] uppercase flex items-center gap-1 mb-1">
                  <Package className="w-3 h-3 text-[#7A5DBB]" /> Autofill Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg border border-[#ECE8E3] bg-white text-[#141226] font-medium"
                >
                  <option value="">Select Product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handleRunTool} className="space-y-3.5">
              {(tool.inputs || []).map((input) => {
                const isTextArea = input.type === 'textarea' || input.label.toLowerCase().includes('copy') || input.label.toLowerCase().includes('features') || input.label.toLowerCase().includes('objection');
                const isPromptField = isTextArea || input.label.toLowerCase().includes('prompt') || input.label.toLowerCase().includes('topic') || input.label.toLowerCase().includes('hook') || input.label.toLowerCase().includes('headline') || input.label.toLowerCase().includes('description') || input.label.toLowerCase().includes('idea') || input.label.toLowerCase().includes('script') || input.label.toLowerCase().includes('subject');
                return (
                <div key={input.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {input.label}
                    </label>
                    {isPromptField && (
                      <UpPromptButton
                        value={formInputs[input.key] || ''}
                        onChange={(enhanced) => handleInputChange(input.key, enhanced)}
                        type="text"
                        context={`Tool: ${tool.name} | Field: ${input.label} | Category: ${tool.category}`}
                        compact={false}
                      />
                    )}
                  </div>
                  {isTextArea ? (
                    <textarea
                      rows={3}
                      placeholder={input.placeholder}
                      value={formInputs[input.key] || ''}
                      onChange={(e) => handleInputChange(input.key, e.target.value)}
                      className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white resize-none"
                      required
                    />
                  ) : (
                    <input
                      type={input.type || 'text'}
                      placeholder={input.placeholder}
                      value={formInputs[input.key] || ''}
                      onChange={(e) => handleInputChange(input.key, e.target.value)}
                      className="marky-input w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                      required
                    />
                  )}
                </div>
                );
              })}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:opacity-95 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing MARKY Tool...</span>
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

          {/* Right: AI Output Console (7 cols) */}
          <div className="lg:col-span-7 p-5 flex flex-col bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tool Output
                </h3>
                {provider && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#4239C4]/10 text-[#4239C4] border border-[#4239C4]/20">
                    {provider}
                  </span>
                )}
              </div>

              {output && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleRegenerate}
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
                    onClick={handleDeleteOutput}
                    className="p-1 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Clear Output"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Output Display Area */}
            <div className="flex-1 min-h-[300px] max-h-[500px] overflow-y-auto p-4 rounded-xl border border-[#ECE8E3] bg-[#FCFBFA] font-sans text-xs leading-relaxed text-slate-800">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-[#4239C4]/20 border-t-[#4239C4] animate-spin"></div>
                    <Sparkles className="w-4 h-4 text-[#7A5DBB] absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <p className="text-xs font-semibold text-[#141226]">Generating direct-response copy...</p>
                  <p className="text-[11px] text-[#6C6782]">Synthesizing audience psychology and conversion hooks</p>
                </div>
              ) : output ? (
                <div className="space-y-4 font-sans select-text">
                  {output.split(/(?=###?\s+)/).map((section, sIdx) => {
                    const lines = section.trim().split('\n');
                    const headerLine = lines[0]?.replace(/^###?\s+/, '').trim();
                    const body = lines.slice(1).join('\n').trim();

                    if (!headerLine && !body) return null;

                    return (
                      <div key={sIdx} className="p-3.5 rounded-xl bg-white border border-[#ECE8E3] shadow-2xs space-y-2 group">
                        <div className="flex items-center justify-between border-b border-[#ECE8E3]/60 pb-1.5">
                          <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-[#4239C4]">
                            {headerLine || 'Campaign Strategy & Copy'}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(body || headerLine);
                              setCopiedSection(`sec-${sIdx}`);
                              setTimeout(() => setCopiedSection(''), 1800);
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-[#7A5DBB] hover:text-[#4239C4] px-2 py-0.5 rounded bg-[#7A5DBB]/8 hover:bg-[#7A5DBB]/15 transition-colors cursor-pointer"
                            title="Copy this section"
                          >
                            {copiedSection === `sec-${sIdx}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Section</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="text-xs text-[#141226] leading-relaxed whitespace-pre-wrap">
                          {body || headerLine}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400 space-y-2">
                  <Layers className="w-8 h-8 text-[#7A5DBB]/30 stroke-[1.5]" />
                  <p className="font-semibold text-slate-600">Ready to Generate</p>
                  <p className="text-[11px] max-w-xs text-slate-400">
                    Fill in the parameters on the left and click Generate to produce high-impact marketing assets.
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
