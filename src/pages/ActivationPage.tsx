import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  KeyRound, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  LogOut, 
  ArrowRight
} from 'lucide-react';

interface ActivationPageProps {
  onActivated: () => void;
}

export default function ActivationPage({ onActivated }: ActivationPageProps) {
  const { token, logout } = useAuth();
  const [requestCode, setRequestCode] = useState<string>('');
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activating, setActivating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Hardware Request Code & Activation Status
  const fetchStatus = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://192.168.10.180:4000/api/v1/license/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRequestCode(data.requestCode);
        if (data.isActivated) {
          onActivated();
        }
      } else {
        setError(data.error || 'Failed to fetch license status');
      }
    } catch {
      setError('Cannot connect to Express backend on http://192.168.10.180:4000');
    } finally {
      setLoading(false);
    }
  }, [token, onActivated]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Copy Request Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(requestCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit License Key Activation
  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !licenseKeyInput) return;

    try {
      setActivating(true);
      setError(null);
      const res = await fetch('http://192.168.10.180:4000/api/v1/license/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ licenseKey: licenseKeyInput })
      });

      const data = await res.json();
      if (res.ok && data.isActivated) {
        onActivated();
      } else {
        setError(data.error || 'Invalid License Key for this machine.');
      }
    } catch {
      setError('Cannot connect to backend on http://192.168.10.180:4000');
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans select-none">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-mono text-slate-400">Verifying Software License...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 space-y-6 text-left">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-1">
            <Lock className="w-8 h-8 mx-auto animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Software Approval Required</h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            This StudentOS installation requires Owner Approval & Activation before accessing workspace features.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Student Request Code Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[11px] text-slate-400 font-bold block">
            STEP 1: Send your Hardware Request Code to the Owner
          </span>
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-mono text-xs font-extrabold text-blue-400 tracking-wider">
              {requestCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-all cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Send this Request Code to the owner (Asad Khalid) via WhatsApp / Email to receive your unique Activation License Key.
          </p>
        </div>

        {/* STEP 2: Enter License Key Form */}
        <form onSubmit={handleActivate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              STEP 2: Enter Owner License Key
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="STOS-KEY-XXXX-XXXX"
                value={licenseKeyInput}
                onChange={(e) => setLicenseKeyInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono uppercase tracking-wider placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={activating}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-amber-600/20 disabled:opacity-50 cursor-pointer"
          >
            {activating ? (
              <span>Verifying License...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Activate StudentOS Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Logout Link */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            onClick={logout}
            className="text-xs text-slate-500 hover:text-rose-400 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}