// src/utils/fontEngine.ts
export const PRESET_FONTS = [
    {
        id: 'inter',
        name: 'Inter (Default)',
        fontFamily: "'Inter', sans-serif",
        category: 'Sans-Serif',
        googleFontName: 'Inter:wght@400;500;600;700;800',
        description: 'Clean, high-legibility modern sans-serif optimized for screens.'
    },
    {
        id: 'plus-jakarta',
        name: 'Plus Jakarta Sans 💼',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        category: 'Sans-Serif',
        googleFontName: 'Plus+Jakarta+Sans:wght@400;500;600;700;800',
        description: 'Sleek academic and professional typography.'
    },
    {
        id: 'jetbrains-mono',
        name: 'JetBrains Mono 💻',
        fontFamily: "'JetBrains Mono', monospace",
        category: 'Monospace',
        googleFontName: 'JetBrains+Mono:wght@400;500;600;700',
        description: 'Developer favorite monospace font for code snippets and technical notes.'
    },
    {
        id: 'outfit',
        name: 'Outfit Geometric ✍️',
        fontFamily: "'Outfit', sans-serif",
        category: 'Sans-Serif',
        googleFontName: 'Outfit:wght@400;500;600;700',
        description: 'Modern geometric font for an aesthetic study interface.'
    },
    {
        id: 'playfair',
        name: 'Playfair Display 🖋️',
        fontFamily: "'Playfair Display', serif",
        category: 'Serif',
        googleFontName: 'Playfair+Display:wght@400;600;700',
        description: 'Classic book serif typography for high-focus reading.'
    }
];
// Dynamically Inject Google Font & Apply Globally
export const applyCustomFont = (fontFamilyName, googleFontQuery) => {
    if (!fontFamilyName)
        return;
    const fontId = 'studentos-custom-google-font';
    if (googleFontQuery) {
        let fontLinkEl = document.getElementById(fontId);
        if (!fontLinkEl) {
            fontLinkEl = document.createElement('link');
            fontLinkEl.id = fontId;
            fontLinkEl.rel = 'stylesheet';
            document.head.appendChild(fontLinkEl);
        }
        fontLinkEl.href = `https://fonts.googleapis.com/css2?family=${googleFontQuery}&display=swap`;
    }
    const styleId = 'studentos-global-font-style';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
    body, button, input, textarea, select, [class*="font-sans"], [class*="font-mono"] {
      font-family: ${fontFamilyName} !important;
    }
  `;
    localStorage.setItem('studentos_font_name', fontFamilyName);
    if (googleFontQuery) {
        localStorage.setItem('studentos_font_query', googleFontQuery);
    }
};
// Initialize Saved Font on App Startup
export const initSavedFont = () => {
    const savedFont = localStorage.getItem('studentos_font_name') || "'Inter', sans-serif";
    const savedQuery = localStorage.getItem('studentos_font_query') || 'Inter:wght@400;500;600;700';
    applyCustomFont(savedFont, savedQuery);
};
