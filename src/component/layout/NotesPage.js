import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/component/layout/NotesPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Pin, Star, Trash2, FileText, Tag, Folder, Heading, Bold, Italic, List, Code, CheckSquare, AlertCircle, ScanText, Mic, ArrowLeft } from 'lucide-react';
import OcrScannerModal from './OcrScannerModal';
import { LectureRecorder } from './LectureRecorder';
export default function NotesPage() {
    const { token } = useAuth();
    const [notes, setNotes] = useState([]);
    const [activeNote, setActiveNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveTabFilter] = useState('all');
    const [saveStatus, setSaveStatus] = useState('saved');
    const [error, setError] = useState(null);
    // Mobile View Switcher State ('list' vs 'editor')
    const [mobileView, setMobileView] = useState('list');
    // OCR Modal & Audio Recorder State
    const [isOcrOpen, setIsOcrOpen] = useState(false);
    const [isRecorderOpen, setIsRecorderOpen] = useState(false);
    // Fetch Notes from Express Backend (Port 4000)
    const fetchNotes = useCallback(async () => {
        if (!token)
            return;
        try {
            setLoading(true);
            setError(null);
            let url = 'http://192.168.10.180:4000/api/v1/notes';
            if (activeFilter === 'pinned')
                url += '?isPinned=true';
            if (activeFilter === 'favorites')
                url += '?isFavorite=true';
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setNotes(data.notes || []);
                if (data.notes && data.notes.length > 0 && !activeNote) {
                    setActiveNote(data.notes[0]);
                }
            }
            else {
                setError(data.error || 'Failed to load notes');
            }
        }
        catch {
            setError('Cannot connect to Express backend on http://192.168.10.180:4000');
        }
        finally {
            setLoading(false);
        }
    }, [token, activeFilter]);
    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);
    // Handle Select Note
    const handleSelectNote = (note) => {
        setActiveNote(note);
        setMobileView('editor'); // Switch to full editor on mobile
    };
    // Create New Note
    const handleCreateNote = async () => {
        if (!token) {
            alert('Authentication session expired. Please log in again.');
            return;
        }
        try {
            setError(null);
            const res = await fetch('http://192.168.10.180:4000/api/v1/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: 'Untitled Note',
                    markdownText: '# New Lecture Note\n\nStart typing your study notes here...',
                    category: 'General'
                })
            });
            const data = await res.json();
            if (res.ok) {
                setNotes([data.note, ...notes]);
                setActiveNote(data.note);
                setMobileView('editor');
            }
            else {
                alert(`Error: ${data.error || 'Failed to create note'}`);
            }
        }
        catch {
            alert('Cannot connect to Express backend on http://192.168.10.180:4000');
        }
    };
    // Update Note Content (Debounced Auto-Save)
    const handleUpdateNote = async (updatedFields) => {
        if (!activeNote || !token)
            return;
        setSaveStatus('saving');
        const updatedNote = { ...activeNote, ...updatedFields };
        setActiveNote(updatedNote);
        setNotes(notes.map(n => n.id === activeNote.id ? updatedNote : n));
        try {
            const res = await fetch(`http://192.168.10.180:4000/api/v1/notes/${activeNote.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updatedFields)
            });
            if (res.ok) {
                setSaveStatus('saved');
            }
        }
        catch {
            setSaveStatus('idle');
        }
    };
    // Delete Note
    const handleDeleteNote = async (id, e) => {
        if (e)
            e.stopPropagation();
        if (!confirm('Are you sure you want to delete this note?'))
            return;
        try {
            const res = await fetch(`http://192.168.10.180:4000/api/v1/notes/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const remaining = notes.filter(n => n.id !== id);
                setNotes(remaining);
                if (activeNote?.id === id) {
                    setActiveNote(remaining.length > 0 ? remaining[0] : null);
                }
            }
        }
        catch {
            // Error
        }
    };
    // Toggle Pin
    const handleTogglePin = async (id, e) => {
        if (e)
            e.stopPropagation();
        try {
            const res = await fetch(`http://192.168.10.180:4000/api/v1/notes/${id}/pin`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setNotes(notes.map(n => n.id === id ? { ...n, isPinned: data.note.isPinned } : n));
                if (activeNote?.id === id) {
                    setActiveNote({ ...activeNote, isPinned: data.note.isPinned });
                }
            }
        }
        catch {
            // Error
        }
    };
    // Toggle Favorite
    const handleToggleFavorite = async (id, e) => {
        if (e)
            e.stopPropagation();
        try {
            const res = await fetch(`http://192.168.10.180:4000/api/v1/notes/${id}/favorite`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setNotes(notes.map(n => n.id === id ? { ...n, isFavorite: data.note.isFavorite } : n));
                if (activeNote?.id === id) {
                    setActiveNote({ ...activeNote, isFavorite: data.note.isFavorite });
                }
            }
        }
        catch {
            // Error
        }
    };
    const insertFormatting = (prefix, suffix = '') => {
        if (!activeNote)
            return;
        const currentText = activeNote.markdownText || '';
        handleUpdateNote({
            markdownText: `${currentText}\n${prefix} ${suffix}`
        });
    };
    const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.markdownText && n.markdownText.toLowerCase().includes(searchQuery.toLowerCase())) ||
        n.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return (_jsxs("div", { className: "h-[calc(100vh-4rem)] flex select-none bg-slate-950 overflow-hidden text-left", children: [_jsxs("div", { className: `w-full md:w-80 border-r border-slate-800 bg-slate-900/60 flex flex-col h-full shrink-0 ${mobileView === 'editor' ? 'hidden md:flex' : 'flex'}`, children: [_jsxs("div", { className: "p-3 sm:p-4 border-b border-slate-800 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-xs sm:text-sm font-bold text-white flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4 text-blue-400" }), _jsx("span", { children: "Notes Workspace" })] }), _jsxs("div", { className: "flex items-center gap-1 sm:gap-1.5", children: [_jsxs("button", { type: "button", onClick: () => setIsRecorderOpen(!isRecorderOpen), title: "Live Lecture Audio Recorder & AI Transcriber", className: `p-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${isRecorderOpen
                                                    ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20'
                                                    : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400'}`, children: [_jsx(Mic, { className: "w-3.5 h-3.5" }), _jsx("span", { className: "hidden sm:inline", children: "Record" })] }), _jsxs("button", { type: "button", onClick: () => setIsOcrOpen(true), title: "Scan Lecture Slide Image", className: "p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1", children: [_jsx(ScanText, { className: "w-3.5 h-3.5" }), _jsx("span", { className: "hidden sm:inline", children: "OCR" })] }), _jsxs("button", { type: "button", onClick: handleCreateNote, className: "px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1 cursor-pointer", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "New" })] })] })] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" }), _jsx("input", { type: "text", placeholder: "Search notes...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { className: "flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-medium", children: [_jsx("button", { type: "button", onClick: () => setActiveTabFilter('all'), className: `flex-1 py-1 rounded-lg transition-all ${activeFilter === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`, children: "All" }), _jsx("button", { type: "button", onClick: () => setActiveTabFilter('pinned'), className: `flex-1 py-1 rounded-lg transition-all ${activeFilter === 'pinned' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`, children: "Pinned \uD83D\uDCCC" }), _jsx("button", { type: "button", onClick: () => setActiveTabFilter('favorites'), className: `flex-1 py-1 rounded-lg transition-all ${activeFilter === 'favorites' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`, children: "Favorites \u2B50" })] })] }), error && (_jsxs("div", { className: "m-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-[11px] text-rose-400", children: [_jsx(AlertCircle, { className: "w-3.5 h-3.5 shrink-0" }), _jsx("span", { children: error })] })), _jsx("div", { className: "flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar", children: loading ? (_jsx("div", { className: "p-8 text-center text-xs text-slate-500", children: "Loading notes..." })) : filteredNotes.length === 0 ? (_jsxs("div", { className: "p-8 text-center text-xs text-slate-500 space-y-2", children: [_jsx(FileText, { className: "w-8 h-8 mx-auto text-slate-600" }), _jsx("p", { children: "No notes found." }), _jsx("button", { type: "button", onClick: handleCreateNote, className: "text-blue-400 hover:underline font-semibold cursor-pointer", children: "Create your first note" })] })) : (filteredNotes.map(note => {
                            const isSelected = activeNote?.id === note.id;
                            return (_jsxs("div", { onClick: () => handleSelectNote(note), className: `p-3 rounded-xl border transition-all cursor-pointer text-left relative group ${isSelected
                                    ? 'bg-blue-600/10 border-blue-500/50 shadow-md'
                                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'}`, children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("h4", { className: `text-xs font-bold truncate ${isSelected ? 'text-blue-400' : 'text-white'}`, children: note.title || 'Untitled Note' }), _jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("button", { type: "button", onClick: (e) => handleTogglePin(note.id, e), title: "Pin Note", className: `p-1 rounded hover:bg-slate-800 ${note.isPinned ? 'text-amber-400' : 'text-slate-500'}`, children: _jsx(Pin, { className: "w-3 h-3" }) }), _jsx("button", { type: "button", onClick: (e) => handleToggleFavorite(note.id, e), title: "Favorite Note", className: `p-1 rounded hover:bg-slate-800 ${note.isFavorite ? 'text-amber-400' : 'text-slate-500'}`, children: _jsx(Star, { className: "w-3 h-3" }) }), _jsx("button", { type: "button", onClick: (e) => handleDeleteNote(note.id, e), title: "Delete Note", className: "p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400", children: _jsx(Trash2, { className: "w-3 h-3" }) })] })] }), _jsx("p", { className: "text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed", children: note.markdownText ? note.markdownText.replace(/[#*`]/g, '') : 'No additional content...' }), _jsxs("div", { className: "flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500", children: [_jsxs("span", { className: "flex items-center gap-1 font-mono", children: [_jsx(Folder, { className: "w-3 h-3 text-slate-600" }), note.category] }), note.isPinned && _jsx("span", { className: "text-amber-400 font-bold", children: "PINNED" })] })] }, note.id));
                        })) })] }), _jsxs("div", { className: `flex-1 flex flex-col h-full bg-slate-950 min-w-0 overflow-y-auto ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`, children: [isRecorderOpen && (_jsx("div", { className: "p-4 border-b border-rose-500/20 bg-rose-950/10", children: _jsx(LectureRecorder, { token: token, onNoteCreated: (newNote) => {
                                fetchNotes();
                                setIsRecorderOpen(false);
                            } }) })), activeNote ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "h-14 px-3 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40 shrink-0", children: [_jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [_jsxs("button", { type: "button", onClick: () => setMobileView('list'), className: "md:hidden p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-xs", title: "Back to Notes List", children: [_jsx(ArrowLeft, { className: "w-4 h-4 text-blue-400" }), _jsx("span", { children: "List" })] }), _jsx("input", { type: "text", value: activeNote.title, onChange: (e) => handleUpdateNote({ title: e.target.value }), placeholder: "Note Title...", className: "bg-transparent text-sm sm:text-base font-bold text-white focus:outline-none placeholder-slate-600 w-36 sm:w-80 truncate" }), _jsx("span", { className: "hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400", children: saveStatus === 'saving' ? 'Saving...' : 'Saved to SQLite' })] }), _jsxs("div", { className: "flex items-center gap-1 sm:gap-2", children: [_jsx("button", { type: "button", onClick: () => handleTogglePin(activeNote.id), className: `p-1.5 sm:p-2 rounded-xl border transition-colors cursor-pointer ${activeNote.isPinned
                                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`, title: "Pin Note", children: _jsx(Pin, { className: "w-3.5 h-3.5 sm:w-4 sm:h-4" }) }), _jsx("button", { type: "button", onClick: () => handleToggleFavorite(activeNote.id), className: `p-1.5 sm:p-2 rounded-xl border transition-colors cursor-pointer ${activeNote.isFavorite
                                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`, title: "Favorite Note", children: _jsx(Star, { className: "w-3.5 h-3.5 sm:w-4 sm:h-4" }) }), _jsx("button", { type: "button", onClick: () => handleDeleteNote(activeNote.id), className: "p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer", title: "Delete Note", children: _jsx(Trash2, { className: "w-3.5 h-3.5 sm:w-4 sm:h-4" }) })] })] }), _jsxs("div", { className: "px-3 sm:px-6 py-2 border-b border-slate-800 bg-slate-900/20 flex items-center gap-1.5 sm:gap-2 overflow-x-auto text-xs shrink-0 custom-scrollbar", children: [_jsx("button", { type: "button", onClick: () => insertFormatting('# Heading 1'), className: "p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0", children: _jsx(Heading, { className: "w-3.5 h-3.5" }) }), _jsx("button", { type: "button", onClick: () => insertFormatting('**Bold Text**'), className: "p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0", children: _jsx(Bold, { className: "w-3.5 h-3.5" }) }), _jsx("button", { type: "button", onClick: () => insertFormatting('*Italic Text*'), className: "p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0", children: _jsx(Italic, { className: "w-3.5 h-3.5" }) }), _jsx("button", { type: "button", onClick: () => insertFormatting('- List Item'), className: "p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0", children: _jsx(List, { className: "w-3.5 h-3.5" }) }), _jsx("button", { type: "button", onClick: () => insertFormatting('- [ ] Task Checklist'), className: "p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0", children: _jsx(CheckSquare, { className: "w-3.5 h-3.5" }) }), _jsx("button", { type: "button", onClick: () => insertFormatting('```cpp\n// C++ Code Snippet\n```'), className: "p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0", children: _jsx(Code, { className: "w-3.5 h-3.5" }) }), _jsx("div", { className: "h-4 w-px bg-slate-800 mx-1 shrink-0" }), _jsxs("div", { className: "flex items-center gap-1 text-[11px] text-slate-400 shrink-0", children: [_jsx(Tag, { className: "w-3 h-3" }), _jsx("span", { className: "hidden sm:inline", children: "Category:" }), _jsx("input", { type: "text", value: activeNote.category, onChange: (e) => handleUpdateNote({ category: e.target.value }), className: "bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-white focus:outline-none w-20 sm:w-28 text-xs" })] })] }), _jsx("div", { className: "flex-1 p-3 sm:p-6 overflow-y-auto", children: _jsx("textarea", { value: activeNote.markdownText, onChange: (e) => handleUpdateNote({ markdownText: e.target.value }), placeholder: "Write your lecture notes in Markdown format...", className: "w-full h-full min-h-[300px] bg-transparent text-slate-100 text-xs sm:text-sm font-mono leading-relaxed focus:outline-none resize-none placeholder-slate-600" }) })] })) : (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-slate-500 text-xs space-y-3 p-6", children: [_jsx(FileText, { className: "w-12 h-12 text-slate-700" }), _jsx("p", { children: "Select a note from the list or create a new note." }), _jsx("button", { type: "button", onClick: handleCreateNote, className: "px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all cursor-pointer", children: "Create New Note" })] }))] }), _jsx(OcrScannerModal, { isOpen: isOcrOpen, onClose: () => setIsOcrOpen(false), onSaveToNotes: fetchNotes })] }));
}
