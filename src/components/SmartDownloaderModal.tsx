import React, { useState } from 'react';
import { X as Close, Download, Link as LinkIcon, Copy } from 'lucide-react';
import { detectProvider, getPixeldrainInfo, getYouTubeStreams, getViaProxy, Provider, StreamInfo } from '../services/downloaderService';

interface SmartDownloaderModalProps {
  open: boolean;
  onClose: () => void;
}

export function SmartDownloaderModal({ open, onClose }: SmartDownloaderModalProps) {
  const [url, setUrl] = useState('');
  const [provider, setProvider] = useState<Provider>('unknown');
  const [streams, setStreams] = useState<StreamInfo[]>([]);
  const [meta, setMeta] = useState<{ name?: string; size?: number; downloadUrl?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  if (!open) return null;

  const analyze = async () => {
    setLoading(true); setErr(''); setStreams([]); setMeta(null);
    try {
      const p = detectProvider(url);
      setProvider(p);
      if (p === 'pixeldrain') {
        const info = await getPixeldrainInfo(url);
        setMeta(info);
      } else if (p === 'youtube') {
        const s = await getYouTubeStreams(url);
        setStreams(s);
      } else if (p === 'facebook') {
        try { const s = await getViaProxy(url); setStreams(s); }
        catch { setErr('Facebook requires backend proxy. Set VITE_DOWNLOADER_ENDPOINT.'); }
      } else {
        setErr('Unsupported provider. Try Pixeldrain or YouTube.');
      }
    } catch (e: any) { setErr(e?.message || 'Failed'); }
    setLoading(false);
  };

  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); } catch {} };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-lg border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">Smart Downloader</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Close className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Paste a URL (Pixeldrain, YouTube, Facebook via proxy)</label>
            <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://..." className="w-full bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm"/>
          </div>
          <button onClick={analyze} disabled={loading || !url.trim()} className="btn-primary px-3 py-2 rounded disabled:opacity-50 flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Analyze</button>
          {err && <div className="text-xs text-red-400">{err}</div>}
          {loading && <div className="text-xs text-gray-400">Analyzing…</div>}

          {meta && (
            <div className="p-3 rounded bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400">Pixeldrain file</div>
              <div className="text-sm font-semibold">{meta.name || 'File'}</div>
              <div className="text-[10px] text-gray-400">Size: {meta.size ? `${Math.round(meta.size/1024/1024)} MB` : '—'}</div>
              {meta.downloadUrl && (
                <div className="mt-2 flex gap-2">
                  <a href={meta.downloadUrl} target="_blank" rel="noreferrer" className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-2 text-sm"><Download className="w-4 h-4"/> Download</a>
                  <button onClick={()=>copy(meta.downloadUrl!)} className="px-3 py-2 bg-white/5 border border-white/10 rounded flex items-center gap-2 text-sm"><Copy className="w-4 h-4"/> Copy link</button>
                </div>
              )}
            </div>
          )}

          {streams.length>0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Streams ({provider})</div>
              {streams.slice(0,10).map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/10 text-sm">
                  <div className="flex-1">
                    <div className="font-semibold">{s.quality || (s.audioOnly ? 'Audio' : 'Video')}</div>
                    <div className="text-[10px] text-gray-400">{s.mime || ''} {s.size ? `• ${s.size}` : ''}</div>
                  </div>
                  <div className="flex gap-2">
                    <a href={s.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-1 text-xs"><Download className="w-4 h-4"/> Open</a>
                    <button onClick={()=>copy(s.url)} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded flex items-center gap-1 text-xs"><Copy className="w-4 h-4"/> Copy</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}