import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/component/layout/FontSelectorModal.tsx
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Type, Check, Sparkles, ArrowLeft, Search } from 'lucide-react';
import { PRESET_FONTS, applyCustomFont } from '../../backend/utils/fontEngine';
export const FontSelectorModal = ({ isOpen, onClose }) => {
    const [activeFontId, setActiveFontId] = useState('inter');
    const [customFontInput, setCustomFontInput] = useState('');
    const [statusMessage, setSaveStatusMessage] = useState('');
    useEffect(() => {
        const savedFontName = localStorage.getItem('studentos_font_name');
        if (savedFontName) {
            const match = PRESET_FONTS.find((f) => f.fontFamily === savedFontName);
            if (match) {
                setActiveFontId(match.id);
            }
            else {
                setActiveFontId('custom');
            }
        }
    }, [isOpen]);
    const handleSelectPreset = (font) => {
        setActiveFontId(font.id);
        applyCustomFont(font.fontFamily, font.googleFontName);
        setSaveStatusMessage(`Applied ${font.name}! ✨`);
        setTimeout(() => setSaveStatusMessage(''), 2000);
    };
    const handleApplyCustomGoogleFont = () => {
        if (!customFontInput.trim())
            return;
        const formattedFontName = customFontInput.trim();
        const googleQuery = `${formattedFontName.replace(/\s+/g, '+')}:wght@400;500;600;700`;
        const fontFamilyCss = `'${formattedFontName}', sans-serif`;
        setActiveFontId('custom');
        applyCustomFont(fontFamilyCss, googleQuery);
        setSaveStatusMessage(`Applied Google Font: "${formattedFontName}"! 🚀`);
        setTimeout(() => setSaveStatusMessage(''), 2500);
    };
    if (!isOpen)
        return null;
    return ReactDOM.createPortal(_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-hidden", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-left text-slate-100", children: [_jsxs("div", { className: "p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { onClick: onClose, className: "px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold", children: [_jsx(ArrowLeft, { className: "w-4 h-4 text-sky-400" }), _jsx("span", { children: "Back" })] }), _jsx("div", { className: "h-4 w-px bg-slate-800 hidden sm:block" }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: "Custom Typography & Font Engine \uD83D\uDD24" }), _jsx("p", { className: "text-xs text-slate-400 hidden sm:block", children: "Choose your preferred reading font for StudentOS." })] })] }), _jsx("button", { onClick: onClose, className: "p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white", children: _jsx(X, { className: "w-5 h-5" }) })] }), statusMessage ? (_jsx("div", { className: "bg-sky-500/10 border-b border-sky-500/20 text-sky-400 text-xs px-4 py-2 text-center font-medium", children: statusMessage })) : null, _jsxs("div", { className: "flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar", children: [_jsxs("div", { className: "p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2", children: [_jsxs("label", { className: "text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1", children: [_jsx(Sparkles, { className: "w-3.5 h-3.5 text-amber-400" }), _jsx("span", { children: "Add Any Custom Google Font (e.g., Poppins, Roboto, Fira Code)" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" }), _jsx("input", { type: "text", placeholder: "Type Google Font name (e.g. Poppins, Montserrat, Cascadia Code)...", value: customFontInput, onChange: (e) => setCustomFontInput(e.target.value), className: "w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500" })] }), _jsx("button", { onClick: handleApplyCustomGoogleFont, className: "px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0", children: "Apply Font" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider mb-3", children: "Academic Presets" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: PRESET_FONTS.map((font) => {
                                        const isActive = activeFontId === font.id;
                                        return (_jsxs("div", { onClick: () => handleSelectPreset(font), className: `p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${isActive
                                                ? 'bg-sky-950/30 border-sky-500 shadow-xl shadow-sky-500/10 ring-1 ring-sky-500/50'
                                                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'}`, children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("span", { className: "text-sm font-bold text-white flex items-center gap-1.5", children: [_jsx(Type, { className: "w-4 h-4 text-sky-400" }), font.name] }), isActive && (_jsxs("span", { className: "bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1", children: [_jsx(Check, { className: "w-3 h-3" }), " Active"] }))] }), _jsx("p", { className: "text-xs text-slate-400 mb-3", children: font.description })] }), _jsx("div", { className: "p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200", style: { fontFamily: font.fontFamily }, children: "\"Data Structures & Algorithms - StudentOS v2.0\"" })] }, font.id));
                                    }) })] })] }), _jsxs("div", { className: "p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0", children: [_jsx("p", { className: "text-xs text-slate-500", children: "Selected font applies globally across all modules & Notes." }), _jsx("button", { onClick: onClose, className: "px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all cursor-pointer", children: "Apply & Close" })] })] }) }), document.body);
};
