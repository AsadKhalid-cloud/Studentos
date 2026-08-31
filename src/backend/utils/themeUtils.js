// src/utils/themeUtils.ts
export const initSavedTheme = () => {
    const savedTheme = localStorage.getItem('studentos_theme') || 'nordic-white';
    const THEME_MAP = {
        'nordic-white': { bg: '#f8fafc', sidebar: '#ffffff', accent: '#2563eb' },
        'dark-default': { bg: '#0f172a', sidebar: '#1e293b', accent: '#3b82f6' },
        'cyberpunk-neon': { bg: '#090d16', sidebar: '#121829', accent: '#a855f7' },
        'emerald-forest': { bg: '#062016', sidebar: '#0b2e21', accent: '#10b981' },
        'mocha-coffee': { bg: '#1c1412', sidebar: '#2a1e1b', accent: '#f59e0b' },
        'dracula-purple': { bg: '#181124', sidebar: '#221935', accent: '#8b5cf6' }
    };
    const themeObj = THEME_MAP[savedTheme] || THEME_MAP['nordic-white'];
    const styleId = 'studentos-custom-theme-style';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }
    const isWhite = savedTheme === 'nordic-white';
    styleEl.innerHTML = `
    body, .bg-slate-950, [class*="bg-slate-950"] {
      background-color: ${themeObj.bg} !important;
      ${isWhite ? 'color: #0f172a !important;' : ''}
    }
    .bg-slate-900, .bg-slate-900\\/60, .bg-slate-900\\/40, aside, [class*="bg-slate-900"] {
      background-color: ${themeObj.sidebar} !important;
      ${isWhite ? 'border-color: #cbd5e1 !important;' : ''}
    }
    ${isWhite ? `
      .text-white, .text-slate-100, .text-slate-200 { color: #0f172a !important; }
      .text-slate-400, .text-slate-500 { color: #475569 !important; }
      .border-slate-800, .border-slate-700 { border-color: #cbd5e1 !important; }
      .bg-slate-800, .bg-slate-800\\/80 { background-color: #e2e8f0 !important; }
      input, textarea, select {
        background-color: #f1f5f9 !important;
        color: #0f172a !important;
        border-color: #cbd5e1 !important;
      }
    ` : ''}
    .text-blue-400, .text-purple-400, .text-sky-400 {
      color: ${themeObj.accent} !important;
    }
    .bg-blue-600, .bg-purple-600, .bg-sky-600 {
      background-color: ${themeObj.accent} !important;
    }
    .border-blue-500, .border-purple-500, .border-sky-500 {
      border-color: ${themeObj.accent} !important;
    }
  `;
};
