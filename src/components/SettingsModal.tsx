import React, { useEffect, useState } from 'react';
import { X, Save, Globe, Zap, Gauge, Key } from 'lucide-react';

export interface AppSettings {
  displayName: string;
  language: string; // e.g., 'auto', 'en', 'ar', 'fr'
  model?: 'flash' | 'pro';
  pixeldrainOnly?: boolean;
  autoCitations?: boolean;
}

interface SettingsModalProps {
  open: boolean;
  initial: AppSettings;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
}

const languages = [
  { code: 'auto', name: 'Auto' },
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
];

export function SettingsModal({ open, initial, onClose, onSave }: SettingsModalProps) {
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [language, setLanguage] = useState(initial.language);
  const [model, setModel] = useState<'flash' | 'pro'>(initial.model || 'flash');
  const [pixeldrainOnly, setPixeldrainOnly] = useState<boolean>(!!initial.pixeldrainOnly);
  const [autoCitations, setAutoCitations] = useState<boolean>(initial.autoCitations ?? true);
  const [geminiKey, setGeminiKey] = useState<string>(() => {
    try { return localStorage.getItem('gemini_api_key') || ''; } catch { return ''; }
  });

  useEffect(() => {
    setDisplayName(initial.displayName);
    setLanguage(initial.language);
    setModel(initial.model || 'flash');
    setPixeldrainOnly(!!initial.pixeldrainOnly);
    setAutoCitations(initial.autoCitations ?? true);
  }, [initial]);

  const persistGeminiKey = () => {
    try {
      if (geminiKey.trim().length > 0) localStorage.setItem('gemini_api_key', geminiKey.trim());
      else localStorage.removeItem('gemini_api_key');
    } catch {}
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-md border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold">Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><Globe className="w-4 h-4"/> Preferred language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">AI mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setModel('flash')} className={`px-3 py-2 rounded border ${model==='flash'?'border-emerald-500 bg-emerald-600/20':'border-white/10 bg-white/5'}`}>
                <div className="text-xs font-semibold flex items-center gap-1"><Zap className="w-4 h-4"/> Speed</div>
                <div className="text-[10px] text-gray-400">Gemini Flash</div>
              </button>
              <button onClick={() => setModel('pro')} className={`px-3 py-2 rounded border ${model==='pro'?'border-blue-500 bg-blue-600/20':'border-white/10 bg-white/5'}`}>
                <div className="text-xs font-semibold flex items-center gap-1"><Gauge className="w-4 h-4"/> Quality</div>
                <div className="text-[10px] text-gray-400">Gemini Pro</div>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="pix-only" type="checkbox" checked={pixeldrainOnly} onChange={(e)=>setPixeldrainOnly(e.target.checked)} />
            <label htmlFor="pix-only" className="text-xs text-gray-300">Only show Pixeldrain-available titles in results</label>
          </div>
          <div className="flex items-center gap-2">
            <input id="auto-cite" type="checkbox" checked={autoCitations} onChange={(e)=>setAutoCitations(e.target.checked)} />
            <label htmlFor="auto-cite" className="text-xs text-gray-300">Auto request sources/evidence for answers</label>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><Key className="w-4 h-4"/> Gemini API key (stored locally)</label>
            <input value={geminiKey} onChange={(e)=>setGeminiKey(e.target.value)} placeholder="Paste your Gemini API key" className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="mt-1 text-[10px] text-gray-500">Used if env key is missing. Saved in your browser only.</div>
          </div>
        </div>
        <div className="p-4 border-t border-white/10 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded">Cancel</button>
          <button
            onClick={() => { persistGeminiKey(); onSave({ displayName: displayName.trim() || 'Rim', language, model, pixeldrainOnly, autoCitations }); }}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}