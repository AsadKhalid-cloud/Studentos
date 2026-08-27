import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Wallet, 
  Flame, 
  Plus, 
  GraduationCap, 
  FileText, 
  Code2, 
  Award,
  ChevronRight
} from 'lucide-react';
import type { ActiveTab } from './sidebar';

interface DashboardPageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export default function DashboardPage({ setActiveTab }: DashboardPageProps) {
  const { token, user } = useAuth();

  // Real Dynamic Data States
  const [coursesCount, setCoursesCount] = useState<number>(0);
  const [attendanceRate, setAttendanceRate] = useState<number>(100);
  const [pendingTasksCount, setPendingTasksCount] = useState<number>(0);
  const [urgentTasksCount, setUrgentTasksCount] = useState<number>(0);
  const [monthlyExpense, setTotalExpense] = useState<number>(0);
  const [earnedCredits, setEarnedCredits] = useState<number>(64);
  const [targetCgpa, setTargetCgpa] = useState<number>(4.00);
  const [realTasks, setRealTasks] = useState<any[]>([]);
  const [todayEvents, setTodayEvents] = useState<any[]>([]);

  // Fetch Real Live Data from Backend APIs
  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
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
          const totalAtt = courseList.reduce((acc: number, c: any) => acc + (c.attendanceStats?.attendancePercent || 100), 0);
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
        const pending = taskList.filter((t: any) => t.status !== 'COMPLETED');
        const urgent = pending.filter((t: any) => t.priority === 'URGENT');
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
    } catch {
      // Offline fallback
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Dynamic Time Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Toggle Task Checklist
  const toggleTask = async (id: string, currentStatus: string) => {
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
    } catch {
      // Error
    }
  };
  

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none text-left">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-linear-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 shadow-2xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Active Student Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}, {user?.username}! 👋
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Welcome to your StudentOS Operating System. You have <strong className="text-white">{pendingTasksCount} pending tasks</strong> and <strong className="text-white">{coursesCount} active courses</strong> in your database.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2 relative z-10 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('notes')}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>View Courses</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid (100% REAL DYNAMIC DATA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Courses */}
        <div 
          onClick={() => setActiveTab('courses')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">ACTIVE COURSES</span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{coursesCount} Course{coursesCount === 1 ? '' : 's'}</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
              {attendanceRate}% Attended
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Real SQLite Database Count</p>
        </div>

        {/* Card 2: Pending Tasks */}
        <div 
          onClick={() => setActiveTab('tasks')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">PENDING TASKS</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{pendingTasksCount} Tasks</span>
            {urgentTasksCount > 0 && (
              <span className="text-xs text-amber-400 font-semibold">{urgentTasksCount} Urgent</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Assignments & To-Dos</p>
        </div>

        {/* Card 3: Monthly Expenses */}
        <div 
          onClick={() => setActiveTab('budget')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">TOTAL EXPENSES</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">${monthlyExpense.toFixed(2)}</span>
            <span className="text-xs text-emerald-400 font-semibold">Budget Log</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Logged Expenses</p>
        </div>

        {/* Card 4: GPA Tracker */}
        <div 
          onClick={() => setActiveTab('university')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">TARGET CGPA</span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{targetCgpa.toFixed(2)} / 4.0</span>
            <span className="text-xs text-purple-400 font-semibold">BS-IT</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{earnedCredits} Earned Credits</p>
        </div>
      </div>

      {/* Main Grid: Schedule & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Schedule & Quick Hub */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule Widget */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-400" />
                <span>Class Timetable & Events</span>
              </h3>
              <button 
                onClick={() => setActiveTab('calendar')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Full Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {todayEvents.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                  No upcoming classes or events scheduled. Use Calendar tab to add timetable slots.
                </div>
              ) : (
                todayEvents.slice(0, 3).map(evt => (
                  <div key={evt.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs">
                        {new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">{evt.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{evt.location || 'University Room'} {evt.course ? `• ${evt.course.code}` : ''}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold">
                      {evt.eventType}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Hub Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => setActiveTab('notes')}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Notes Hub</h4>
                <p className="text-[10px] text-slate-400">Rich Markdown Notes</p>
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('code')}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Code Repo</h4>
                <p className="text-[10px] text-slate-400">Syntax Snippets</p>
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('university')}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">BS-IT Profile</h4>
                <p className="text-[10px] text-slate-400">Credits & CGPA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Pending Tasks Checklist */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>Real Task Checklist</span>
            </h3>
            <button 
              onClick={() => setActiveTab('tasks')}
              className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {realTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No tasks logged yet. Go to Tasks tab to create a task!
              </div>
            ) : (
              realTasks.map(task => {
                const isDone = task.status === 'COMPLETED';
                return (
                  <div 
                    key={task.id}
                    onClick={() => toggleTask(task.id, task.status)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isDone 
                        ? 'bg-slate-950/40 border-slate-800/40 opacity-50 line-through' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleTask(task.id, task.status)}
                      className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900 cursor-pointer"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-xs font-medium text-slate-200 leading-tight">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500">{task.course ? task.course.code : 'General'}</span>
                        {task.priority === 'URGENT' && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 text-[9px] font-bold">URGENT</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}