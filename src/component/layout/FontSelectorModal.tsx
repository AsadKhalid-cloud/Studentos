// src/component/layout/FontSelectorModal.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Type, Check, Sparkles, ArrowLeft, Search } from 'lucide-react';
import { PRESET_FONTS, applyCustomFont, FontOption } from '../../backend/utils/fontEngine';

interface FontSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FontSelectorModal: React.FC<FontSelectorModalProps> = ({ isOpen, onClose }) => {
  const [activeFontId, setActiveFontId] = useState<string>('inter');
  const [customFontInput, setCustomFontInput] = useState<string>('');
  const [statusMessage, setSaveStatusMessage] = useState<string>('');

  useEffect(() => {
    const savedFontName = localStorage.getItem('studentos_font_name');
    if (savedFontName) {
      const match = PRESET_FONTS.find((f: FontOption) => f.fontFamily === savedFontName);
      if (match) {
        setActiveFontId(match.id);
      } else {
        setActiveFontId('custom');
      }
    }
  }, [isOpen]);

  const handleSelectPreset = (font: FontOption) => {
    setActiveFontId(font.id);
    applyCustomFont(font.fontFamily, font.googleFontName);
    setSaveStatusMessage(`Applied ${font.name}! ✨`);
    setTimeout(() => setSaveStatusMessage(''), 2000);
  };

  const handleApplyCustomGoogleFont = () => {
    if (!customFontInput.trim()) return;
    const formattedFontName = customFontInput.trim();
    const googleQuery = `${formattedFontName.replace(/\s+/g, '+')}:wght@400;500;600;700`;
    const fontFamilyCss = `'${formattedFontName}', sans-serif`;

    setActiveFontId('custom');
    applyCustomFont(fontFamilyCss, googleQuery);
    setSaveStatusMessage(`Applied Google Font: "${formattedFontName}"! 🚀`);
    setTimeout(() => setSaveStatusMessage(''), 2500);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-left text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4 text-sky-400" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Custom Typography & Font Engine 🔤
              </h3>
              <p className="text-xs text-slate-400 hidden sm:block">Choose your preferred reading font for StudentOS.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {statusMessage ? (
          <div className="bg-sky-500/10 border-b border-sky-500/20 text-sky-400 text-xs px-4 py-2 text-center font-medium">
            {statusMessage}
          </div>
        ) : null}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          
          {/* Custom Google Font Search Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Any Custom Google Font (e.g., Poppins, Roboto, Fira Code)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Type Google Font name (e.g. Poppins, Montserrat, Cascadia Code)..."
                  value={customFontInput}
                  onChange={(e) => setCustomFontInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                onClick={handleApplyCustomGoogleFont}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0"
              >
                Apply Font
              </button>
            </div>
          </div>

          {/* Preset Font Cards */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Academic Presets</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRESET_FONTS.map((font: FontOption) => {
                const isActive = activeFontId === font.id;
                return (
                  <div
                    key={font.id}
                    onClick={() => handleSelectPreset(font)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'bg-sky-950/30 border-sky-500 shadow-xl shadow-sky-500/10 ring-1 ring-sky-500/50'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Type className="w-4 h-4 text-sky-400" />
                          {font.name}
                        </span>
                        {isActive && (
                          <span className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{font.description}</p>
                    </div>

                    {/* Font Live Sample Preview Text */}
                    <div 
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                      style={{ fontFamily: font.fontFamily }}
                    >
                      "Data Structures & Algorithms - StudentOS v2.0"
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">Selected font applies globally across all modules & Notes.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};