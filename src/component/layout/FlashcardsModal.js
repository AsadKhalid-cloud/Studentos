import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Brain, Sparkles, X, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';
export default function FlashcardsModal({ isOpen, onClose }) {
    const { token } = useAuth();
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewedCount, setReviewedCount] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    // Fetch Due Flashcards
    const fetchDueCards = useCallback(async () => {
        if (!token)
            return;
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('http://192.168.10.180:4000/api/v1/flashcards/due', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setCards(data.flashcards || []);
                setCurrentIndex(0);
                setIsFlipped(false);
                setIsCompleted(false);
                setReviewedCount(0);
            }
            else {
                setError(data.error || 'Failed to load flashcards');
            }
        }
        catch {
            setError('Cannot connect to Express backend on http://192.168.10.180:4000');
        }
        finally {
            setLoading(false);
        }
    }, [token]);
    useEffect(() => {
        if (isOpen) {
            fetchDueCards();
        }
    }, [isOpen, fetchDueCards]);
    // Submit Spaced Repetition Rating
    const handleReviewRating = async (rating) => {
        const currentCard = cards[currentIndex];
        if (!currentCard || !token)
            return;
        try {
            const res = await fetch(`http://192.168.10.180:4000/api/v1/flashcards/${currentCard.id}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ rating })
            });
            if (res.ok) {
                setIsFlipped(false);
                setReviewedCount(prev => prev + 1);
                if (currentIndex + 1 < cards.length) {
                    setCurrentIndex(prev => prev + 1);
                }
                else {
                    setIsCompleted(true);
                }
            }
        }
        catch {
            // Error
        }
    };
    if (!isOpen)
        return null;
    const currentCard = cards[currentIndex];
    const progressPercent = cards.length > 0 ? Math.round(((currentIndex) / cards.length) * 100) : 100;
    return (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none text-left", children: _jsxs("div", { className: "w-full max-w-xl bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-130", children: [_jsxs("div", { className: "p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400", children: _jsx(Brain, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsxs("h3", { className: "text-sm font-bold text-white flex items-center gap-2", children: [_jsx("span", { children: "Spaced Repetition Flashcard Study Deck" }), _jsx("span", { className: "px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-mono", children: "SM-2 Algorithm" })] }), _jsx("p", { className: "text-[11px] text-slate-400", children: "Active Recall Study Mode" })] })] }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "flex-1 p-6 flex flex-col justify-between space-y-6", children: loading ? (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-slate-500 text-xs", children: [_jsx(RotateCw, { className: "w-8 h-8 animate-spin text-purple-400 mb-2" }), _jsx("span", { children: "Loading Spaced Repetition Cards..." })] })) : error ? (_jsxs("div", { className: "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400 my-auto", children: [_jsx(AlertCircle, { className: "w-5 h-5 shrink-0" }), _jsx("span", { children: error })] })) : isCompleted || cards.length === 0 ? (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center space-y-4 my-auto", children: [_jsx("div", { className: "p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400", children: _jsx(CheckCircle2, { className: "w-12 h-12" }) }), _jsxs("div", { className: "space-y-1", children: [_jsx("h3", { className: "text-xl font-bold text-white", children: "Study Deck Review Complete! \uD83C\uDF89" }), _jsxs("p", { className: "text-xs text-slate-400 max-w-sm", children: ["You reviewed ", reviewedCount, " flashcard(s). Your recall intervals have been updated in SQLite!"] })] }), _jsx("button", { onClick: onClose, className: "px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 cursor-pointer", children: "Close Study Deck" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-1.5", children: [_jsxs("div", { className: "flex items-center justify-between text-xs font-mono text-slate-400", children: [_jsxs("span", { children: ["CARD ", currentIndex + 1, " OF ", cards.length] }), _jsxs("span", { className: "text-purple-400 font-bold", children: [progressPercent, "% Reviewed"] })] }), _jsx("div", { className: "w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800", children: _jsx("div", { className: "h-full bg-linear-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-300", style: { width: `${progressPercent}%` } }) })] }), _jsxs("div", { onClick: () => setIsFlipped(!isFlipped), className: `flex-1 p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between min-h-65 shadow-2xl relative overflow-hidden ${isFlipped
                                    ? 'bg-slate-950 border-purple-500/50 shadow-purple-500/10'
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`, children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [currentCard.course && (_jsx("span", { className: "px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold font-mono", children: currentCard.course.code })), _jsx("span", { className: "px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold font-mono text-[10px]", children: currentCard.questionType })] }), _jsx("span", { className: "text-[10px] text-slate-500 font-mono", children: isFlipped ? 'BACK (ANSWER)' : 'FRONT (QUESTION)' })] }), _jsx("div", { className: "my-auto space-y-3", children: !isFlipped ? (_jsxs("div", { children: [_jsx("span", { className: "text-[10px] text-slate-500 font-mono block mb-1", children: "PROMPT:" }), _jsx("h3", { className: "text-base font-bold text-white leading-relaxed", children: currentCard.question })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] text-emerald-400 font-bold font-mono block mb-1", children: "CORRECT SOLUTION:" }), _jsx("p", { className: "text-sm font-semibold text-white leading-relaxed", children: currentCard.answer || 'Answer in explanation below' })] }), currentCard.explanation && (_jsxs("div", { className: "pt-2 border-t border-slate-900", children: [_jsx("span", { className: "text-[10px] text-blue-400 font-bold font-mono block mb-1", children: "EXPLANATION:" }), _jsx("p", { className: "text-xs text-slate-400 leading-relaxed max-h-28 overflow-y-auto custom-scrollbar", children: currentCard.explanation })] }))] })) }), _jsx("div", { className: "text-center pt-2 border-t border-slate-800/60", children: _jsxs("span", { className: "text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1", children: [_jsx(RotateCw, { className: "w-3 h-3" }), _jsx("span", { children: "Click card anytime to flip" })] }) })] }), !isFlipped ? (_jsxs("button", { onClick: () => setIsFlipped(true), className: "w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center gap-2", children: [_jsx(Sparkles, { className: "w-4 h-4 text-amber-400" }), _jsx("span", { children: "Reveal Answer & Solution" })] })) : (_jsxs("div", { className: "space-y-2", children: [_jsx("span", { className: "text-[10px] text-slate-400 font-mono block text-center", children: "HOW EASY WAS RECALLING THIS ANSWER?" }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsxs("button", { onClick: () => handleReviewRating('HARD'), className: "py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all cursor-pointer flex flex-col items-center", children: [_jsx("span", { children: "\uD83D\uDD34 Hard" }), _jsx("span", { className: "text-[9px] text-rose-500/80 font-mono mt-0.5", children: "Review in 1 Day" })] }), _jsxs("button", { onClick: () => handleReviewRating('GOOD'), className: "py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all cursor-pointer flex flex-col items-center", children: [_jsx("span", { children: "\uD83D\uDFE1 Good" }), _jsx("span", { className: "text-[9px] text-amber-500/80 font-mono mt-0.5", children: "Review in 3 Days" })] }), _jsxs("button", { onClick: () => handleReviewRating('EASY'), className: "py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer flex flex-col items-center", children: [_jsx("span", { children: "\uD83D\uDFE2 Easy" }), _jsx("span", { className: "text-[9px] text-emerald-500/80 font-mono mt-0.5", children: "Review in 7 Days" })] })] })] }))] })) })] }) }));
}
