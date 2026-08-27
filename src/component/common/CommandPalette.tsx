import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  X, 
  FileText, 
  BookOpen, 
  HelpCircle, 
  Code2, 
  Wallet, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from '../layout/sidebar';

interface SearchResults {
  notes: any[];
  courses: any[];
  questions: any[];
  codeSnippets: any[];
  transactions: any[];
  assignments: any[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function CommandPalette({ isOpen, onClose, setActiveTab }: CommandPaletteProps) {
  const { token } = useAuth();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResults>({
    notes: [],
    courses: [],
    questions: [],
    codeSnippets: [],
    transactions: [],
    assignments: []
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Global Keyboard Listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open Modal
          const searchBtn = document.getElementById('open-command-palette');
          if (searchBtn) searchBtn.click();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Execute Search API Call
  const executeSearch = useCallback(async (searchTerm: string) => {
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
    } catch {
      // Search Error
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      executeSearch(query);
    }, 250);

    return () => clearTimeout(timeout);
  }, [query, executeSearch]);

  if (!isOpen) return null;

  const totalResults = 
    results.notes.length + 
    results.courses.length + 
    results.questions.length + 
    results.codeSnippets.length + 
    results.transactions.length;

  const handleJumpToTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search notes, questions, courses, code, transactions... (Type to search)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-xs text-slate-500 hover:text-white"
            >
              Clear
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar text-xs">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-mono">Searching SQLite Database...</div>
          ) : query.length < 2 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-700 mx-auto" />
              <p>Type at least 2 characters to search across all student modules.</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-1">
              <p className="font-bold text-slate-400">No results found for "{query}"</p>
              <p className="text-[11px]">Try searching with a different term or keyword.</p>
            </div>
          ) : (
            <div className="space-y-6 text-left">
              {/* 1. NOTES RESULTS */}
              {results.notes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold font-mono text-[11px] uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Notes ({results.notes.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.notes.map(note => (
                      <div
                        key={note.id}
                        onClick={() => handleJumpToTab('notes')}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-blue-500/50 cursor-pointer flex items-center justify-between transition-all group"
                      >
                        <div>
                          <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{note.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{note.markdownText?.replace(/[#*`]/g, '')}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. COURSES RESULTS */}
              {results.courses.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono text-[11px] uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Courses ({results.courses.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.courses.map(course => (
                      <div
                        key={course.id}
                        onClick={() => handleJumpToTab('courses')}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            {course.code}
                          </span>
                          <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">{course.name}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. QUESTION BANK RESULTS */}
              {results.questions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-purple-400 font-bold font-mono text-[11px] uppercase tracking-wider">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Questions ({results.questions.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.questions.map(q => (
                      <div
                        key={q.id}
                        onClick={() => handleJumpToTab('questions')}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-purple-500/50 cursor-pointer flex items-center justify-between transition-all group"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400">
                              {q.questionType}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Topic: {q.topic}</span>
                          </div>
                          <p className="font-medium text-slate-200 line-clamp-1">{q.question}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. CODE SNIPPETS RESULTS */}
              {results.codeSnippets.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono text-[11px] uppercase tracking-wider">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Code Snippets ({results.codeSnippets.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.codeSnippets.map(code => (
                      <div
                        key={code.id}
                        onClick={() => handleJumpToTab('code')}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/50 cursor-pointer flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            {code.language}
                          </span>
                          <span className="font-bold text-white group-hover:text-amber-400 transition-colors">{code.title}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. TRANSACTIONS RESULTS */}
              {results.transactions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold font-mono text-[11px] uppercase tracking-wider">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Transactions ({results.transactions.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.transactions.map(t => (
                      <div
                        key={t.id}
                        onClick={() => handleJumpToTab('budget')}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-rose-500/50 cursor-pointer flex items-center justify-between transition-all group"
                      >
                        <div>
                          <p className="font-bold text-white group-hover:text-rose-400 transition-colors">{t.description || t.category.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{t.category.name} • {t.type}</p>
                        </div>
                        <span className={`font-mono font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ${t.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">ESC</kbd> to close</span>
          <span>Click any item to jump directly to workspace</span>
        </div>
      </div>
    </div>
  );
}