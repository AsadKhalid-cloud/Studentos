// src/App.tsx
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Sidebar, { ActiveTab } from './component/layout/sidebar';
import Header from './component/layout/Header';
import DashboardPage from './component/layout/DashboardPage';
import NotesPage from './component/layout/NotesPage';
import CoursesPage from './component/layout/CoursesPage';
import QuestionBankPage from './component/layout/QuestionBankPage';
import BudgetPage from './component/layout/BudgetPage';
import CalendarPage from './component/layout/CalendarPage';
import TasksPage from './component/layout/TasksPage';
import CodeWorkspacePage from './component/layout/CodeWorkspacePage';
import SettingsPage from './component/layout/SettingsPage';
import UniversityPage from './component/layout/UniversityPage';
import AnalyticsPage from './component/layout/AnalyticsPage';
import CommandPalette from './component/common/CommandPalette';
import PomodoroModal from './component/layout/PomodoroModal';
import AiAssistantDrawer from './component/layout/AiAssistantDrawer';
import { ArlamModal } from './component/layout/ArlamModal';

export default function App() {
  // 1. ALL HOOKS AT THE VERY TOP OF FUNCTION (React Rules of Hooks)
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isTimerOpen, setIsTimerOpen] = useState<boolean>(false);
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Track current active tab in session memory for Back Navigation
  useEffect(() => {
    const historyRaw = sessionStorage.getItem('studentos_tab_history');
    let historyStack: string[] = historyRaw ? JSON.parse(historyRaw) : [];
    if (historyStack[historyStack.length - 1] !== activeTab) {
      historyStack.push(activeTab);
      sessionStorage.setItem('studentos_tab_history', JSON.stringify(historyStack));
    }

    const handleTabChangeEvent = (e: any) => {
      if (e.detail) {
        setActiveTab(e.detail);
      }
    };

    window.addEventListener('studentos-tab-change', handleTabChangeEvent);
    return () => window.removeEventListener('studentos-tab-change', handleTabChangeEvent);
  }, [activeTab]);

  // 2. CONDITIONAL EARLY RETURNS (AFTER ALL HOOKS)
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-slate-100 select-none">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-mono text-slate-400">Loading StudentOS Workspace...</p>
      </div>
    );
  }

  // Unauthenticated -> Show Auth Page
  if (!user) {
    return <AuthPage />;
  }

  // Helper for rendering Active Module Content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} />;
      case 'notes':
        return <NotesPage />;
      case 'courses':
        return <CoursesPage />;
      case 'questions':
        return <QuestionBankPage />;
      case 'budget':
        return <BudgetPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'tasks':
        return <TasksPage />;
      case 'code':
        return <CodeWorkspacePage />;
      case 'settings':
        return <SettingsPage />;
      case 'university':
        return <UniversityPage />;
      case 'analytics':
        return <AnalyticsPage setActiveTab={setActiveTab} />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} />;
    }
  };

  // 3. MAIN RENDER SHELL
  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen bg-slate-950 overflow-hidden">
        <Header 
          activeTab={activeTab} 
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenQuickAdd={() => setActiveTab('notes')} 
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenTimer={() => setIsTimerOpen(true)}
          onOpenAi={() => setIsAiOpen(true)}
        />
        <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {renderTabContent()}
        </main>
      </div>

      {/* Global Command Palette Search Modal (Ctrl + K) */}
      <CommandPalette 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        setActiveTab={setActiveTab} 
      />

      {/* Pomodoro Focus Study Timer Modal */}
      <PomodoroModal 
        isOpen={isTimerOpen} 
        onClose={() => setIsTimerOpen(false)} 
      />

      {/* AI Study Assistant Drawer */}
      <AiAssistantDrawer 
        isOpen={isAiOpen} 
        onClose={() => setIsAiOpen(false)} 
      />

      {/* Calendar Alarm Modal */}
      <ArlamModal onGoToCalendar={() => setActiveTab('calendar')} />
    </div>
  );
}