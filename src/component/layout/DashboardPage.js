import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, CheckSquare, Calendar as CalendarIcon, Wallet, Flame, Plus, GraduationCap, FileText, Code2, Award, ChevronRight } from 'lucide-react';
export default function DashboardPage({ setActiveTab }) {
    const { token, user } = useAuth();
    // Real Dynamic Data States
    const [coursesCount, setCoursesCount] = useState(0);
    const [attendanceRate, setAttendanceRate] = useState(100);
    const [pendingTasksCount, setPendingTasksCount] = useState(0);
    const [urgentTasksCount, setUrgentTasksCount] = useState(0);
    const [monthlyExpense, setTotalExpense] = useState(0);
    const [earnedCredits, setEarnedCredits] = useState(64);
    const [targetCgpa, setTargetCgpa] = useState(4.00);
    const [realTasks, setRealTasks] = useState([]);
    const [todayEvents, setTodayEvents] = useState([]);
    // Fetch Real Live Data from Backend APIs
    const fetchDashboardData = useCallback(async () => {
        if (!token)
            return;
        try {
            // 1. Fetch Courses Count
            const courseRes = await fetch('http://192.168.10.180:4000/api/v1/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (courseRes.ok) {
                const cData = await courseRes.json();
                const courseList = cData.courses || [];
                setCoursesCount(courseList.length);
                if (courseList.length > 0) {
                    const totalAtt = courseList.reduce((acc, c) => acc + (c.attendanceStats?.attendancePercent || 100), 0);
                    setAttendanceRate(Math.round(totalAtt / courseList.length));
                }
            }
            // 2. Fetch Pending Tasks
            const taskRes = await fetch('http://192.168.10.180:4000/api/v1/tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (taskRes.ok) {
                const tData = await taskRes.json();
                const taskList = tData.tasks || [];
                const pending = taskList.filter((t) => t.status !== 'COMPLETED');
                const urgent = pending.filter((t) => t.priority === 'URGENT');
                setPendingTasksCount(pending.length);
                setUrgentTasksCount(urgent.length);
                setRealTasks(taskList.slice(0, 5));
            }
            // 3. Fetch Budget Expenses
            const budgetRes = await fetch('http://192.168.10.180:4000/api/v1/budget/summary', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (budgetRes.ok) {
                const bData = await budgetRes.json();
                setTotalExpense(bData.summary?.totalExpense || 0);
            }
            // 4. Fetch University Profile CGPA
            const profileRes = await fetch('http://192.168.10.180:4000/api/v1/university/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (profileRes.ok) {
                const pData = await profileRes.json();
                if (pData.profile) {
                    setEarnedCredits(pData.profile.earnedCredits || 64);
                    setTargetCgpa(pData.profile.targetCgpa || 4.00);
                }
            }
            // 5. Fetch Today's Calendar Events
            const calRes = await fetch('http://192.168.10.180:4000/api/v1/calendar/events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (calRes.ok) {
                const calData = await calRes.json();
                setTodayEvents(calData.events || []);
            }
        }
        catch {
            // Offline fallback
        }
    }, [token]);
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);
    // Dynamic Time Greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12)
            return 'Good Morning';
        if (hour < 18)
            return 'Good Afternoon';
        return 'Good Evening';
    };
    // Toggle Task Checklist
    const toggleTask = async (id, currentStatus) => {
        const newStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
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
                fetchDashboardData();
            }
        }
        catch {
            // Error
        }
    };
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8 select-none text-left", children: [_jsxs("div", { className: "flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-linear-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 shadow-2xl relative overflow-hidden", children: [_jsxs("div", { className: "space-y-1 relative z-10", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold", children: [_jsx(Flame, { className: "w-3.5 h-3.5 text-amber-400 animate-pulse" }), _jsx("span", { children: "Active Student Session" })] }), _jsxs("h1", { className: "text-2xl sm:text-3xl font-extrabold text-white tracking-tight", children: [getGreeting(), ", ", user?.username, "! \uD83D\uDC4B"] }), _jsxs("p", { className: "text-xs text-slate-400 max-w-xl", children: ["Welcome to your StudentOS Operating System. You have ", _jsxs("strong", { className: "text-white", children: [pendingTasksCount, " pending tasks"] }), " and ", _jsxs("strong", { className: "text-white", children: [coursesCount, " active courses"] }), " in your database."] })] }), _jsxs("div", { className: "flex items-center gap-2 relative z-10 w-full sm:w-auto", children: [_jsxs("button", { onClick: () => setActiveTab('notes'), className: "flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "New Note" })] }), _jsxs("button", { onClick: () => setActiveTab('courses'), className: "flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer", children: [_jsx(BookOpen, { className: "w-4 h-4 text-blue-400" }), _jsx("span", { children: "View Courses" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { onClick: () => setActiveTab('courses'), className: "p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer group", children: [_jsxs("div", { className: "flex items-center justify-between text-slate-400", children: [_jsx("span", { className: "text-xs font-mono", children: "ACTIVE COURSES" }), _jsx("div", { className: "p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform", children: _jsx(BookOpen, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "mt-4 flex items-baseline justify-between", children: [_jsxs("span", { className: "text-2xl font-bold text-white", children: [coursesCount, " Course", coursesCount === 1 ? '' : 's'] }), _jsxs("span", { className: "text-xs text-emerald-400 font-semibold flex items-center gap-0.5", children: [attendanceRate, "% Attended"] })] }), _jsx("p", { className: "text-[11px] text-slate-500 mt-1", children: "Real SQLite Database Count" })] }), _jsxs("div", { onClick: () => setActiveTab('tasks'), className: "p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group", children: [_jsxs("div", { className: "flex items-center justify-between text-slate-400", children: [_jsx("span", { className: "text-xs font-mono", children: "PENDING TASKS" }), _jsx("div", { className: "p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform", children: _jsx(CheckSquare, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "mt-4 flex items-baseline justify-between", children: [_jsxs("span", { className: "text-2xl font-bold text-white", children: [pendingTasksCount, " Tasks"] }), urgentTasksCount > 0 && (_jsxs("span", { className: "text-xs text-amber-400 font-semibold", children: [urgentTasksCount, " Urgent"] }))] }), _jsx("p", { className: "text-[11px] text-slate-500 mt-1", children: "Assignments & To-Dos" })] }), _jsxs("div", { onClick: () => setActiveTab('budget'), className: "p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group", children: [_jsxs("div", { className: "flex items-center justify-between text-slate-400", children: [_jsx("span", { className: "text-xs font-mono", children: "TOTAL EXPENSES" }), _jsx("div", { className: "p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform", children: _jsx(Wallet, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "mt-4 flex items-baseline justify-between", children: [_jsxs("span", { className: "text-2xl font-bold text-white", children: ["$", monthlyExpense.toFixed(2)] }), _jsx("span", { className: "text-xs text-emerald-400 font-semibold", children: "Budget Log" })] }), _jsx("p", { className: "text-[11px] text-slate-500 mt-1", children: "Logged Expenses" })] }), _jsxs("div", { onClick: () => setActiveTab('university'), className: "p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group", children: [_jsxs("div", { className: "flex items-center justify-between text-slate-400", children: [_jsx("span", { className: "text-xs font-mono", children: "TARGET CGPA" }), _jsx("div", { className: "p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform", children: _jsx(Award, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "mt-4 flex items-baseline justify-between", children: [_jsxs("span", { className: "text-2xl font-bold text-white", children: [targetCgpa.toFixed(2), " / 4.0"] }), _jsx("span", { className: "text-xs text-purple-400 font-semibold", children: "BS-IT" })] }), _jsxs("p", { className: "text-[11px] text-slate-500 mt-1", children: [earnedCredits, " Earned Credits"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "p-6 rounded-2xl bg-slate-900 border border-slate-800", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-sm font-bold text-white flex items-center gap-2", children: [_jsx(CalendarIcon, { className: "w-4 h-4 text-blue-400" }), _jsx("span", { children: "Class Timetable & Events" })] }), _jsxs("button", { onClick: () => setActiveTab('calendar'), className: "text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer", children: [_jsx("span", { children: "Full Calendar" }), _jsx(ChevronRight, { className: "w-3.5 h-3.5" })] })] }), _jsx("div", { className: "space-y-3", children: todayEvents.length === 0 ? (_jsx("div", { className: "p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500", children: "No upcoming classes or events scheduled. Use Calendar tab to add timetable slots." })) : (todayEvents.slice(0, 3).map(evt => (_jsxs("div", { className: "p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs", children: new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-semibold text-white", children: evt.title }), _jsxs("p", { className: "text-[11px] text-slate-400 mt-0.5", children: [evt.location || 'University Room', " ", evt.course ? `• ${evt.course.code}` : ''] })] })] }), _jsx("span", { className: "px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold", children: evt.eventType })] }, evt.id)))) })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { onClick: () => setActiveTab('notes'), className: "p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-3", children: [_jsx("div", { className: "p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400", children: _jsx(FileText, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-bold text-white", children: "Notes Hub" }), _jsx("p", { className: "text-[10px] text-slate-400", children: "Rich Markdown Notes" })] })] }), _jsxs("div", { onClick: () => setActiveTab('code'), className: "p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-3", children: [_jsx("div", { className: "p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400", children: _jsx(Code2, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-bold text-white", children: "Code Repo" }), _jsx("p", { className: "text-[10px] text-slate-400", children: "Syntax Snippets" })] })] }), _jsxs("div", { onClick: () => setActiveTab('university'), className: "p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-3", children: [_jsx("div", { className: "p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400", children: _jsx(GraduationCap, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-bold text-white", children: "BS-IT Profile" }), _jsx("p", { className: "text-[10px] text-slate-400", children: "Credits & CGPA" })] })] })] })] }), _jsxs("div", { className: "p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-sm font-bold text-white flex items-center gap-2", children: [_jsx(CheckSquare, { className: "w-4 h-4 text-amber-400" }), _jsx("span", { children: "Real Task Checklist" })] }), _jsx("button", { onClick: () => setActiveTab('tasks'), className: "text-xs text-amber-400 hover:underline font-semibold cursor-pointer", children: "View All" })] }), _jsx("div", { className: "space-y-2.5", children: realTasks.length === 0 ? (_jsx("div", { className: "p-6 text-center text-xs text-slate-500", children: "No tasks logged yet. Go to Tasks tab to create a task!" })) : (realTasks.map(task => {
                                    const isDone = task.status === 'COMPLETED';
                                    return (_jsxs("div", { onClick: () => toggleTask(task.id, task.status), className: `p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${isDone
                                            ? 'bg-slate-950/40 border-slate-800/40 opacity-50 line-through'
                                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`, children: [_jsx("input", { type: "checkbox", checked: isDone, onChange: () => toggleTask(task.id, task.status), className: "mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900 cursor-pointer" }), _jsxs("div", { className: "flex-1 text-left", children: [_jsx("p", { className: "text-xs font-medium text-slate-200 leading-tight", children: task.title }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx("span", { className: "text-[10px] text-slate-500", children: task.course ? task.course.code : 'General' }), task.priority === 'URGENT' && (_jsx("span", { className: "px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 text-[9px] font-bold", children: "URGENT" }))] })] })] }, task.id));
                                })) })] })] })] }));
}
