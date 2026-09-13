'use client';

import React, { useState } from 'react';
import {
  Plus,
  Phone,
  MessageSquare,
  Sparkles,
  DollarSign,
  MapPin,
  Clock,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  Bot,
  ExternalLink,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function CrmKanbanBoard({
  stages = [],
  leads = [],
  onStageChange,
  onLeadSelect,
  onAddLeadToStage
}) {
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverStageId, setDragOverStageId] = useState(null);

  // Group leads by stage_id
  const stageColumns = stages.map((stage) => {
    // A lead belongs here if lead.stage_id === stage.id or, as fallback, matching status name
    const stageLeads = leads.filter((l) => {
      if (l.stage_id) return String(l.stage_id) === String(stage.id);
      return (l.status || '').toLowerCase() === (stage.name || '').toLowerCase();
    });

    const totalValue = stageLeads.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

    return {
      ...stage,
      leads: stageLeads,
      totalValue
    };
  });

  // Handle Drag & Drop
  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', String(leadId));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDragLeave = (e, stageId) => {
    if (dragOverStageId === stageId) {
      setDragOverStageId(null);
    }
  };

  const handleDrop = (e, stageId, stageName) => {
    e.preventDefault();
    setDragOverStageId(null);
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId && onStageChange) {
      onStageChange(Number(leadId), stageId, stageName);
    }
    setDraggedLeadId(null);
  };

  // Helper score formatting
  const getScoreColor = (scoreNum) => {
    const val = Number(scoreNum) || 50;
    if (val >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (val >= 60) return 'text-[#4239C4] bg-[#4239C4]/10 border-[#4239C4]/20';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const cleanPhone = (p) => (p ? p.replace(/[^\d+]/g, '') : '');

  // Step movement helper (Move left or right)
  const handleMoveStageRelative = (e, lead, currentStageIdx, direction) => {
    e.stopPropagation();
    const targetIdx = currentStageIdx + direction;
    if (targetIdx >= 0 && targetIdx < stages.length) {
      const targetStage = stages[targetIdx];
      if (onStageChange) {
        onStageChange(lead.id, targetStage.id, targetStage.name);
      }
    }
  };

  return (
    <div className="w-full pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
        {stageColumns.map((stage, stageIdx) => {
          const isDragOver = dragOverStageId === stage.id;
          const isFirstStage = stageIdx === 0;
          const isLastStage = stageIdx === stageColumns.length - 1;

          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={(e) => handleDragLeave(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id, stage.name)}
              className={`w-full rounded-2xl flex flex-col bg-[#F9F8F6] border-2 transition-all ${
                isDragOver
                  ? 'border-[#4239C4] bg-[#4239C4]/5 shadow-lg scale-[1.01]'
                  : 'border-[#ECE8E3] hover:border-slate-300'
              }`}
            >
              {/* Stage Header */}
              <div className="p-3.5 border-b border-[#ECE8E3] bg-white rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: stage.color || '#4239C4' }}
                  />
                  <div className="truncate">
                    <h3 className="text-xs font-black text-[#141226] truncate">
                      {stage.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#6C6782] font-semibold mt-0.5">
                      <span>{Math.round(stage.probability * 100)}% Win</span>
                      {stage.sla_hours > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            <span>{stage.sla_hours}h SLA</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-[#F7F6FA] text-[#141226] border border-[#ECE8E3]">
                    {stage.leads.length}
                  </span>
                  {onAddLeadToStage && (
                    <button
                      onClick={() => onAddLeadToStage(stage.id, stage.name)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-[#4239C4] text-slate-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Add lead to stage"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stage Total Value Strip */}
              {stage.totalValue > 0 && (
                <div className="px-3.5 py-1.5 bg-[#ECE8E3]/40 border-b border-[#ECE8E3]/60 flex items-center justify-between text-[10px] font-bold text-[#6C6782]">
                  <span>Stage Pipeline:</span>
                  <span className="text-[#141226] font-extrabold">
                    PKR {stage.totalValue.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Cards Container */}
              <div className="p-3 space-y-3 min-h-[260px] max-h-[440px] overflow-y-auto flex-1">
                {stage.leads.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-[#ECE8E3] rounded-xl flex flex-col items-center justify-center text-center p-4 text-[#6C6782]">
                    <span className="text-xs font-semibold">Drop leads here</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Drag cards across stages to update status
                    </span>
                  </div>
                ) : (
                  stage.leads.map((lead) => {
                    const score = Number(lead.lead_score_numeric) || (lead.lead_score === 'A' ? 88 : lead.lead_score === 'B' ? 68 : 45);
                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => onLeadSelect && onLeadSelect(lead)}
                        className="p-3.5 rounded-xl bg-white border border-[#ECE8E3] shadow-xs hover:shadow-md hover:border-[#4239C4]/40 transition-all cursor-grab active:cursor-grabbing group select-none relative"
                      >
                        {/* Top info: Score & Value */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${getScoreColor(
                              score
                            )}`}
                          >
                            <Bot className="w-2.5 h-2.5" />
                            <span>{score}/100</span>
                          </span>

                          {lead.value ? (
                            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              PKR {Number(lead.value).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">
                              {lead.city || 'Lead'}
                            </span>
                          )}
                        </div>

                        {/* Title & Company */}
                        <h4 className="text-xs font-black text-[#141226] group-hover:text-[#4239C4] transition-colors line-clamp-1">
                          {lead.name}
                        </h4>

                        {lead.company && lead.company !== lead.name && (
                          <p className="text-[11px] text-[#6C6782] font-semibold truncate mt-0.5">
                            {lead.company}
                          </p>
                        )}

                        {/* Location & Source */}
                        <div className="flex items-center gap-2 text-[10px] text-[#6C6782] mt-2 flex-wrap">
                          {lead.city && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              <span>{lead.city}</span>
                            </span>
                          )}
                          {lead.category && (
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                              {lead.category}
                            </span>
                          )}
                        </div>

                        {/* Next action hint */}
                        {lead.next_action && (
                          <div className="mt-2.5 pt-2 border-t border-[#ECE8E3]/60 text-[10px] text-[#4239C4] font-medium flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                            <span className="truncate">{lead.next_action}</span>
                          </div>
                        )}

                        {/* Card bottom toolbar */}
                        <div className="mt-3 pt-2 border-t border-[#ECE8E3] flex items-center justify-between">
                          {/* Quick WhatsApp Link */}
                          {lead.phone ? (
                            <a
                              href={`https://wa.me/${cleanPhone(lead.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                              title="Message on WhatsApp"
                            >
                              <MessageSquare className="w-2.5 h-2.5" />
                              <span>WhatsApp</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400">No phone</span>
                          )}

                          {/* Move Left / Right Buttons */}
                          <div className="flex items-center gap-1">
                            {!isFirstStage && (
                              <button
                                onClick={(e) => handleMoveStageRelative(e, lead, stageIdx, -1)}
                                className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                                title="Move to previous stage"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {!isLastStage && (
                              <button
                                onClick={(e) => handleMoveStageRelative(e, lead, stageIdx, 1)}
                                className="w-5 h-5 rounded bg-slate-100 hover:bg-[#4239C4] hover:text-white text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                                title="Move to next stage"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
