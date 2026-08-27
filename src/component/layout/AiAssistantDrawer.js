import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, X, Send, Copy, Check, FileText, HelpCircle, Lightbulb, Calendar, Bot, RotateCw, AlertCircle } from 'lucide-react';
export default function AiAssistantDrawer({ isOpen, onClose }) {
    const { token } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [contextText, setContextText] = useState('');
    const [aiResponse, setAiResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    // Active AI Provider Config
    const provider = localStorage.getItem('studentos_ai_provider') || 'ollama';
    const apiKey = localStorage.getItem('studentos_ai_key') || '';
    const ollamaUrl = localStorage.getItem('studentos_ollama_url') || 'http://localhost:11434';
    if (!isOpen)
        return null;
    // Preset Action Handlers
    const handlePresetAction = (actionType) => {
        switch (actionType) {
            case 'SUMMARIZE':
                setPrompt('Summarize the key concepts and bullet points from these study notes:');
                break;
            case 'QUIZ':
                setPrompt('Generate 5 Multiple Choice Questions (MCQs) with correct answers and explanations based on this topic:');
                break;
            case 'EXPLAIN':
                setPrompt('Explain this complex concept / code snippet step-by-step with clear examples:');
                break;
            case 'PLANNER':
                setPrompt('Create an optimized 3-day exam revision plan for this subject:');
                break;
        }
    };
    // Execute AI Request
    const handleGenerateAi = async (e) => {
        e.preventDefault();
        if (!token || (!prompt && !contextText))
            return;
        try {
            setLoading(true);
            setError(null);
            setAiResponse(null);
            const res = await fetch('http://192.168.10.180:4000/api/v1/ai/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    prompt,
                    contextText,
                    provider,
                    apiKey,
                    ollamaUrl
                })
            });
            const data = await res.json();
            if (res.ok) {
                setAiResponse(data.response);
            }
            else {
                setError(data.error || 'AI generation failed');
            }
        }
        catch {
            setError('Cannot connect to Express backend on http://192.168.10.180:4000');
        }
        finally {
            setLoading(false);
        }
    };
    // Copy AI Output
    const handleCopyResponse = () => {
        if (!aiResponse)
            return;
        navigator.clipboard.writeText(aiResponse);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end select-none text-left", children: _jsxs("div", { className: "w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col justify-between overflow-hidden", children: [_jsxs("div", { className: "p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400", children: _jsx(Sparkles, { className: "w-5 h-5 text-purple-400 animate-pulse" }) }), _jsxs("div", { children: [_jsxs("h3", { className: "text-sm font-bold text-white flex items-center gap-2", children: [_jsx("span", { children: "AI Study Assistant Bridge" }), _jsx("span", { className: "px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-mono uppercase", children: provider })] }), _jsx("p", { className: "text-[11px] text-slate-400", children: "Academic Note Summarizer & Quiz Generator" })] })] }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("span", { className: "text-[11px] font-mono text-slate-400 uppercase font-bold block", children: "Quick AI Presets:" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [_jsxs("button", { type: "button", onClick: () => handlePresetAction('SUMMARIZE'), className: "p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white text-left transition-all cursor-pointer flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4 text-blue-400 shrink-0" }), _jsx("span", { children: "Summarize Notes" })] }), _jsxs("button", { type: "button", onClick: () => handlePresetAction('QUIZ'), className: "p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white text-left transition-all cursor-pointer flex items-center gap-2", children: [_jsx(HelpCircle, { className: "w-4 h-4 text-purple-400 shrink-0" }), _jsx("span", { children: "Generate 5 MCQs" })] }), _jsxs("button", { type: "button", onClick: () => handlePresetAction('EXPLAIN'), className: "p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white text-left transition-all cursor-pointer flex items-center gap-2", children: [_jsx(Lightbulb, { className: "w-4 h-4 text-amber-400 shrink-0" }), _jsx("span", { children: "Explain Concept" })] }), _jsxs("button", { type: "button", onClick: () => handlePresetAction('PLANNER'), className: "p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white text-left transition-all cursor-pointer flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-emerald-400 shrink-0" }), _jsx("span", { children: "Revision Plan" })] })] })] }), _jsxs("form", { onSubmit: handleGenerateAi, className: "space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Prompt / Instruction *" }), _jsx("textarea", { required: true, rows: 2, placeholder: "Ask AI a study question or select a preset above...", value: prompt, onChange: (e) => setPrompt(e.target.value), className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Study Notes Context (Optional)" }), _jsx("textarea", { rows: 4, placeholder: "Paste lecture text, code snippet, or topic content here for AI analysis...", value: contextText, onChange: (e) => setContextText(e.target.value), className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500" })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50", children: loading ? (_jsxs(_Fragment, { children: [_jsx(RotateCw, { className: "w-4 h-4 animate-spin text-white" }), _jsx("span", { children: "AI Generating Response..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "w-4 h-4" }), _jsx("span", { children: "Execute AI Assistant" })] })) })] }), error && (_jsxs("div", { className: "p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-400", children: [_jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: error })] })), aiResponse && (_jsxs("div", { className: "p-5 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3 relative text-xs", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-2", children: [_jsxs("span", { className: "text-[10px] font-mono text-purple-400 font-bold flex items-center gap-1.5", children: [_jsx(Bot, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "AI RESPONSE OUTPUT" })] }), _jsxs("button", { type: "button", onClick: handleCopyResponse, className: "flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer", children: [copied ? _jsx(Check, { className: "w-3.5 h-3.5 text-emerald-400" }) : _jsx(Copy, { className: "w-3.5 h-3.5" }), _jsx("span", { children: copied ? 'Copied' : 'Copy' })] })] }), _jsx("div", { className: "text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-80 overflow-y-auto custom-scrollbar", children: aiResponse })] }))] })] }) }));
}
