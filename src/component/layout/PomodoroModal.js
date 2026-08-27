import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Play, Pause, RotateCcw, X, Volume2, VolumeX, CheckCircle2, Clock } from 'lucide-react';
export default function PomodoroModal({ isOpen, onClose }) {
    const { token } = useAuth();
    const [mode, setMode] = useState('FOCUS');
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 Minutes
    const [isActive, setIsActive] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [courses, setCourses] = useState([]);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [sessionSuccess, setSuccessMessage] = useState(null);
    // Audio Context Ref for Web Audio Synthesizer (Lofi Rain / Focus Noise)
    const audioCtxRef = useRef(null);
    const noiseNodeRef = useRef(null);
    // Fetch Courses for Dropdown
    const fetchCourses = useCallback(async () => {
        if (!token)
            return;
        try {
            const res = await fetch('http://192.168.10.180:4000/api/v1/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCourses(data.courses || []);
                if (data.courses?.length > 0 && !selectedCourseId) {
                    setSelectedCourseId(data.courses[0].id);
                }
            }
        }
        catch {
            // Offline fallback
        }
    }, [token, selectedCourseId]);
    useEffect(() => {
        if (isOpen) {
            fetchCourses();
        }
    }, [isOpen, fetchCourses]);
    // Mode Duration Mapping
    const getModeDuration = (m) => {
        switch (m) {
            case 'FOCUS': return 25 * 60;
            case 'SHORT_BREAK': return 5 * 60;
            case 'LONG_BREAK': return 15 * 60;
        }
    };
    const handleModeChange = (newMode) => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(getModeDuration(newMode));
    };
    // Log Focus Session to SQLite Database
    const logCompletedSession = useCallback(async (durationMins) => {
        if (!token)
            return;
        try {
            const res = await fetch('http://192.168.10.180:4000/api/v1/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    durationMinutes: durationMins,
                    courseId: selectedCourseId || null,
                    notes: `${mode === 'FOCUS' ? 'Pomodoro Focus Session' : 'Break Time'} Completed`
                })
            });
            if (res.ok) {
                setSuccessMessage(`Awesome! ${durationMins} minutes focus study logged to SQLite database! 🎉`);
                setTimeout(() => setSuccessMessage(null), 5000);
            }
        }
        catch {
            // Offline
        }
    }, [token, selectedCourseId, mode]);
    // Timer Tick Engine
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }
        else if (isActive && timeLeft === 0) {
            setIsActive(false);
            stopLofiAudio();
            if (mode === 'FOCUS') {
                logCompletedSession(25);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode, logCompletedSession]);
    // Toggle Lofi Focus Ambient Noise Synthesizer (Web Audio API)
    const toggleLofiAudio = () => {
        if (audioPlaying) {
            stopLofiAudio();
        }
        else {
            startLofiAudio();
        }
    };
    const startLofiAudio = () => {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioCtx();
            audioCtxRef.current = ctx;
            const bufferSize = ctx.sampleRate * 2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400; // Soothing Rain Sound
            const gain = ctx.createGain();
            gain.gain.value = 0.05; // Gentle volume
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start();
            noiseNodeRef.current = noise;
            setAudioPlaying(true);
        }
        catch {
            // Audio error
        }
    };
    const stopLofiAudio = () => {
        if (noiseNodeRef.current) {
            try {
                noiseNodeRef.current.stop();
            }
            catch {
                // ignore
            }
            noiseNodeRef.current = null;
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
        setAudioPlaying(false);
    };
    if (!isOpen)
        return null;
    // Format MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const totalDuration = getModeDuration(mode);
    const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);
    return (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none text-left", children: _jsxs("div", { className: "w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400", children: _jsx(Clock, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-bold text-white", children: "Pomodoro Focus Timer" }), _jsx("p", { className: "text-[11px] text-slate-400", children: "Deep Work & Session Logging" })] })] }), _jsx("button", { onClick: () => { stopLofiAudio(); onClose(); }, className: "p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer", children: _jsx(X, { className: "w-5 h-5" }) })] }), sessionSuccess && (_jsxs("div", { className: "p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400", children: [_jsx(CheckCircle2, { className: "w-4 h-4 shrink-0" }), _jsx("span", { className: "font-semibold", children: sessionSuccess })] })), _jsxs("div", { className: "flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-semibold", children: [_jsx("button", { onClick: () => handleModeChange('FOCUS'), className: `flex-1 py-2 rounded-xl transition-all cursor-pointer ${mode === 'FOCUS' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`, children: "\uD83C\uDFAF Focus (25m)" }), _jsx("button", { onClick: () => handleModeChange('SHORT_BREAK'), className: `flex-1 py-2 rounded-xl transition-all cursor-pointer ${mode === 'SHORT_BREAK' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`, children: "\u2615 Short (5m)" }), _jsx("button", { onClick: () => handleModeChange('LONG_BREAK'), className: `flex-1 py-2 rounded-xl transition-all cursor-pointer ${mode === 'LONG_BREAK' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`, children: "\uD83C\uDF34 Long (15m)" })] }), _jsx("div", { className: "py-6 flex flex-col items-center justify-center relative", children: _jsxs("div", { className: "w-48 h-48 rounded-full bg-slate-950 border-4 border-slate-800 flex flex-col items-center justify-center shadow-2xl relative", children: [_jsx("span", { className: "text-4xl font-extrabold font-mono text-white tracking-wider", children: formatTime(timeLeft) }), _jsx("span", { className: "text-[10px] text-blue-400 font-mono font-bold mt-1 uppercase", children: isActive ? 'SESSION ACTIVE' : 'PAUSED' })] }) }), mode === 'FOCUS' && (_jsxs("div", { className: "space-y-1 text-xs", children: [_jsx("label", { className: "block text-slate-400 font-medium", children: "Link Focus Session to Course:" }), _jsxs("select", { value: selectedCourseId, onChange: (e) => setSelectedCourseId(e.target.value), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500", children: [_jsx("option", { value: "", children: "General Study Session" }), courses.map(c => (_jsxs("option", { value: c.id, children: [c.code, " - ", c.name] }, c.id)))] })] })), _jsxs("div", { className: "flex items-center justify-between gap-3 pt-2", children: [_jsxs("button", { type: "button", onClick: toggleLofiAudio, className: `p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs ${audioPlaying
                                ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`, title: "Lofi Focus Sound", children: [audioPlaying ? _jsx(Volume2, { className: "w-4 h-4 text-purple-400 animate-pulse" }) : _jsx(VolumeX, { className: "w-4 h-4" }), _jsx("span", { className: "hidden sm:inline", children: audioPlaying ? 'Lofi Rain ON' : 'Lofi Sound' })] }), _jsxs("button", { type: "button", onClick: () => setIsActive(!isActive), className: "flex-1 py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2", children: [isActive ? _jsx(Pause, { className: "w-4 h-4" }) : _jsx(Play, { className: "w-4 h-4" }), _jsx("span", { children: isActive ? 'PAUSE TIMER' : 'START FOCUS' })] }), _jsx("button", { type: "button", onClick: () => { setIsActive(false); setTimeLeft(getModeDuration(mode)); }, className: "p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer", title: "Reset Timer", children: _jsx(RotateCcw, { className: "w-4 h-4" }) })] })] }) }));
}
