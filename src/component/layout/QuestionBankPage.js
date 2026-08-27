import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, Plus, Search, Eye, EyeOff, CheckCircle2, XCircle, Trash2, Edit3, X, Brain, AlertCircle } from 'lucide-react';
import FlashcardsModal from './FlashcardsModal';
export default function QuestionBankPage() {
    const { token } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');
    const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');
    // UI Interactive States
    const [revealedAnswers, setRevealedAnswers] = useState({});
    const [selectedMcqOption, setSelectedMcqOption] = useState({});
    // Modals State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
    const [form, setForm] = useState({
        id: '',
        courseId: '',
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
    // Fetch Courses & Questions
    const fetchData = useCallback(async () => {
        if (!token)
            return;
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
            if (selectedType !== 'ALL')
                url += `questionType=${selectedType}&`;
            if (selectedDifficulty !== 'ALL')
                url += `difficulty=${selectedDifficulty}&`;
            if (selectedCourseFilter !== 'ALL')
                url += `courseId=${selectedCourseFilter}&`;
            const qRes = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const qData = await qRes.json();
            if (qRes.ok) {
                setQuestions(qData.questions || []);
            }
            else {
                setError(qData.error || 'Failed to fetch questions');
            }
        }
        catch {
            setError('Cannot connect to Express backend on http://192.168.10.180:4000');
        }
        finally {
            setLoading(false);
        }
    }, [token, selectedType, selectedDifficulty, selectedCourseFilter]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    // Toggle Answer Reveal
    const toggleAnswer = (id) => {
        setRevealedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
    };
    // Open Modal
    const openModal = (q) => {
        if (q) {
            setForm({
                id: q.id,
                courseId: q.courseId || courses[0]?.id || '',
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
        }
        else {
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
    const handleSaveQuestion = async (e) => {
        e.preventDefault();
        if (!token)
            return;
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
            }
            else {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to save question'}`);
            }
        }
        catch {
            alert('Cannot connect to backend');
        }
    };
    // Delete Question
    const handleDeleteQuestion = async (id) => {
        if (!confirm('Are you sure you want to delete this question?'))
            return;
        try {
            const res = await fetch(`http://192.168.10.180:4000/api/v1/questions/${id}`, {
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
    // Update Option in Form
    const handleOptionChange = (index, text) => {
        const newOptions = [...form.options];
        newOptions[index].optionText = text;
        setForm({ ...form, options: newOptions });
    };
    const setCorrectOption = (selectedIndex) => {
        const newOptions = form.options.map((opt, i) => ({
            ...opt,
            isCorrect: i === selectedIndex
        }));
        setForm({ ...form, options: newOptions });
    };
    // Search Filter
    const filteredQuestions = questions.filter(q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.chapter.toLowerCase().includes(searchQuery.toLowerCase()));
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8 select-none text-left", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(HelpCircle, { className: "w-6 h-6 text-blue-400" }), _jsx("h1", { className: "text-2xl font-extrabold text-white tracking-tight", children: "Question Bank & Flashcards Hub" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Store MCQs, Past Papers & practice active recall with Spaced Repetition Flashcard Study Decks." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => setIsFlashcardsOpen(true), className: "px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer", children: [_jsx(Brain, { className: "w-4 h-4 text-amber-300 animate-pulse" }), _jsx("span", { children: "Study Flashcards \uD83E\uDDE0" })] }), _jsxs("button", { onClick: () => openModal(), className: "px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Add Question" })] })] })] }), error && (_jsxs("div", { className: "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400", children: [_jsx(AlertCircle, { className: "w-5 h-5 shrink-0" }), _jsx("span", { children: error })] })), _jsxs("div", { className: "p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [_jsxs("div", { className: "relative md:col-span-2", children: [_jsx(Search, { className: "w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" }), _jsx("input", { type: "text", placeholder: "Search questions, topics, chapters...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500" })] }), _jsxs("select", { value: selectedCourseFilter, onChange: (e) => setSelectedCourseFilter(e.target.value), className: "bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500", children: [_jsx("option", { value: "ALL", children: "All Courses" }), courses.map(c => (_jsxs("option", { value: c.id, children: [c.code, " - ", c.name] }, c.id)))] })] }), _jsx("div", { className: "flex flex-wrap gap-2 pt-2 border-t border-slate-800 text-xs font-medium", children: ['ALL', 'MCQ', 'SHORT', 'LONG', 'PRACTICAL', 'VIVA', 'CODING', 'PAST_PAPER'].map(type => (_jsx("button", { onClick: () => setSelectedType(type), className: `px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${selectedType === type
                                ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`, children: type }, type))) })] }), loading ? (_jsx("div", { className: "p-12 text-center text-xs text-slate-500", children: "Loading question bank..." })) : filteredQuestions.length === 0 ? (_jsxs("div", { className: "p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3", children: [_jsx(HelpCircle, { className: "w-12 h-12 mx-auto text-slate-700" }), _jsx("h3", { className: "text-sm font-bold text-white", children: "No Questions Found" }), _jsx("p", { className: "text-xs text-slate-400 max-w-sm mx-auto", children: "Add practice MCQs, past paper questions, or viva cards for your BS-IT courses." }), _jsxs("button", { onClick: () => openModal(), className: "px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-2", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Add First Question" })] })] })) : (_jsx("div", { className: "space-y-4", children: filteredQuestions.map(q => {
                    const isAnswerVisible = revealedAnswers[q.id];
                    return (_jsxs("div", { className: "p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-left", children: [_jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [q.course && (_jsx("span", { className: "px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold font-mono", children: q.course.code })), _jsx("span", { className: "px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold font-mono", children: q.questionType }), _jsx("span", { className: `px-2.5 py-0.5 rounded-md font-bold font-mono ${q.difficulty === 'EASY' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                                                    q.difficulty === 'MEDIUM' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                                                        'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`, children: q.difficulty }), _jsxs("span", { className: "text-slate-500 font-mono text-[11px]", children: [q.marks, " Mark(s)"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => openModal(q), className: "p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer", children: _jsx(Edit3, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: () => handleDeleteQuestion(q.id), className: "p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("p", { className: "text-xs font-mono text-slate-500", children: ["Topic: ", q.topic, " ", q.chapter ? `• Chapter: ${q.chapter}` : ''] }), _jsx("h3", { className: "text-sm font-bold text-white leading-relaxed", children: q.question })] }), q.questionType === 'MCQ' && q.options && q.options.length > 0 && (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2", children: q.options.map((opt, idx) => {
                                    const isSelected = selectedMcqOption[q.id] === idx;
                                    let optionStyle = "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300";
                                    if (isSelected) {
                                        optionStyle = opt.isCorrect
                                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                                            : "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                                    }
                                    else if (isAnswerVisible && opt.isCorrect) {
                                        optionStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold";
                                    }
                                    return (_jsxs("div", { onClick: () => setSelectedMcqOption(prev => ({ ...prev, [q.id]: idx })), className: `p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${optionStyle}`, children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-5 h-5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-400 shrink-0", children: String.fromCharCode(65 + idx) }), _jsx("span", { children: opt.optionText })] }), isSelected && (opt.isCorrect ? _jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-400 shrink-0" }) : _jsx(XCircle, { className: "w-4 h-4 text-rose-400 shrink-0" }))] }, idx));
                                }) })), _jsxs("div", { className: "pt-2 border-t border-slate-800/60 flex flex-col gap-3", children: [_jsxs("button", { onClick: () => toggleAnswer(q.id), className: "self-start text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 cursor-pointer", children: [isAnswerVisible ? _jsx(EyeOff, { className: "w-3.5 h-3.5" }) : _jsx(Eye, { className: "w-3.5 h-3.5" }), _jsx("span", { children: isAnswerVisible ? 'Hide Answer & Explanation' : 'Reveal Solution' })] }), isAnswerVisible && (_jsxs("div", { className: "p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs", children: [q.answer && (_jsxs("div", { children: [_jsx("span", { className: "text-[10px] font-mono text-emerald-400 font-bold block mb-1", children: "CORRECT ANSWER" }), _jsx("p", { className: "text-white font-medium", children: q.answer })] })), q.explanation && (_jsxs("div", { className: "pt-2 border-t border-slate-900", children: [_jsx("span", { className: "text-[10px] font-mono text-blue-400 font-bold block mb-1", children: "STEP-BY-STEP EXPLANATION" }), _jsx("p", { className: "text-slate-400 leading-relaxed", children: q.explanation })] }))] }))] })] }, q.id));
                }) })), isModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(HelpCircle, { className: "w-5 h-5 text-blue-400" }), _jsx("span", { children: form.id ? 'Edit Question' : 'Add New Question' })] }), _jsx("button", { onClick: () => setIsModalOpen(false), className: "p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("form", { onSubmit: handleSaveQuestion, className: "space-y-4 text-xs", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Select Course *" }), _jsx("select", { required: true, value: form.courseId, onChange: (e) => setForm({ ...form, courseId: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500", children: courses.map(c => (_jsxs("option", { value: c.id, children: [c.code, " - ", c.name] }, c.id))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Question Type *" }), _jsxs("select", { value: form.questionType, onChange: (e) => setForm({ ...form, questionType: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500", children: [_jsx("option", { value: "MCQ", children: "MCQ (Multiple Choice)" }), _jsx("option", { value: "SHORT", children: "Short Question" }), _jsx("option", { value: "LONG", children: "Long Question" }), _jsx("option", { value: "PRACTICAL", children: "Practical Task" }), _jsx("option", { value: "VIVA", children: "Viva Question" }), _jsx("option", { value: "CODING", children: "Coding Problem" }), _jsx("option", { value: "PAST_PAPER", children: "Past Paper Question" })] })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Difficulty" }), _jsxs("select", { value: form.difficulty, onChange: (e) => setForm({ ...form, difficulty: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500", children: [_jsx("option", { value: "EASY", children: "Easy \uD83D\uDFE2" }), _jsx("option", { value: "MEDIUM", children: "Medium \uD83D\uDFE1" }), _jsx("option", { value: "HARD", children: "Hard \uD83D\uDD34" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Topic Name" }), _jsx("input", { type: "text", placeholder: "Normalization", value: form.topic, onChange: (e) => setForm({ ...form, topic: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Marks" }), _jsx("input", { type: "number", min: "1", value: form.marks, onChange: (e) => setForm({ ...form, marks: Number(e.target.value) }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Question Text *" }), _jsx("textarea", { required: true, rows: 3, placeholder: "Type the question...", value: form.question, onChange: (e) => setForm({ ...form, question: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), form.questionType === 'MCQ' && (_jsxs("div", { className: "space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800", children: [_jsx("label", { className: "block text-xs font-bold text-blue-400", children: "MCQ Options (Select the Radio for Correct Answer):" }), form.options.map((opt, idx) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", name: "correctOption", checked: opt.isCorrect, onChange: () => setCorrectOption(idx), className: "text-blue-600 bg-slate-900 border-slate-700 cursor-pointer" }), _jsxs("span", { className: "w-5 font-mono font-bold text-slate-500 text-xs", children: [String.fromCharCode(65 + idx), "."] }), _jsx("input", { type: "text", placeholder: `Option ${String.fromCharCode(65 + idx)}`, value: opt.optionText, onChange: (e) => handleOptionChange(idx, e.target.value), className: "flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500" })] }, idx)))] })), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Answer / Solution" }), _jsx("textarea", { rows: 2, placeholder: "Correct answer...", value: form.answer, onChange: (e) => setForm({ ...form, answer: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Explanation" }), _jsx("textarea", { rows: 2, placeholder: "Step-by-step explanation...", value: form.explanation, onChange: (e) => setForm({ ...form, explanation: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setIsModalOpen(false), className: "flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer", children: "Cancel" }), _jsx("button", { type: "submit", className: "flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 cursor-pointer", children: form.id ? 'Update Question' : 'Save Question' })] })] })] }) })), _jsx(FlashcardsModal, { isOpen: isFlashcardsOpen, onClose: () => setIsFlashcardsOpen(false) })] }));
}
