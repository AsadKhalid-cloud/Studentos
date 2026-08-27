import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  X, 
  Brain,
  AlertCircle
} from 'lucide-react';
import FlashcardsModal from './FlashcardsModal';

interface QuestionOption {
  id?: string;
  optionText: string;
  isCorrect: boolean;
}

interface QuestionItem {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  questionType: 'MCQ' | 'SHORT' | 'LONG' | 'PRACTICAL' | 'VIVA' | 'CODING' | 'PAST_PAPER';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question: string;
  answer: string;
  explanation: string;
  marks: number;
  options: QuestionOption[];
  course?: {
    code: string;
    name: string;
    color: string;
  };
}

interface CourseOption {
  id: string;
  code: string;
  name: string;
}

export default function QuestionBankPage() {
  const { token } = useAuth();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');

  // UI Interactive States
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [selectedMcqOption, setSelectedMcqOption] = useState<Record<string, number>>({});

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);

  const [form, setForm] = useState({
    id: '',
    courseId: '',
    subject: '',
    chapter: '',
    topic: 'General',
    questionType: 'MCQ' as any,
    difficulty: 'MEDIUM' as any,
    question: '',
    answer: '',
    explanation: '',
    marks: 1,
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false }
    ]
  });

  // Fetch Courses & Questions
  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      // Fetch Courses for Dropdown
      const courseRes = await fetch('http://192.168.10.180:4000/api/v1/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourses(courseData.courses || []);
        if (courseData.courses?.length > 0 && !form.courseId) {
          setForm(prev => ({ ...prev, courseId: courseData.courses[0].id }));
        }
      }

      // Fetch Questions
      let url = 'http://192.168.10.180:4000/api/v1/questions?';
      if (selectedType !== 'ALL') url += `questionType=${selectedType}&`;
      if (selectedDifficulty !== 'ALL') url += `difficulty=${selectedDifficulty}&`;
      if (selectedCourseFilter !== 'ALL') url += `courseId=${selectedCourseFilter}&`;

      const qRes = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const qData = await qRes.json();
      if (qRes.ok) {
        setQuestions(qData.questions || []);
      } else {
        setError(qData.error || 'Failed to fetch questions');
      }
    } catch {
      setError('Cannot connect to Express backend on http://192.168.10.180:4000');
    } finally {
      setLoading(false);
    }
  }, [token, selectedType, selectedDifficulty, selectedCourseFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle Answer Reveal
  const toggleAnswer = (id: string) => {
    setRevealedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Modal
  const openModal = (q?: QuestionItem) => {
    if (q) {
      setForm({
        id: q.id,
        courseId: (q as any).courseId || courses[0]?.id || '',
        subject: q.subject || '',
        chapter: q.chapter || '',
        topic: q.topic || 'General',
        questionType: q.questionType,
        difficulty: q.difficulty,
        question: q.question,
        answer: q.answer || '',
        explanation: q.explanation || '',
        marks: q.marks || 1,
        options: q.options && q.options.length > 0 ? q.options : [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false }
        ]
      });
    } else {
      setForm({
        id: '',
        courseId: courses[0]?.id || '',
        subject: '',
        chapter: '',
        topic: 'General',
        questionType: 'MCQ',
        difficulty: 'MEDIUM',
        question: '',
        answer: '',
        explanation: '',
        marks: 1,
        options: [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false }
        ]
      });
    }
    setIsModalOpen(true);
  };

  // Save Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const isEdit = Boolean(form.id);
    const url = isEdit 
      ? `http://192.168.10.180:4000/api/v1/questions/${form.id}` 
      : 'http://192.168.10.180:4000/api/v1/questions';
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
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Failed to save question'}`);
      }
    } catch {
      alert('Cannot connect to backend');
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`http://192.168.10.180:4000/api/v1/questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      // Error
    }
  };

  // Update Option in Form
  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...form.options];
    newOptions[index].optionText = text;
    setForm({ ...form, options: newOptions });
  };

  const setCorrectOption = (selectedIndex: number) => {
    const newOptions = form.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === selectedIndex
    }));
    setForm({ ...form, options: newOptions });
  };

  // Search Filter
  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.chapter.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Question Bank & Flashcards Hub</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Store MCQs, Past Papers & practice active recall with Spaced Repetition Flashcard Study Decks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* FLASHCARD STUDY DECK MODE BUTTON */}
          <button
            onClick={() => setIsFlashcardsOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Brain className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Study Flashcards 🧠</span>
          </button>

          <button
            onClick={() => openModal()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search questions, topics, chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Course Filter Dropdown */}
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>
        </div>

        {/* Type Filter Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 text-xs font-medium">
          {['ALL', 'MCQ', 'SHORT', 'LONG', 'PRACTICAL', 'VIVA', 'CODING', 'PAST_PAPER'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                selectedType === type
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading question bank...</div>
      ) : filteredQuestions.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <HelpCircle className="w-12 h-12 mx-auto text-slate-700" />
          <h3 className="text-sm font-bold text-white">No Questions Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Add practice MCQs, past paper questions, or viva cards for your BS-IT courses.
          </p>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Question</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map(q => {
            const isAnswerVisible = revealedAnswers[q.id];

            return (
              <div 
                key={q.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-left"
              >
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    {q.course && (
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold font-mono">
                        {q.course.code}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold font-mono">
                      {q.questionType}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md font-bold font-mono ${
                      q.difficulty === 'EASY' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                      q.difficulty === 'MEDIUM' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                      'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">{q.marks} Mark(s)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(q)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-1">
                  <p className="text-xs font-mono text-slate-500">Topic: {q.topic} {q.chapter ? `• Chapter: ${q.chapter}` : ''}</p>
                  <h3 className="text-sm font-bold text-white leading-relaxed">{q.question}</h3>
                </div>

                {/* MCQ Interactive Choices Simulator */}
                {q.questionType === 'MCQ' && q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt, idx) => {
                      const isSelected = selectedMcqOption[q.id] === idx;
                      let optionStyle = "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300";

                      if (isSelected) {
                        optionStyle = opt.isCorrect 
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold" 
                          : "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                      } else if (isAnswerVisible && opt.isCorrect) {
                        optionStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold";
                      }

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedMcqOption(prev => ({ ...prev, [q.id]: idx }))}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${optionStyle}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-400 shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt.optionText}</span>
                          </span>
                          {isSelected && (
                            opt.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reveal Answer Action */}
                <div className="pt-2 border-t border-slate-800/60 flex flex-col gap-3">
                  <button
                    onClick={() => toggleAnswer(q.id)}
                    className="self-start text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isAnswerVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isAnswerVisible ? 'Hide Answer & Explanation' : 'Reveal Solution'}</span>
                  </button>

                  {/* Revealed Answer Box */}
                  {isAnswerVisible && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      {q.answer && (
                        <div>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">CORRECT ANSWER</span>
                          <p className="text-white font-medium">{q.answer}</p>
                        </div>
                      )}
                      {q.explanation && (
                        <div className="pt-2 border-t border-slate-900">
                          <span className="text-[10px] font-mono text-blue-400 font-bold block mb-1">STEP-BY-STEP EXPLANATION</span>
                          <p className="text-slate-400 leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT QUESTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                <span>{form.id ? 'Edit Question' : 'Add New Question'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Select Course *</label>
                  <select
                    required
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Question Type *</label>
                  <select
                    value={form.questionType}
                    onChange={(e) => setForm({ ...form, questionType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="MCQ">MCQ (Multiple Choice)</option>
                    <option value="SHORT">Short Question</option>
                    <option value="LONG">Long Question</option>
                    <option value="PRACTICAL">Practical Task</option>
                    <option value="VIVA">Viva Question</option>
                    <option value="CODING">Coding Problem</option>
                    <option value="PAST_PAPER">Past Paper Question</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="EASY">Easy 🟢</option>
                    <option value="MEDIUM">Medium 🟡</option>
                    <option value="HARD">Hard 🔴</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Topic Name</label>
                  <input
                    type="text"
                    placeholder="Normalization"
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={form.marks}
                    onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Question Text *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type the question..."
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              {/* Dynamic MCQ Options Builder */}
              {form.questionType === 'MCQ' && (
                <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-bold text-blue-400">MCQ Options (Select the Radio for Correct Answer):</label>
                  {form.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={opt.isCorrect}
                        onChange={() => setCorrectOption(idx)}
                        className="text-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
                      />
                      <span className="w-5 font-mono font-bold text-slate-500 text-xs">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        value={opt.optionText}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Answer / Solution</label>
                <textarea
                  rows={2}
                  placeholder="Correct answer..."
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Explanation</label>
                <textarea
                  rows={2}
                  placeholder="Step-by-step explanation..."
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  {form.id ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SPACED REPETITION FLASHCARDS STUDY DECK MODAL */}
      <FlashcardsModal 
        isOpen={isFlashcardsOpen} 
        onClose={() => setIsFlashcardsOpen(false)} 
      />
    </div>
  );
}