import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, Plus, Clock, AlertCircle, CheckCircle2, X, Trash2, Edit3, ArrowRight, ArrowLeft, Filter } from 'lucide-react';
export default function TasksPage() {
    const { token } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({
        id: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        courseId: ''
    });
    // Fetch Courses & Tasks
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
            // Fetch Tasks
            let taskUrl = 'http://192.168.10.180:4000/api/v1/tasks?';
            if (priorityFilter !== 'ALL') {
                taskUrl += `priority=${priorityFilter}&`;
            }
            const taskRes = await fetch(taskUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const tData = await taskRes.json();
            if (taskRes.ok) {
                setTasks(tData.tasks || []);
            }
            else {
                setError(tData.error || 'Failed to fetch tasks');
            }
        }
        catch {
            setError('Cannot connect to Express backend on http://192.168.10.180:4000');
        }
        finally {
            setLoading(false);
        }
    }, [token, priorityFilter]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    // Open Modal
    const openModal = (task) => {
        if (task) {
            setForm({
                id: task.id,
                title: task.title,
                description: task.description || '',
                priority: task.priority,
                dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
                courseId: task.courseId || ''
            });
        }
        else {
            setForm({
                id: '',
                title: '',
                description: '',
                priority: 'MEDIUM',
                dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
                courseId: courses[0]?.id || ''
            });
        }
        setIsModalOpen(true);
    };
    // Save Task
    const handleSaveTask = async (e) => {
        e.preventDefault();
        if (!token)
            return;
        const isEdit = Boolean(form.id);
        const url = isEdit
            ? `http://192.168.10.180:4000/api/v1/tasks/${form.id}`
            : 'http://192.168.10.180:4000/api/v1/tasks';
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
                alert(`Error: ${data.error || 'Failed to save task'}`);
            }
        }
        catch {
            alert('Cannot connect to backend');
        }
    };
    // Shift Task Status (Kanban Column Move)
    const handleMoveStatus = async (id, newStatus, e) => {
        e.stopPropagation();
        if (!token)
            return;
        try {
            const res = await fetch(`http://192.168.10.180:4000/api/v1/tasks/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
            }
        }
        catch {
            // Error
        }
    };
    // Delete Task
    const handleDeleteTask = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this task?'))
            return;
        try {
            const res = await fetch(`http://192.168.10.180:4000/api/v1/tasks/${id}`, {
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
    // Helper for Priority Badge
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'URGENT': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            case 'HIGH': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'MEDIUM': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };
    // Filter Tasks by Search Query
    const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const todoTasks = filteredTasks.filter(t => t.status === 'TODO');
    const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
    const completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED');
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8 select-none", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckSquare, { className: "w-6 h-6 text-amber-400" }), _jsx("h1", { className: "text-2xl font-extrabold text-white tracking-tight", children: "Task & Deadline Manager" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Organize assignments, lab tasks, priorities, due dates, and track progress using Kanban columns." })] }), _jsxs("button", { onClick: () => openModal(), className: "px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2 cursor-pointer", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Add Task" })] })] }), error && (_jsxs("div", { className: "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400", children: [_jsx(AlertCircle, { className: "w-5 h-5 shrink-0" }), _jsx("span", { children: error })] })), _jsxs("div", { className: "p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs", children: [_jsx("div", { className: "relative w-full sm:w-80", children: _jsx("input", { type: "text", placeholder: "Search tasks & assignments...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" }) }), _jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto", children: [_jsx(Filter, { className: "w-3.5 h-3.5 text-slate-500" }), _jsx("span", { className: "text-slate-400", children: "Priority:" }), ['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map(p => (_jsx("button", { onClick: () => setPriorityFilter(p), className: `px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${priorityFilter === p
                                    ? 'bg-amber-600 border-amber-500 text-white shadow'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`, children: p }, p)))] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 text-left", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between", children: [_jsxs("span", { className: "text-xs font-bold text-slate-200 flex items-center gap-2", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-slate-400" }), _jsx("span", { children: "To-Do" })] }), _jsx("span", { className: "px-2 py-0.5 rounded-md bg-slate-800 font-mono text-xs font-bold text-slate-400", children: todoTasks.length })] }), _jsx("div", { className: "space-y-3", children: todoTasks.map(task => (_jsxs("div", { className: "p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 relative group", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getPriorityBadge(task.priority)}`, children: task.priority }), _jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("button", { onClick: () => openModal(task), className: "p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white", children: _jsx(Edit3, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: (e) => handleDeleteTask(task.id, e), className: "p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] })] }), _jsx("h4", { className: "text-xs font-bold text-white leading-relaxed", children: task.title }), task.description && _jsx("p", { className: "text-[11px] text-slate-400 line-clamp-2", children: task.description }), _jsxs("div", { className: "pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3 text-slate-500" }), new Date(task.dueDate).toLocaleDateString()] }), _jsxs("button", { onClick: (e) => handleMoveStatus(task.id, 'IN_PROGRESS', e), className: "text-blue-400 hover:text-blue-300 font-bold flex items-center gap-0.5 cursor-pointer", children: [_jsx("span", { children: "Start" }), _jsx(ArrowRight, { className: "w-3 h-3" })] })] })] }, task.id))) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between", children: [_jsxs("span", { className: "text-xs font-bold text-amber-400 flex items-center gap-2", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" }), _jsx("span", { children: "In Progress" })] }), _jsx("span", { className: "px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 font-mono text-xs font-bold text-amber-400", children: inProgressTasks.length })] }), _jsx("div", { className: "space-y-3", children: inProgressTasks.map(task => (_jsxs("div", { className: "p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 relative group", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getPriorityBadge(task.priority)}`, children: task.priority }), _jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("button", { onClick: () => openModal(task), className: "p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white", children: _jsx(Edit3, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: (e) => handleDeleteTask(task.id, e), className: "p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] })] }), _jsx("h4", { className: "text-xs font-bold text-white leading-relaxed", children: task.title }), task.description && _jsx("p", { className: "text-[11px] text-slate-400 line-clamp-2", children: task.description }), _jsxs("div", { className: "pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono", children: [_jsxs("button", { onClick: (e) => handleMoveStatus(task.id, 'TODO', e), className: "text-slate-500 hover:text-slate-300 font-semibold flex items-center gap-0.5 cursor-pointer", children: [_jsx(ArrowLeft, { className: "w-3 h-3" }), _jsx("span", { children: "To-Do" })] }), _jsxs("button", { onClick: (e) => handleMoveStatus(task.id, 'COMPLETED', e), className: "text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 cursor-pointer", children: [_jsx("span", { children: "Done" }), _jsx(CheckCircle2, { className: "w-3 h-3" })] })] })] }, task.id))) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between", children: [_jsxs("span", { className: "text-xs font-bold text-emerald-400 flex items-center gap-2", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-400" }), _jsx("span", { children: "Completed" })] }), _jsx("span", { className: "px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 font-mono text-xs font-bold text-emerald-400", children: completedTasks.length })] }), _jsx("div", { className: "space-y-3", children: completedTasks.map(task => (_jsxs("div", { className: "p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 opacity-70 relative group", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400", children: "DONE" }), _jsx("button", { onClick: (e) => handleDeleteTask(task.id, e), className: "p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] }), _jsx("h4", { className: "text-xs font-bold text-slate-300 line-through leading-relaxed", children: task.title }), _jsxs("div", { className: "pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono", children: [_jsx("span", { children: "Finished" }), _jsx("button", { onClick: (e) => handleMoveStatus(task.id, 'IN_PROGRESS', e), className: "text-amber-400 hover:underline font-semibold cursor-pointer", children: "Re-open" })] })] }, task.id))) })] })] }), isModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(CheckSquare, { className: "w-5 h-5 text-amber-400" }), _jsx("span", { children: form.id ? 'Edit Task' : 'Add New Task / Assignment' })] }), _jsx("button", { onClick: () => setIsModalOpen(false), className: "p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("form", { onSubmit: handleSaveTask, className: "space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Task Title *" }), _jsx("input", { type: "text", required: true, placeholder: "DBMS Assignment 3 Submission", value: form.title, onChange: (e) => setForm({ ...form, title: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Priority" }), _jsxs("select", { value: form.priority, onChange: (e) => setForm({ ...form, priority: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500", children: [_jsx("option", { value: "LOW", children: "Low \uD83D\uDD35" }), _jsx("option", { value: "MEDIUM", children: "Medium \uD83D\uDFE1" }), _jsx("option", { value: "HIGH", children: "High \uD83D\uDFE0" }), _jsx("option", { value: "URGENT", children: "Urgent \uD83D\uDD34" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Linked Course" }), _jsxs("select", { value: form.courseId, onChange: (e) => setForm({ ...form, courseId: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500", children: [_jsx("option", { value: "", children: "None (General Task)" }), courses.map(c => (_jsxs("option", { value: c.id, children: [c.code, " - ", c.name] }, c.id)))] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Due Date & Time *" }), _jsx("input", { type: "datetime-local", required: true, value: form.dueDate, onChange: (e) => setForm({ ...form, dueDate: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Description (Optional)" }), _jsx("textarea", { rows: 3, placeholder: "Assignment requirements, submission link, notes...", value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setIsModalOpen(false), className: "flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer", children: "Cancel" }), _jsx("button", { type: "submit", className: "flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-lg shadow-amber-600/20 cursor-pointer", children: form.id ? 'Update Task' : 'Create Task' })] })] })] }) }))] }));
}
