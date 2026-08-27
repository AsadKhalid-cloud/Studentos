import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Plus, User, MapPin, Award, CheckCircle2, XCircle, AlertTriangle, Trash2, Edit3, Calendar, X, AlertCircle, Clock, Sparkles } from 'lucide-react';
export default function CoursesPage() {
    const { token } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Modal States
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    // Course Form State
    const [courseForm, setCourseForm] = useState({
        id: '',
        code: '',
        name: '',
        instructor: '',
        classroom: '',
        creditHours: 3,
        color: '#3B82F6',
        status: 'ACTIVE'
    });
    // Attendance Form State
    const [attendanceForm, setAttendanceForm] = useState({
        status: 'PRESENT',
        remarks: ''
    });
    // Fetch Courses from Express Backend
    const fetchCourses = useCallback(async () => {
        if (!token)
            return;
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('http://192.168.10.180:4000/api/v1/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setCourses(data.courses || []);
            }
            else {
                setError(data.error || 'Failed to fetch courses');
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
        fetchCourses();
    }, [fetchCourses]);
    // Bunk Predictor Calculation Helper
    const getBunkPrediction = (present, total) => {
        if (total === 0)
            return { status: 'SAFE', message: 'No classes conducted yet' };
        const percent = Math.round((present / total) * 100);
        if (percent >= 75) {
            // How many classes can be bunked while keeping >= 75%
            const safeBunks = Math.floor((present - 0.75 * total) / 0.75);
            return {
                status: 'SAFE',
                safeBunks: Math.max(0, safeBunks),
                message: safeBunks > 0
                    ? `🟢 Safe! You can bunk ${safeBunks} next class(es) & stay above 75%.`
                    : `🟢 Borderline Safe! Do not miss the next class.`
            };
        }
        else {
            // How many consecutive classes must be attended to reach 75%
            const requiredClasses = Math.ceil((0.75 * total - present) / 0.25);
            return {
                status: 'WARNING',
                requiredClasses,
                message: `🔴 Danger! You MUST attend the next ${requiredClasses} consecutive class(es) to reach 75%.`
            };
        }
    };
    // Open Modal to Add / Edit Course
    const openCourseModal = (course) => {
        if (course) {
            setCourseForm({
                id: course.id,
                code: course.code,
                name: course.name,
                instructor: course.instructor || '',
                classroom: course.classroom || '',
                creditHours: course.creditHours,
                color: course.color,
                status: course.status
            });
        }
        else {
            setCourseForm({
                id: '',
                code: '',
                name: '',
                instructor: '',
                classroom: '',
                creditHours: 3,
                color: '#3B82F6',
                status: 'ACTIVE'
            });
        }
        setIsCourseModalOpen(true);
    };
    // Submit Course Form
    const handleSaveCourse = async (e) => {
        e.preventDefault();
        if (!token)
            return;
        const isEdit = Boolean(courseForm.id);
        const url = isEdit
            ? `http://192.168.10.180:4000/api/v1/courses/${courseForm.id}`
            : 'http://192.168.10.180:4000/api/v1/courses';
        const method = isEdit ? 'PUT' : 'POST';
        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(courseForm)
            });
            if (res.ok) {
                setIsCourseModalOpen(false);
                fetchCourses();
            }
            else {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to save course'}`);
            }
        }
        catch {
            alert('Cannot connect to backend');
        }
    };
    // Delete Course
    const handleDeleteCourse = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this course?'))
            return;
        try {
            const res = await fetch(`http://192.168.10.180:4000/api/v1/courses/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchCourses();
            }
        }
        catch {
            // Error
        }
    };
    // Open Attendance Modal
    const openAttendanceModal = (course, e) => {
        e.stopPropagation();
        setSelectedCourse(course);
        setAttendanceForm({ status: 'PRESENT', remarks: '' });
        setIsAttendanceModalOpen(true);
    };
    // Submit Daily Attendance
    const handleSaveAttendance = async (e) => {
        e.preventDefault();
        if (!selectedCourse || !token)
            return;
        try {
            const res = await fetch(`http://192.168.10.180:4000/api/v1/courses/${selectedCourse.id}/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(attendanceForm)
            });
            if (res.ok) {
                setIsAttendanceModalOpen(false);
                fetchCourses();
            }
            else {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to log attendance'}`);
            }
        }
        catch {
            alert('Cannot connect to backend');
        }
    };
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8 select-none text-left", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-6 h-6 text-blue-400" }), _jsx("h1", { className: "text-2xl font-extrabold text-white tracking-tight", children: "Courses & Attendance Bunk Predictor" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Track BS-IT course attendance, predict safe class bunks, and maintain 75% attendance threshold." })] }), _jsxs("button", { onClick: () => openCourseModal(), className: "px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Add Course" })] })] }), error && (_jsxs("div", { className: "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400", children: [_jsx(AlertCircle, { className: "w-5 h-5 shrink-0" }), _jsx("span", { children: error })] })), loading ? (_jsx("div", { className: "p-12 text-center text-xs text-slate-500", children: "Loading courses..." })) : courses.length === 0 ? (_jsxs("div", { className: "p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3", children: [_jsx(BookOpen, { className: "w-12 h-12 mx-auto text-slate-700" }), _jsx("h3", { className: "text-sm font-bold text-white", children: "No Courses Added Yet" }), _jsx("p", { className: "text-xs text-slate-400 max-w-sm mx-auto", children: "Get started by adding your current semester IT subjects like DBMS, OS, Data Structures, or C++." }), _jsxs("button", { onClick: () => openCourseModal(), className: "px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-2", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Add First Course" })] })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: courses.map(course => {
                    const percent = course.attendanceStats.attendancePercent;
                    const isWarning = percent < 75;
                    const bunkData = getBunkPrediction(course.attendanceStats.presentCount, course.attendanceStats.totalClasses);
                    return (_jsxs("div", { className: "p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between relative group", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "px-2.5 py-1 rounded-lg text-xs font-bold font-mono border", style: { backgroundColor: `${course.color}15`, color: course.color, borderColor: `${course.color}40` }, children: course.code }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: (e) => { e.stopPropagation(); openCourseModal(course); }, title: "Edit Course", className: "p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer", children: _jsx(Edit3, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: (e) => handleDeleteCourse(course.id, e), title: "Delete Course", className: "p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] })] }), _jsx("h3", { className: "text-base font-bold text-white line-clamp-1", children: course.name }), _jsxs("div", { className: "space-y-1 text-xs text-slate-400 pt-1", children: [course.instructor && (_jsxs("p", { className: "flex items-center gap-1.5", children: [_jsx(User, { className: "w-3.5 h-3.5 text-slate-500" }), _jsxs("span", { children: ["Prof. ", course.instructor] })] })), course.classroom && (_jsxs("p", { className: "flex items-center gap-1.5", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-slate-500" }), _jsx("span", { children: course.classroom })] })), _jsxs("p", { className: "flex items-center gap-1.5 font-mono text-[11px] text-slate-500", children: [_jsx(Award, { className: "w-3.5 h-3.5 text-slate-600" }), _jsxs("span", { children: [course.creditHours, " Credit Hours"] })] })] })] }), _jsxs("div", { className: "p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 mt-2", children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-slate-400 font-medium", children: "Attendance Rate" }), _jsxs("span", { className: `font-bold font-mono ${isWarning ? 'text-rose-400' : 'text-emerald-400'}`, children: [percent, "%"] })] }), _jsx("div", { className: "w-full h-2 bg-slate-800 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full transition-all ${isWarning ? 'bg-rose-500' : 'bg-emerald-500'}`, style: { width: `${percent}%` } }) }), _jsxs("div", { className: "flex items-center justify-between text-[10px] text-slate-500", children: [_jsxs("span", { children: [course.attendanceStats.presentCount, " / ", course.attendanceStats.totalClasses, " Classes Attended"] }), isWarning ? (_jsxs("span", { className: "text-rose-400 font-semibold flex items-center gap-1", children: [_jsx(AlertTriangle, { className: "w-3 h-3" }), " Below 75%"] })) : (_jsx("span", { className: "text-emerald-400 font-semibold", children: "Safe Status" }))] })] }), _jsx("div", { className: `p-3 rounded-xl border text-[11px] font-medium leading-relaxed ${bunkData.status === 'SAFE'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300 font-semibold'}`, children: _jsxs("div", { className: "flex items-start gap-1.5", children: [_jsx(Sparkles, { className: "w-3.5 h-3.5 shrink-0 mt-0.5" }), _jsx("span", { children: bunkData.message })] }) }), _jsxs("button", { onClick: (e) => openAttendanceModal(course, e), className: "w-full mt-2 py-2.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer", children: [_jsx(Calendar, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Log Attendance" })] })] }, course.id));
                }) })), isCourseModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-5 h-5 text-blue-400" }), _jsx("span", { children: courseForm.id ? 'Edit Course' : 'Add New Course' })] }), _jsx("button", { onClick: () => setIsCourseModalOpen(false), className: "p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("form", { onSubmit: handleSaveCourse, className: "space-y-4 text-xs", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Course Code *" }), _jsx("input", { type: "text", required: true, placeholder: "IT-301", value: courseForm.code, onChange: (e) => setCourseForm({ ...courseForm, code: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Credit Hours" }), _jsx("input", { type: "number", min: "1", max: "6", value: courseForm.creditHours, onChange: (e) => setCourseForm({ ...courseForm, creditHours: Number(e.target.value) }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Course Name *" }), _jsx("input", { type: "text", required: true, placeholder: "Database Management Systems", value: courseForm.name, onChange: (e) => setCourseForm({ ...courseForm, name: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Instructor Name" }), _jsx("input", { type: "text", placeholder: "Dr. Ahmed Khan", value: courseForm.instructor, onChange: (e) => setCourseForm({ ...courseForm, instructor: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Classroom / Lab Location" }), _jsx("input", { type: "text", placeholder: "Lab 3 / Room 204", value: courseForm.classroom, onChange: (e) => setCourseForm({ ...courseForm, classroom: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Card Color Badge" }), _jsx("input", { type: "color", value: courseForm.color, onChange: (e) => setCourseForm({ ...courseForm, color: e.target.value }), className: "w-full h-9 bg-slate-950 border border-slate-800 rounded-xl p-1 cursor-pointer" })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setIsCourseModalOpen(false), className: "flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer", children: "Cancel" }), _jsx("button", { type: "submit", className: "flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 cursor-pointer", children: courseForm.id ? 'Update Course' : 'Create Course' })] })] })] }) })), isAttendanceModalOpen && selectedCourse && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-bold text-white", children: "Log Class Attendance" }), _jsxs("p", { className: "text-[11px] text-blue-400 font-mono mt-0.5", children: [selectedCourse.code, " \u2022 ", selectedCourse.name] })] }), _jsx("button", { onClick: () => setIsAttendanceModalOpen(false), className: "p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("form", { onSubmit: handleSaveAttendance, className: "space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-2 font-medium", children: "Select Attendance Status *" }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsxs("button", { type: "button", onClick: () => setAttendanceForm({ ...attendanceForm, status: 'PRESENT' }), className: `py-2.5 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${attendanceForm.status === 'PRESENT'
                                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`, children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), _jsx("span", { children: "Present" })] }), _jsxs("button", { type: "button", onClick: () => setAttendanceForm({ ...attendanceForm, status: 'ABSENT' }), className: `py-2.5 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${attendanceForm.status === 'ABSENT'
                                                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`, children: [_jsx(XCircle, { className: "w-4 h-4" }), _jsx("span", { children: "Absent" })] }), _jsxs("button", { type: "button", onClick: () => setAttendanceForm({ ...attendanceForm, status: 'LATE' }), className: `py-2.5 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${attendanceForm.status === 'LATE'
                                                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-lg'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`, children: [_jsx(Clock, { className: "w-4 h-4" }), _jsx("span", { children: "Late" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Class Remarks (Optional)" }), _jsx("input", { type: "text", placeholder: "e.g. Lab 3 Quiz Conducted", value: attendanceForm.remarks, onChange: (e) => setAttendanceForm({ ...attendanceForm, remarks: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setIsAttendanceModalOpen(false), className: "flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer", children: "Cancel" }), _jsx("button", { type: "submit", className: "flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 cursor-pointer", children: "Record Log" })] })] })] }) }))] }));
}
