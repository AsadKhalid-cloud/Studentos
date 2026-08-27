import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Database, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react';

interface BackupStats {
  notesCount: number;
  coursesCount: number;
  questionsCount: number;
  codeCount: number;
  transactionsCount: number;
  tasksCount: number;
  eventsCount: number;
  totalRecords: number;
}

export default function SettingsPage() {
  const { token, user, logout } = useAuth();
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Danger Zone Delete Account Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [confirmUsernameInput, setConfirmUsernameInput] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Pluggable AI Assistant Provider Settings
  const [aiProvider, setAiProvider] = useState<string>(localStorage.getItem('studentos_ai_provider') || 'ollama');
  const [aiApiKey, setAiApiKey] = useState<string>(localStorage.getItem('studentos_ai_key') || '');
  const [ollamaEndpoint, setOllamaEndpoint] = useState<string>(localStorage.getItem('studentos_ollama_url') || 'http://localhost:11434');

  // Fetch Database Stats
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      setError(null);
      const res = await fetch('http://192.168.10.180:4000/api/v1/backup/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch database stats');
      }
    } catch {
      setError('Cannot connect to Express backend on http://192.168.10.180:4000');
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // One-Click Export Backup
  const handleExportBackup = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://192.168.10.180:4000/api/v1/backup/export', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `StudentOS_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setSuccessMessage('Full SQLite Database Backup exported successfully to your downloads!');
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const errData = await res.json();
        alert(`Failed to export backup: ${errData.error || 'Server Error'}`);
      }
    } catch {
      alert('Cannot connect to Express backend on http://192.168.10.180:4000');
    }
  };

  // Restore Backup File Upload
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backupData = JSON.parse(event.target?.result as string);
        const res = await fetch('http://192.168.10.180:4000/api/v1/backup/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ backupData })
        });

        if (res.ok) {
          setSuccessMessage('Database restored successfully from backup archive!');
          fetchStats();
          setTimeout(() => setSuccessMessage(null), 5000);
        } else {
          const data = await res.json();
          alert(`Error: ${data.error || 'Failed to restore backup'}`);
        }
      } catch {
        alert('Invalid JSON backup file format.');
      }
    };
    reader.readAsText(file);
  };

  // Save AI Settings
  const handleSaveAiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('studentos_ai_provider', aiProvider);
    localStorage.setItem('studentos_ai_key', aiApiKey);
    localStorage.setItem('studentos_ollama_url', ollamaEndpoint);
    setSuccessMessage('AI Provider Settings saved locally!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Permanent Delete Account Function
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
        alert('Your account and all associated data have been permanently deleted.');
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Settings & System Preferences</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your SQLite database backups, AI model provider connections, and account deletion.
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-400">
          <Check className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TOP CARD 1: DANGER ZONE — DELETE ACCOUNT (FIRST CARD ON PAGE!) */}
      <div className="p-6 rounded-3xl bg-rose-950/40 border border-rose-500/40 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
          <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span>Danger Zone — Permanent Account Deletion ⚠️</span>
          </h3>
          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold">
            Irreversible Action
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1 max-w-xl">
            <h4 className="font-extrabold text-white text-sm">Delete My User Profile ({user?.username}) & Purge All Data</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Permanently delete your account and remove all your notes, courses, question bank, code snippets, expenses, and calendar events from the local SQLite database.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setConfirmUsernameInput('');
              setIsDeleteModalOpen(true);
            }}
            className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all shadow-xl shadow-rose-600/30 cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete My Account</span>
          </button>
        </div>
      </div>

      {/* CARD 2: LOCAL DATABASE BACKUP & RESTORE */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span>Local Database & Data Portability</span>
          </h3>
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold">
            SQLite (dev.db)
          </span>
        </div>

        {/* Live Metrics Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Rich Notes</span>
              <span className="font-bold text-white text-base">{stats.notesCount} Records</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Active Courses</span>
              <span className="font-bold text-white text-base">{stats.coursesCount} Records</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Question Bank</span>
              <span className="font-bold text-white text-base">{stats.questionsCount} Records</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Total DB Records</span>
              <span className="font-bold text-blue-400 text-base">{stats.totalRecords} Records</span>
            </div>
          </div>
        )}

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Export Action */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Full Database Backup</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Export all your notes, courses, questions, code, expenses, and schedule into a timestamped JSON file.
            </p>
            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup File (.json)</span>
            </button>
          </div>

          {/* Import / Restore Action */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Restore Database from Backup</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Select a previously exported `.json` backup file to restore records directly into SQLite.
            </p>
            <label className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-700">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Upload Backup File</span>
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportBackup} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      </div>

      {/* CARD 3: PLUGGABLE AI ASSISTANT PROVIDER SETTINGS */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>AI Study Assistant Provider Bridge</span>
          </h3>
          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-bold">
            Pluggable Architecture
          </span>
        </div>

        <form onSubmit={handleSaveAiSettings} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Select AI Provider Strategy *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setAiProvider('ollama')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all ${
                  aiProvider === 'ollama' 
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-bold">Ollama (Offline LLM)</span>
                <span className="text-[10px] text-slate-500 font-normal">100% Free & Local</span>
              </button>

              <button
                type="button"
                onClick={() => setAiProvider('gemini')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all ${
                  aiProvider === 'gemini' 
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-bold">Google Gemini API</span>
                <span className="text-[10px] text-slate-500 font-normal">Cloud API Key</span>
              </button>

              <button
                type="button"
                onClick={() => setAiProvider('openai')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all ${
                  aiProvider === 'openai' 
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-bold">OpenAI GPT-4o</span>
                <span className="text-[10px] text-slate-500 font-normal">Cloud API Key</span>
              </button>
            </div>
          </div>

          {aiProvider === 'ollama' ? (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Ollama Local Endpoint URL</label>
              <input
                type="text"
                value={ollamaEndpoint}
                onChange={(e) => setOllamaEndpoint(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">{aiProvider.toUpperCase()} API Key</label>
              <input
                type="password"
                value={aiApiKey}
                onChange={(e) => setAiApiKey(e.target.value)}
                placeholder="Paste API Key here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="py-2.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
          >
            Save AI Provider Settings
          </button>
        </form>
      </div>

      {/* CARD 4: SYSTEM SECURITY & PROFILE */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Account Security & Session Controls</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Logged-In Username</span>
            <span className="font-bold text-white text-sm">{user?.username}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 block">User Email</span>
            <span className="font-bold text-white text-sm">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* CONFIRM DELETE ACCOUNT MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>Confirm Account Deletion</span>
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                To confirm permanent deletion, type your username <strong className="text-rose-400 font-mono">{user?.username}</strong> in the box below:
              </p>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Type Username to Confirm *</label>
                <input
                  type="text"
                  required
                  placeholder={user?.username}
                  value={confirmUsernameInput}
                  onChange={(e) => setConfirmUsernameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || confirmUsernameInput.trim() !== user?.username}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-600/20 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Permanently Delete'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}