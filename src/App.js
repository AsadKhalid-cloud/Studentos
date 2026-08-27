import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.tsx
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Sidebar from './component/layout/sidebar';
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
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isTimerOpen, setIsTimerOpen] = useState(false);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    // Track current active tab in session memory for Back Navigation
    useEffect(() => {
        const historyRaw = sessionStorage.getItem('studentos_tab_history');
        let historyStack = historyRaw ? JSON.parse(historyRaw) : [];
        if (historyStack[historyStack.length - 1] !== activeTab) {
            historyStack.push(activeTab);
            sessionStorage.setItem('studentos_tab_history', JSON.stringify(historyStack));
        }
        const handleTabChangeEvent = (e) => {
            if (e.detail) {
                setActiveTab(e.detail);
            }
        };
        window.addEventListener('studentos-tab-change', handleTabChangeEvent);
        return () => window.removeEventListener('studentos-tab-change', handleTabChangeEvent);
    }, [activeTab]);
    // 1. Loading Screen
    if (loading) {
        return (_jsxs("div", { className: "min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-slate-100 select-none", children: [_jsx("div", { className: "w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" }), _jsx("p", { className: "text-xs font-mono text-slate-400", children: "Loading StudentOS Workspace..." })] }));
    }
    // 2. Unauthenticated -> Show Auth Page
    if (!user) {
        return _jsx(AuthPage, {});
    }
    // Helper for rendering Active Module Content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return _jsx(DashboardPage, { setActiveTab: setActiveTab });
            case 'notes':
                return _jsx(NotesPage, {});
            case 'courses':
                return _jsx(CoursesPage, {});
            case 'questions':
                return _jsx(QuestionBankPage, {});
            case 'budget':
                return _jsx(BudgetPage, {});
            case 'calendar':
                return _jsx(CalendarPage, {});
            case 'tasks':
                return _jsx(TasksPage, {});
            case 'code':
                return _jsx(CodeWorkspacePage, {});
            case 'settings':
                return _jsx(SettingsPage, {});
            case 'university':
                return _jsx(UniversityPage, {});
            case 'analytics':
                return _jsx(AnalyticsPage, { setActiveTab: setActiveTab });
            default:
                return _jsx(DashboardPage, { setActiveTab: setActiveTab });
        }
    };
    // 3. Authenticated -> Render Full Application Shell
    return (_jsxs("div", { className: "h-screen w-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden", children: [_jsx(Sidebar, { activeTab: activeTab, setActiveTab: setActiveTab, isOpenMobile: isMobileSidebarOpen, onCloseMobile: () => setIsMobileSidebarOpen(false) }), _jsxs("div", { className: "flex-1 flex flex-col min-w-0 h-screen bg-slate-950 overflow-hidden", children: [_jsx(Header, { activeTab: activeTab, onOpenMobileSidebar: () => setIsMobileSidebarOpen(true), onOpenQuickAdd: () => setActiveTab('notes'), onOpenSearch: () => setIsSearchOpen(true), onOpenTimer: () => setIsTimerOpen(true), onOpenAi: () => setIsAiOpen(true) }), _jsx("main", { className: "flex-1 min-h-0 overflow-y-auto custom-scrollbar", children: renderTabContent() })] }), _jsx(CommandPalette, { isOpen: isSearchOpen, onClose: () => setIsSearchOpen(false), setActiveTab: setActiveTab }), _jsx(PomodoroModal, { isOpen: isTimerOpen, onClose: () => setIsTimerOpen(false) }), _jsx(AiAssistantDrawer, { isOpen: isAiOpen, onClose: () => setIsAiOpen(false) }), _jsx(ArlamModal, { onGoToCalendar: () => setActiveTab('calendar') })] }));
}
