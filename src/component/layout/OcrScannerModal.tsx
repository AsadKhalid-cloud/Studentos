import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Tesseract from 'tesseract.js';
import { 
  ScanText, 
  Upload, 
  X, 
  Copy, 
  Check, 
  FileText, 
  Code2, 
  RotateCw, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface OcrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToNotes?: () => void;
}

export default function OcrScannerModal({ isOpen, onClose, onSaveToNotes }: OcrScannerModalProps) {
  const { token } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setExtractedText('');
    setSavedStatus(null);

    // Read Image Preview if Image
    if (file.type.startsWith('image/')) {
      const imgReader = new FileReader();
      imgReader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      imgReader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }

    // Read File as Base64 Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Execute OCR Text Extraction (Client Web Worker for Images, Backend for PDFs)
  const handleExtractText = async () => {
    if (!token || !selectedFile || !fileBase64) return;

    try {
      setLoading(true);
      setError(null);
      setExtractedText('');

      const isImage = selectedFile.type.startsWith('image/') || /\.(png|jpg|jpeg|webp)$/i.test(selectedFile.name);

      if (isImage && imagePreview) {
        // 1. IMAGE FILE -> Run Tesseract Web Worker inside Browser Renderer (No Node Worker Error!)
        const result = await Tesseract.recognize(imagePreview, 'eng', {
          logger: m => console.log('[StudentOS Tesseract Progress]:', m)
        });

        const rawText = result.data.text || '';
        // Clean up noise symbols
        const cleanText = rawText
          .replace(/[~®_^|\\`]/g, ' ')
          .replace(/\r\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        setExtractedText(cleanText || `No readable text found in image ${selectedFile.name}.`);
      } else {
        // 2. PDF DOCUMENT -> Send to Express Backend pdfParse
        const res = await fetch('http://192.168.10.180:4000/api/v1/ocr/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: selectedFile.name,
            imageBase64: fileBase64
          })
        });

        const data = await res.json();
        if (res.ok) {
          setExtractedText(data.extractedText);
        } else {
          setError(data.error || 'PDF Text Extraction failed');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Text extraction failed');
    } finally {
      setLoading(false);
    }
  };

  // Save Extracted Text to Notes
  const handleSaveToNotes = async () => {
    if (!token || !extractedText) return;

    try {
      const res = await fetch('http://192.168.10.180:4000/api/v1/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Slide Note - ${selectedFile?.name.replace(/\.[^/.]+$/, '') || 'Lecture'}`,
          markdownText: extractedText,
          category: 'Lecture Slide'
        })
      });

      if (res.ok) {
        setSavedStatus('Note saved to SQLite Workspace! 📝');
        setTimeout(() => setSavedStatus(null), 3000);
        if (onSaveToNotes) onSaveToNotes();
      }
    } catch {
      alert('Failed to save note');
    }
  };

  // Save Extracted Text as Code Snippet
  const handleSaveToCodeRepo = async () => {
    if (!token || !extractedText) return;

    try {
      const res = await fetch('http://192.168.10.180:4000/api/v1/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Slide Code - ${selectedFile?.name.replace(/\.[^/.]+$/, '') || 'Snippet'}`,
          language: 'javascript',
          codeContent: extractedText,
          explanation: 'Extracted directly from uploaded lecture slide.',
          tags: '#ocr #slide'
        })
      });

      if (res.ok) {
        setSavedStatus('Code snippet saved to SQLite Code Repo! 💻');
        setTimeout(() => setSavedStatus(null), 3000);
      }
    } catch {
      alert('Failed to save code snippet');
    }
  };

  // Copy Extracted Text
  const handleCopyText = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none text-left font-sans">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <ScanText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Lecture Slide OCR Text Extractor</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono">
                  Chromium Web Worker Engine
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Extract clean text and code from your PDF or slide images</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
          {/* Status Message */}
          {savedStatus && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 font-bold">
              <Check className="w-4 h-4 shrink-0" />
              <span>{savedStatus}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* File Dropzone */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-semibold">Upload PDF Document / Slide Image *</label>
            <label className="p-6 rounded-2xl border-2 border-dashed border-slate-800 hover:border-blue-500/50 bg-slate-950/60 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group">
              <Upload className="w-8 h-8 text-slate-600 group-hover:text-blue-400 transition-colors" />
              <div className="text-center">
                <span className="text-white font-bold block">{selectedFile ? selectedFile.name : 'Click to select PDF or Image File'}</span>
                <span className="text-[10px] text-slate-500">Extracts clean readable text from images or PDF files</span>
              </div>
              <input 
                type="file" 
                accept="*/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>
          </div>

          {/* Image Preview & Extract Button */}
          {selectedFile && (
            <div className="space-y-3">
              {imagePreview && (
                <div className="p-2 rounded-2xl bg-slate-950 border border-slate-800 max-h-48 overflow-hidden flex items-center justify-center">
                  <img src={imagePreview} alt="Preview" className="max-h-44 object-contain rounded-xl" />
                </div>
              )}

              <button
                type="button"
                onClick={handleExtractText}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-white" />
                    <span>Scanning Image Pixels & Extracting Text...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Extract Clean Text</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Extracted Output Text Area */}
          {extractedText && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-blue-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-mono text-blue-400 font-bold flex items-center gap-1.5">
                  <ScanText className="w-3.5 h-3.5" />
                  <span>EXTRACTED CLEAN TEXT</span>
                </span>

                <button
                  type="button"
                  onClick={handleCopyText}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>

              <textarea
                rows={8}
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="w-full bg-transparent text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none resize-none"
              ></textarea>

              {/* Direct Save Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={handleSaveToNotes}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Save Directly to Notes 📝</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveToCodeRepo}
                  className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Save as Code Snippet 💻</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}