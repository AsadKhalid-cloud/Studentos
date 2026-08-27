import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/component/layout/sidebar.tsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BookOpen, FileText, HelpCircle, Code2, Wallet, Calendar, CheckSquare, BarChart3, Settings, LogOut, GraduationCap, Trash2, X, AlertTriangle } from 'lucide-react';
export default function Sidebar({ activeTab, setActiveTab, isOpenMobile = false, onCloseMobile }) {
    const { user, token, logout } = useAuth();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmUsernameInput, setConfirmUsernameInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const navGroups = [
        {
            groupLabel: 'ACADEMIC SUITE',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'university', label: 'University Profile', icon: GraduationCap },
                { id: 'courses', label: 'Courses & Attendance', icon: BookOpen },
                { id: 'notes', label: 'Notes Workspace', icon: FileText },
                { id: 'questions', label: 'Question Bank', icon: HelpCircle },
            ]
        },
        {
            groupLabel: 'TOOLS & FINANCE',
            items: [
                { id: 'code', label: 'Code Snippets', icon: Code2 },
                { id: 'budget', label: 'Budget Manager', icon: Wallet },
                { id: 'calendar', label: 'Calendar & Planner', icon: Calendar },
                { id: 'tasks', label: 'Tasks & Deadlines', icon: CheckSquare },
            ]
        },
        {
            groupLabel: 'SYSTEM & ANALYTICS',
            items: [
                { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
                { id: 'settings', label: 'Settings', icon: Settings },
            ]
        }
    ];
    const handleTabClick = (id) => {
        setActiveTab(id);
        if (onCloseMobile)
            onCloseMobile();
    };
    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        if (!token || !user)
            return;
        if (confirmUsernameInput.trim() !== user.username) {
            alert('Username confirmation does not match!');
            return;
        }
        try {
            setIsDeleting(true);
            const res = await fetch('http://192.168.10.180:4000/api/v1/auth/delete-account', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Your account has been deleted.');
                logout();
            }
            else {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to delete account'}`);
            }
        }
        catch {
            alert('Cannot connect to backend');
        }
        finally {
            setIsDeleting(false);
        }
    };
    const sidebarContent = (_jsxs("aside", { className: "w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none shrink-0 text-left", children: [_jsxs("div", { className: "h-16 px-5 border-b border-slate-800 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-1.5 rounded-xl bg-slate-950 border border-slate-800 shadow-md flex items-center justify-center shrink-0", children: _jsx("img", { src: "/images/logo.png", alt: "StudentOS Logo", className: "w-7 h-7 object-contain rounded-lg" }) }), _jsxs("div", { children: [_jsx("h1", { className: "font-extrabold text-white text-base tracking-tight leading-none", children: "StudentOS" }), _jsx("span", { className: "text-[10px] text-blue-400 font-mono font-semibold uppercase tracking-wider", children: "BS-IT Academic Suite" })] })] }), onCloseMobile && (_jsx("button", { onClick: onCloseMobile, className: "lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white", children: _jsx(X, { className: "w-5 h-5" }) }))] }), _jsxs("nav", { className: "flex-1 p-3 space-y-5 overflow-y-auto custom-scrollbar", children: [navGroups.map((group, idx) => (_jsxs("div", { className: "space-y-1", children: [_jsx("span", { className: "text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider px-3", children: group.groupLabel }), group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (_jsxs("button", { type: "button", onClick: () => handleTabClick(item.id), className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 border border-blue-500/30 font-bold'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`, children: [_jsx(Icon, { className: `w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}` }), _jsx("span", { children: item.label })] }, item.id));
                            })] }, idx))), _jsx("div", { className: "pt-3 border-t border-slate-800/80", children: _jsxs("button", { type: "button", onClick: () => {
                                setConfirmUsernameInput('');
                                setIsDeleteModalOpen(true);
                            }, className: "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer", children: [_jsx(Trash2, { className: "w-4 h-4 text-rose-500" }), _jsx("span", { children: "Delete My Account \u26A0\uFE0F" })] }) })] }), _jsx("div", { className: "p-3 border-t border-slate-800/80 bg-slate-950/60", children: _jsxs("div", { className: "flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800", children: [_jsxs("div", { className: "flex items-center gap-2 overflow-hidden", children: [_jsx("div", { className: "w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm", children: user?.username ? user.username.charAt(0).toUpperCase() : 'A' }), _jsxs("div", { className: "truncate text-left", children: [_jsx("p", { className: "text-xs font-semibold text-white truncate leading-none", children: user?.username }), _jsx("p", { className: "text-[10px] text-slate-500 truncate leading-tight mt-0.5", children: user?.email })] })] }), _jsx("button", { type: "button", onClick: logout, title: "Logout", className: "p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white", children: _jsx(LogOut, { className: "w-3.5 h-3.5" }) })] }) })] }));
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden lg:block h-screen sticky top-0", children: sidebarContent }), isOpenMobile && (_jsxs("div", { className: "fixed inset-0 z-50 lg:hidden flex", children: [_jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-sm", onClick: onCloseMobile }), _jsx("div", { className: "relative z-10 h-full", children: sidebarContent })] })), isDeleteModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 text-left select-none", children: _jsxs("div", { className: "w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("h3", { className: "text-base font-bold text-rose-400 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-rose-500" }), _jsx("span", { children: "Confirm Account Deletion" })] }), _jsx("button", { type: "button", onClick: () => setIsDeleteModalOpen(false), className: "p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("form", { onSubmit: handleDeleteAccount, className: "space-y-4 text-xs", children: [_jsxs("p", { className: "text-slate-300 leading-relaxed", children: ["Type your username ", _jsx("strong", { className: "text-rose-400 font-mono", children: user?.username }), " to confirm:"] }), _jsx("input", { type: "text", required: true, placeholder: user?.username, value: confirmUsernameInput, onChange: (e) => setConfirmUsernameInput(e.target.value), className: "w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500" }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setIsDeleteModalOpen(false), className: "flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold", children: "Cancel" }), _jsxs("button", { type: "submit", disabled: isDeleting || confirmUsernameInput.trim() !== user?.username, className: "flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-600/20 disabled:opacity-40 flex items-center justify-center gap-2", children: [_jsx(Trash2, { className: "w-4 h-4" }), _jsx("span", { children: isDeleting ? 'Deleting...' : 'Permanently Delete' })] })] })] })] }) }))] }));
}
