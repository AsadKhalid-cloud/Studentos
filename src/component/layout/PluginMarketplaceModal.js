import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/component/layout/PluginMarketplaceModal.tsx
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Palette, Puzzle, Check, Music, Timer, Calculator, Sigma, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const DEFAULT_THEMES = [
    {
        id: 'nordic-white',
        name: 'Nordic Frost White (Default)',
        description: 'Minimalist crisp white theme for daylight study sessions.',
        colors: { bg: '#f8fafc', sidebar: '#ffffff', accent: '#2563eb', text: '#0f172a' },
        isOfficial: true
    },
    {
        id: 'dark-default',
        name: 'Midnight Slate ',
        description: 'Clean, high-contrast dark theme optimized for late-night study sessions.',
        colors: { bg: '#0f172a', sidebar: '#1e293b', accent: '#3b82f6', text: '#f8fafc' },
        isOfficial: true
    },
    {
        id: 'cyberpunk-neon',
        name: 'Cyberpunk Neon ',
        description: 'Vibrant neon blue and violet accents inspired by futuristic IDEs.',
        colors: { bg: '#090d16', sidebar: '#121829', accent: '#a855f7', text: '#f4f4f5' },
        isOfficial: true
    },
    {
        id: 'emerald-forest',
        name: 'Emerald Forest ',
        description: 'Calming deep green tones to reduce eye strain during long reading hours.',
        colors: { bg: '#062016', sidebar: '#0b2e21', accent: '#10b981', text: '#ecfdf5' },
        isOfficial: true
    },
    {
        id: 'mocha-coffee',
        name: 'Mocha Coffee ',
        description: 'Warm espresso and caramel tones for a cozy academic environment.',
        colors: { bg: '#1c1412', sidebar: '#2a1e1b', accent: '#f59e0b', text: '#fffbeb' },
        isOfficial: true
    },
    {
        id: 'dracula-purple',
        name: 'Dracula Obsidian ',
        description: 'Classic dark purple palette beloved by programmers and power users.',
        colors: { bg: '#181124', sidebar: '#221935', accent: '#8b5cf6', text: '#f3e8ff' },
        isOfficial: true
    }
];
export const PluginMarketplaceModal = ({ isOpen, onClose, onThemeChange, onPluginsChange, }) => {
    const auth = useAuth ? useAuth() : { token: null };
    const token = auth?.token || localStorage.getItem('token') || localStorage.getItem('studentos_token');
    const [activeTab, setActiveTab] = useState('themes');
    const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem('studentos_theme') || 'nordic-white');
    const [enabledPlugins, setEnabledPlugins] = useState(() => {
        const saved = localStorage.getItem('studentos_plugins');
        return saved ? JSON.parse(saved) : ['lofi-audio-player', 'floating-pomodoro'];
    });
    const [themesCatalog, setThemesCatalog] = useState(DEFAULT_THEMES);
    const [pluginsCatalog, setPluginsCatalog] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    // Dynamic CSS Theme Injector
    const applyThemeToDOM = (themeObj) => {
        if (!themeObj || !themeObj.colors)
            return;
        const styleId = 'studentos-custom-theme-style';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }
        const isWhite = themeObj.id === 'nordic-white';
        styleEl.innerHTML = `
      body, .bg-slate-950, [class*="bg-slate-950"] {
        background-color: ${themeObj.colors.bg} !important;
        ${isWhite ? 'color: #0f172a !important;' : ''}
      }
      .bg-slate-900, .bg-slate-900\\/60, .bg-slate-900\\/40, aside, [class*="bg-slate-900"] {
        background-color: ${themeObj.colors.sidebar} !important;
        ${isWhite ? 'border-color: #cbd5e1 !important;' : ''}
      }
      ${isWhite ? `
        .text-white, .text-slate-100, .text-slate-200 { color: #0f172a !important; }
        .text-slate-400, .text-slate-500 { color: #475569 !important; }
        .border-slate-800, .border-slate-700 { border-color: #cbd5e1 !important; }
        .bg-slate-800, .bg-slate-800\\/80 { background-color: #e2e8f0 !important; }
      ` : ''}
      .text-blue-400, .text-purple-400, .text-sky-400 {
        color: ${themeObj.colors.accent} !important;
      }
      .bg-blue-600, .bg-purple-600, .bg-sky-600 {
        background-color: ${themeObj.colors.accent} !important;
      }
      .border-blue-500, .border-purple-500, .border-sky-500 {
        border-color: ${themeObj.colors.accent} !important;
      }
    `;
    };
    // Initial Theme Application on App Mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('studentos_theme');
        if (savedTheme) {
            const found = DEFAULT_THEMES.find(t => t.id === savedTheme);
            if (found)
                applyThemeToDOM(found);
        }
    }, []);
    // Fetch Themes & Plugins Catalog from Express Backend
    useEffect(() => {
        if (!isOpen)
            return;
        const fetchCatalog = async () => {
            try {
                const res = await fetch('http://192.168.10.180:4000/api/v1/plugins/catalog', {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    if (data.themes && data.themes.length > 0) {
                        setThemesCatalog(data.themes);
                    }
                    if (data.plugins)
                        setPluginsCatalog(data.plugins);
                    const themeToApply = localStorage.getItem('studentos_theme') || data.activeTheme || 'nordic-white';
                    setSelectedTheme(themeToApply);
                    const activeObj = (data.themes || DEFAULT_THEMES).find((t) => t.id === themeToApply);
                    if (activeObj)
                        applyThemeToDOM(activeObj);
                    // Priority for LocalStorage enabled plugins (Prevent backend overwrite reset)
                    const savedLocalPlugins = localStorage.getItem('studentos_plugins');
                    if (savedLocalPlugins) {
                        setEnabledPlugins(JSON.parse(savedLocalPlugins));
                    }
                    else if (data.enabledPlugins) {
                        setEnabledPlugins(data.enabledPlugins);
                    }
                }
            }
            catch (err) {
                console.error('Failed to load plugin catalog:', err);
            }
        };
        fetchCatalog();
    }, [isOpen, token]);
    // Apply & Save Theme Preference Permanently
    const handleApplyTheme = async (themeId) => {
        setSelectedTheme(themeId);
        if (onThemeChange)
            onThemeChange(themeId);
        const themeObj = themesCatalog.find(t => t.id === themeId) || DEFAULT_THEMES.find(t => t.id === themeId);
        if (themeObj) {
            applyThemeToDOM(themeObj);
        }
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem('studentos_theme', themeId);
        savePreferences(themeId, enabledPlugins);
    };
    // Toggle Plugin Extension (Instant LocalStorage & Parent Handler Sync)
    const handleTogglePlugin = (pluginId) => {
        const updated = enabledPlugins.includes(pluginId)
            ? enabledPlugins.filter(id => id !== pluginId)
            : [...enabledPlugins, pluginId];
        setEnabledPlugins(updated);
        // Save to LocalStorage immediately
        localStorage.setItem('studentos_plugins', JSON.stringify(updated));
        if (onPluginsChange)
            onPluginsChange(updated);
        savePreferences(selectedTheme, updated);
    };
    // Save Settings to Backend SQLite
    const savePreferences = async (theme, plugins) => {
        localStorage.setItem('studentos_plugins', JSON.stringify(plugins));
        localStorage.setItem('studentos_theme', theme);
        try {
            setSaveMessage('Saving preferences...');
            const res = await fetch('http://192.168.10.180:4000/api/v1/plugins/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ theme, enabledPlugins: plugins })
            });
            if (res.ok) {
                setSaveMessage('✅ Preferences Saved!');
                setTimeout(() => setSaveMessage(''), 2500);
            }
        }
        catch {
            setSaveMessage('Saved in Browser');
        }
    };
    if (!isOpen)
        return null;
    return ReactDOM.createPortal(_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-hidden", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-left text-slate-100 relative", children: [_jsxs("div", { className: "p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { onClick: onClose, className: "px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold", title: "Close and Return to App", children: [_jsx(ArrowLeft, { className: "w-4 h-4 text-purple-400" }), _jsx("span", { children: "Back to App" })] }), _jsx("div", { className: "h-4 w-px bg-slate-800 hidden sm:block" }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: "Plugin Marketplace & Theme Engine \uD83E\uDDE9" }), _jsx("p", { className: "text-xs text-slate-400 hidden sm:block", children: "Customize StudentOS colors and third-party extensions." })] })] }), _jsx("button", { onClick: onClose, className: "p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer", title: "Close", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "px-5 pt-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between shrink-0", children: [_jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => setActiveTab('themes'), className: `px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-t border-x cursor-pointer flex items-center gap-1.5 ${activeTab === 'themes'
                                        ? 'bg-slate-900 border-slate-800 text-purple-400 border-b-slate-900'
                                        : 'bg-transparent border-transparent text-slate-400 hover:text-white'}`, children: [_jsx(Palette, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Theme Marketplace" })] }), _jsxs("button", { onClick: () => setActiveTab('plugins'), className: `px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-t border-x cursor-pointer flex items-center gap-1.5 ${activeTab === 'plugins'
                                        ? 'bg-slate-900 border-slate-800 text-purple-400 border-b-slate-900'
                                        : 'bg-transparent border-transparent text-slate-400 hover:text-white'}`, children: [_jsx(Puzzle, { className: "w-3.5 h-3.5" }), _jsxs("span", { children: ["Plugin Extensions (", enabledPlugins.length, " Active)"] })] })] }), saveMessage && (_jsx("span", { className: "text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 mb-1", children: saveMessage }))] }), _jsx("div", { className: "flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar", children: activeTab === 'themes' ? (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4", children: themesCatalog.map((theme) => {
                            const isActive = selectedTheme === theme.id;
                            return (_jsxs("div", { onClick: () => handleApplyTheme(theme.id), className: `p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${isActive
                                    ? 'bg-purple-950/30 border-purple-500 shadow-xl shadow-purple-500/10 ring-1 ring-purple-500/50'
                                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'}`, children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "text-sm font-bold text-white flex items-center gap-1.5", children: theme.name }), isActive ? (_jsxs("span", { className: "bg-purple-600 text-white font-semibold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1", children: [_jsx(Check, { className: "w-3 h-3" }), " Active"] })) : (_jsx("span", { className: "text-[10px] text-slate-500 hover:text-purple-400", children: "Click to Apply" }))] }), _jsx("p", { className: "text-xs text-slate-400 leading-relaxed mb-4", children: theme.description })] }), _jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-slate-800/80", children: [_jsx("span", { className: "text-[10px] text-slate-500 font-mono", children: "Palette Preview:" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-5 h-5 rounded-full border border-slate-700 shadow-sm", style: { backgroundColor: theme.colors.bg }, title: "Background Color" }), _jsx("span", { className: "w-5 h-5 rounded-full border border-slate-700 shadow-sm", style: { backgroundColor: theme.colors.sidebar }, title: "Sidebar Color" }), _jsx("span", { className: "w-5 h-5 rounded-full border border-slate-700 shadow-sm", style: { backgroundColor: theme.colors.accent }, title: "Accent Color" })] })] })] }, theme.id));
                        }) })) : (_jsx("div", { className: "grid grid-cols-1 gap-3 pb-4", children: pluginsCatalog.map((plugin) => {
                            const isEnabled = enabledPlugins.includes(plugin.id);
                            return (_jsxs("div", { className: `p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${isEnabled
                                    ? 'bg-slate-950 border-purple-500/50 shadow-md'
                                    : 'bg-slate-950/50 border-slate-800 opacity-75'}`, children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsxs("div", { className: `p-2.5 rounded-xl border mt-0.5 ${isEnabled ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`, children: [plugin.icon === 'Music' && _jsx(Music, { className: "w-5 h-5" }), plugin.icon === 'Timer' && _jsx(Timer, { className: "w-5 h-5" }), plugin.icon === 'Calculator' && _jsx(Calculator, { className: "w-5 h-5" }), plugin.icon === 'Sigma' && _jsx(Sigma, { className: "w-5 h-5" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h4", { className: "text-sm font-bold text-white", children: plugin.name }), _jsxs("span", { className: "text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400", children: ["v", plugin.version] })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1 leading-relaxed", children: plugin.description }), _jsxs("div", { className: "flex items-center gap-3 mt-2 text-[10px] text-slate-500", children: [_jsxs("span", { children: ["Author: ", plugin.author] }), _jsx("span", { children: "\u2022" }), _jsx("span", { className: "text-purple-400 font-semibold", children: plugin.category })] })] })] }), _jsx("button", { onClick: () => handleTogglePlugin(plugin.id), className: `px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${isEnabled
                                            ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-600/20'
                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`, children: isEnabled ? 'Enabled ✅' : 'Enable +' })] }, plugin.id));
                        }) })) }), _jsxs("div", { className: "p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0", children: [_jsx("p", { className: "text-xs text-slate-500", children: "Selected theme & active extensions are auto-saved to SQLite." }), _jsxs("button", { onClick: onClose, className: "px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-1.5", children: [_jsx(Check, { className: "w-4 h-4" }), _jsx("span", { children: "Apply & Close" })] })] })] }) }), document.body);
};
