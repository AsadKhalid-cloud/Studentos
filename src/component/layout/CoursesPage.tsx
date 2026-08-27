import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  Plus, 
  User, 
  MapPin, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Calendar,
  X,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  classroom: string;
  creditHours: number;
  color: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  attendanceStats: {
    totalClasses: number;
    presentCount: number;
    attendancePercent: number;
  };
  semester?: {
    name: string;
  };
}

export default function CoursesPage() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://192.168.10.180:4000/api/v1/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCourses(data.courses || []);
      } else {
        setError(data.error || 'Failed to fetch courses');
      }
    } catch {
      setError('Cannot connect to Express backend on http://192.168.10.180:4000');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Bunk Predictor Calculation Helper
  const getBunkPrediction = (present: number, total: number) => {
    if (total === 0) return { status: 'SAFE', message: 'No classes conducted yet' };

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
    } else {
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
  const openCourseModal = (course?: Course) => {
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
    } else {
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
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

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
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Failed to save course'}`);
      }
    } catch {
      alert('Cannot connect to backend');
    }
  };

  // Delete Course
  const handleDeleteCourse = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const res = await fetch(`http://192.168.10.180:4000/api/v1/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCourses();
      }
    } catch {
      // Error
    }
  };

  // Open Attendance Modal
  const openAttendanceModal = (course: Course, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCourse(course);
    setAttendanceForm({ status: 'PRESENT', remarks: '' });
    setIsAttendanceModalOpen(true);
  };

  // Submit Daily Attendance
  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !token) return;

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
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Failed to log attendance'}`);
      }
    } catch {
      alert('Cannot connect to backend');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Courses & Attendance Bunk Predictor</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track BS-IT course attendance, predict safe class bunks, and maintain 75% attendance threshold.
          </p>
        </div>

        <button
          onClick={() => openCourseModal()}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Courses Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <BookOpen className="w-12 h-12 mx-auto text-slate-700" />
          <h3 className="text-sm font-bold text-white">No Courses Added Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Get started by adding your current semester IT subjects like DBMS, OS, Data Structures, or C++.
          </p>
          <button
            onClick={() => openCourseModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Course</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => {
            const percent = course.attendanceStats.attendancePercent;
            const isWarning = percent < 75;
            const bunkData = getBunkPrediction(course.attendanceStats.presentCount, course.attendanceStats.totalClasses);

            return (
              <div 
                key={course.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between relative group"
              >
                {/* Course Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono border"
                      style={{ backgroundColor: `${course.color}15`, color: course.color, borderColor: `${course.color}40` }}
                    >
                      {course.code}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openCourseModal(course); }}
                        title="Edit Course"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCourse(course.id, e)}
                        title="Delete Course"
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-1">{course.name}</h3>

                  <div className="space-y-1 text-xs text-slate-400 pt-1">
                    {course.instructor && (
                      <p className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Prof. {course.instructor}</span>
                      </p>
                    )}
                    {course.classroom && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{course.classroom}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                      <Award className="w-3.5 h-3.5 text-slate-600" />
                      <span>{course.creditHours} Credit Hours</span>
                    </p>
                  </div>
                </div>

                {/* Attendance Tracker Bar */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Attendance Rate</span>
                    <span className={`font-bold font-mono ${isWarning ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {percent}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${isWarning ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{course.attendanceStats.presentCount} / {course.attendanceStats.totalClasses} Classes Attended</span>
                    {isWarning ? (
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Below 75%
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Safe Status</span>
                    )}
                  </div>
                </div>

                {/* REAL-TIME BUNK PREDICTOR ALERT BOX */}
                <div className={`p-3 rounded-xl border text-[11px] font-medium leading-relaxed ${
                  bunkData.status === 'SAFE' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300 font-semibold'
                }`}>
                  <div className="flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{bunkData.message}</span>
                  </div>
                </div>

                {/* Bottom Quick Attendance Button */}
                <button
                  onClick={(e) => openAttendanceModal(course, e)}
                  className="w-full mt-2 py-2.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Log Attendance</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT COURSE MODAL */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span>{courseForm.id ? 'Edit Course' : 'Add New Course'}</span>
              </h3>
              <button onClick={() => setIsCourseModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="IT-301"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Credit Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={courseForm.creditHours}
                    onChange={(e) => setCourseForm({ ...courseForm, creditHours: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Database Management Systems"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Instructor Name</label>
                <input
                  type="text"
                  placeholder="Dr. Ahmed Khan"
                  value={courseForm.instructor}
                  onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Classroom / Lab Location</label>
                <input
                  type="text"
                  placeholder="Lab 3 / Room 204"
                  value={courseForm.classroom}
                  onChange={(e) => setCourseForm({ ...courseForm, classroom: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Card Color Badge</label>
                <input
                  type="color"
                  value={courseForm.color}
                  onChange={(e) => setCourseForm({ ...courseForm, color: e.target.value })}
                  className="w-full h-9 bg-slate-950 border border-slate-800 rounded-xl p-1 cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  {courseForm.id ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG DAILY ATTENDANCE MODAL */}
      {isAttendanceModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Log Class Attendance</h3>
                <p className="text-[11px] text-blue-400 font-mono mt-0.5">{selectedCourse.code} • {selectedCourse.name}</p>
              </div>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-2 font-medium">Select Attendance Status *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAttendanceForm({ ...attendanceForm, status: 'PRESENT' })}
                    className={`py-2.5 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                      attendanceForm.status === 'PRESENT'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Present</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttendanceForm({ ...attendanceForm, status: 'ABSENT' })}
                    className={`py-2.5 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                      attendanceForm.status === 'ABSENT'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Absent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttendanceForm({ ...attendanceForm, status: 'LATE' })}
                    className={`py-2.5 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                      attendanceForm.status === 'LATE'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Late</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Class Remarks (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Lab 3 Quiz Conducted"
                  value={attendanceForm.remarks}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, remarks: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  Record Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}