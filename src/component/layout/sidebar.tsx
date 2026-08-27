// src/component/layout/sidebar.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Code2, 
  Wallet, 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  LogOut, 
  ShieldCheck,
  GraduationCap,
  Trash2,
  X,
  AlertTriangle,
  Menu
} from 'lucide-react';

export type ActiveTab = 
  | 'dashboard' 
  | 'university' 
  | 'courses' 
  | 'notes' 
  | 'questions' 
  | 'code' 
  | 'budget' 
  | 'calendar' 
  | 'tasks' 
  | 'analytics' 
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpenMobile = false, onCloseMobile }: SidebarProps) {
  const { user, token, logout } = useAuth();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [confirmUsernameInput, setConfirmUsernameInput] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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

  const handleTabClick = (id: ActiveTab) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;

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
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Failed to delete account'}`);
      }
    } catch {
      alert('Cannot connect to backend');
    } finally {
      setIsDeleting(false);
    }
  };

  const sidebarContent = (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none shrink-0 text-left">
      {/* App Branding */}
      {/* CUSTOM LOGO ON SIDEBAR HEADER */}
<div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 shadow-md flex items-center justify-center shrink-0">
      <img src="/images/logo.png" alt="StudentOS Logo" className="w-7 h-7 object-contain rounded-lg" />
    </div>
    <div>
      <h1 className="font-extrabold text-white text-base tracking-tight leading-none">StudentOS</h1>
      <span className="text-[10px] text-blue-400 font-mono font-semibold uppercase tracking-wider">BS-IT Academic Suite</span>
    </div>
  </div>
  

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-5 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider px-3">
              {group.groupLabel}
            </span>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabClick(item.id as ActiveTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 border border-blue-500/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}

        {/* DELETE ACCOUNT BUTTON */}
        <div className="pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              setConfirmUsernameInput('');
              setIsDeleteModalOpen(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Delete My Account ⚠️</span>
          </button>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-semibold text-white truncate leading-none">{user?.username}</p>
              <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">{user?.email}</p>
            </div>
          </div>

          <button type="button" onClick={logout} title="Logout" className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar (Always Visible on Laptop lg screens) */}
      <div className="hidden lg:block h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Slide-Out Drawer (Only visible when toggled on mobile) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 h-full">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ACCOUNT MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 text-left select-none">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>Confirm Account Deletion</span>
              </h3>
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Type your username <strong className="text-rose-400 font-mono">{user?.username}</strong> to confirm:
              </p>

              <input
                type="text"
                required
                placeholder={user?.username}
                value={confirmUsernameInput}
                onChange={(e) => setConfirmUsernameInput(e.target.value)}
                className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
              />

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || confirmUsernameInput.trim() !== user?.username}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-600/20 disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Permanently Delete'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}