'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  RefreshCw,
  Eye,
  X,
  Bot,
  LayoutList,
  Calendar,
  Layers,
  Cpu,
  Shield,
  Activity,
  UserCheck
} from 'lucide-react';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import Tabs from '@/components/ui/Tabs';
import EmptyState from '@/components/ui/EmptyState';
import Portal, { useBodyScrollLock } from '@/components/ui/Portal';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [agentFilter, setAgentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'table'
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  useBodyScrollLock(Boolean(selectedLog));

  useEffect(() => {
    loadLogs();
  }, [agentFilter, statusFilter, searchQuery]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs({
        agent: agentFilter !== 'All' ? agentFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: searchQuery || undefined,
        limit: 100
      });
      if (res.success) {
        setLogs(res.data);
      }
    } catch (e) {
      console.error('Audit logs error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Agent', 'Tool', 'Action', 'Status', 'Timestamp', 'Input', 'Output'];
    const rows = logs.map((l) => [
      l.id,
      `"${l.agent_name}"`,
      `"${l.tool_name || ''}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${l.created_at}"`,
      `"${(l.input_summary || '').replace(/"/g, '""')}"`,
      `"${(l.output_summary || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MarketPulse-Audit-Logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const agentsList = [
    'All',
    'Strategy Agent',
    'Advertising Agent',
    'Lead Generation Agent',
    'Content Agent',
    'Competitor Agent',
    'Reporting Agent',
    'Supervisor'
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Header Banner */}
      <PageHeader
        badge="Governance & Compliance Timeline"
        badgeIcon={History}
        title="Workforce Audit Trail & Activity Logs"
        description="Chronological record of every autonomous agent decision, universal tool execution, API scraping request, and supervisor authorization indexed for complete accountability."
        actions={
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 marky-btn-secondary text-xs font-bold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Log (CSV)</span>
          </button>
        }
      />

      {/* 2. Filter Bar & View Mode Toggle */}
      <div className="marky-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Agent Filter */}
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="marky-input text-xs font-bold py-1.5 px-3 cursor-pointer"
          >
            {agentsList.map((a) => (
              <option key={a} value={a}>
                Agent: {a}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="marky-input text-xs font-bold py-1.5 px-3 cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Success">Success</option>
            <option value="Approval Required">Approval Required</option>
            <option value="Warning">Warning</option>
            <option value="Error">Error</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-[#6C6782] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search action or output..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="marky-input w-full pl-9 pr-3 py-1.5 text-xs"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[#F7F6FA] rounded-xl border border-[#ECE8E3]">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'timeline' ? 'bg-white text-[#4239C4] shadow-xs' : 'text-[#6C6782]'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#4239C4] shadow-xs' : 'text-[#6C6782]'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* 3. Timeline or Table View */}
      {loading ? (
        <div className="marky-card p-12 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#4239C4]" />
          <p className="text-xs text-[#6C6782]">Querying cryptographic audit index...</p>
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Audit Logs Found"
          description="No operations recorded matching your active filter criteria."
          actionText="Clear Filters"
          onAction={() => {
            setAgentFilter('All');
            setStatusFilter('All');
            setSearchQuery('');
          }}
        />
      ) : viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="marky-card p-6 md:p-8 space-y-6">
          <div className="relative border-l-2 border-[#ECE8E3] ml-4 md:ml-6 space-y-6">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-6 md:pl-8 group">
                {/* Timeline node icon */}
                <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-white border-2 border-[#4239C4] flex items-center justify-center text-[#4239C4] shadow-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>

                {/* Event Card */}
                <div className="p-4 rounded-2xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-2 hover:border-[#7A5DBB]/40 hover:bg-white transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#141226]">{log.agent_name}</span>
                      {log.tool_name && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#4239C4]/10 text-[#4239C4]">
                          {log.tool_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={log.status} />
                      <span className="text-[11px] text-[#6C6782] font-mono">
                        {new Date(log.created_at).toLocaleTimeString()} • {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#141226]">
                    {log.action}
                  </p>

                  {log.input_summary && (
                    <p className="text-[11px] text-[#6C6782] bg-white p-2.5 rounded-xl border border-[#ECE8E3] line-clamp-2">
                      <strong className="text-[#141226]">Input:</strong> {log.input_summary}
                    </p>
                  )}

                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-xs font-bold text-[#4239C4] hover:text-[#372EB3] flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Payload</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="marky-card overflow-hidden border border-[#ECE8E3]">
          <div className="overflow-x-auto">
            <table className="marky-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Agent / Operator</th>
                  <th>Tool</th>
                  <th>Action Taken</th>
                  <th className="text-center">Status</th>
                  <th className="text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-[#6C6782] font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="font-bold text-[#141226] whitespace-nowrap">
                      {log.agent_name}
                    </td>
                    <td>
                      {log.tool_name ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4239C4]/10 text-[#4239C4]">
                          {log.tool_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="font-semibold text-[#141226] max-w-sm truncate">
                      {log.action}
                    </td>
                    <td className="text-center">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-[#4239C4] hover:bg-[#4239C4]/10 rounded-lg cursor-pointer"
                        title="View Full Payload"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Log Detail Inspector Modal */}
      {selectedLog && (
        <Portal>
          <div className="fixed inset-0 z-[99999] bg-[#0B091B]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-[#ECE8E3] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#ECE8E3] flex items-center justify-between bg-[#F7F6FA]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#141226]">Audit Event #{selectedLog.id}</h3>
                  <span className="text-[11px] text-[#6C6782]">{selectedLog.agent_name} • {new Date(selectedLog.created_at).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-[#6C6782] hover:text-[#141226] rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#6C6782] uppercase block mb-1">Action Description</span>
                <p className="font-bold text-[#141226] bg-[#F7F6FA] p-3 rounded-xl border border-[#ECE8E3]">
                  {selectedLog.action}
                </p>
              </div>

              {selectedLog.input_summary && (
                <div>
                  <span className="text-[10px] font-bold text-[#6C6782] uppercase block mb-1">Input Telemetry</span>
                  <div className="p-3.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] font-mono text-[11px] text-[#3E3A52] whitespace-pre-wrap">
                    {selectedLog.input_summary}
                  </div>
                </div>
              )}

              {selectedLog.output_summary && (
                <div>
                  <span className="text-[10px] font-bold text-[#6C6782] uppercase block mb-1">Execution Output / Response</span>
                  <div className="p-3.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] font-mono text-[11px] text-[#3E3A52] whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {selectedLog.output_summary}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#ECE8E3] bg-[#F7F6FA] flex items-center justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="marky-btn-secondary px-4 py-2 font-bold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      </Portal>
    )}
  </div>
);
}
