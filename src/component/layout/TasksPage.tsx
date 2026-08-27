import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  Tag,
  Filter
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
  isRecurring: boolean;
  recurrencePattern: string;
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

export default function TasksPage() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form, setForm] = useState({
    id: '',
    title: '',
    description: '',
    priority: 'MEDIUM' as any,
    dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    courseId: ''
  });

  // Fetch Courses & Tasks
  const fetchData = useCallback(async () => {
    if (!token) return;
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
      } else {
        setError(tData.error || 'Failed to fetch tasks');
      }
    } catch {
      setError('Cannot connect to Express backend on http://192.168.10.180:4000');
    } finally {
      setLoading(false);
    }
  }, [token, priorityFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Modal
  const openModal = (task?: Task) => {
    if (task) {
      setForm({
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
        courseId: (task as any).courseId || ''
      });
    } else {
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
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

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
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Failed to save task'}`);
      }
    } catch {
      alert('Cannot connect to backend');
    }
  };

  // Shift Task Status (Kanban Column Move)
  const handleMoveStatus = async (id: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'COMPLETED', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;

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
    } catch {
      // Error
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`http://192.168.10.180:4000/api/v1/tasks/${id}`, {
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

  // Helper for Priority Badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'HIGH': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'MEDIUM': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  // Filter Tasks by Search Query
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todoTasks = filteredTasks.filter(t => t.status === 'TODO');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Task & Deadline Manager</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organize assignments, lab tasks, priorities, due dates, and track progress using Kanban columns.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search tasks & assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400">Priority:</span>
          {['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                priorityFilter === p
                  ? 'bg-amber-600 border-amber-500 text-white shadow'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KANBAN BOARD (3 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {/* COLUMN 1: TO-DO */}
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span>To-Do</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 font-mono text-xs font-bold text-slate-400">
              {todoTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {todoTasks.map(task => (
              <div key={task.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(task)} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => handleDeleteTask(task.id, e)} className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white leading-relaxed">{task.title}</h4>
                {task.description && <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>}

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={(e) => handleMoveStatus(task.id, 'IN_PROGRESS', e)}
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Start</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: IN PROGRESS */}
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>In Progress</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 font-mono text-xs font-bold text-amber-400">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {inProgressTasks.map(task => (
              <div key={task.id} className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(task)} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => handleDeleteTask(task.id, e)} className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white leading-relaxed">{task.title}</h4>
                {task.description && <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>}

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <button 
                    onClick={(e) => handleMoveStatus(task.id, 'TODO', e)}
                    className="text-slate-500 hover:text-slate-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>To-Do</span>
                  </button>
                  <button 
                    onClick={(e) => handleMoveStatus(task.id, 'COMPLETED', e)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Done</span>
                    <CheckCircle2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 3: COMPLETED */}
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>Completed</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 font-mono text-xs font-bold text-emerald-400">
              {completedTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {completedTasks.map(task => (
              <div key={task.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 opacity-70 relative group">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    DONE
                  </span>
                  <button onClick={(e) => handleDeleteTask(task.id, e)} className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-xs font-bold text-slate-300 line-through leading-relaxed">{task.title}</h4>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Finished</span>
                  <button 
                    onClick={(e) => handleMoveStatus(task.id, 'IN_PROGRESS', e)}
                    className="text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    Re-open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ADD / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-400" />
                <span>{form.id ? 'Edit Task' : 'Add New Task / Assignment'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="DBMS Assignment 3 Submission"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="LOW">Low 🔵</option>
                    <option value="MEDIUM">Medium 🟡</option>
                    <option value="HIGH">High 🟠</option>
                    <option value="URGENT">Urgent 🔴</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Linked Course</label>
                  <select
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">None (General Task)</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Due Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Assignment requirements, submission link, notes..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-lg shadow-amber-600/20 cursor-pointer"
                >
                  {form.id ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}