import React, { useState } from 'react';
import { X as Close, Link as LinkIcon } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface IsnadExplorerModalProps {
  open: boolean;
  onClose: () => void;
}

export function IsnadExplorerModal({ open, onClose }: IsnadExplorerModalProps) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const run = async () => {
    if (!query.trim()) return;
    setLoading(true); setResult('');
    try {
      const prompt = `Isnad Explorer:
Given the hadith or reference below, provide:
- Authenticity grading with sources (books, scholar gradings, numbers)
- Chain of narrators (key nodes), note controversial links
- Alternative gradings if they exist
- Brief warning if weak/controversial
- Bullet list of citations with exact references

Input: ${query}`;
      const res = await geminiService.sendMessage(prompt, undefined, { model: 'pro' });
      setResult(res);
    } catch (e: any) { setResult(e?.message || 'Failed'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-lg border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">Isnad Explorer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Close className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-3">
          <textarea value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Paste hadith text or reference (collection • number)" className="w-full bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm min-h-[80px]"/>
          <button onClick={run} disabled={loading || !query.trim()} className="btn-primary px-3 py-2 rounded disabled:opacity-50 flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Analyze</button>
          <div className="text-xs text-gray-300 whitespace-pre-wrap">
            {loading ? 'Analyzing…' : (result || 'No result')}
          </div>
        </div>
      </div>
    </div>
  );
}