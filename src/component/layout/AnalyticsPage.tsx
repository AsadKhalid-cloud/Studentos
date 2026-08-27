import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart3, 
  CheckCircle2, 
  BookOpen, 
  Wallet, 
  Award, 
  FileText, 
  HelpCircle, 
  Code2, 
  TrendingUp, 
  Sparkles,
  AlertCircle,
  Network
} from 'lucide-react';
import KnowledgeGraphPage from './KnowledgeGraphPage';
import { ActiveTab } from './sidebar';

interface AnalyticsData {
  productivityScore: number;
  taskCompletionRatio: number;
  completedTasks: number;
  totalTasks: number;
  attendanceRatio: number;
  presentClasses: number;
  totalClasses: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  notesCount: number;
  questionsCount: number;
  codeCount: number;
  coursesCount: number;
  earnedCredits: number;
  targetCgpa: number;
}

interface AnalyticsPageProps {
  setActiveTab?: (tab: ActiveTab) => void;
}

export default function AnalyticsPage({ setActiveTab }: AnalyticsPageProps) {
  const { token } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Tab Switcher State ('reports' | 'graph')
  const [viewMode, setViewMode] = useState<'reports' | 'graph'>('reports');

  // Fetch Analytics Data
  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://192.168.10.180:4000/api/v1/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok) {
        setData(result.analytics);
      } else {
        setError(result.error || 'Failed to fetch analytics');
      }
    } catch {
      setError('Cannot connect to Express backend on http://192.168.10.180:4000');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 select-none text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Analytics & Knowledge Graph</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time academic performance dashboard, attendance trends, productivity score & Obsidian node graph.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode('reports')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'reports' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Performance Reports</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('graph')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'graph' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Knowledge Graph View 🕸️</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: REPORTS VIEW */}
      {viewMode === 'reports' && (
        <>
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Calculating productivity metrics...</div>
          ) : data && (
            <div className="space-y-8">
              {/* DYNAMIC PRODUCTIVITY SCORE BANNER GAUGE */}
              <div className="p-8 rounded-3xl bg-linear-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Productivity Assessment</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Productivity Rating</h2>
                  <p className="text-xs text-slate-400 max-w-lg">
                    Calculated based on 35% Attendance + 35% Task Completion + 20% Budget Health + 10% Resource Creation.
                  </p>
                </div>

                {/* Score Ring Badge */}
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center font-mono shrink-0 min-w-56 shadow-inner">
                  <span className="text-[10px] text-slate-500 block mb-1">DYNAMIC SCORE</span>
                  <span className="text-4xl font-extrabold text-blue-400">{data.productivityScore} / 100</span>
                  <span className="text-xs font-bold text-emerald-400 block mt-2">
                    {data.productivityScore >= 80 ? '🚀 Excellent Performance' : data.productivityScore >= 60 ? '⚡ Good Progress' : '⚠️ Action Needed'}
                  </span>
                </div>
              </div>

              {/* METRICS CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-mono">ATTENDANCE RATE</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-white">{data.attendanceRatio}%</span>
                    <span className="text-xs text-emerald-400 font-semibold">{data.presentClasses} / {data.totalClasses} Classes</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Class Attendance</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-mono">TASK COMPLETION</span>
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-white">{data.taskCompletionRatio}%</span>
                    <span className="text-xs text-blue-400 font-semibold">{data.completedTasks} / {data.totalTasks} Tasks</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Assignments Finished</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-mono">NET SAVINGS</span>
                    <Wallet className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-emerald-400">${data.netSavings.toFixed(2)}</span>
                    <span className="text-xs text-slate-400 font-semibold">Remaining Balance</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Financial Health</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-mono">KNOWLEDGE VAULT</span>
                    <Award className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-white">{data.notesCount + data.questionsCount + data.codeCount}</span>
                    <span className="text-xs text-purple-400 font-semibold">Study Resources</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Notes, Questions & Code</p>
                </div>
              </div>

              {/* DETAILED PERFORMANCE PROGRESS BARS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic & Class Performance */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span>Academic & Attendance Performance</span>
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1.5 font-medium">
                        <span className="text-slate-400">Class Attendance Rate</span>
                        <span className="text-emerald-400 font-bold font-mono">{data.attendanceRatio}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.attendanceRatio}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5 font-medium">
                        <span className="text-slate-400">Task & Assignment Completion</span>
                        <span className="text-blue-400 font-bold font-mono">{data.taskCompletionRatio}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.taskCompletionRatio}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Knowledge Creation Breakdown */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>Knowledge Vault Creation</span>
                  </h3>

                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                      <FileText className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-500 block">Notes</span>
                      <span className="font-bold text-white font-mono text-sm">{data.notesCount}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                      <HelpCircle className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-500 block">Questions</span>
                      <span className="font-bold text-white font-mono text-sm">{data.questionsCount}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                      <Code2 className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-500 block">Code Snippets</span>
                      <span className="font-bold text-white font-mono text-sm">{data.codeCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: KNOWLEDGE GRAPH CANVAS VIEW */}
      {viewMode === 'graph' && (
        <KnowledgeGraphPage setActiveTab={setActiveTab || (() => {})} />
      )}
    </div>
  );
}