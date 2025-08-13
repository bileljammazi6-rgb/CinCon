import React, { useEffect, useState } from 'react';
import { X, User, Globe, Gauge, Image as ImageIcon, Check } from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { username: string; language: string; model: 'flash'|'pro'; avatar_url?: string }) => void;
}

export function OnboardingModal({ open, onClose, onSave }: OnboardingModalProps) {
  const [username, setUsername] = useState('');
  const [language, setLanguage] = useState('auto');
  const [model, setModel] = useState<'flash'|'pro'>('flash');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (!open) return;
    try { setUsername(localStorage.getItem('last_username') || ''); } catch {}
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-md border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold">Welcome</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><User className="w-4 h-4"/> Username</label>
            <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Your name" className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm"/>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><Globe className="w-4 h-4"/> Language</label>
            <select value={language} onChange={(e)=>setLanguage(e.target.value)} className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm">
              <option value="auto">Auto</option>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">AI mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={()=>setModel('flash')} className={`px-3 py-2 rounded border ${model==='flash'?'border-emerald-500 bg-emerald-600/20':'border-white/10 bg-white/5'}`}><div className="text-xs font-semibold flex items-center gap-1"><Gauge className="w-4 h-4"/> Speed</div></button>
              <button onClick={()=>setModel('pro')} className={`px-3 py-2 rounded border ${model==='pro'?'border-blue-500 bg-blue-600/20':'border-white/10 bg-white/5'}`}><div className="text-xs font-semibold flex items-center gap-1"><Gauge className="w-4 h-4"/> Quality</div></button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><ImageIcon className="w-4 h-4"/> Avatar URL (optional)</label>
            <input value={avatarUrl} onChange={(e)=>setAvatarUrl(e.target.value)} placeholder="https://..." className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm"/>
          </div>
        </div>
        <div className="p-4 border-t border-white/10 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded">Skip</button>
          <button onClick={()=>{ try { localStorage.setItem('last_username', username.trim()); localStorage.setItem('onboarded','1'); } catch {}; onSave({ username: username.trim()||'You', language, model, avatar_url: avatarUrl||undefined }); onClose(); }} className="px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-1"><Check className="w-4 h-4"/> Save</button>
        </div>
      </div>
    </div>
  );
}