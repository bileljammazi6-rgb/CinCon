import React, { useEffect, useRef, useState } from 'react';
import { X as Close, Play, Pause, Link as LinkIcon } from 'lucide-react';
import { sendGameMove, subscribeToGameMoves } from '../services/communityService';

interface CoWatchModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
}

export function CoWatchModal({ open, onClose, username }: CoWatchModalProps) {
  const [url, setUrl] = useState('');
  const [roomId, setRoomId] = useState('cowatch-global');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    const unsub = subscribeToGameMoves(roomId, ({ move_type, data }) => {
      if (move_type !== 'cowatch') return;
      const v = videoRef.current; if (!v) return;
      if (data.action === 'play') { v.currentTime = data.time || v.currentTime; v.play(); }
      if (data.action === 'pause') { v.currentTime = data.time || v.currentTime; v.pause(); }
      if (data.action === 'seek') { v.currentTime = data.time || 0; }
    });
    return () => { unsub(); };
  }, [open, roomId]);

  if (!open) return null;

  const broadcast = async (action: 'play'|'pause'|'seek', time?: number) => {
    try { await sendGameMove(roomId, 'cowatch', { action, time, user: username }); } catch {}
  };

  const onPlay = async () => { const v = videoRef.current; if (!v) return; await broadcast('play', v.currentTime); };
  const onPause = async () => { const v = videoRef.current; if (!v) return; await broadcast('pause', v.currentTime); };
  const onSeek = async () => { const v = videoRef.current; if (!v) return; await broadcast('seek', v.currentTime); };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-3xl border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">Co‑Watch Room</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Close className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="Pixeldrain video URL" className="flex-1 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm"/>
            <input value={roomId} onChange={(e)=>setRoomId(e.target.value)} placeholder="Room ID" className="w-40 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm"/>
          </div>
          <div className="bg-black rounded overflow-hidden">
            {url ? (
              <video ref={videoRef} src={url} controls className="w-full" onPlay={onPlay} onPause={onPause} onSeeked={onSeek}/>
            ) : (
              <div className="text-xs text-gray-400 p-6">Paste a Pixeldrain direct media URL to start.</div>
            )}
          </div>
          <div className="text-[10px] text-gray-500">Playback is synced for anyone joined to the same room ID.</div>
        </div>
      </div>
    </div>
  );
}