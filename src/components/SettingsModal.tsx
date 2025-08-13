import React, { useEffect, useState } from 'react';
import { X, Save, Globe, Zap, Gauge, Key, User as UserIcon, Image as ImageIcon, FileText, BookOpen, ShieldCheck, Vibrate } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '../services/communityService';

export interface AppSettings {
  displayName: string;
  language: string; // e.g., 'auto', 'en', 'ar', 'fr'
  model?: 'flash' | 'pro';
  pixeldrainOnly?: boolean;
  autoCitations?: boolean;
  fiqh?: { madhhab: 'hanafi'|'maliki'|'shafii'|'hanbali'|'athari'|'none'; strictness: 'lenient'|'balanced'|'strict'; includeMinority: boolean };
  trustMeter?: boolean;
  haptics?: boolean;
  smartSubtitles?: boolean;
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [madhhab, setMadhhab] = useState<AppSettings['fiqh']['madhhab']>(initial.fiqh?.madhhab || 'none');
  const [strictness, setStrictness] = useState<AppSettings['fiqh']['strictness']>(initial.fiqh?.strictness || 'balanced');
  const [includeMinority, setIncludeMinority] = useState<boolean>(initial.fiqh?.includeMinority ?? true);
  const [trustMeter, setTrustMeter] = useState<boolean>(initial.trustMeter ?? true);
  const [haptics, setHaptics] = useState<boolean>(initial.haptics ?? true);
  const [smartSubtitles, setSmartSubtitles] = useState<boolean>(initial.smartSubtitles ?? false);

  useEffect(() => {
    setDisplayName(initial.displayName);
    setLanguage(initial.language);
    setModel(initial.model || 'flash');
    setPixeldrainOnly(!!initial.pixeldrainOnly);
    setAutoCitations(initial.autoCitations ?? true);
    setMadhhab(initial.fiqh?.madhhab || 'none');
    setStrictness(initial.fiqh?.strictness || 'balanced');
    setIncludeMinority(initial.fiqh?.includeMinority ?? true);
    setTrustMeter(initial.trustMeter ?? true);
    setHaptics(initial.haptics ?? true);
    setSmartSubtitles(initial.smartSubtitles ?? false);
  }, [initial]);

  useEffect(() => {
    if (!profileOpen) return;
    const load = async () => {
      try {
        const username = (displayName || localStorage.getItem('last_username') || '');
        if (!username) return;
        const p = await getUserProfile(username);
        setAvatarUrl(p?.avatar_url || '');
        setBio(p?.bio || '');
      } catch {}
    };
    load();
  }, [profileOpen]);

  const persistGeminiKey = () => {
    try {
      if (geminiKey.trim().length > 0) localStorage.setItem('gemini_api_key', geminiKey.trim());
      else localStorage.removeItem('gemini_api_key');
    } catch {}
  };

  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      const username = displayName.trim() || (localStorage.getItem('last_username') || '');
      if (!username) return;
      await updateUserProfile(username, { avatar_url: avatarUrl || null, bio: bio || null });
      setProfileOpen(false);
    } catch {
      // ignore
    } finally {
      setSavingProfile(false);
    }
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
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">Signed in as</div>
            <button onClick={()=>setProfileOpen(true)} className="text-xs px-2 py-1 rounded border border-white/10 bg_white/5 hover:bg-white/10 flex items-center gap-1"><UserIcon className="w-3.5 h-3.5"/> Edit profile</button>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-gray-800 border border_white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><Key className="w-4 h-4"/> Gemini API Key</label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e)=>setGeminiKey(e.target.value)}
              placeholder="Paste your Google AI Studio API key"
              className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-[10px] text-gray-500 mt-1">Stored locally in your browser. You can also set VITE_GEMINI_API_KEY in the environment.</div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><BookOpen className="w-4 h-4"/> Fiqh alignment</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <select value={madhhab} onChange={(e)=>setMadhhab(e.target.value as any)} className="bg-gray-800 border border-white/10 rounded px-2 py-2 text-xs">
                <option value="none">No madhhab</option>
                <option value="hanafi">Hanafi</option>
                <option value="maliki">Maliki</option>
                <option value="shafii">Shafi'i</option>
                <option value="hanbali">Hanbali</option>
                <option value="athari">Athari</option>
              </select>
              <select value={strictness} onChange={(e)=>setStrictness(e.target.value as any)} className="bg-gray-800 border border-white/10 rounded px-2 py-2 text-xs">
                <option value="lenient">Lenient</option>
                <option value="balanced">Balanced</option>
                <option value="strict">Strict</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={includeMinority} onChange={(e)=>setIncludeMinority(e.target.checked)} /> Include minority opinions</label>
          </div>

          <div className="pt-2 border-t border-white/10 grid gap-2">
            <label className="flex items-center gap-2 text-xs text-gray-300"><ShieldCheck className="w-4 h-4"/> <input type="checkbox" checked={trustMeter} onChange={(e)=>setTrustMeter(e.target.checked)} /> Enable Trust Meter</label>
            <label className="flex items-center gap-2 text-xs text-gray-300"><Vibrate className="w-4 h-4"/> <input type="checkbox" checked={haptics} onChange={(e)=>setHaptics(e.target.checked)} /> Haptic cues</label>
            <label className="flex items-center gap-2 text-xs text-gray-300"><span className="w-4 h-4 inline-block"/> <input type="checkbox" checked={smartSubtitles} onChange={(e)=>setSmartSubtitles(e.target.checked)} /> Smart Subtitles (beta)</label>
          </div>

          {profileOpen && (
            <div className="mt-2 p-3 rounded border border-white/10 bg-white/5">
              <div className="text-xs font-semibold mb-2 flex items-center gap-1"><UserIcon className="w-4 h-4"/> Edit Profile</div>
              <div className="grid gap-2">
                <label className="text-xs text-gray-400">Avatar URL</label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-400"/>
                  <input value={avatarUrl} onChange={(e)=>setAvatarUrl(e.target.value)} placeholder="https://..." className="flex-1 bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm"/>
                </div>
                <label className="text-xs text-gray-400 mt-2">Bio</label>
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-gray-400 mt-2"/>
                  <textarea value={bio} onChange={(e)=>setBio(e.target.value)} placeholder="Write a short bio" className="flex-1 bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm min-h-[80px]"/>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={()=>setProfileOpen(false)} className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded">Close</button>
                  <button onClick={saveProfile} disabled={savingProfile} className="px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 rounded disabled:opacity-50">Save profile</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-white/10 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded">Cancel</button>
          <button
            onClick={() => { 
              persistGeminiKey(); 
              localStorage.setItem('last_username', displayName.trim()); 
              onSave({ 
                displayName: displayName.trim() || (localStorage.getItem('last_username') || 'You'), 
                language, 
                model, 
                pixeldrainOnly, 
                autoCitations, 
                fiqh: { madhhab, strictness, includeMinority },
                trustMeter,
                haptics,
                smartSubtitles,
              }); 
            }}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}