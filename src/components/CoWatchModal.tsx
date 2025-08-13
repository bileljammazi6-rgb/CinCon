import React, { useEffect, useRef, useState } from 'react';
import { X as Close, Send, UserPlus, Copy, Share2 } from 'lucide-react';
import { sendGameMove, subscribeToGameMoves, listUsers, createInvite } from '../services/communityService';

interface CoWatchModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
  initialUrl?: string;
  initialRoomId?: string;
}

type ChatMsg = { user: string; text: string; ts: string };

enum InviteStatus { Idle, Sending, Sent, Error }

export function CoWatchModal({ open, onClose, username, initialUrl, initialRoomId }: CoWatchModalProps) {
  const [url, setUrl] = useState('');
  const [roomId, setRoomId] = useState('cowatch-' + Math.random().toString(36).slice(2,8));
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatText, setChatText] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const [users, setUsers] = useState<{ username: string; avatar_url?: string }[]>([]);
  const [search, setSearch] = useState('');
  const [inviteTo, setInviteTo] = useState<string>('');
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>(InviteStatus.Idle);
  const [presence, setPresence] = useState<string[]>([]);

  useEffect(() => { if (open && initialUrl) setUrl(initialUrl); }, [open, initialUrl]);
  useEffect(() => { if (open && initialRoomId) setRoomId(initialRoomId); }, [open, initialRoomId]);

  useEffect(() => { if (!open) return; listUsers().then(setUsers).catch(()=>{}); }, [open]);

  useEffect(() => {
    if (!open) return;
    const unsub = subscribeToGameMoves(roomId, ({ move_type, data }) => {
      if (move_type === 'cowatch') {
        const v = videoRef.current; if (!v) return;
        if (data.action === 'play') { v.currentTime = data.time || v.currentTime; v.play(); }
        if (data.action === 'pause') { v.currentTime = data.time || v.currentTime; v.pause(); }
        if (data.action === 'seek') { v.currentTime = data.time || 0; }
        if (data.action === 'stop') { v.pause(); v.currentTime = 0; }
      }
      if (move_type === 'cowatch_chat') {
        setChat(prev => [...prev, data as ChatMsg]);
      }
      if (move_type === 'cowatch_presence') {
        const arr = (data?.users || []) as string[];
        setPresence(arr);
      }
    });
    return () => { unsub(); };
  }, [open, roomId]);

  useEffect(() => {
    if (!open) return;
    const key = 'cowatch_presence_' + roomId;
    const update = () => {
      try {
        const raw = localStorage.getItem(key) || '[]';
        const users = Array.from(new Set([...(JSON.parse(raw) as string[]), username]));
        localStorage.setItem(key, JSON.stringify(users));
        sendGameMove(roomId, 'cowatch_presence', { users }).catch(()=>{});
      } catch {}
    };
    update();
    const int = setInterval(update, 10000);
    return () => { clearInterval(int); };
  }, [open, roomId, username]);

  if (!open) return null;

  const broadcast = async (action: 'play'|'pause'|'seek'|'stop', time?: number) => {
    try { await sendGameMove(roomId, 'cowatch', { action, time, user: username }); } catch {}
  };

  const onPlay = async () => { const v = videoRef.current; if (!v) return; await broadcast('play', v.currentTime); };
  const onPause = async () => { const v = videoRef.current; if (!v) return; await broadcast('pause', v.currentTime); };
  const onSeek = async () => { const v = videoRef.current; if (!v) return; await broadcast('seek', v.currentTime); };
  const onStop = async () => { const v = videoRef.current; if (!v) return; v.pause(); v.currentTime = 0; await broadcast('stop', 0); };

  const sendChat = async () => {
    const text = chatText.trim(); if (!text) return;
    const msg: ChatMsg = { user: username, text, ts: new Date().toISOString() };
    setChat(prev => [...prev, msg]); setChatText('');
    try { await sendGameMove(roomId, 'cowatch_chat', msg as any); } catch {}
  };

  const shareLink = `${location.origin}${location.pathname}#cowatch=1&room=${encodeURIComponent(roomId)}${url?`&url=${encodeURIComponent(url)}`:''}`;
  const copyShare = async () => { try { await navigator.clipboard.writeText(shareLink); } catch {} };

  const sendInvite = async () => {
    if (!inviteTo) return;
    setInviteStatus(InviteStatus.Sending);
    try {
      await createInvite('movie', username, inviteTo, { kind: 'cowatch', roomId, url });
      setInviteStatus(InviteStatus.Sent);
      setTimeout(()=> setInviteStatus(InviteStatus.Idle), 1500);
    } catch {
      setInviteStatus(InviteStatus.Error);
      setTimeout(()=> setInviteStatus(InviteStatus.Idle), 2000);
    }
  };

  const filtered = users.filter(u => u.username !== username && (!search || u.username.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-5xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">Co‑Watch Room • {roomId}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Close className="w-5 h-5"/></button>
        </div>
        <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Video + Chat */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="Pixeldrain direct URL" className="flex-1 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm"/>
              <input value={roomId} onChange={(e)=>setRoomId(e.target.value)} placeholder="Room ID" className="sm:w-40 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm"/>
            </div>
            <div className="bg-black rounded overflow-hidden">
              {url ? (
                <div className="relative">
                  <video ref={videoRef} src={url} controls className="w-full" onPlay={onPlay} onPause={onPause} onSeeked={onSeek}/>
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <button onClick={onStop} className="text-xs px-2 py-1 rounded bg-white/10 border border-white/20 hover:bg-white/20">Stop</button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 p-6">Paste a Pixeldrain direct media URL to start.</div>
              )}
            </div>
            <div className="text-[10px] text-gray-400">In room: {presence.length>0 ? presence.join(', ') : '—'}</div>
            <div className="text-[10px] text-gray-500">Share the Room ID with friends; playback and chat are synced in real-time.</div>
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
          {/* Invite & Share */}
          <div className="space-y-3">
            <div className="p-3 rounded bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400 mb-2">Invite people</div>
              <div className="flex gap-2 mb-2">
                <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search username" className="flex-1 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm"/>
              </div>
              <div className="max-h-40 overflow-y-auto text-sm space-y-1">
                {filtered.map(u => (
                  <button key={u.username} onClick={()=>setInviteTo(u.username)} className={`w-full text-left px-2 py-1 rounded ${inviteTo===u.username?'bg-emerald-600/20 border border-emerald-500':'hover:bg-white/5 border border-white/10'}`}>{u.username}</button>
                ))}
                {filtered.length===0 && <div className="text-xs text-gray-500">No users</div>}
              </div>
              <button onClick={sendInvite} disabled={!inviteTo || inviteStatus===InviteStatus.Sending} className="mt-2 w-full px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-2"><UserPlus className="w-4 h-4"/> {inviteStatus===InviteStatus.Sending?'Sending...':inviteStatus===InviteStatus.Sent?'Sent!':'Send invite'}</button>
            </div>
            <div className="p-3 rounded bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400 mb-2">Share link</div>
              <div className="text-[10px] break-all bg-[#0f1720] border border-white/10 rounded p-2">{shareLink}</div>
              <button onClick={copyShare} className="mt-2 w-full px-3 py-2 rounded bg_white/5 border border-white/10 flex items-center justify-center gap-2"><Copy className="w-4 h-4"/> Copy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}