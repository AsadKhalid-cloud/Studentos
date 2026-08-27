import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, X, FileText, BookOpen, HelpCircle, Code2, Wallet, ArrowRight, Sparkles } from 'lucide-react';
export default function CommandPalette({ isOpen, onClose, setActiveTab }) {
    const { token } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({
        notes: [],
        courses: [],
        questions: [],
        codeSnippets: [],
        transactions: [],
        assignments: []
    });
    const [loading, setLoading] = useState(false);
    // Global Keyboard Listener for Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                }
                else {
                    // Open Modal
                    const searchBtn = document.getElementById('open-command-palette');
                    if (searchBtn)
                        searchBtn.click();
                }
            }
            else if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    // Execute Search API Call
    const executeSearch = useCallback(async (searchTerm) => {
        if (!token || !searchTerm || searchTerm.length < 2) {
            setResults({ notes: [], courses: [], questions: [], codeSnippets: [], transactions: [], assignments: [] });
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(`http://192.168.10.180:4000/api/v1/search?q=${encodeURIComponent(searchTerm)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setResults(data);
            }
        }
        catch {
            // Search Error
        }
        finally {
            setLoading(false);
        }
    }, [token]);
    useEffect(() => {
        const timeout = setTimeout(() => {
            executeSearch(query);
        }, 250);
        return () => clearTimeout(timeout);
    }, [query, executeSearch]);
    if (!isOpen)
        return null;
    const totalResults = results.notes.length +
        results.courses.length +
        results.questions.length +
        results.codeSnippets.length +
        results.transactions.length;
    const handleJumpToTab = (tab) => {
        setActiveTab(tab);
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 select-none", children: _jsxs("div", { className: "w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]", children: [_jsxs("div", { className: "p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60", children: [_jsx(Search, { className: "w-5 h-5 text-blue-400 shrink-0" }), _jsx("input", { type: "text", autoFocus: true, placeholder: "Search notes, questions, courses, code, transactions... (Type to search)", value: query, onChange: (e) => setQuery(e.target.value), className: "w-full bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none font-medium" }), query && (_jsx("button", { onClick: () => setQuery(''), className: "text-xs text-slate-500 hover:text-white", children: "Clear" })), _jsx("button", { onClick: onClose, className: "p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar text-xs", children: loading ? (_jsx("div", { className: "p-12 text-center text-slate-500 font-mono", children: "Searching SQLite Database..." })) : query.length < 2 ? (_jsxs("div", { className: "p-12 text-center text-slate-500 space-y-2", children: [_jsx(Sparkles, { className: "w-8 h-8 text-slate-700 mx-auto" }), _jsx("p", { children: "Type at least 2 characters to search across all student modules." })] })) : totalResults === 0 ? (_jsxs("div", { className: "p-12 text-center text-slate-500 space-y-1", children: [_jsxs("p", { className: "font-bold text-slate-400", children: ["No results found for \"", query, "\""] }), _jsx("p", { className: "text-[11px]", children: "Try searching with a different term or keyword." })] })) : (_jsxs("div", { className: "space-y-6 text-left", children: [results.notes.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-blue-400 font-bold font-mono text-[11px] uppercase tracking-wider", children: [_jsx(FileText, { className: "w-3.5 h-3.5" }), _jsxs("span", { children: ["Notes (", results.notes.length, ")"] })] }), _jsx("div", { className: "space-y-1", children: results.notes.map(note => (_jsxs("div", { onClick: () => handleJumpToTab('notes'), className: "p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-blue-500/50 cursor-pointer flex items-center justify-between transition-all group", children: [_jsxs("div", { children: [_jsx("p", { className: "font-bold text-white group-hover:text-blue-400 transition-colors", children: note.title }), _jsx("p", { className: "text-[11px] text-slate-400 line-clamp-1 mt-0.5", children: note.markdownText?.replace(/[#*`]/g, '') })] }), _jsx(ArrowRight, { className: "w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors shrink-0" })] }, note.id))) })] })), results.courses.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-emerald-400 font-bold font-mono text-[11px] uppercase tracking-wider", children: [_jsx(BookOpen, { className: "w-3.5 h-3.5" }), _jsxs("span", { children: ["Courses (", results.courses.length, ")"] })] }), _jsx("div", { className: "space-y-1", children: results.courses.map(course => (_jsxs("div", { onClick: () => handleJumpToTab('courses'), className: "p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between transition-all group", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400", children: course.code }), _jsx("span", { className: "font-bold text-white group-hover:text-emerald-400 transition-colors", children: course.name })] }), _jsx(ArrowRight, { className: "w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" })] }, course.id))) })] })), results.questions.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-purple-400 font-bold font-mono text-[11px] uppercase tracking-wider", children: [_jsx(HelpCircle, { className: "w-3.5 h-3.5" }), _jsxs("span", { children: ["Questions (", results.questions.length, ")"] })] }), _jsx("div", { className: "space-y-1", children: results.questions.map(q => (_jsxs("div", { onClick: () => handleJumpToTab('questions'), className: "p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-purple-500/50 cursor-pointer flex items-center justify-between transition-all group", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400", children: q.questionType }), _jsxs("span", { className: "text-[10px] text-slate-500 font-mono", children: ["Topic: ", q.topic] })] }), _jsx("p", { className: "font-medium text-slate-200 line-clamp-1", children: q.question })] }), _jsx(ArrowRight, { className: "w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors shrink-0" })] }, q.id))) })] })), results.codeSnippets.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-amber-400 font-bold font-mono text-[11px] uppercase tracking-wider", children: [_jsx(Code2, { className: "w-3.5 h-3.5" }), _jsxs("span", { children: ["Code Snippets (", results.codeSnippets.length, ")"] })] }), _jsx("div", { className: "space-y-1", children: results.codeSnippets.map(code => (_jsxs("div", { onClick: () => handleJumpToTab('code'), className: "p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/50 cursor-pointer flex items-center justify-between transition-all group", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400", children: code.language }), _jsx("span", { className: "font-bold text-white group-hover:text-amber-400 transition-colors", children: code.title })] }), _jsx(ArrowRight, { className: "w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors shrink-0" })] }, code.id))) })] })), results.transactions.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-rose-400 font-bold font-mono text-[11px] uppercase tracking-wider", children: [_jsx(Wallet, { className: "w-3.5 h-3.5" }), _jsxs("span", { children: ["Transactions (", results.transactions.length, ")"] })] }), _jsx("div", { className: "space-y-1", children: results.transactions.map(t => (_jsxs("div", { onClick: () => handleJumpToTab('budget'), className: "p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-rose-500/50 cursor-pointer flex items-center justify-between transition-all group", children: [_jsxs("div", { children: [_jsx("p", { className: "font-bold text-white group-hover:text-rose-400 transition-colors", children: t.description || t.category.name }), _jsxs("p", { className: "text-[10px] text-slate-500 font-mono", children: [t.category.name, " \u2022 ", t.type] })] }), _jsxs("span", { className: `font-mono font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`, children: ["$", t.amount.toFixed(2)] })] }, t.id))) })] }))] })) }), _jsxs("div", { className: "p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500", children: [_jsxs("span", { children: ["Press ", _jsx("kbd", { className: "px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300", children: "ESC" }), " to close"] }), _jsx("span", { children: "Click any item to jump directly to workspace" })] })] }) }));
}
