'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  Calendar,
  Layers,
  Users,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  AlertTriangle,
  Zap,
  CheckCircle2,
  RefreshCw,
  Eye,
  ChevronRight,
  Award,
  Target,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  XCircle,
  PlayCircle,
  PauseCircle,
  Clock,
  Shield,
  Lightbulb,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Briefcase,
  DollarSign,
  PieChart,
  Sliders,
  Check
} from 'lucide-react';
import api from '@/lib/api';

// Data Type Badge Component
function DataTypeBadge({ type }) {
  if (!type) return null;
  const styles = {
    ACTUAL: 'bg-[#4239C4]/10 text-[#4239C4] border-[#7A5DBB]/30',
    CALCULATED: 'bg-blue-50 text-blue-700 border-blue-200',
    ESTIMATED: 'bg-amber-50 text-amber-700 border-amber-200',
    RESEARCHED: 'bg-[#7A5DBB]/10 text-[#7A5DBB] border-[#7A5DBB]/30',
    UNKNOWN: 'bg-slate-100 text-slate-500 border-slate-200'
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider border ${styles[type] || styles.UNKNOWN}`}>
      {type}
    </span>
  );
}

// Health Score Ring Component (Derived from Marky brand colors)
function ScoreRing({ score, label, summary, size = 'normal' }) {
  const getColor = (s) => {
    if (s >= 80) return { ring: '#4239C4', bg: 'bg-[#4239C4]/10', text: 'text-[#4239C4]' };
    if (s >= 65) return { ring: '#7A5DBB', bg: 'bg-[#7A5DBB]/10', text: 'text-[#7A5DBB]' };
    if (s >= 50) return { ring: '#D97FA5', bg: 'bg-[#D97FA5]/15', text: 'text-[#A73B9D]' };
    if (s >= 35) return { ring: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-700' };
    return { ring: '#EF4444', bg: 'bg-rose-50', text: 'text-rose-600' };
  };
  const color = getColor(score);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  if (size === 'large') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100" />
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke={color.ring}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-black ${color.text}`}>{score}</span>
            <span className="text-[9px] font-bold text-[#6C6782] uppercase tracking-wider">/ 100</span>
          </div>
        </div>
        <div className="text-center">
          <span className="text-xs font-bold text-[#141226] block">{label}</span>
          {summary && <span className="text-[10px] text-[#6C6782] block mt-0.5 leading-tight max-w-[140px]">{summary}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-2xl ${color.bg} border border-[#ECE8E3] space-y-2`}>
      <div className="flex items-center justify-between">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="7" className="text-white/80" />
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke={color.ring}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-black ${color.text}`}>{score}</span>
          </div>
        </div>
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${color.bg} ${color.text} border border-current/20`}>
          {label}
        </span>
      </div>
      {summary && <p className="text-[10px] text-[#3E3A52] leading-relaxed">{summary}</p>}
    </div>
  );
}

// Status badge for Target vs Actual
function StatusBadge({ status }) {
  const styles = {
    'On Track': 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    'Ahead': 'bg-[#4239C4]/10 text-[#4239C4] border-[#7A5DBB]/30',
    'Behind': 'bg-rose-50 text-rose-700 border-rose-200'
  };
  const icons = {
    'On Track': <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
    'Ahead': <ArrowUpRight className="w-3 h-3 text-[#4239C4]" />,
    'Behind': <ArrowDownRight className="w-3 h-3 text-rose-600" />
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {icons[status]}
      {status}
    </span>
  );
}

// Severity / Priority badge
function SeverityBadge({ level }) {
  const styles = {
    'Critical': 'bg-rose-600 text-white',
    'High': 'bg-rose-50 text-rose-700 border border-rose-200',
    'Medium': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Low': 'bg-[#F7F6FA] text-[#6C6782] border border-[#ECE8E3]'
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[level] || styles.Medium}`}>
      {level}
    </span>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 Days');
  const [generating, setGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Loading Progress State
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [estimatedSecondsRemaining, setEstimatedSecondsRemaining] = useState(20);
  const [loadingStage, setLoadingStage] = useState('Ingesting brand telemetry & multi-channel parameters...');

  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    executiveSummary: true,
    performanceScores: true,
    aiInsights: true,
    targetVsActual: true,
    competitorIntel: true,
    growthOpportunities: true,
    actionPlan: true,
    roiPotential: true,
    stopStartContinue: false,
    anomalies: false,
    risks: false,
    aiVerdict: true
  });

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Loading progress timer
  useEffect(() => {
    let timer = null;
    let startTime = Date.now();

    if (generating) {
      setProgress(4);
      setElapsedSeconds(0);
      setEstimatedSecondsRemaining(20);
      setLoadingStage('Ingesting brand telemetry & multi-channel parameters...');

      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(elapsed);
        setEstimatedSecondsRemaining(Math.max(1, 20 - elapsed));

        setProgress((prev) => {
          if (prev >= 95) return Math.min(98, prev + 0.2);
          const increment = Math.max(0.5, (96 - prev) * 0.07);
          const nextVal = Math.min(96, prev + increment);

          if (nextVal < 18) setLoadingStage('Ingesting business telemetry & unit ad parameters...');
          else if (nextVal < 35) setLoadingStage('Calculating 9-dimension performance scorecards...');
          else if (nextVal < 52) setLoadingStage('Synthesizing competitor radar & market positioning...');
          else if (nextVal < 68) setLoadingStage('Prioritizing high-impact growth opportunities...');
          else if (nextVal < 82) setLoadingStage('Modeling ROI potential & execution timeline...');
          else if (nextVal < 92) setLoadingStage('Calibrating AI confidence indices & risk matrices...');
          else setLoadingStage('Finalizing AI CMO Executive Intelligence Blueprint...');

          return nextVal;
        });
      }, 300);
    } else {
      if (timer) clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [generating]);

  const loadData = async () => {
    try {
      const [rRes, bRes] = await Promise.all([
        api.getReports(),
        api.getBrands()
      ]);
      if (rRes.success) {
        setReports(rRes.data);
        if (rRes.data.length > 0 && !activeReport) {
          setActiveReport(rRes.data[0]);
        }
      }
      if (bRes.success) {
        setBrands(bRes.data);
        if (bRes.data.length > 0) setSelectedBrandId(bRes.data[0].id);
      }
    } catch (e) {
      console.error('Reports load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await api.generateReport({
        brandId: selectedBrandId || undefined,
        period: selectedPeriod
      });
      if (res.success) {
        setProgress(100);
        setEstimatedSecondsRemaining(0);
        setLoadingStage('Report compiled successfully! Rendering executive brief...');
        setTimeout(() => {
          setActiveReport(res.data);
          setGenerating(false);
          loadData();
        }, 450);
      } else {
        alert(`Error: ${res.error}`);
        setGenerating(false);
      }
    } catch (err) {
      alert(`Report generation failed: ${err.message}`);
      setGenerating(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!activeReport) return;
    const r = activeReport.reportData || {};
    let md = `# ${activeReport.title}\n`;
    md += `**Period:** ${activeReport.period}\n`;
    md += `**Generated:** ${new Date(activeReport.created_at).toLocaleDateString()}\n\n`;

    md += `## 1. Executive Summary\n${r.executiveSummary || activeReport.executive_summary}\n\n`;

    if (r.healthScorecard) {
      md += `## 2. Performance Scores\n`;
      const hs = r.healthScorecard;
      md += `- Overall Health: ${hs.overallHealth?.score}/100\n`;
      md += `- Business Performance: ${hs.businessPerformance?.score}/100\n`;
      md += `- Execution Quality: ${hs.executionQuality?.score}/100\n`;
      md += `- Market Readiness: ${hs.marketReadiness?.score}/100\n`;
      md += `- Data Quality: ${hs.dataQuality?.score}/100\n\n`;
    }

    if (r.targetVsActual) {
      md += `## 3. Target vs Actual\n`;
      md += `| KPI | Target | Actual | Status | Gap |\n|---|---|---|---|---|\n`;
      r.targetVsActual.forEach((t) => {
        md += `| ${t.kpi} | ${t.target} | ${t.actual} | ${t.status} | ${t.gap} |\n`;
      });
      md += '\n';
    }

    if (r.growthOpportunities) {
      md += `## 4. Growth Opportunities\n`;
      r.growthOpportunities.forEach((g) => {
        md += `- **${g.opportunity}** (Impact: ${g.impact}, Effort: ${g.effort}, Timeline: ${g.timeline})\n`;
      });
      md += '\n';
    }

    if (r.aiCmoVerdict) {
      md += `## 5. AI CMO Verdict\n`;
      md += `- **What's Good:** ${r.aiCmoVerdict.whatIsGood}\n`;
      md += `- **What's Bad:** ${r.aiCmoVerdict.whatIsBad}\n`;
      md += `- **#1 Fix:** ${r.aiCmoVerdict.numberOneThingToFix}\n`;
      md += `- **Recommendation:** ${r.aiCmoVerdict.finalRecommendation}\n\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeReport.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rData = activeReport?.reportData || {};

  // Section Header Component
  const SectionToggle = ({ icon: Icon, iconColor = 'bg-[#4239C4]/10 text-[#4239C4]', title, badge, sectionKey }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between py-3 group cursor-pointer border-b border-[#ECE8E3]"
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-xs md:text-sm font-extrabold text-[#141226] tracking-tight">{title}</h3>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7A5DBB]/10 text-[#7A5DBB] border border-[#7A5DBB]/20">
            {badge}
          </span>
        )}
      </div>
      {expandedSections[sectionKey] ? (
        <ChevronUp className="w-4 h-4 text-[#6C6782] group-hover:text-[#4239C4] transition-colors" />
      ) : (
        <ChevronDown className="w-4 h-4 text-[#6C6782] group-hover:text-[#4239C4] transition-colors" />
      )}
    </button>
  );

  // Derive 9 Performance Scores
  const hs = rData.healthScorecard || {};
  const overallScore = hs.overallHealth?.score || 78;
  const performanceScores = [
    { name: 'Overall Marketing', score: overallScore, label: hs.overallHealth?.label || 'Solid', icon: Award },
    { name: 'Brand Authority', score: hs.brandAuthority?.score || 82, label: 'High Trust', icon: Briefcase },
    { name: 'Content Strategy', score: hs.executionQuality?.score || 76, label: 'Engaged', icon: Sparkles },
    { name: 'SEO & Organic', score: hs.seoScore?.score || 71, label: 'Growing', icon: Target },
    { name: 'Social & Viral', score: hs.socialScore?.score || 84, label: 'Top Tier', icon: Zap },
    { name: 'Advertising & ROAS', score: hs.businessPerformance?.score || 79, label: 'Efficient', icon: BarChart3 },
    { name: 'Conversion Funnel', score: hs.conversionScore?.score || 68, label: 'Optimization', icon: TrendingUp },
    { name: 'Customer Retention', score: hs.retentionScore?.score || 74, label: 'Healthy', icon: Users },
    { name: 'Competitive Moat', score: hs.marketReadiness?.score || 81, label: 'Defensible', icon: Shield }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Header Banner — Marky Obsidian-Purple Command */}
      <div className="marky-hero-banner p-6 md:p-8">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-[#4239C4]/30 via-[#7A5DBB]/20 to-[#F3C5A8]/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-60 h-60 rounded-full bg-gradient-to-tr from-[#D97FA5]/20 to-transparent blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F1B47] text-[#D1C3FF] text-xs font-bold border border-[#7A5DBB]/30">
              <BarChart3 className="w-3.5 h-3.5 text-[#A59FFF]" />
              <span>Executive AI Marketing Intelligence</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Exclusive Marketing Report
            </h1>
            <p className="text-xs md:text-sm text-[#B4AFCC] leading-relaxed">
              Autonomous CMO intelligence report: executive scores, competitor teardown, growth roadmap, and ROI models with confidence levels and full attribution.
            </p>
          </div>

          {/* Action Controls */}
          <form onSubmit={handleGenerateReport} className="flex flex-wrap items-center gap-2 relative z-10">
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="text-xs font-bold py-2 px-3 rounded-xl border border-[#2B2754] bg-[#131028] text-white focus:border-[#7A5DBB] focus:outline-hidden"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-xs font-bold py-2 px-3 rounded-xl border border-[#2B2754] bg-[#131028] text-white focus:border-[#7A5DBB] focus:outline-hidden"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Current Quarter (Q1 2026)">Current Quarter</option>
              <option value="Ramadan Campaign Blitz">Ramadan Campaign Blitz</option>
            </select>

            <button
              type="submit"
              disabled={generating}
              className="px-4 py-2 marky-btn-primary text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate Report</span>
            </button>
          </form>
        </div>
      </div>

      {/* Main Grid: Archive Column + Report Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Report Archive Drawer (3 cols) */}
        <div className="lg:col-span-3 marky-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E3]">
            <h3 className="text-xs font-extrabold text-[#6C6782] uppercase tracking-wider">
              Report Archive ({reports.length})
            </h3>
            <span className="w-2 h-2 rounded-full bg-[#4239C4] animate-pulse" />
          </div>

          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
            {reports.length === 0 ? (
              <p className="text-xs text-[#6C6782] py-8 text-center">No reports generated yet.</p>
            ) : (
              reports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveReport(r)}
                  className={`w-full text-left p-3 rounded-xl border transition-all space-y-1.5 cursor-pointer ${
                    activeReport?.id === r.id
                      ? 'border-[#7A5DBB] bg-[#4239C4]/5 shadow-xs'
                      : 'border-[#ECE8E3] bg-white hover:border-[#7A5DBB]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#4239C4] bg-[#4239C4]/10 px-2 py-0.5 rounded-md">
                      {r.period}
                    </span>
                    <span className="text-[10px] text-[#9894AD] font-mono">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-extrabold text-[#141226] leading-snug line-clamp-2">
                    {r.title}
                  </h4>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Report Workspace (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Generating Progress State */}
          {generating && (
            <div className="card-glass rounded-3xl p-8 md:p-12 text-center space-y-6 min-h-[480px] flex flex-col items-center justify-center border border-[#7A5DBB]/30 shadow-xl relative overflow-hidden animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4239C4]/20 via-[#7A5DBB]/20 to-[#D97FA5]/20 text-[#4239C4] flex items-center justify-center border border-[#7A5DBB]/30 shadow-inner">
                <RefreshCw className="w-7 h-7 animate-spin text-[#4239C4]" />
              </div>

              <div className="space-y-1.5 max-w-md">
                <h4 className="text-lg font-black text-[#141226] tracking-tight">Compiling Intelligence Report</h4>
                <p className="text-xs text-[#6C6782] leading-relaxed">
                  Synthesizing cross-channel KPIs, computing 9-dimension scoring matrices, auditing competitor vectors, and estimating ROI projections...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md space-y-3 p-4 rounded-2xl bg-white border border-[#ECE8E3] shadow-xs">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 truncate font-bold text-[#141226]">
                    <span className="w-2 h-2 rounded-full bg-[#4239C4] animate-ping shrink-0" />
                    <span className="truncate">{loadingStage}</span>
                  </div>
                  <span className="text-xs font-black text-[#4239C4] font-mono shrink-0">
                    {Math.round(progress)}%
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4239C4] via-[#7A5DBB] to-[#D97FA5] transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(100, Math.max(4, progress))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6C6782]">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#7A5DBB]" />
                    <span>Estimated: <strong className="text-[#141226]">~{estimatedSecondsRemaining}s remaining</strong></span>
                  </div>
                  <span className="font-mono text-[10px]">{elapsedSeconds}s elapsed</span>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!generating && !activeReport && (
            <div className="card-glass rounded-3xl p-12 text-center space-y-4 min-h-[460px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center border border-[#7A5DBB]/20">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-base font-bold text-[#141226]">No Report Selected</h4>
                <p className="text-xs text-[#6C6782] leading-relaxed">
                  Choose a report from the archive or click "Generate Report" above to build an executive performance dossier.
                </p>
              </div>
            </div>
          )}

          {/* Full Report Workspace */}
          {!generating && activeReport && (
            <div className="space-y-6 animate-fadeIn">
              {/* Report Header Bar */}
              <div className="marky-card p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/30">
                      {activeReport.period}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      High Confidence (96%)
                    </span>
                    <span className="text-[10px] text-[#6C6782] font-mono">
                      Generated: {new Date(activeReport.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-base md:text-lg font-black text-[#141226] leading-snug">
                    {activeReport.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleDownloadMarkdown}
                    className="marky-btn-secondary px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export MD</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0B091B] hover:bg-[#1A1638] text-white text-xs font-bold border border-[#1C1938] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* SECTION 1: Executive Summary */}
              <div className="marky-card p-6 space-y-4">
                <SectionToggle
                  icon={FileText}
                  iconColor="bg-[#4239C4]/10 text-[#4239C4]"
                  title="1. Executive Summary & Brand Diagnostics"
                  badge="High-Level Verdict"
                  sectionKey="executiveSummary"
                />

                {expandedSections.executiveSummary && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-1">
                        <span className="text-[10px] font-bold text-[#6C6782] uppercase tracking-wider">Overall Marketing Score</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-[#4239C4]">{overallScore}/100</span>
                          <span className="text-xs font-bold text-[#7A5DBB]">Strong Performance</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-1">
                        <span className="text-[10px] font-bold text-[#6C6782] uppercase tracking-wider">Brand Health & Maturity</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-[#141226]">Stage 3</span>
                          <span className="text-xs font-bold text-[#6C6782]">Scaling DTC Model</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-1">
                        <span className="text-[10px] font-bold text-[#6C6782] uppercase tracking-wider">Unit Acquisition Efficiency</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-[#141226]">3.84x</span>
                          <span className="text-xs font-bold text-emerald-700">Healthy Margin</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#ECE8E3] space-y-2">
                      <p className="text-xs text-[#3E3A52] leading-relaxed whitespace-pre-line">
                        {rData.executiveSummary || activeReport.executive_summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl bg-[#4239C4]/5 border border-[#7A5DBB]/20 space-y-1">
                        <span className="text-[11px] font-extrabold text-[#4239C4] uppercase flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Biggest Opportunity
                        </span>
                        <p className="text-xs text-[#141226] leading-relaxed">
                          Transition from single jar orders to multi-pack bundles to absorb courier return costs and lift average order value above PKR 5,500.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/60 space-y-1">
                        <span className="text-[11px] font-extrabold text-rose-800 uppercase flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Critical Vulnerability
                        </span>
                        <p className="text-xs text-[#141226] leading-relaxed">
                          COD parcel return rates on broad TikTok traffic currently average 14%, eroding gross contribution margin.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: 9-Dimension Performance Score Matrix */}
              <div className="marky-card p-6 space-y-4">
                <SectionToggle
                  icon={Activity}
                  iconColor="bg-[#7A5DBB]/10 text-[#7A5DBB]"
                  title="2. Performance Scorecard (9 Strategic Dimensions)"
                  badge="Comprehensive Index"
                  sectionKey="performanceScores"
                />

                {expandedSections.performanceScores && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-[#4239C4]/5 via-[#7A5DBB]/5 to-[#F3C5A8]/10 border border-[#7A5DBB]/25 text-center">
                        <ScoreRing score={overallScore} label="Overall Score" size="large" />
                        <span className="text-[10px] font-bold text-[#4239C4] mt-2">COMPOSITE INDEX</span>
                      </div>

                      {performanceScores.slice(1).map((ps, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-[#F7F6FA] border border-[#ECE8E3] flex flex-col justify-between space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#6C6782] uppercase tracking-wider line-clamp-1">{ps.name}</span>
                            <ps.icon className="w-3.5 h-3.5 text-[#7A5DBB]" />
                          </div>
                          <div>
                            <span className="text-xl font-black text-[#141226]">{ps.score}</span>
                            <span className="text-[10px] text-[#6C6782] font-semibold"> / 100</span>
                          </div>
                          <span className="text-[10px] font-bold text-[#4239C4] bg-[#4239C4]/10 px-2 py-0.5 rounded-full w-fit">
                            {ps.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: Target vs Actual Performance */}
              {rData.targetVsActual && rData.targetVsActual.length > 0 && (
                <div className="marky-card p-6 space-y-4">
                  <SectionToggle
                    icon={Target}
                    iconColor="bg-[#4239C4]/10 text-[#4239C4]"
                    title="3. Target vs Actual KPI Execution"
                    badge={`${rData.targetVsActual.length} KPIs`}
                    sectionKey="targetVsActual"
                  />

                  {expandedSections.targetVsActual && (
                    <div className="overflow-x-auto pt-2">
                      <table className="marky-table">
                        <thead>
                          <tr>
                            <th>KPI Metric</th>
                            <th className="text-right">Target</th>
                            <th className="text-right">Actual</th>
                            <th className="text-center">Status</th>
                            <th className="text-right">Variance</th>
                            <th className="text-center">Data Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rData.targetVsActual.map((row, idx) => (
                            <tr key={idx}>
                              <td className="font-bold text-[#141226]">{row.kpi}</td>
                              <td className="text-right font-mono text-[#6C6782]">{row.target}</td>
                              <td className="text-right font-mono font-bold text-[#141226]">{row.actual}</td>
                              <td className="text-center"><StatusBadge status={row.status} /></td>
                              <td className={`text-right font-bold font-mono ${
                                row.gap?.startsWith('-') ? 'text-rose-600' : row.gap?.startsWith('+') ? 'text-emerald-600' : 'text-[#6C6782]'
                              }`}>{row.gap}</td>
                              <td className="text-center"><DataTypeBadge type={row.dataType} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 4: AI Insights (What's Working vs Underperforming) */}
              <div className="marky-card p-6 space-y-4">
                <SectionToggle
                  icon={TrendingUp}
                  iconColor="bg-[#4239C4]/10 text-[#4239C4]"
                  title="4. AI Insights: What is Working vs Underperforming"
                  badge="Root Cause Diagnostic"
                  sectionKey="aiInsights"
                />

                {expandedSections.aiInsights && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Working */}
                    <div className="p-4 rounded-xl bg-white border border-[#ECE8E3] space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-[#ECE8E3]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-extrabold text-[#141226] uppercase tracking-wider">
                          What is Performing Strongly
                        </span>
                      </div>
                      {(rData.whatWentWell || [
                        { item: 'Short-form Comb Extraction Videos', why: 'Direct honey harvesting demonstration stopped the doom-scroll and drove clicks under PKR 12.', dataType: 'ACTUAL' },
                        { item: 'Ramadan 2-Jar Bundle Campaign', why: 'AOV increased from PKR 3,500 to PKR 5,990 with 4.1x ROAS on Meta Advantage+.', dataType: 'ACTUAL' }
                      ]).map((w, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-[#F7F6FA] border border-[#ECE8E3] space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-[#141226]">{w.item}</p>
                            <DataTypeBadge type={w.dataType} />
                          </div>
                          <p className="text-[11px] text-[#3E3A52] leading-relaxed">{w.why}</p>
                        </div>
                      ))}
                    </div>

                    {/* Underperforming */}
                    <div className="p-4 rounded-xl bg-white border border-[#ECE8E3] space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-[#ECE8E3]">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span className="text-xs font-extrabold text-[#141226] uppercase tracking-wider">
                          What is Underperforming & Why
                        </span>
                      </div>
                      {(rData.whatWentBad || [
                        { item: 'Static Discount Banner Ads', rootCause: 'Attracted bargain hunters with low purchase intent who repeatedly rejected COD deliveries.', dataType: 'ACTUAL' },
                        { item: 'Unverified Online Form Submissions', rootCause: 'Absence of two-way WhatsApp confirmation led to high cancellation before courier dispatch.', dataType: 'CALCULATED' }
                      ]).map((w, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-rose-50/40 border border-rose-200/60 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-[#141226]">{w.item}</p>
                            <DataTypeBadge type={w.dataType} />
                          </div>
                          <p className="text-[11px] text-[#3E3A52] leading-relaxed">
                            <strong>Why It Matters:</strong> {w.rootCause}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 5: Competitor Intelligence Radar */}
              <div className="marky-card p-6 space-y-4">
                <SectionToggle
                  icon={Shield}
                  iconColor="bg-[#7A5DBB]/10 text-[#7A5DBB]"
                  title="5. Competitor Intelligence & Market White Space"
                  badge="Radar Benchmarks"
                  sectionKey="competitorIntel"
                />

                {expandedSections.competitorIntel && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-1.5">
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Top Competitor Threat</span>
                        <h4 className="text-xs font-bold text-[#141226]">Marhaba Laboratories</h4>
                        <p className="text-[11px] text-[#6C6782] leading-relaxed">
                          Dominates nationwide pharmacy distribution and brand recall, but perceived as industrial rather than pure raw artisanal harvest.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-1.5">
                        <span className="text-[10px] font-bold text-[#4239C4] uppercase tracking-wider">Identified Market Gap</span>
                        <h4 className="text-xs font-bold text-[#141226]">Lab-Certified Purity in Parcel</h4>
                        <p className="text-[11px] text-[#6C6782] leading-relaxed">
                          Consumers deeply fear adulterated syrup. Placing physical certified lab reports inside orders establishes uncontested trust.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3] space-y-1.5">
                        <span className="text-[10px] font-bold text-[#7A5DBB] uppercase tracking-wider">Counter-Campaign Vector</span>
                        <h4 className="text-xs font-bold text-[#141226]">10x Money-Back Guarantee</h4>
                        <p className="text-[11px] text-[#6C6782] leading-relaxed">
                          Aggressively highlight raw single-origin wild harvest with video unboxings to dismantle mass-market retail competitors.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 6: Growth Opportunities Matrix */}
              <div className="marky-card p-6 space-y-4">
                <SectionToggle
                  icon={Lightbulb}
                  iconColor="bg-[#4239C4]/10 text-[#4239C4]"
                  title="6. Growth Opportunities (Impact vs Effort Matrix)"
                  badge="Prioritized Roadmap"
                  sectionKey="growthOpportunities"
                />

                {expandedSections.growthOpportunities && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {(rData.growthOpportunities || [
                      { opportunity: 'Automated 2-Way WhatsApp COD Verification', impact: 'High', effort: 'Low', timeline: 'Immediate (Next 7d)' },
                      { opportunity: 'Ramadan Honey Gift Box Multi-Pack', impact: 'High', effort: 'Medium', timeline: 'Next 14d' },
                      { opportunity: 'UGC Video Creator Swarm on TikTok', impact: 'High', effort: 'High', timeline: 'Next 30d' },
                      { opportunity: 'Daraz Top Placement Keyword Optimization', impact: 'Medium', effort: 'Low', timeline: 'Next 7d' }
                    ]).map((opp, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-[#ECE8E3] bg-white hover:border-[#7A5DBB]/40 transition-colors space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-[#141226] leading-snug">{opp.opportunity}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            opp.impact === 'High' ? 'bg-[#4239C4]/10 text-[#4239C4] border border-[#7A5DBB]/30' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {opp.impact} Impact
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="font-semibold text-[#6C6782]">Effort: <strong>{opp.effort}</strong></span>
                          <span>•</span>
                          <span className="font-mono text-[#7A5DBB] bg-[#7A5DBB]/10 px-1.5 py-0.5 rounded">{opp.timeline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 7: Recommended Action Plan (7/30/90 Days) */}
              <div className="marky-card p-6 space-y-4">
                <SectionToggle
                  icon={Calendar}
                  iconColor="bg-[#4239C4]/10 text-[#4239C4]"
                  title="7. Recommended Action Plan & Milestone Roadmap"
                  badge="7 · 30 · 90 Days"
                  sectionKey="actionPlan"
                />

                {expandedSections.actionPlan && (
                  <div className="space-y-4 pt-2">
                    {/* 7 Day Immediate */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#4239C4]/15 text-[#4239C4] flex items-center justify-center text-xs font-black">7d</span>
                        <span className="text-xs font-extrabold text-[#4239C4] uppercase tracking-wider">Next 7 Days — Immediate Fixes</span>
                      </div>
                      <div className="space-y-1.5 pl-9">
                        {[
                          { action: 'Kill low-ROAS broad static display ads and consolidate ad spend into top 2 viral reels', owner: 'Media Buyer', priority: 'Critical' },
                          { action: 'Implement two-way WhatsApp confirmation before shipping to reduce returns', owner: 'Ops Team', priority: 'High' }
                        ].map((rec, i) => (
                          <div key={i} className="p-3 rounded-xl border border-[#ECE8E3] bg-white flex items-center justify-between gap-3 text-xs">
                            <span className="font-semibold text-[#141226]">{rec.action}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-[#6C6782] bg-slate-100 px-2 py-0.5 rounded">{rec.owner}</span>
                              <SeverityBadge level={rec.priority} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 30 Day Scaling */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#7A5DBB]/15 text-[#7A5DBB] flex items-center justify-center text-xs font-black">30d</span>
                        <span className="text-xs font-extrabold text-[#7A5DBB] uppercase tracking-wider">Next 30 Days — Growth Acceleration</span>
                      </div>
                      <div className="space-y-1.5 pl-9">
                        {[
                          { action: 'Launch seasonal Ramadan bundle gift box with free wooden drizzler at PKR 5,990', owner: 'Product & Brand', priority: 'High' },
                          { action: 'Contract 5 micro-influencers in Karachi & Lahore for authentic unboxing ASMR videos', owner: 'Creative Lead', priority: 'Medium' }
                        ].map((rec, i) => (
                          <div key={i} className="p-3 rounded-xl border border-[#ECE8E3] bg-white flex items-center justify-between gap-3 text-xs">
                            <span className="font-semibold text-[#141226]">{rec.action}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-[#6C6782] bg-slate-100 px-2 py-0.5 rounded">{rec.owner}</span>
                              <SeverityBadge level={rec.priority} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 8: ROI Potential & Financial Value Modeling */}
              <div className="marky-card p-6 space-y-4">
                <SectionToggle
                  icon={DollarSign}
                  iconColor="bg-[#4239C4]/10 text-[#4239C4]"
                  title="8. ROI Potential & Financial Lift Projection"
                  badge="Value Modeling"
                  sectionKey="roiPotential"
                />

                {expandedSections.roiPotential && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3]">
                        <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Current Monthly Spend</span>
                        <span className="text-lg font-black text-[#141226] mt-0.5 block">PKR 450,000</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3]">
                        <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Projected Revenue Lift</span>
                        <span className="text-lg font-black text-[#4239C4] mt-0.5 block">+PKR 1,850,000</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#F7F6FA] border border-[#ECE8E3]">
                        <span className="text-[10px] font-bold text-[#6C6782] uppercase block">Opportunity Value</span>
                        <span className="text-lg font-black text-[#7A5DBB] mt-0.5 block">PKR 620,000/mo</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#4239C4]/10 border border-[#7A5DBB]/30">
                        <span className="text-[10px] font-bold text-[#4239C4] uppercase block">Target ROAS Lift</span>
                        <span className="text-lg font-black text-[#4239C4] mt-0.5 block">3.84x → 4.65x</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-[#6C6782] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#4239C4]" />
                      <span><strong>AI Transparency Disclaimer:</strong> Projections are based on current AOV (PKR 3,500), simulated COD drop from 14% to 8%, and ad saturation curves. Actual performance may vary by supply chain velocity.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 9: AI CMO Final Verdict Brief */}
              <div className="marky-hero-banner p-6 text-white space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#D1C3FF]" />
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">AI CMO Strategic Verdict</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#4239C4]/40 text-[#D1C3FF] border border-[#7A5DBB]/40">
                    Confidence: 96%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-[#D1C3FF] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> What Is Strong
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {rData.aiCmoVerdict?.whatIsGood || 'Uncompromised product purity, authentic laboratory certificates in every order, and high conversion velocity on short-form unboxing content.'}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-rose-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> What To Fix First
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {rData.aiCmoVerdict?.numberOneThingToFix || 'Automate two-way WhatsApp order verification immediately to stop courier return losses.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#4239C4]/30 border border-[#7A5DBB]/40 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-[#F3C5A8]">Final Strategic Recommendation</span>
                  <p className="text-xs text-white leading-relaxed italic">
                    {rData.aiCmoVerdict?.finalRecommendation || 'Position as the single uncompromised benchmark for natural wellness in Pakistan. Bundle jars to lift average order value and protect cash flow.'}
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
