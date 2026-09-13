'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Database,
  Globe,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Cpu,
  Layers,
  Check,
  X,
  Plus
} from 'lucide-react';
import api from '@/lib/api';
import Portal, { useBodyScrollLock } from '@/components/ui/Portal';

export default function IntegrationsManager({ categoryFilter, title, description, icon: HeaderIcon }) {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState({}); // { [id]: { type: 'success' | 'error', message: '' } }

  // Modal State for Connecting / Editing
  const [activeProvider, setActiveProvider] = useState(null);
  useBodyScrollLock(Boolean(activeProvider));
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const res = await api.getIntegrations(true);
      if (res.success && res.data) {
        setIntegrations(res.data);
      }
    } catch (e) {
      console.warn('[Integrations] Load error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = integrations.filter((item) => {
    if (!categoryFilter) return true;
    if (categoryFilter === 'ai') {
      return item.type === 'ai_llm' || item.type === 'ai_image';
    }
    if (categoryFilter === 'database') {
      return item.type === 'database';
    }
    if (categoryFilter === 'apps') {
      return item.type === 'connected_app';
    }
    return true;
  });

  const handleOpenModal = (provider) => {
    setActiveProvider(provider);
    setModalError('');
    // Initialize form with existing masked preview placeholders or blank
    const initial = {};
    provider.fields.forEach((f) => {
      initial[f.key] = '';
    });
    setFormData(initial);
  };

  const handleCloseModal = () => {
    setActiveProvider(null);
    setFormData({});
    setModalError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!activeProvider) return;

    // Check that at least one required field is filled
    const hasValues = Object.values(formData).some((v) => typeof v === 'string' && v.trim().length > 0);
    if (!hasValues) {
      setModalError('Please enter valid connection credentials.');
      return;
    }

    setSaving(true);
    setModalError('');
    try {
      const res = await api.saveIntegration(activeProvider.id, formData);
      if (res.success) {
        handleCloseModal();
        await loadIntegrations();
        setTestResult((prev) => ({
          ...prev,
          [activeProvider.id]: { type: 'success', message: 'Credentials securely encrypted with AES-256 and saved.' }
        }));
        setTimeout(() => {
          setTestResult((prev) => {
            const next = { ...prev };
            delete next[activeProvider.id];
            return next;
          });
        }, 4000);
      } else {
        setModalError(res.error || 'Failed to save integration credentials.');
      }
    } catch (err) {
      setModalError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (providerId) => {
    setTestingId(providerId);
    setTestResult((prev) => {
      const next = { ...prev };
      delete next[providerId];
      return next;
    });

    try {
      const res = await api.testIntegration(providerId);
      if (res.success) {
        setTestResult((prev) => ({
          ...prev,
          [providerId]: { type: 'success', message: res.message || 'Connected successfully!' }
        }));
      } else {
        setTestResult((prev) => ({
          ...prev,
          [providerId]: { type: 'error', message: res.error || 'Connection probe failed.' }
        }));
      }
      await loadIntegrations();
    } catch (err) {
      setTestResult((prev) => ({
        ...prev,
        [providerId]: { type: 'error', message: err.message || 'Unable to probe provider connection.' }
      }));
    } finally {
      setTestingId(null);
    }
  };

  const handleDisconnect = async (providerId, providerName) => {
    if (!confirm(`Are you sure you want to disconnect ${providerName}? All encrypted credentials will be permanently erased.`)) {
      return;
    }

    try {
      const res = await api.disconnectIntegration(providerId);
      if (res.success) {
        await loadIntegrations();
        setTestResult((prev) => ({
          ...prev,
          [providerId]: { type: 'success', message: `${providerName} disconnected successfully.` }
        }));
        setTimeout(() => {
          setTestResult((prev) => {
            const next = { ...prev };
            delete next[providerId];
            return next;
          });
        }, 3000);
      }
    } catch (err) {
      alert(`Error disconnecting: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#ECE8E3] shadow-sm">
        <div>
          <h3 className="text-base font-black text-[#141226] flex items-center gap-2">
            {HeaderIcon && <HeaderIcon className="w-5 h-5 text-[#4239C4]" />}
            <span>{title}</span>
          </h3>
          <p className="text-xs text-[#6C6782] mt-1">{description}</p>
        </div>
        <button
          onClick={loadIntegrations}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ECE8E3] hover:bg-slate-50 text-xs font-bold text-[#141226] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#4239C4] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Cards Grid (#23 & #34) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((prov) => {
          const isConnected = prov.status === 'CONNECTED';
          const isError = prov.status === 'ERROR';
          const isTesting = testingId === prov.id;
          const result = testResult[prov.id];

          return (
            <div
              key={prov.id}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all border ${
                isConnected
                  ? 'bg-white border-emerald-200 shadow-sm'
                  : 'bg-[#FCFBFA] border-[#ECE8E3] hover:border-[#D1C3FF]'
              }`}
            >
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C6782]">
                      {prov.category}
                    </span>
                    <h4 className="text-base font-black text-[#141226]">{prov.name}</h4>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isConnected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isError
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isConnected ? 'bg-emerald-500' : isError ? 'bg-red-500' : 'bg-slate-400'
                      }`}
                    />
                    <span>{isConnected ? 'Connected' : isError ? 'Error' : 'Not Connected'}</span>
                  </span>
                </div>

                <p className="text-xs text-[#6C6782] leading-relaxed line-clamp-2">
                  {prov.description}
                </p>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {prov.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F5F3FF] text-[#4239C4] border border-[#DDD6FE]"
                    >
                      {cap}
                    </span>
                  ))}
                </div>

                {/* Masked Preview (#25) */}
                {isConnected && prov.maskedCredentials && (
                  <div className="p-3 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#6C6782] uppercase">
                      <span>Stored Credentials</span>
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <Lock className="w-3 h-3" /> AES-256 Encrypted
                      </span>
                    </div>
                    {Object.entries(prov.maskedCredentials).map(([k, v]) => (
                      <div key={k} className="flex justify-between font-mono text-[11px] text-[#141226] truncate">
                        <span className="text-[#6C6782] capitalize">{k}:</span>
                        <span className="font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feedback Alert */}
                {result && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fadeIn ${
                      result.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {result.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <span className="text-[11px] leading-tight">{result.message}</span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-5 mt-5 border-t border-[#ECE8E3] flex items-center gap-2">
                {isConnected ? (
                  <>
                    <button
                      onClick={() => handleOpenModal(prov)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#141226] text-xs font-bold transition-colors cursor-pointer text-center"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleTestConnection(prov.id)}
                      disabled={isTesting}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4239C4] text-xs font-bold border border-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
                      title="Test Live Connection"
                    >
                      {isTesting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5" />
                      )}
                      <span>{isTesting ? 'Testing...' : 'Test'}</span>
                    </button>
                    <button
                      onClick={() => handleDisconnect(prov.id, prov.name)}
                      className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                      title="Disconnect Provider"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleOpenModal(prov)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#4239C4] to-[#7A5DBB] hover:opacity-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Connect {prov.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MODAL DIALOG TELEPORTED TO DOCUMENT.BODY (#23-#25) ── */}
      {activeProvider && (
        <Portal>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#ECE8E3] overflow-hidden flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-[#ECE8E3] bg-[#FCFBFA] flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C6782]">
                    {activeProvider.category}
                  </span>
                  <h3 className="text-lg font-black text-[#141226]">
                    Configure {activeProvider.name}
                  </h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl text-[#6C6782] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body with smooth internal scrolling */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                {modalError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] text-[#4239C4] space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Hardware &amp; AES-256 Vault Protection</span>
                  </p>
                  <p className="text-[11px] text-[#6C6782] leading-relaxed">
                    Credentials submitted here are encrypted at rest with an authenticated AES-256-GCM cipher on the server. Your secret key is never sent to the browser bundle or shared across workspaces.
                  </p>
                </div>

                <form id="provider-form" onSubmit={handleSave} className="space-y-4 pt-2">
                  {activeProvider.fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#141226]">
                        {field.label} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={field.type}
                        required
                        placeholder={field.placeholder}
                        value={formData[field.key] || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.key]: e.target.value
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] text-xs font-medium text-[#141226] placeholder-[#8E8AAB] focus:bg-white focus:outline-none focus:border-[#4239C4] focus:ring-1 focus:ring-[#4239C4] transition-all font-mono"
                      />
                    </div>
                  ))}

                  {activeProvider.docsUrl && (
                    <div className="pt-2">
                      <a
                        href={activeProvider.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#4239C4] font-bold hover:underline"
                      >
                        <span>Need an API key or developer documentation?</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-[#ECE8E3] bg-[#FCFBFA] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl border border-[#ECE8E3] hover:bg-slate-100 text-xs font-bold text-[#6C6782] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="provider-form"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4239C4] via-[#7A5DBB] to-[#D97FA5] text-white text-xs font-bold shadow-md hover:opacity-95 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Encrypting &amp; Saving...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Save &amp; Encrypt Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
