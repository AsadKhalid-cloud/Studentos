// src/component/layout/Header.tsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Plus, Moon, Sun, Sparkles, Clock, Puzzle, ArrowLeft, Type, Menu } from 'lucide-react';
import { ActiveTab } from './sidebar';
import { PluginMarketplaceModal } from './PluginMarketplaceModal';
import { LofiAudioWidget } from './LofiAudioWidget';
import { FontSelectorModal } from './FontSelectorModal';
import { initSavedFont } from '../../backend/utils/fontEngine';
import { ArlamModal } from './ArlamModal';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileSidebar?: () => void;
  onOpenQuickAdd?: () => void;
  onOpenSearch?: () => void;
  onOpenTimer?: () => void;
  onOpenAi?: () => void;
}

export default function Header({ 
  activeTab, 
  onOpenMobileSidebar, 
  onOpenQuickAdd, 
  onOpenSearch, 
  onOpenTimer, 
  onOpenAi 
}: HeaderProps) {
  const { user } = useAuth();
  const [isDark, setIsDark] = React.useState(true);
  const [isPluginModalOpen, setIsPluginModalOpen] = React.useState<boolean>(false);
  const [isFontModalOpen, setIsFontModalOpen] = React.useState<boolean>(false);

  const [enabledPlugins, setEnabledPlugins] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('studentos_plugins');
    return saved ? JSON.parse(saved) : ['lofi-audio-player', 'floating-pomodoro'];
  });

  // Safe Tab History Back Navigation inside StudentOS
  const handleBackClick = () => {
    const historyRaw = sessionStorage.getItem('studentos_tab_history');
    let historyStack: string[] = historyRaw ? JSON.parse(historyRaw) : ['dashboard'];

    if (historyStack.length > 1) {
      historyStack.pop();
      const previousTab = historyStack[historyStack.length - 1];
      sessionStorage.setItem('studentos_tab_history', JSON.stringify(historyStack));

      window.dispatchEvent(new CustomEvent('studentos-tab-change', { detail: previousTab }));
    } else {
      window.dispatchEvent(new CustomEvent('studentos-tab-change', { detail: 'dashboard' }));
    }
  };

  // Initialize Saved Custom Font on App Load
  React.useEffect(() => {
    initSavedFont();
  }, []);

  // Auto-apply saved theme and plugins on page load / refresh (F5)
  React.useEffect(() => {
   const savedTheme = localStorage.getItem('studentos_theme') || 'nordic-white';
    const THEME_MAP: Record<string, any> = {
      'nordic-white': { bg: '#f8fafc', sidebar: '#ffffff', accent: '#2563eb' },
      'dark-default': { bg: '#0f172a', sidebar: '#1e293b', accent: '#3b82f6' },
      'cyberpunk-neon': { bg: '#090d16', sidebar: '#121829', accent: '#a855f7' },
      'emerald-forest': { bg: '#062016', sidebar: '#0b2e21', accent: '#10b981' },
      'mocha-coffee': { bg: '#1c1412', sidebar: '#2a1e1b', accent: '#f59e0b' },
      'dracula-purple': { bg: '#181124', sidebar: '#221935', accent: '#8b5cf6' }
    };

    const themeObj = THEME_MAP[savedTheme] || THEME_MAP['dark-default'];
    const styleId = 'studentos-custom-theme-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const isWhite = savedTheme === 'nordic-white';

    styleEl.innerHTML = `
      body, .bg-slate-950, [class*="bg-slate-950"] {
        background-color: ${themeObj.bg} !important;
        ${isWhite ? 'color: #0f172a !important;' : ''}
      }
      .bg-slate-900, .bg-slate-900\\/60, .bg-slate-900\\/40, aside, [class*="bg-slate-900"] {
        background-color: ${themeObj.sidebar} !important;
        ${isWhite ? 'border-color: #cbd5e1 !important;' : ''}
      }
      ${isWhite ? `
        .text-white, .text-slate-100, .text-slate-200 { color: #0f172a !important; }
        .text-slate-400, .text-slate-500 { color: #475569 !important; }
        .border-slate-800, .border-slate-700 { border-color: #cbd5e1 !important; }
        .bg-slate-800, .bg-slate-800\\/80 { background-color: #e2e8f0 !important; }
      ` : ''}
      .text-blue-400, .text-purple-400, .text-sky-400 {
        color: ${themeObj.accent} !important;
      }
      .bg-blue-600, .bg-purple-600, .bg-sky-600 {
        background-color: ${themeObj.accent} !important;
      }
      .border-blue-500, .border-purple-500, .border-sky-500 {
        border-color: ${themeObj.accent} !important;
      }
    `;
  }, []);

  // Tab Title Mapping
  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard Overview', subtitle: 'Academic metrics & study streak' },
    university: { title: 'University Profile', subtitle: 'Degree details & credits' },
    courses: { title: 'Courses & Attendance', subtitle: 'Course progress & timetable' },
    notes: { title: 'Rich Notes Workspace', subtitle: 'Lecture notes & code blocks' },
    questions: { title: 'Question Bank', subtitle: 'MCQs & past paper practice' },
    code: { title: 'Code Snippets & Labs', subtitle: 'Source code & algorithm notes' },
    budget: { title: 'Budget & Finances', subtitle: 'Expenses & financial reports' },
    calendar: { title: 'Calendar & Timetable', subtitle: 'Schedules & exam planner' },
    tasks: { title: 'Tasks & Deadlines', subtitle: 'Assignments & due dates' },
    analytics: { title: 'Analytics & Reports', subtitle: 'GPA trends & study hours' },
    settings: { title: 'System Settings', subtitle: 'Security & configurations' },
  };

  const current = titles[activeTab] || { title: 'Workspace', subtitle: 'StudentOS Platform' };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none shadow-sm gap-2">
      {/* Left: Mobile Menu Toggle, Back Button & Unwrapped Title */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Mobile Menu Toggle Button (☰) */}
        {onOpenMobileSidebar && (
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
            title="Open Mobile Menu"
          >
            <Menu className="w-5 h-5 text-blue-400" />
          </button>
        )}

        <button
          type="button"
          onClick={handleBackClick}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
          title="Go Back"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">Back</span>
        </button>

        <div className="h-4 w-px bg-slate-800/80 hidden sm:block" />

        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-extrabold text-white tracking-tight whitespace-nowrap">
            {current.title}
          </h2>
          <p className="text-[10px] text-slate-400 leading-none hidden xl:block mt-0.5 truncate">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right Compact Controls Toolbar */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar">
        {/* Compact Search Trigger */}
        <div 
          id="open-command-palette"
          onClick={onOpenSearch}
          className="relative hidden lg:block cursor-pointer group shrink-0"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search... (Ctrl+K)"
            readOnly
            className="w-40 xl:w-48 bg-slate-950/80 border border-slate-800 group-hover:border-slate-700 rounded-xl pl-8 pr-10 py-1 text-xs text-slate-300 placeholder-slate-500 cursor-pointer focus:outline-none transition-all"
          />
          <kbd className="absolute right-1.5 top-1 px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-[8px] font-mono text-slate-400">
            Ctrl K
          </kbd>
        </div>

        {/* Quick Action Button */}
        {onOpenQuickAdd && (
          <button
            onClick={onOpenQuickAdd}
            className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create</span>
          </button>
        )}

        {/* POMODORO TIMER */}
        <button
          onClick={onOpenTimer}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
          title="Pomodoro Focus Timer"
        >
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden 2xl:inline">Timer</span>
        </button>

        {/* AI STUDY ASSISTANT */}
        <button
          onClick={onOpenAi}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 cursor-pointer hover:bg-purple-600 hover:text-white transition-all flex items-center gap-1 text-xs font-bold shrink-0"
          title="AI Study Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="hidden 2xl:inline">AI</span>
        </button>

        {/* PLUGINS MARKETPLACE */}
        <button
          onClick={() => setIsPluginModalOpen(true)}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0"
          title="Plugin Marketplace & Theme Engine"
        >
          <Puzzle className="w-3.5 h-3.5" />
          <span className="hidden 2xl:inline">Plugins</span>
        </button>

        {/* CUSTOM FONT ENGINE */}
        <button
          onClick={() => setIsFontModalOpen(true)}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0"
          title="Custom Typography & Font Engine"
        >
          <Type className="w-3.5 h-3.5" />
          <span className="hidden 2xl:inline">Fonts</span>
        </button>

        {/* LO-FI AUDIO PLAYER WIDGET */}
        {enabledPlugins.includes('lofi-audio-player') && <LofiAudioWidget />}

        {/* Notifications */}
        <button className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-white cursor-pointer transition-colors relative shrink-0">
          <Bell className="w-3.5 h-3.5" />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute top-1.5 right-1.5"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
      </div>

      {/* FONT SELECTOR MODAL */}
      <FontSelectorModal
        isOpen={isFontModalOpen}
        onClose={() => setIsFontModalOpen(false)}
      />

      {/* PLUGIN MARKETPLACE MODAL */}
      <PluginMarketplaceModal
        isOpen={isPluginModalOpen}
        onClose={() => setIsPluginModalOpen(false)}
        onPluginsChange={(newPlugins) => {
          setEnabledPlugins(newPlugins);
          localStorage.setItem('studentos_plugins', JSON.stringify(newPlugins));
        }}
      />

      {/* AUTOMATIC BACKGROUND CALENDAR & TIMETABLE ALARM MODAL */}
      <ArlamModal />
    </header>
  );
}