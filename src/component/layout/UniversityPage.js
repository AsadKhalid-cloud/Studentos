import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Building, Award, Check, Edit3, X, AlertCircle, Calculator, Sparkles, TrendingUp } from 'lucide-react';
// Letter Grade Points Mapping (Standard University Scale)
const GRADE_POINTS = {
    'A (4.0)': 4.0,
    'A- (3.7)': 3.7,
    'B+ (3.3)': 3.3,
    'B (3.0)': 3.0,
    'B- (2.7)': 2.7,
    'C+ (2.3)': 2.3,
    'C (2.0)': 2.0,
    'D (1.0)': 1.0,
    'F (0.0)': 0.0
};
export default function UniversityPage() {
    const { token, user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    // Simulated Letter Grades per Course State
    const [simulatedGrades, setSimulatedGrades] = useState({});
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({
        universityName: '',
        department: '',
        degreeProgram: '',
        section: '',
        rollNumber: '',
        studentId: '',
        batch: '',
        academicSession: '',
        academicAdvisor: '',
        totalRequiredCredits: 130,
        earnedCredits: 64,
        targetCgpa: 4.00
    });
    // Fetch University Profile & Active Courses
    const fetchData = useCallback(async () => {
        if (!token)
            return;
        try {
            setLoading(true);
            setError(null);
            // Fetch Profile
            const profRes = await fetch('http://192.168.10.180:4000/api/v1/university/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const profData = await profRes.json();
            if (profRes.ok && profData.profile) {
                setProfile(profData.profile);
                setForm({
                    universityName: profData.profile.universityName || 'My University',
                    department: profData.profile.department || 'Department of IT',
                    degreeProgram: profData.profile.degreeProgram || 'BS Information Technology',
                    section: profData.profile.section || 'BSIT-4A',
                    rollNumber: profData.profile.rollNumber || 'BSF24006431',
                    studentId: profData.profile.studentId || 'ST-9042',
                    batch: profData.profile.batch || '2023-2027',
                    academicSession: profData.profile.academicSession || 'Fall 2026',
                    academicAdvisor: profData.profile.academicAdvisor || 'Prof. Dr. Tariq',
                    totalRequiredCredits: profData.profile.totalRequiredCredits || 130,
                    earnedCredits: profData.profile.earnedCredits || 64,
                    targetCgpa: profData.profile.targetCgpa || 4.00
                });
            }
            // Fetch Active Courses for CGPA Simulation
            const courseRes = await fetch('http://192.168.10.180:4000/api/v1/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const cData = await courseRes.json();
            if (courseRes.ok) {
                const activeList = cData.courses || [];
                setCourses(activeList);
                // Initialize default simulated grades (A = 4.0)
                const initialGrades = {};
                activeList.forEach((c) => {
                    initialGrades[c.id] = 4.0;
                });
                setSimulatedGrades(initialGrades);
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
        fetchData();
    }, [fetchData]);
    // Real-Time CGPA Simulation Calculation
    const calculateSimulatedGpa = () => {
        if (courses.length === 0)
            return { semesterGpa: 0, newCumulativeCgpa: profile?.targetCgpa || 4.0 };
        let totalPoints = 0;
        let totalCredits = 0;
        courses.forEach(c => {
            const gradePoint = simulatedGrades[c.id] !== undefined ? simulatedGrades[c.id] : 4.0;
            totalPoints += gradePoint * c.creditHours;
            totalCredits += c.creditHours;
        });
        const semesterGpa = totalCredits > 0 ? (totalPoints / totalCredits) : 4.0;
        // Calculate New Cumulative CGPA
        const currentEarnedCredits = profile?.earnedCredits || 64;
        const currentCgpa = profile?.targetCgpa || 3.85;
        const previousTotalPoints = currentEarnedCredits * currentCgpa;
        const newTotalPoints = previousTotalPoints + totalPoints;
        const newTotalCredits = currentEarnedCredits + totalCredits;
        const newCumulativeCgpa = newTotalCredits > 0 ? (newTotalPoints / newTotalCredits) : currentCgpa;
        return {
            semesterGpa: Math.min(4.0, Math.max(0, semesterGpa)),
            newCumulativeCgpa: Math.min(4.0, Math.max(0, newCumulativeCgpa)),
            semesterCredits: totalCredits
        };
    };
    const simulation = calculateSimulatedGpa();
    // Save Profile Changes
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!token)
            return;
        try {
            const res = await fetch('http://192.168.10.180:4000/api/v1/university/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setSuccessMessage('University Academic Profile updated successfully!');
                fetchData();
                setTimeout(() => setSuccessMessage(null), 4000);
            }
            else {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to update profile'}`);
            }
        }
        catch {
            alert('Cannot connect to backend');
        }
    };
    const progressPercent = profile ? Math.round((profile.earnedCredits / profile.totalRequiredCredits) * 100) : 0;
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8 select-none text-left", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(GraduationCap, { className: "w-6 h-6 text-blue-400" }), _jsx("h1", { className: "text-2xl font-extrabold text-white tracking-tight", children: "University Profile & CGPA Simulator" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "BS-IT Academic Identity, Student ID, Credit Hours Tracker, and Interactive Semester Grade Simulator." })] }), _jsxs("button", { onClick: () => setIsModalOpen(true), className: "px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer", children: [_jsx(Edit3, { className: "w-4 h-4" }), _jsx("span", { children: "Edit Academic Profile" })] })] }), successMessage && (_jsxs("div", { className: "p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-400", children: [_jsx(Check, { className: "w-5 h-5 shrink-0" }), _jsx("span", { className: "font-semibold", children: successMessage })] })), error && (_jsxs("div", { className: "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400", children: [_jsx(AlertCircle, { className: "w-5 h-5 shrink-0" }), _jsx("span", { children: error })] })), loading ? (_jsx("div", { className: "p-12 text-center text-xs text-slate-500", children: "Loading university profile..." })) : profile && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "p-8 rounded-3xl bg-linear-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6", children: [_jsxs("div", { className: "flex items-center gap-5", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-xl shrink-0", children: user?.username.charAt(0).toUpperCase() }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h2", { className: "text-2xl font-extrabold text-white", children: user?.username }), _jsx("span", { className: "px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-mono text-[10px] font-bold", children: profile.section || 'BSIT' })] }), _jsxs("p", { className: "text-xs text-slate-300 font-medium flex items-center gap-1.5", children: [_jsx(Building, { className: "w-3.5 h-3.5 text-blue-400" }), profile.universityName, " \u2022 ", profile.department] }), _jsxs("p", { className: "text-[11px] text-slate-400 font-mono", children: ["Roll No: ", _jsx("span", { className: "text-white font-bold", children: profile.rollNumber || 'N/A' }), " | Student ID: ", _jsx("span", { className: "text-white font-bold", children: profile.studentId || 'N/A' })] })] })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center font-mono w-full md:w-auto", children: [_jsx("span", { className: "text-[10px] text-slate-500 block", children: "CURRENT SESSION" }), _jsx("span", { className: "text-sm font-bold text-emerald-400", children: profile.academicSession || 'Fall 2026' }), _jsxs("span", { className: "text-[10px] text-slate-400 block mt-0.5", children: ["Batch: ", profile.batch || '2023-2027'] })] })] }), _jsxs("div", { className: "p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-sm font-bold text-white flex items-center gap-2", children: [_jsx(Award, { className: "w-5 h-5 text-blue-400" }), _jsx("span", { children: "BS-IT Graduation Progress Bar" })] }), _jsxs("span", { className: "text-xs font-mono font-bold text-blue-400", children: [profile.earnedCredits, " / ", profile.totalRequiredCredits, " Earned Credits (", progressPercent, "%)"] })] }), _jsx("div", { className: "w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800", children: _jsx("div", { className: "h-full bg-linear-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 shadow-lg shadow-blue-500/50", style: { width: `${progressPercent}%` } }) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2", children: [_jsxs("div", { className: "p-3 rounded-xl bg-slate-950 border border-slate-800", children: [_jsx("span", { className: "text-slate-500 block", children: "Required Credits" }), _jsxs("span", { className: "font-bold text-white font-mono text-sm", children: [profile.totalRequiredCredits, " Credits"] })] }), _jsxs("div", { className: "p-3 rounded-xl bg-slate-950 border border-slate-800", children: [_jsx("span", { className: "text-slate-500 block", children: "Earned Credits" }), _jsxs("span", { className: "font-bold text-emerald-400 font-mono text-sm", children: [profile.earnedCredits, " Credits"] })] }), _jsxs("div", { className: "p-3 rounded-xl bg-slate-950 border border-slate-800", children: [_jsx("span", { className: "text-slate-500 block", children: "Remaining Credits" }), _jsxs("span", { className: "font-bold text-amber-400 font-mono text-sm", children: [Math.max(0, profile.totalRequiredCredits - profile.earnedCredits), " Credits"] })] })] })] }), _jsxs("div", { className: "p-6 rounded-3xl bg-slate-900 border border-purple-500/30 space-y-6 shadow-2xl", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(Calculator, { className: "w-5 h-5 text-purple-400" }), _jsx("span", { children: "Interactive Semester CGPA Simulator" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "Select target letter grades for your active courses to simulate your predicted semester GPA & Cumulative CGPA." })] }), _jsxs("div", { className: "flex items-center gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 font-mono text-xs", children: [_jsx("span", { className: "text-slate-400", children: "Predicted Semester GPA:" }), _jsxs("span", { className: "font-extrabold text-purple-400 text-sm", children: [simulation.semesterGpa.toFixed(2), " / 4.00"] })] })] }), courses.length === 0 ? (_jsx("div", { className: "p-6 text-center text-xs text-slate-500", children: "No active courses found. Go to Courses tab to add courses for grade simulation." })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: courses.map(course => (_jsxs("div", { className: "p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-bold text-white", children: course.code }), _jsxs("span", { className: "text-[10px] text-slate-500 font-mono", children: [course.creditHours, " Credit Hrs"] })] }), _jsx("p", { className: "text-[11px] text-slate-400 truncate", children: course.name }), _jsxs("div", { children: [_jsx("label", { className: "block text-[10px] text-slate-500 font-mono mb-1", children: "Target Letter Grade:" }), _jsx("select", { value: Object.keys(GRADE_POINTS).find(key => GRADE_POINTS[key] === (simulatedGrades[course.id] ?? 4.0)) || 'A (4.0)', onChange: (e) => setSimulatedGrades({ ...simulatedGrades, [course.id]: GRADE_POINTS[e.target.value] }), className: "w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500", children: Object.keys(GRADE_POINTS).map(gradeLabel => (_jsx("option", { value: gradeLabel, children: gradeLabel }, gradeLabel))) })] })] }, course.id))) }), _jsxs("div", { className: "p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs", children: [_jsxs("div", { className: "flex items-center gap-2 text-purple-300", children: [_jsx(Sparkles, { className: "w-5 h-5 shrink-0 text-amber-400" }), _jsxs("div", { children: [_jsx("span", { className: "font-bold text-white block", children: "Predicted Cumulative CGPA Goal" }), _jsxs("span", { className: "text-[11px] text-slate-400", children: ["Based on ", simulation.semesterCredits, " current semester credit hours + ", profile.earnedCredits, " previously earned credits."] })] })] }), _jsxs("div", { className: "flex items-center gap-2 font-mono bg-slate-950 px-4 py-2 rounded-xl border border-purple-500/30", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-emerald-400" }), _jsx("span", { className: "text-slate-400", children: "Predicted CGPA:" }), _jsx("span", { className: "text-base font-extrabold text-emerald-400", children: simulation.newCumulativeCgpa.toFixed(2) })] })] })] }))] })] })), isModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(GraduationCap, { className: "w-5 h-5 text-blue-400" }), _jsx("span", { children: "Edit Academic Profile" })] }), _jsx("button", { onClick: () => setIsModalOpen(false), className: "p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("form", { onSubmit: handleSaveProfile, className: "space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "University Name *" }), _jsx("input", { type: "text", required: true, value: form.universityName, onChange: (e) => setForm({ ...form, universityName: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Department" }), _jsx("input", { type: "text", value: form.department, onChange: (e) => setForm({ ...form, department: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Degree Program" }), _jsx("input", { type: "text", value: form.degreeProgram, onChange: (e) => setForm({ ...form, degreeProgram: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Roll Number" }), _jsx("input", { type: "text", value: form.rollNumber, onChange: (e) => setForm({ ...form, rollNumber: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Student ID" }), _jsx("input", { type: "text", value: form.studentId, onChange: (e) => setForm({ ...form, studentId: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Section" }), _jsx("input", { type: "text", value: form.section, onChange: (e) => setForm({ ...form, section: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Batch" }), _jsx("input", { type: "text", placeholder: "2023-2027", value: form.batch, onChange: (e) => setForm({ ...form, batch: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Academic Session" }), _jsx("input", { type: "text", placeholder: "Fall 2026", value: form.academicSession, onChange: (e) => setForm({ ...form, academicSession: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Total Required Credits" }), _jsx("input", { type: "number", value: form.totalRequiredCredits, onChange: (e) => setForm({ ...form, totalRequiredCredits: Number(e.target.value) }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Earned Credits" }), _jsx("input", { type: "number", value: form.earnedCredits, onChange: (e) => setForm({ ...form, earnedCredits: Number(e.target.value) }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Target CGPA" }), _jsx("input", { type: "number", step: "0.01", max: "4.00", value: form.targetCgpa, onChange: (e) => setForm({ ...form, targetCgpa: Number(e.target.value) }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Academic Advisor" }), _jsx("input", { type: "text", placeholder: "Prof. Dr. Tariq", value: form.academicAdvisor, onChange: (e) => setForm({ ...form, academicAdvisor: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setIsModalOpen(false), className: "flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer", children: "Cancel" }), _jsx("button", { type: "submit", className: "flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 cursor-pointer", children: "Save Academic Profile" })] })] })] }) }))] }));
}
