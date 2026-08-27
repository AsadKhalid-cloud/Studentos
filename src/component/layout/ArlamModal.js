import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/component/layout/ArlamModal.tsx
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Bell, Clock, MapPin, CheckCircle, Calendar as CalendarIcon, Volume2 } from 'lucide-react';
import { playAcademicAlarmChime } from '../../backend/utils/audioChime';
import { useAuth } from '../../context/AuthContext';
export const ArlamModal = ({ manualEvent, onCloseManual, onGoToCalendar }) => {
    const auth = useAuth ? useAuth() : { token: null };
    const token = auth?.token || localStorage.getItem('token') || localStorage.getItem('studentos_token');
    const [activeAlarmEvent, setActiveAlarmEvent] = useState(null);
    const [notifiedEventIds, setNotifiedEventIds] = useState([]);
    // Manual Trigger via Prop
    useEffect(() => {
        if (manualEvent) {
            setActiveAlarmEvent(manualEvent);
            playAcademicAlarmChime();
        }
    }, [manualEvent]);
    // Universal Time Parser
    const parseEventDateTime = (evt) => {
        if (!evt)
            return null;
        if (evt.startTime && !isNaN(new Date(evt.startTime).getTime())) {
            return new Date(evt.startTime);
        }
        const dateStr = evt.date || evt.eventDate || evt.createdAt;
        const timeStr = evt.time || evt.startTime || '';
        if (timeStr) {
            const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
            if (match) {
                let hours = parseInt(match[1], 10);
                const minutes = parseInt(match[2], 10);
                const ampm = match[3] ? match[3].toUpperCase() : null;
                if (ampm === 'PM' && hours < 12)
                    hours += 12;
                if (ampm === 'AM' && hours === 12)
                    hours = 0;
                const d = dateStr && !isNaN(new Date(dateStr).getTime()) ? new Date(dateStr) : new Date();
                d.setHours(hours, minutes, 0, 0);
                return d;
            }
        }
        return null;
    };
    // Real-Time Background Event Ticker (Checks every 5 seconds)
    useEffect(() => {
        if (!token)
            return;
        const checkUpcomingEventsAndClassTimes = async () => {
            try {
                let res = await fetch('http://192.168.10.180:4000/api/v1/calendar/events', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) {
                    res = await fetch('http://192.168.10.180:4000/api/v1/calendar', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
                const data = await res.json();
                let eventList = [];
                if (Array.isArray(data)) {
                    eventList = data;
                }
                else if (data && Array.isArray(data.events)) {
                    eventList = data.events;
                }
                else if (data && Array.isArray(data.data)) {
                    eventList = data.data;
                }
                if (eventList.length > 0) {
                    const now = new Date();
                    for (const evt of eventList) {
                        const evtTime = parseEventDateTime(evt);
                        if (evtTime) {
                            const diffInMinutes = (now.getTime() - evtTime.getTime()) / (1000 * 60);
                            if (diffInMinutes >= -2 && diffInMinutes <= 5 && !notifiedEventIds.includes(evt.id)) {
                                setActiveAlarmEvent(evt);
                                setNotifiedEventIds((prev) => [...prev, evt.id]);
                                // Play Chime Bell 🔔
                                playAcademicAlarmChime();
                                break;
                            }
                        }
                    }
                }
            }
            catch (err) {
                // Fallback
            }
        };
        checkUpcomingEventsAndClassTimes();
        const interval = setInterval(checkUpcomingEventsAndClassTimes, 5000);
        return () => clearInterval(interval);
    }, [token, notifiedEventIds]);
    const handleDismiss = () => {
        setActiveAlarmEvent(null);
        if (onCloseManual)
            onCloseManual();
    };
    if (!activeAlarmEvent)
        return null;
    return ReactDOM.createPortal(_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none", children: _jsxs("div", { className: "bg-slate-900 border-2 border-rose-500/80 rounded-2xl w-full max-w-md p-6 shadow-2xl text-left text-slate-100 animate-bounce-once relative overflow-hidden", children: [_jsx("div", { className: "absolute -top-12 -left-12 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl" }), _jsxs("div", { className: "flex items-center justify-between mb-4 relative z-10", children: [_jsxs("div", { className: "flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold animate-pulse", children: [_jsx(Bell, { className: "w-4 h-4 text-rose-400 animate-bounce" }), _jsx("span", { children: "CLASS / EVENT STARTING NOW!" })] }), _jsx("button", { onClick: () => playAcademicAlarmChime(), title: "Replay Bell Chime", className: "p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer", children: _jsx(Volume2, { className: "w-4 h-4 text-amber-400" }) })] }), _jsx("h3", { className: "text-xl font-extrabold text-white tracking-tight mb-2 relative z-10", children: activeAlarmEvent.title || 'CS-201 Data Structures & Algorithms Class' }), _jsxs("div", { className: "p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 mb-6 text-xs relative z-10", children: [_jsxs("div", { className: "flex items-center gap-2 text-slate-300", children: [_jsx(Clock, { className: "w-4 h-4 text-sky-400" }), _jsxs("span", { children: ["Time: ", _jsx("strong", { children: activeAlarmEvent.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] })] }), _jsxs("div", { className: "flex items-center gap-2 text-slate-300", children: [_jsx(MapPin, { className: "w-4 h-4 text-emerald-400" }), _jsxs("span", { children: ["Location: ", _jsx("strong", { children: activeAlarmEvent.location || 'Lab Room 302' })] })] }), _jsxs("div", { className: "flex items-center gap-2 text-slate-300", children: [_jsx(CalendarIcon, { className: "w-4 h-4 text-purple-400" }), _jsxs("span", { children: ["Course: ", _jsx("strong", { children: activeAlarmEvent.course?.code || activeAlarmEvent.course?.name || 'BS-IT Course' })] })] })] }), _jsxs("div", { className: "flex items-center gap-3 relative z-10", children: [_jsxs("button", { onClick: handleDismiss, className: "flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), _jsx("span", { children: "Acknowledge / Dismiss" })] }), onGoToCalendar && (_jsx("button", { onClick: () => {
                                handleDismiss();
                                onGoToCalendar();
                            }, className: "py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer", children: "Calendar" }))] })] }) }), document.body);
};
