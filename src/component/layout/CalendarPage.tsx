import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  BookOpen, 
  Trash2, 
  Edit3, 
  X, 
  AlertCircle,
  Bell
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  eventType: 'CLASS' | 'EXAM' | 'DEADLINE' | 'HOLIDAY' | 'PERSONAL';
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  hasAlarm?: boolean;
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

export default function CalendarPage() {
  const { token } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Month Navigation State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  // Modal & Alarm State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form, setForm] = useState({
    id: '',
    title: '',
    eventType: 'EXAM' as any,
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date().toISOString().slice(0, 16),
    location: '',
    description: '',
    courseId: '',
    hasAlarm: true
  });

  // Fetch Courses & Calendar Events
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
      } else {
        setError(eData.error || 'Failed to fetch calendar events');
      }
    } catch {
      setError('Cannot connect to Express backend on http://192.168.10.180:4000');
    } finally {
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
  const openModal = (evt?: CalendarEvent) => {
    if (evt) {
      setForm({
        id: evt.id,
        title: evt.title,
        eventType: evt.eventType,
        startTime: new Date(evt.startTime).toISOString().slice(0, 16),
        endTime: new Date(evt.endTime).toISOString().slice(0, 16),
        location: evt.location || '',
        description: evt.description || '',
        courseId: (evt as any).courseId || '',
        hasAlarm: evt.hasAlarm !== false
      });
    } else {
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
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

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
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Failed to save event'}`);
      }
    } catch {
      alert('Cannot connect to backend');
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const res = await fetch(`http://192.168.10.180:4000/api/v1/calendar/events/${id}`, {
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

  // Helper for Event Badge Color
  const getEventBadgeStyle = (type: string) => {
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Calendar & Timetable Planner</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organize class timetables, exam countdown schedules, assignment deadlines, and personal study sessions.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Month Navigation & Type Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Month Switcher */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-bold text-white font-mono min-w-44 text-center">
            {monthNames[month]} {year}
          </h2>
          <button 
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          {['ALL', 'EXAM', 'DEADLINE', 'CLASS', 'HOLIDAY', 'PERSONAL'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                selectedTypeFilter === type
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: 7x5 Month Calendar & Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-xs font-mono font-bold text-slate-500 pb-2 border-b border-slate-800">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Month Days Cells */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-24 rounded-2xl bg-slate-950/20 opacity-30 border border-transparent"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isSelected = selectedDay === dayNum;
              const isToday = dayNum === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

              const dayEvents = events.filter(evt => {
                const eDate = new Date(evt.startTime);
                return eDate.getDate() === dayNum && eDate.getMonth() === month && eDate.getFullYear() === year;
              });

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                    isSelected 
                      ? 'bg-blue-600/10 border-blue-500 shadow-lg' 
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                      isToday ? 'bg-blue-600 text-white' : isSelected ? 'text-blue-400' : 'text-slate-300'
                    }`}>
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map(e => (
                      <div 
                        key={e.id}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border truncate ${getEventBadgeStyle(e.eventType)}`}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-500 font-mono font-bold text-right">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Event Details Inspector */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-left flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Events for {monthNames[month]} {selectedDay}</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedDayEvents.length} Event(s) Scheduled</p>
              </div>
              <button
                onClick={() => openModal()}
                className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                title="Add Event on this day"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading events...</div>
            ) : selectedDayEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-700" />
                <p>No events scheduled for this day.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {selectedDayEvents.map(evt => (
                  <div key={evt.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getEventBadgeStyle(evt.eventType)}`}>
                        {evt.eventType}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal(evt)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteEvent(evt.id, e)}
                          className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{evt.title}</span>
                      {evt.hasAlarm !== false && (
                        <span className="text-[10px] text-rose-400 flex items-center gap-1">
                          <Bell className="w-3 h-3 text-rose-400" />
                        </span>
                      )}
                    </h4>

                    <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                      {evt.location && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{evt.location}</span>
                        </p>
                      )}
                      {evt.course && (
                        <p className="flex items-center gap-1.5 text-blue-400 font-bold">
                          <BookOpen className="w-3 h-3" />
                          <span>{evt.course.code} - {evt.course.name}</span>
                        </p>
                      )}
                    </div>

                    {evt.description && (
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-900 leading-relaxed">
                        {evt.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADD / EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
                <span>{form.id ? 'Edit Event' : 'Add Calendar Event'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="DBMS Midterm Exam / OS Lab Deadline"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Event Type *</label>
                  <select
                    value={form.eventType}
                    onChange={(e) => setForm({ ...form, eventType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="EXAM">Exam 🔴</option>
                    <option value="DEADLINE">Deadline 🟡</option>
                    <option value="CLASS">Class 🔵</option>
                    <option value="HOLIDAY">Holiday 🟢</option>
                    <option value="PERSONAL">Personal 🟣</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Linked Course</label>
                  <select
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">None (Personal)</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">End Time</label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ENABLE ALARM CHECKBOX IN ADD EVENT FORM */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  type="checkbox"
                  id="formHasAlarm"
                  checked={form.hasAlarm}
                  onChange={(e) => setForm({ ...form, hasAlarm: e.target.checked })}
                  className="rounded border-slate-700 text-rose-500 focus:ring-0 bg-slate-900 cursor-pointer"
                />
                <label htmlFor="formHasAlarm" className="text-xs font-semibold text-rose-400 cursor-pointer flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-rose-400" />
                  <span>Set Audio Bell Alarm Reminder for this Event</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Location / Room Number</label>
                <input
                  type="text"
                  placeholder="Exam Hall 1 / Room 204"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional notes for this event..."
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
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  {form.id ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}