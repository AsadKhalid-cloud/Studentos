import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Brain, 
  Sparkles, 
  X, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  BookOpen, 
  Check, 
  Flame 
} from 'lucide-react';

interface QuestionOption {
  id?: string;
  optionText: string;
  isCorrect: boolean;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  questionType: string;
  difficulty: string;
  topic: string;
  chapter: string;
  marks: number;
  intervalDays: number;
  options: QuestionOption[];
  course?: {
    code: string;
    name: string;
    color: string;
  };
}

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FlashcardsModal({ isOpen, onClose }: FlashcardsModalProps) {
  const { token } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewedCount, setReviewedCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Fetch Due Flashcards
  const fetchDueCards = useCallback(async () => {
    if (!token) return;
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
      } else {
        setError(data.error || 'Failed to load flashcards');
      }
    } catch {
      setError('Cannot connect to Express backend on http://192.168.10.180:4000');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      fetchDueCards();
    }
  }, [isOpen, fetchDueCards]);

  // Submit Spaced Repetition Rating
  const handleReviewRating = async (rating: 'HARD' | 'GOOD' | 'EASY') => {
    const currentCard = cards[currentIndex];
    if (!currentCard || !token) return;

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
        } else {
          setIsCompleted(true);
        }
      }
    } catch {
      // Error
    }
  };

  if (!isOpen) return null;

  const currentCard = cards[currentIndex];
  const progressPercent = cards.length > 0 ? Math.round(((currentIndex) / cards.length) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none text-left">
<div className="w-full max-w-xl bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-130">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Spaced Repetition Flashcard Study Deck</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-mono">
                  SM-2 Algorithm
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Active Recall Study Mode</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 p-6 flex flex-col justify-between space-y-6">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
              <RotateCw className="w-8 h-8 animate-spin text-purple-400 mb-2" />
              <span>Loading Spaced Repetition Cards...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400 my-auto">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : isCompleted || cards.length === 0 ? (
            /* SESSION COMPLETED SCREEN */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 my-auto">
              <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Study Deck Review Complete! 🎉</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  You reviewed {reviewedCount} flashcard(s). Your recall intervals have been updated in SQLite!
                </p>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 cursor-pointer"
              >
                Close Study Deck
              </button>
            </div>
          ) : (
            /* ACTIVE FLASHCARD VIEW */
            <>
              {/* Card Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>CARD {currentIndex + 1} OF {cards.length}</span>
                  <span className="text-purple-400 font-bold">{progressPercent}% Reviewed</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-linear-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* 3D-STYLE FLIP FLASHCARD CONTAINER */}
             <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className={`flex-1 p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between min-h-65 shadow-2xl relative overflow-hidden ${
                  isFlipped 
                    ? 'bg-slate-950 border-purple-500/50 shadow-purple-500/10' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Top Badges */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {currentCard.course && (
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold font-mono">
                        {currentCard.course.code}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold font-mono text-[10px]">
                      {currentCard.questionType}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {isFlipped ? 'BACK (ANSWER)' : 'FRONT (QUESTION)'}
                  </span>
                </div>

                {/* Card Main Text */}
                <div className="my-auto space-y-3">
                  {!isFlipped ? (
                    /* FRONT OF CARD (QUESTION) */
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block mb-1">PROMPT:</span>
                      <h3 className="text-base font-bold text-white leading-relaxed">{currentCard.question}</h3>
                    </div>
                  ) : (
                    /* BACK OF CARD (ANSWER & EXPLANATION) */
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold font-mono block mb-1">CORRECT SOLUTION:</span>
                        <p className="text-sm font-semibold text-white leading-relaxed">{currentCard.answer || 'Answer in explanation below'}</p>
                      </div>

                      {currentCard.explanation && (
                        <div className="pt-2 border-t border-slate-900">
                          <span className="text-[10px] text-blue-400 font-bold font-mono block mb-1">EXPLANATION:</span>
                          <p className="text-xs text-slate-400 leading-relaxed max-h-28 overflow-y-auto custom-scrollbar">
                            {currentCard.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Flip Hint */}
                <div className="text-center pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1">
                    <RotateCw className="w-3 h-3" />
                    <span>Click card anytime to flip</span>
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              {!isFlipped ? (
                /* REVEAL BUTTON */
                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Reveal Answer & Solution</span>
                </button>
              ) : (
                /* SPACED REPETITION RATING BUTTONS */
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-mono block text-center">HOW EASY WAS RECALLING THIS ANSWER?</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleReviewRating('HARD')}
                      className="py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
                    >
                      <span>🔴 Hard</span>
                      <span className="text-[9px] text-rose-500/80 font-mono mt-0.5">Review in 1 Day</span>
                    </button>

                    <button
                      onClick={() => handleReviewRating('GOOD')}
                      className="py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
                    >
                      <span>🟡 Good</span>
                      <span className="text-[9px] text-amber-500/80 font-mono mt-0.5">Review in 3 Days</span>
                    </button>

                    <button
                      onClick={() => handleReviewRating('EASY')}
                      className="py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
                    >
                      <span>🟢 Easy</span>
                      <span className="text-[9px] text-emerald-500/80 font-mono mt-0.5">Review in 7 Days</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}