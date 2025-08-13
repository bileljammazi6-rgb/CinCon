import React, { useEffect, useRef, useState } from 'react';
import { X as Close, Send } from 'lucide-react';
import { sendGameMove, subscribeToGameMoves } from '../services/communityService';

interface CoWatchModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
}

type ChatMsg = { user: string; text: string; ts: string };

export function CoWatchModal({ open, onClose, username }: CoWatchModalProps) {
  const [url, setUrl] = useState('');
  const [roomId, setRoomId] = useState('cowatch-global');
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatText, setChatText] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    const unsub = subscribeToGameMoves(roomId, ({ move_type, data }) => {
      if (move_type === 'cowatch') {
        const v = videoRef.current; if (!v) return;
        if (data.action === 'play') { v.currentTime = data.time || v.currentTime; v.play(); }
        if (data.action === 'pause') { v.currentTime = data.time || v.currentTime; v.pause(); }
        if (data.action === 'seek') { v.currentTime = data.time || 0; }
      }
      if (move_type === 'cowatch_chat') {
        setChat(prev => [...prev, data as ChatMsg]);
      }
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

  const sendChat = async () => {
    const text = chatText.trim(); if (!text) return;
    const msg: ChatMsg = { user: username, text, ts: new Date().toISOString() };
    setChat(prev => [...prev, msg]); setChatText('');
    try { await sendGameMove(roomId, 'cowatch_chat', msg as any); } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-4xl border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">Co‑Watch Room • {roomId}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Close className="w-5 h-5"/></button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 space-y-2">
            <div className="flex gap-2">
              <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="Pixeldrain direct URL" className="flex-1 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm"/>
              <input value={roomId} onChange={(e)=>setRoomId(e.target.value)} placeholder="Room ID" className="w-40 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm"/>
            </div>
            <div className="bg-black rounded overflow-hidden">
              {url ? (
                <video ref={videoRef} src={url} controls className="w-full" onPlay={onPlay} onPause={onPause} onSeeked={onSeek}/>
              ) : (
                <div className="text-xs text-gray-400 p-6">Paste a Pixeldrain direct media URL to start.</div>
              )}
            </div>
            <div className="text-[10px] text-gray-500">Share the Room ID with friends; playback and chat are synced.</div>
          </div>
          <div className="flex flex-col h-64">
            <div className="flex-1 overflow-y-auto bg-white/5 border border-white/10 rounded p-2 text-xs space-y-1">
              {chat.map((m, i) => (
                <div key={i}><span className="text-emerald-400 font-semibold">{m.user}</span>: <span className="text-gray-200">{m.text}</span></div>
              ))}
              {chat.length===0 && <div className="text-gray-500">No messages yet. Say hello!</div>}
            </div>
            <div className="mt-2 flex gap-2">
              <input value={chatText} onChange={(e)=>setChatText(e.target.value)} onKeyPress={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); sendChat(); } }} placeholder="Message the room" className="flex-1 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm"/>
              <button onClick={sendChat} className="btn-primary px-3 py-2 rounded"><Send className="w-4 h-4"/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}