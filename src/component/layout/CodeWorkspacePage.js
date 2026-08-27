import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Code2, Plus, Search, Copy, Check, Star, Trash2, Edit3, ExternalLink, X, AlertCircle, Terminal } from 'lucide-react';
export default function CodeWorkspacePage() {
    const { token } = useAuth();
    const [snippets, setSnippets] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('ALL');
    const [copiedId, setCopiedId] = useState(null);
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({
        id: '',
        title: '',
        language: 'cpp',
        codeContent: '',
        explanation: '',
        githubUrl: '',
        tags: '#dsa #cpp',
        courseId: ''
    });
    // Fetch Courses & Code Snippets
    const fetchData = useCallback(async () => {
        if (!token)
            return;
        try {
            setLoading(true);
            setError(null);
            // Fetch Courses
            const courseRes = await fetch('http://192.168.10.180:4000/api/v1/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (courseRes.ok) {
                const cData = await courseRes.json();
                setCourses(cData.courses || []);
            }
            // Fetch Snippets
            let codeUrl = 'http://192.168.10.180:4000/api/v1/code?';
            if (selectedLanguage !== 'ALL') {
                codeUrl += `language=${selectedLanguage}&`;
            }
            const codeRes = await fetch(codeUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const codeData = await codeRes.json();
            if (codeRes.ok) {
                setSnippets(codeData.codeSnippets || []);
            }
            else {
                setError(codeData.error || 'Failed to fetch code snippets');
            }
        }
        catch {
            setError('Cannot connect to Express backend on http://192.168.10.180:4000');
        }
        finally {
            setLoading(false);
        }
    }, [token, selectedLanguage]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    // Copy Code to Clipboard
    const handleCopyCode = (id, code, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    // Open Modal
    const openModal = (snip) => {
        if (snip) {
            setForm({
                id: snip.id,
                title: snip.title,
                language: snip.language,
                codeContent: snip.codeContent,
                explanation: snip.explanation || '',
                githubUrl: snip.githubUrl || '',
                tags: snip.tags || '',
                courseId: snip.courseId || ''
            });
        }
        else {
            setForm({
                id: '',
                title: '',
                language: 'cpp',
                codeContent: '// Type your C++ / Python / SQL code here...\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello StudentOS!";\n    return 0;\n}',
                explanation: '',
                githubUrl: '',
                tags: '#programming #bsit',
                courseId: courses[0]?.id || ''
            });
        }
        setIsModalOpen(true);
    };
    // Save Code Snippet
    const handleSaveSnippet = async (e) => {
        e.preventDefault();
        if (!token)
            return;
        const isEdit = Boolean(form.id);
        const url = isEdit
            ? `http://192.168.10.180:4000/api/v1/code/${form.id}`
            : 'http://192.168.10.180:4000/api/v1/code';
        const method = isEdit ? 'PUT' : 'POST';
        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
            }
            else {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to save snippet'}`);
            }
        }
        catch {
            alert('Cannot connect to backend');
        }
    };
    // Toggle Favorite
    const handleToggleFavorite = async (id, e) => {
        e.stopPropagation();
        try {
            const res = await fetch(`http://192.168.10.180:4000/api/v1/code/${id}/favorite`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchData();
            }
        }
        catch {
            // Error
        }
    };
    // Delete Snippet
    const handleDeleteSnippet = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this code snippet?'))
            return;
        try {
            const res = await fetch(`http://192.168.10.180:4000/api/v1/code/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchData();
            }
        }
        catch {
            // Error
        }
    };
    // Filter Snippets by Search Query
    const filteredSnippets = snippets.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.codeContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8 select-none", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Code2, { className: "w-6 h-6 text-purple-400" }), _jsx("h1", { className: "text-2xl font-extrabold text-white tracking-tight", children: "Code Workspace & Syntax Hub" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "BS-IT Programming Repository: Store C++, Python, Java, SQL Queries, and link GitHub Repositories." })] }), _jsxs("button", { onClick: () => openModal(), className: "px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "New Snippet" })] })] }), error && (_jsxs("div", { className: "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400", children: [_jsx(AlertCircle, { className: "w-5 h-5 shrink-0" }), _jsx("span", { children: error })] })), _jsxs("div", { className: "p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" }), _jsx("input", { type: "text", placeholder: "Search code snippets, algorithms, language, tags...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500" })] }), _jsx("div", { className: "flex flex-wrap gap-2 pt-2 border-t border-slate-800 text-xs font-medium", children: ['ALL', 'cpp', 'python', 'java', 'sql', 'javascript', 'php', 'html'].map(lang => (_jsx("button", { onClick: () => setSelectedLanguage(lang), className: `px-3 py-1.5 rounded-xl border uppercase font-mono text-[11px] transition-all cursor-pointer ${selectedLanguage === lang
                                ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`, children: lang === 'cpp' ? 'C++' : lang === 'sql' ? 'SQL' : lang }, lang))) })] }), loading ? (_jsx("div", { className: "p-12 text-center text-xs text-slate-500", children: "Loading code workspace..." })) : filteredSnippets.length === 0 ? (_jsxs("div", { className: "p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3", children: [_jsx(Code2, { className: "w-12 h-12 mx-auto text-slate-700" }), _jsx("h3", { className: "text-sm font-bold text-white", children: "No Snippets Found" }), _jsx("p", { className: "text-xs text-slate-400 max-w-sm mx-auto", children: "Save C++ pointers, SQL join queries, or Python algorithms for quick exam reference." }), _jsxs("button", { onClick: () => openModal(), className: "px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-2", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Add First Snippet" })] })] })) : (_jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 text-left", children: filteredSnippets.map(snip => (_jsxs("div", { className: "p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between relative group", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold font-mono text-xs uppercase", children: snip.language }), snip.course && (_jsx("span", { className: "px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold font-mono text-xs", children: snip.course.code }))] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: (e) => handleToggleFavorite(snip.id, e), title: "Favorite Snippet", className: `p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ${snip.isFavorite ? 'text-amber-400' : 'text-slate-500'}`, children: _jsx(Star, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => openModal(snip), title: "Edit Snippet", className: "p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer", children: _jsx(Edit3, { className: "w-4 h-4" }) }), _jsx("button", { onClick: (e) => handleDeleteSnippet(snip.id, e), title: "Delete Snippet", className: "p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }), _jsx("h3", { className: "text-base font-bold text-white", children: snip.title }), snip.tags && _jsx("p", { className: "text-[11px] text-slate-500 font-mono", children: snip.tags })] }), _jsxs("div", { className: "relative rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden font-mono text-xs", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[10px]", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(Terminal, { className: "w-3 h-3 text-purple-400" }), _jsxs("span", { children: [snip.language, " Source"] })] }), _jsx("button", { onClick: (e) => handleCopyCode(snip.id, snip.codeContent, e), className: "flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer", children: copiedId === snip.id ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "w-3.5 h-3.5 text-emerald-400" }), _jsx("span", { className: "text-emerald-400 font-bold", children: "Copied!" })] })) : (_jsxs(_Fragment, { children: [_jsx(Copy, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Copy" })] })) })] }), _jsx("pre", { className: "p-4 text-emerald-400 overflow-x-auto leading-relaxed max-h-60 custom-scrollbar", children: _jsx("code", { children: snip.codeContent }) })] }), _jsxs("div", { className: "pt-2 border-t border-slate-800/60 space-y-2 text-xs", children: [snip.explanation && (_jsxs("p", { className: "text-slate-400 leading-relaxed text-[11px]", children: [_jsx("span", { className: "text-white font-bold block mb-0.5", children: "Algorithm Explanation:" }), snip.explanation] })), snip.githubUrl && (_jsxs("a", { href: snip.githubUrl, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1.5 text-purple-400 hover:underline text-xs font-semibold pt-1", children: [_jsx(ExternalLink, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "GitHub Repository / Gist" })] }))] })] }, snip.id))) })), isModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(Code2, { className: "w-5 h-5 text-purple-400" }), _jsx("span", { children: form.id ? 'Edit Code Snippet' : 'Add New Code Snippet' })] }), _jsx("button", { onClick: () => setIsModalOpen(false), className: "p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("form", { onSubmit: handleSaveSnippet, className: "space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Snippet Title *" }), _jsx("input", { type: "text", required: true, placeholder: "B-Tree Indexing SQL Query / Pointer Swap C++", value: form.title, onChange: (e) => setForm({ ...form, title: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Language *" }), _jsxs("select", { value: form.language, onChange: (e) => setForm({ ...form, language: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 uppercase font-mono", children: [_jsx("option", { value: "cpp", children: "C++" }), _jsx("option", { value: "python", children: "Python" }), _jsx("option", { value: "java", children: "Java" }), _jsx("option", { value: "sql", children: "SQL" }), _jsx("option", { value: "javascript", children: "JavaScript" }), _jsx("option", { value: "php", children: "PHP" }), _jsx("option", { value: "html", children: "HTML / CSS" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Linked Course" }), _jsxs("select", { value: form.courseId, onChange: (e) => setForm({ ...form, courseId: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500", children: [_jsx("option", { value: "", children: "None (General)" }), courses.map(c => (_jsxs("option", { value: c.id, children: [c.code, " - ", c.name] }, c.id)))] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Source Code *" }), _jsx("textarea", { required: true, rows: 8, value: form.codeContent, onChange: (e) => setForm({ ...form, codeContent: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none focus:border-purple-500 resize-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Algorithm Explanation (Optional)" }), _jsx("textarea", { rows: 2, placeholder: "How this code works, time complexity O(n)...", value: form.explanation, onChange: (e) => setForm({ ...form, explanation: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Tags" }), _jsx("input", { type: "text", placeholder: "#pointers #dsa", value: form.tags, onChange: (e) => setForm({ ...form, tags: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "GitHub Repo URL" }), _jsx("input", { type: "url", placeholder: "https://github.com/user/repo", value: form.githubUrl, onChange: (e) => setForm({ ...form, githubUrl: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500" })] })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setIsModalOpen(false), className: "flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer", children: "Cancel" }), _jsx("button", { type: "submit", className: "flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-600/20 cursor-pointer", children: form.id ? 'Update Snippet' : 'Save Snippet' })] })] })] }) }))] }));
}
