import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, BookOpen, Trash2, Edit3, X, AlertCircle, Bell } from 'lucide-react';
export default function CalendarPage() {
    const { token } = useAuth();
    const [events, setEvents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Month Navigation State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
    // Modal & Alarm State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({
        id: '',
        title: '',
        eventType: 'EXAM',
        startTime: new Date().toISOString().slice(0, 16),
        endTime: new Date().toISOString().slice(0, 16),
        location: '',
        description: '',
        courseId: '',
        hasAlarm: true
    });
    // Fetch Courses & Calendar Events
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
            // Fetch Events
            let eventUrl = 'http://192.168.10.180:4000/api/v1/calendar/events';
            if (selectedTypeFilter !== 'ALL') {
                eventUrl += `?eventType=${selectedTypeFilter}`;
            }
            const eventRes = await fetch(eventUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const eData = await eventRes.json();
            if (eventRes.ok) {
                setEvents(eData.events || []);
            }
            else {
                setError(eData.error || 'Failed to fetch calendar events');
            }
        }
        catch {
            setError('Cannot connect to Express backend on http://192.168.10.180:4000');
        }
        finally {
            setLoading(false);
        }
    }, [token, selectedTypeFilter]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    // Month Grid Calculations
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };
    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };
    // Open Add/Edit Modal
    const openModal = (evt) => {
        if (evt) {
            setForm({
                id: evt.id,
                title: evt.title,
                eventType: evt.eventType,
                startTime: new Date(evt.startTime).toISOString().slice(0, 16),
                endTime: new Date(evt.endTime).toISOString().slice(0, 16),
                location: evt.location || '',
                description: evt.description || '',
                courseId: evt.courseId || '',
                hasAlarm: evt.hasAlarm !== false
            });
        }
        else {
            const defaultDate = new Date(year, month, selectedDay, 10, 0);
            setForm({
                id: '',
                title: '',
                eventType: 'EXAM',
                startTime: defaultDate.toISOString().slice(0, 16),
                endTime: new Date(defaultDate.getTime() + 3600000).toISOString().slice(0, 16),
                location: '',
                description: '',
                courseId: courses[0]?.id || '',
                hasAlarm: true
            });
        }
        setIsModalOpen(true);
    };
    // Save Event
    const handleSaveEvent = async (e) => {
        e.preventDefault();
        if (!token)
            return;
        const isEdit = Boolean(form.id);
        const url = isEdit
            ? `http://192.168.10.180:4000/api/v1/calendar/events/${form.id}`
            : 'http://192.168.10.180:4000/api/v1/calendar/events';
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
                alert(`Error: ${data.error || 'Failed to save event'}`);
            }
        }
        catch {
            alert('Cannot connect to backend');
        }
    };
    // Delete Event
    const handleDeleteEvent = async (id, e) => {
        if (e)
            e.stopPropagation();
        if (!confirm('Are you sure you want to delete this event?'))
            return;
        try {
            const res = await fetch(`http://192.168.10.180:4000/api/v1/calendar/events/${id}`, {
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
    // Helper for Event Badge Color
    const getEventBadgeStyle = (type) => {
        switch (type) {
            case 'EXAM': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            case 'DEADLINE': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'CLASS': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'HOLIDAY': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            default: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        }
    };
    // Get Events for Selected Day
    const selectedDayEvents = events.filter(evt => {
        const eDate = new Date(evt.startTime);
        return eDate.getDate() === selectedDay &&
            eDate.getMonth() === month &&
            eDate.getFullYear() === year;
    });
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8 select-none", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CalendarIcon, { className: "w-6 h-6 text-blue-400" }), _jsx("h1", { className: "text-2xl font-extrabold text-white tracking-tight", children: "Calendar & Timetable Planner" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Organize class timetables, exam countdown schedules, assignment deadlines, and personal study sessions." })] }), _jsxs("button", { onClick: () => openModal(), className: "px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Add Event" })] })] }), error && (_jsxs("div", { className: "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400", children: [_jsx(AlertCircle, { className: "w-5 h-5 shrink-0" }), _jsx("span", { children: error })] })), _jsxs("div", { className: "p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: handlePrevMonth, className: "p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer", children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), _jsxs("h2", { className: "text-base font-bold text-white font-mono min-w-44 text-center", children: [monthNames[month], " ", year] }), _jsx("button", { onClick: handleNextMonth, className: "p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer", children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "flex flex-wrap gap-2 text-xs font-medium", children: ['ALL', 'EXAM', 'DEADLINE', 'CLASS', 'HOLIDAY', 'PERSONAL'].map(type => (_jsx("button", { onClick: () => setSelectedTypeFilter(type), className: `px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${selectedTypeFilter === type
                                ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`, children: type }, type))) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-7 text-center text-xs font-mono font-bold text-slate-500 pb-2 border-b border-slate-800", children: [_jsx("span", { children: "SUN" }), _jsx("span", { children: "MON" }), _jsx("span", { children: "TUE" }), _jsx("span", { children: "WED" }), _jsx("span", { children: "THU" }), _jsx("span", { children: "FRI" }), _jsx("span", { children: "SAT" })] }), _jsxs("div", { className: "grid grid-cols-7 gap-2", children: [Array.from({ length: firstDayOfWeek }).map((_, idx) => (_jsx("div", { className: "h-24 rounded-2xl bg-slate-950/20 opacity-30 border border-transparent" }, `empty-${idx}`))), Array.from({ length: daysInMonth }).map((_, idx) => {
                                        const dayNum = idx + 1;
                                        const isSelected = selectedDay === dayNum;
                                        const isToday = dayNum === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                                        const dayEvents = events.filter(evt => {
                                            const eDate = new Date(evt.startTime);
                                            return eDate.getDate() === dayNum && eDate.getMonth() === month && eDate.getFullYear() === year;
                                        });
                                        return (_jsxs("div", { onClick: () => setSelectedDay(dayNum), className: `h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${isSelected
                                                ? 'bg-blue-600/10 border-blue-500 shadow-lg'
                                                : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: `w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${isToday ? 'bg-blue-600 text-white' : isSelected ? 'text-blue-400' : 'text-slate-300'}`, children: dayNum }), dayEvents.length > 0 && (_jsx("span", { className: "w-2 h-2 rounded-full bg-amber-400" }))] }), _jsxs("div", { className: "space-y-1 overflow-hidden", children: [dayEvents.slice(0, 2).map(e => (_jsx("div", { className: `text-[9px] font-bold px-1.5 py-0.5 rounded border truncate ${getEventBadgeStyle(e.eventType)}`, children: e.title }, e.id))), dayEvents.length > 2 && (_jsxs("div", { className: "text-[9px] text-slate-500 font-mono font-bold text-right", children: ["+", dayEvents.length - 2, " more"] }))] })] }, dayNum));
                                    })] })] }), _jsx("div", { className: "p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-left flex flex-col justify-between", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-sm font-bold text-white", children: ["Events for ", monthNames[month], " ", selectedDay] }), _jsxs("p", { className: "text-[11px] text-slate-400 font-mono mt-0.5", children: [selectedDayEvents.length, " Event(s) Scheduled"] })] }), _jsx("button", { onClick: () => openModal(), className: "p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer", title: "Add Event on this day", children: _jsx(Plus, { className: "w-4 h-4" }) })] }), loading ? (_jsx("div", { className: "p-8 text-center text-xs text-slate-500", children: "Loading events..." })) : selectedDayEvents.length === 0 ? (_jsxs("div", { className: "p-8 text-center text-xs text-slate-500 space-y-2", children: [_jsx(CalendarIcon, { className: "w-8 h-8 mx-auto text-slate-700" }), _jsx("p", { children: "No events scheduled for this day." })] })) : (_jsx("div", { className: "space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar", children: selectedDayEvents.map(evt => (_jsxs("div", { className: "p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative group", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getEventBadgeStyle(evt.eventType)}`, children: evt.eventType }), _jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("button", { onClick: () => openModal(evt), className: "p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white", children: _jsx(Edit3, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: (e) => handleDeleteEvent(evt.id, e), className: "p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] })] }), _jsxs("h4", { className: "text-xs font-bold text-white flex items-center justify-between", children: [_jsx("span", { children: evt.title }), evt.hasAlarm !== false && (_jsx("span", { className: "text-[10px] text-rose-400 flex items-center gap-1", children: _jsx(Bell, { className: "w-3 h-3 text-rose-400" }) }))] }), _jsxs("div", { className: "space-y-1 text-[11px] text-slate-400 font-mono", children: [_jsxs("p", { className: "flex items-center gap-1.5", children: [_jsx(Clock, { className: "w-3 h-3 text-slate-500" }), _jsx("span", { children: new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] }), evt.location && (_jsxs("p", { className: "flex items-center gap-1.5", children: [_jsx(MapPin, { className: "w-3 h-3 text-slate-500" }), _jsx("span", { children: evt.location })] })), evt.course && (_jsxs("p", { className: "flex items-center gap-1.5 text-blue-400 font-bold", children: [_jsx(BookOpen, { className: "w-3 h-3" }), _jsxs("span", { children: [evt.course.code, " - ", evt.course.name] })] }))] }), evt.description && (_jsx("p", { className: "text-[11px] text-slate-400 pt-1 border-t border-slate-900 leading-relaxed", children: evt.description }))] }, evt.id))) }))] }) })] }), isModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(CalendarIcon, { className: "w-5 h-5 text-blue-400" }), _jsx("span", { children: form.id ? 'Edit Event' : 'Add Calendar Event' })] }), _jsx("button", { onClick: () => setIsModalOpen(false), className: "p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("form", { onSubmit: handleSaveEvent, className: "space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Event Title *" }), _jsx("input", { type: "text", required: true, placeholder: "DBMS Midterm Exam / OS Lab Deadline", value: form.title, onChange: (e) => setForm({ ...form, title: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Event Type *" }), _jsxs("select", { value: form.eventType, onChange: (e) => setForm({ ...form, eventType: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500", children: [_jsx("option", { value: "EXAM", children: "Exam \uD83D\uDD34" }), _jsx("option", { value: "DEADLINE", children: "Deadline \uD83D\uDFE1" }), _jsx("option", { value: "CLASS", children: "Class \uD83D\uDD35" }), _jsx("option", { value: "HOLIDAY", children: "Holiday \uD83D\uDFE2" }), _jsx("option", { value: "PERSONAL", children: "Personal \uD83D\uDFE3" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Linked Course" }), _jsxs("select", { value: form.courseId, onChange: (e) => setForm({ ...form, courseId: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500", children: [_jsx("option", { value: "", children: "None (Personal)" }), courses.map(c => (_jsxs("option", { value: c.id, children: [c.code, " - ", c.name] }, c.id)))] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Start Time *" }), _jsx("input", { type: "datetime-local", required: true, value: form.startTime, onChange: (e) => setForm({ ...form, startTime: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "End Time" }), _jsx("input", { type: "datetime-local", value: form.endTime, onChange: (e) => setForm({ ...form, endTime: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" })] })] }), _jsxs("div", { className: "flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800", children: [_jsx("input", { type: "checkbox", id: "formHasAlarm", checked: form.hasAlarm, onChange: (e) => setForm({ ...form, hasAlarm: e.target.checked }), className: "rounded border-slate-700 text-rose-500 focus:ring-0 bg-slate-900 cursor-pointer" }), _jsxs("label", { htmlFor: "formHasAlarm", className: "text-xs font-semibold text-rose-400 cursor-pointer flex items-center gap-1.5", children: [_jsx(Bell, { className: "w-3.5 h-3.5 text-rose-400" }), _jsx("span", { children: "Set Audio Bell Alarm Reminder for this Event" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Location / Room Number" }), _jsx("input", { type: "text", placeholder: "Exam Hall 1 / Room 204", value: form.location, onChange: (e) => setForm({ ...form, location: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Description (Optional)" }), _jsx("textarea", { rows: 2, placeholder: "Additional notes for this event...", value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setIsModalOpen(false), className: "flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer", children: "Cancel" }), _jsx("button", { type: "submit", className: "flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 cursor-pointer", children: form.id ? 'Update Event' : 'Save Event' })] })] })] }) }))] }));
}
