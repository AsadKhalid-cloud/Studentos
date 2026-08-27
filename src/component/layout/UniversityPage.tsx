import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  Building, 
  BookOpen, 
  Award, 
  Check, 
  Edit3, 
  X, 
  AlertCircle,
  Calculator,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface ProfileData {
  id: string;
  universityName: string;
  department: string;
  degreeProgram: string;
  section: string;
  rollNumber: string;
  studentId: string;
  batch: string;
  academicSession: string;
  academicAdvisor: string;
  totalRequiredCredits: number;
  earnedCredits: number;
  targetCgpa: number;
}

interface CourseItem {
  id: string;
  code: string;
  name: string;
  creditHours: number;
}

// Letter Grade Points Mapping (Standard University Scale)
const GRADE_POINTS: Record<string, number> = {
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
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Simulated Letter Grades per Course State
  const [simulatedGrades, setSimulatedGrades] = useState<Record<string, number>>({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
    if (!token) return;
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
        const initialGrades: Record<string, number> = {};
        activeList.forEach((c: CourseItem) => {
          initialGrades[c.id] = 4.0;
        });
        setSimulatedGrades(initialGrades);
      }
    } catch {
      setError('Cannot connect to Express backend on http://192.168.10.180:4000');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-Time CGPA Simulation Calculation
  const calculateSimulatedGpa = () => {
    if (courses.length === 0) return { semesterGpa: 0, newCumulativeCgpa: profile?.targetCgpa || 4.0 };

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
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

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
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Failed to update profile'}`);
      }
    } catch {
      alert('Cannot connect to backend');
    }
  };

  const progressPercent = profile ? Math.round((profile.earnedCredits / profile.totalRequiredCredits) * 100) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">University Profile & CGPA Simulator</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            BS-IT Academic Identity, Student ID, Credit Hours Tracker, and Interactive Semester Grade Simulator.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Academic Profile</span>
        </button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-400">
          <Check className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STUDENT ACADEMIC IDENTITY CARD */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading university profile...</div>
      ) : profile && (
        <div className="space-y-6">
          {/* Main ID Badge Banner */}
          <div className="p-8 rounded-3xl bg-linear-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-xl shrink-0">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold text-white">{user?.username}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-mono text-[10px] font-bold">
                    {profile.section || 'BSIT'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-400" />
                  {profile.universityName} • {profile.department}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Roll No: <span className="text-white font-bold">{profile.rollNumber || 'N/A'}</span> | Student ID: <span className="text-white font-bold">{profile.studentId || 'N/A'}</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center font-mono w-full md:w-auto">
              <span className="text-[10px] text-slate-500 block">CURRENT SESSION</span>
              <span className="text-sm font-bold text-emerald-400">{profile.academicSession || 'Fall 2026'}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Batch: {profile.batch || '2023-2027'}</span>
            </div>
          </div>

          {/* DEGREE CREDIT HOURS GRADUATION PROGRESS BAR */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                <span>BS-IT Graduation Progress Bar</span>
              </h3>
              <span className="text-xs font-mono font-bold text-blue-400">
                {profile.earnedCredits} / {profile.totalRequiredCredits} Earned Credits ({progressPercent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div 
                className="h-full bg-linear-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 shadow-lg shadow-blue-500/50"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Required Credits</span>
                <span className="font-bold text-white font-mono text-sm">{profile.totalRequiredCredits} Credits</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Earned Credits</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">{profile.earnedCredits} Credits</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Remaining Credits</span>
                <span className="font-bold text-amber-400 font-mono text-sm">
                  {Math.max(0, profile.totalRequiredCredits - profile.earnedCredits)} Credits
                </span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE CGPA SEMESTER SIMULATOR WIDGET */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-400" />
                  <span>Interactive Semester CGPA Simulator</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select target letter grades for your active courses to simulate your predicted semester GPA & Cumulative CGPA.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 font-mono text-xs">
                <span className="text-slate-400">Predicted Semester GPA:</span>
                <span className="font-extrabold text-purple-400 text-sm">{simulation.semesterGpa.toFixed(2)} / 4.00</span>
              </div>
            </div>

            {/* Courses Letter Grade Selector Grid */}
            {courses.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No active courses found. Go to Courses tab to add courses for grade simulation.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {courses.map(course => (
                    <div key={course.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{course.code}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{course.creditHours} Credit Hrs</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{course.name}</p>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono mb-1">Target Letter Grade:</label>
                        <select
                          value={Object.keys(GRADE_POINTS).find(key => GRADE_POINTS[key] === (simulatedGrades[course.id] ?? 4.0)) || 'A (4.0)'}
                          onChange={(e) => setSimulatedGrades({ ...simulatedGrades, [course.id]: GRADE_POINTS[e.target.value] })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                        >
                          {Object.keys(GRADE_POINTS).map(gradeLabel => (
                            <option key={gradeLabel} value={gradeLabel}>{gradeLabel}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulation Prediction Banner */}
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-purple-300">
                    <Sparkles className="w-5 h-5 shrink-0 text-amber-400" />
                    <div>
                      <span className="font-bold text-white block">Predicted Cumulative CGPA Goal</span>
                      <span className="text-[11px] text-slate-400">Based on {simulation.semesterCredits} current semester credit hours + {profile.earnedCredits} previously earned credits.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono bg-slate-950 px-4 py-2 rounded-xl border border-purple-500/30">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-400">Predicted CGPA:</span>
                    <span className="text-base font-extrabold text-emerald-400">{simulation.newCumulativeCgpa.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <span>Edit Academic Profile</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">University Name *</label>
                <input
                  type="text"
                  required
                  value={form.universityName}
                  onChange={(e) => setForm({ ...form, universityName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Department</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Degree Program</label>
                  <input
                    type="text"
                    value={form.degreeProgram}
                    onChange={(e) => setForm({ ...form, degreeProgram: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Roll Number</label>
                  <input
                    type="text"
                    value={form.rollNumber}
                    onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Student ID</label>
                  <input
                    type="text"
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Section</label>
                  <input
                    type="text"
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Batch</label>
                  <input
                    type="text"
                    placeholder="2023-2027"
                    value={form.batch}
                    onChange={(e) => setForm({ ...form, batch: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Academic Session</label>
                  <input
                    type="text"
                    placeholder="Fall 2026"
                    value={form.academicSession}
                    onChange={(e) => setForm({ ...form, academicSession: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Total Required Credits</label>
                  <input
                    type="number"
                    value={form.totalRequiredCredits}
                    onChange={(e) => setForm({ ...form, totalRequiredCredits: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Earned Credits</label>
                  <input
                    type="number"
                    value={form.earnedCredits}
                    onChange={(e) => setForm({ ...form, earnedCredits: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Target CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    max="4.00"
                    value={form.targetCgpa}
                    onChange={(e) => setForm({ ...form, targetCgpa: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Academic Advisor</label>
                <input
                  type="text"
                  placeholder="Prof. Dr. Tariq"
                  value={form.academicAdvisor}
                  onChange={(e) => setForm({ ...form, academicAdvisor: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
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
                  Save Academic Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}