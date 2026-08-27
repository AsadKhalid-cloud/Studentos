import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings as SettingsIcon, Download, Upload, Database, Sparkles, ShieldCheck, Check, AlertCircle, Trash2, X, AlertTriangle } from 'lucide-react';
export default function SettingsPage() {
    const { token, user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    // Danger Zone Delete Account Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmUsernameInput, setConfirmUsernameInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    // Pluggable AI Assistant Provider Settings
    const [aiProvider, setAiProvider] = useState(localStorage.getItem('studentos_ai_provider') || 'ollama');
    const [aiApiKey, setAiApiKey] = useState(localStorage.getItem('studentos_ai_key') || '');
    const [ollamaEndpoint, setOllamaEndpoint] = useState(localStorage.getItem('studentos_ollama_url') || 'http://localhost:11434');
    // Fetch Database Stats
    const fetchStats = useCallback(async () => {
        if (!token)
            return;
        try {
            setError(null);
            const res = await fetch('http://192.168.10.180:4000/api/v1/backup/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setStats(data.stats);
            }
            else {
                setError(data.error || 'Failed to fetch database stats');
            }
        }
        catch {
            setError('Cannot connect to Express backend on http://192.168.10.180:4000');
        }
    }, [token]);
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);
    // One-Click Export Backup
    const handleExportBackup = async () => {
        if (!token)
            return;
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
            }
            else {
                const errData = await res.json();
                alert(`Failed to export backup: ${errData.error || 'Server Error'}`);
            }
        }
        catch {
            alert('Cannot connect to Express backend on http://192.168.10.180:4000');
        }
    };
    // Restore Backup File Upload
    const handleImportBackup = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !token)
            return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const backupData = JSON.parse(event.target?.result);
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
                }
                else {
                    const data = await res.json();
                    alert(`Error: ${data.error || 'Failed to restore backup'}`);
                }
            }
            catch {
                alert('Invalid JSON backup file format.');
            }
        };
        reader.readAsText(file);
    };
    // Save AI Settings
    const handleSaveAiSettings = (e) => {
        e.preventDefault();
        localStorage.setItem('studentos_ai_provider', aiProvider);
        localStorage.setItem('studentos_ai_key', aiApiKey);
        localStorage.setItem('studentos_ollama_url', ollamaEndpoint);
        setSuccessMessage('AI Provider Settings saved locally!');
        setTimeout(() => setSuccessMessage(null), 3000);
    };
    // Permanent Delete Account Function
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
                alert('Your account and all associated data have been permanently deleted.');
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
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8 select-none text-left", children: [_jsx("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl", children: _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(SettingsIcon, { className: "w-6 h-6 text-blue-400" }), _jsx("h1", { className: "text-2xl font-extrabold text-white tracking-tight", children: "Settings & System Preferences" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Manage your SQLite database backups, AI model provider connections, and account deletion." })] }) }), successMessage && (_jsxs("div", { className: "p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-400", children: [_jsx(Check, { className: "w-5 h-5 shrink-0" }), _jsx("span", { className: "font-semibold", children: successMessage })] })), error && (_jsxs("div", { className: "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400", children: [_jsx(AlertCircle, { className: "w-5 h-5 shrink-0" }), _jsx("span", { children: error })] })), _jsxs("div", { className: "p-6 rounded-3xl bg-rose-950/40 border border-rose-500/40 space-y-4 shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-rose-500/20 pb-4", children: [_jsxs("h3", { className: "text-base font-bold text-rose-400 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-rose-500" }), _jsx("span", { children: "Danger Zone \u2014 Permanent Account Deletion \u26A0\uFE0F" })] }), _jsx("span", { className: "px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold", children: "Irreversible Action" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs", children: [_jsxs("div", { className: "space-y-1 max-w-xl", children: [_jsxs("h4", { className: "font-extrabold text-white text-sm", children: ["Delete My User Profile (", user?.username, ") & Purge All Data"] }), _jsx("p", { className: "text-slate-300 text-[11px] leading-relaxed", children: "Permanently delete your account and remove all your notes, courses, question bank, code snippets, expenses, and calendar events from the local SQLite database." })] }), _jsxs("button", { type: "button", onClick: () => {
                                    setConfirmUsernameInput('');
                                    setIsDeleteModalOpen(true);
                                }, className: "px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all shadow-xl shadow-rose-600/30 cursor-pointer flex items-center gap-2 shrink-0", children: [_jsx(Trash2, { className: "w-4 h-4" }), _jsx("span", { children: "Delete My Account" })] })] })] }), _jsxs("div", { className: "p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-4", children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(Database, { className: "w-5 h-5 text-blue-400" }), _jsx("span", { children: "Local Database & Data Portability" })] }), _jsx("span", { className: "px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold", children: "SQLite (dev.db)" })] }), stats && (_jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs", children: [_jsxs("div", { className: "p-3 rounded-xl bg-slate-950 border border-slate-800", children: [_jsx("span", { className: "text-slate-500 block", children: "Rich Notes" }), _jsxs("span", { className: "font-bold text-white text-base", children: [stats.notesCount, " Records"] })] }), _jsxs("div", { className: "p-3 rounded-xl bg-slate-950 border border-slate-800", children: [_jsx("span", { className: "text-slate-500 block", children: "Active Courses" }), _jsxs("span", { className: "font-bold text-white text-base", children: [stats.coursesCount, " Records"] })] }), _jsxs("div", { className: "p-3 rounded-xl bg-slate-950 border border-slate-800", children: [_jsx("span", { className: "text-slate-500 block", children: "Question Bank" }), _jsxs("span", { className: "font-bold text-white text-base", children: [stats.questionsCount, " Records"] })] }), _jsxs("div", { className: "p-3 rounded-xl bg-slate-950 border border-slate-800", children: [_jsx("span", { className: "text-slate-500 block", children: "Total DB Records" }), _jsxs("span", { className: "font-bold text-blue-400 text-base", children: [stats.totalRecords, " Records"] })] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2", children: [_jsxs("div", { className: "p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-white font-bold text-xs", children: [_jsx(Download, { className: "w-4 h-4 text-emerald-400" }), _jsx("span", { children: "Export Full Database Backup" })] }), _jsx("p", { className: "text-[11px] text-slate-400 leading-relaxed", children: "Export all your notes, courses, questions, code, expenses, and schedule into a timestamped JSON file." }), _jsxs("button", { type: "button", onClick: handleExportBackup, className: "w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "Download Backup File (.json)" })] })] }), _jsxs("div", { className: "p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-white font-bold text-xs", children: [_jsx(Upload, { className: "w-4 h-4 text-blue-400" }), _jsx("span", { children: "Restore Database from Backup" })] }), _jsx("p", { className: "text-[11px] text-slate-400 leading-relaxed", children: "Select a previously exported `.json` backup file to restore records directly into SQLite." }), _jsxs("label", { className: "w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-700", children: [_jsx(Upload, { className: "w-4 h-4 text-blue-400" }), _jsx("span", { children: "Upload Backup File" }), _jsx("input", { type: "file", accept: ".json", onChange: handleImportBackup, className: "hidden" })] })] })] })] }), _jsxs("div", { className: "p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-4", children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-5 h-5 text-purple-400" }), _jsx("span", { children: "AI Study Assistant Provider Bridge" })] }), _jsx("span", { className: "px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-bold", children: "Pluggable Architecture" })] }), _jsxs("form", { onSubmit: handleSaveAiSettings, className: "space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Select AI Provider Strategy *" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("button", { type: "button", onClick: () => setAiProvider('ollama'), className: `p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all ${aiProvider === 'ollama'
                                                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`, children: [_jsx("span", { className: "font-bold", children: "Ollama (Offline LLM)" }), _jsx("span", { className: "text-[10px] text-slate-500 font-normal", children: "100% Free & Local" })] }), _jsxs("button", { type: "button", onClick: () => setAiProvider('gemini'), className: `p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all ${aiProvider === 'gemini'
                                                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`, children: [_jsx("span", { className: "font-bold", children: "Google Gemini API" }), _jsx("span", { className: "text-[10px] text-slate-500 font-normal", children: "Cloud API Key" })] }), _jsxs("button", { type: "button", onClick: () => setAiProvider('openai'), className: `p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all ${aiProvider === 'openai'
                                                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`, children: [_jsx("span", { className: "font-bold", children: "OpenAI GPT-4o" }), _jsx("span", { className: "text-[10px] text-slate-500 font-normal", children: "Cloud API Key" })] })] })] }), aiProvider === 'ollama' ? (_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Ollama Local Endpoint URL" }), _jsx("input", { type: "text", value: ollamaEndpoint, onChange: (e) => setOllamaEndpoint(e.target.value), placeholder: "http://localhost:11434", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500" })] })) : (_jsxs("div", { children: [_jsxs("label", { className: "block text-slate-400 mb-1 font-medium", children: [aiProvider.toUpperCase(), " API Key"] }), _jsx("input", { type: "password", value: aiApiKey, onChange: (e) => setAiApiKey(e.target.value), placeholder: "Paste API Key here...", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500" })] })), _jsx("button", { type: "submit", className: "py-2.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/20 cursor-pointer", children: "Save AI Provider Settings" })] })] }), _jsxs("div", { className: "p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4", children: [_jsx("div", { className: "flex items-center justify-between border-b border-slate-800 pb-4", children: _jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(ShieldCheck, { className: "w-5 h-5 text-emerald-400" }), _jsx("span", { children: "Account Security & Session Controls" })] }) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs", children: [_jsxs("div", { className: "p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1", children: [_jsx("span", { className: "text-slate-500 block", children: "Logged-In Username" }), _jsx("span", { className: "font-bold text-white text-sm", children: user?.username })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1", children: [_jsx("span", { className: "text-slate-500 block", children: "User Email" }), _jsx("span", { className: "font-bold text-white text-sm", children: user?.email })] })] })] }), isDeleteModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("h3", { className: "text-base font-bold text-rose-400 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-rose-500" }), _jsx("span", { children: "Confirm Account Deletion" })] }), _jsx("button", { onClick: () => setIsDeleteModalOpen(false), className: "p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("form", { onSubmit: handleDeleteAccount, className: "space-y-4 text-xs", children: [_jsxs("p", { className: "text-slate-300 leading-relaxed", children: ["To confirm permanent deletion, type your username ", _jsx("strong", { className: "text-rose-400 font-mono", children: user?.username }), " in the box below:"] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Type Username to Confirm *" }), _jsx("input", { type: "text", required: true, placeholder: user?.username, value: confirmUsernameInput, onChange: (e) => setConfirmUsernameInput(e.target.value), className: "w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500" })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setIsDeleteModalOpen(false), className: "flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer", children: "Cancel" }), _jsxs("button", { type: "submit", disabled: isDeleting || confirmUsernameInput.trim() !== user?.username, className: "flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-600/20 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2", children: [_jsx(Trash2, { className: "w-4 h-4" }), _jsx("span", { children: isDeleting ? 'Deleting...' : 'Permanently Delete' })] })] })] })] }) }))] }));
}
