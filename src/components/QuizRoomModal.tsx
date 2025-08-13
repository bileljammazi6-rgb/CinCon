import React, { useEffect, useRef, useState } from 'react';
import { X as Close, Send } from 'lucide-react';
import { createQuizRoom, setQuizRoomStatus, upsertQuizParticipant, listQuizParticipants, sendGameMove, subscribeToGameMoves } from '../services/communityService';
import { geminiService } from '../services/geminiService';

interface QuizRoomModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
}

type Q = { q: string; a: string };

export function QuizRoomModal({ open, onClose, username }: QuizRoomModalProps) {
  const [roomId, setRoomId] = useState('quiz-' + Math.random().toString(36).slice(2,8));
  const [status, setStatus] = useState<'waiting'|'running'|'finished'>('waiting');
  const [players, setPlayers] = useState<{ username: string; score: number }[]>([]);
  const [current, setCurrent] = useState<Q | null>(null);
  const [answer, setAnswer] = useState('');
  const [winner, setWinner] = useState<string>('');

  useEffect(() => { if (!open) return; listQuizParticipants(roomId).then(setPlayers).catch(()=>{}); }, [open, roomId]);

  useEffect(() => {
    if (!open) return;
    const unsub = subscribeToGameMoves(roomId, async ({ move_type, data }) => {
      if (move_type !== 'quiz') return;
      if (data.type === 'question') {
        setCurrent({ q: data.q, a: data.a }); setAnswer('');
      }
      if (data.type === 'score') {
        setPlayers(await listQuizParticipants(roomId));
        const top = (await listQuizParticipants(roomId))[0];
        if (top && top.score >= 100) { setWinner(top.username); setStatus('finished'); }
      }
      if (data.type === 'status') setStatus(data.status);
    });
    return () => { unsub(); };
  }, [open, roomId]);

  if (!open) return null;

  const start = async () => {
    await createQuizRoom(roomId); await setQuizRoomStatus(roomId, 'running'); setStatus('running');
    await upsertQuizParticipant(roomId, username, 0);
    await nextQuestion();
  };

  const nextQuestion = async () => {
    const prompt = 'Give a concise quiz question with one correct short answer. Format:\nQuestion: <text>\nAnswer: <text>';
    const r = await geminiService.sendMessage(prompt);
    const q = (/Question:\s*(.*)/i.exec(r)?.[1] || '').trim();
    const a = (/Answer:\s*(.*)/i.exec(r)?.[1] || '').trim();
    await sendGameMove(roomId, 'quiz', { type: 'question', q, a });
  };

  const submit = async () => {
    if (!current) return;
    const ok = answer.trim().toLowerCase() === current.a.toLowerCase();
    if (ok) {
      await upsertQuizParticipant(roomId, username, 10);
      await sendGameMove(roomId, 'quiz', { type: 'score' });
    }
    await nextQuestion();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-2xl border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="text-sm font-semibold">Quiz Room • {roomId}</div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Close className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <input value={roomId} onChange={(e)=>setRoomId(e.target.value)} className="flex-1 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm"/>
            {status==='waiting' ? (
              <button onClick={start} className="btn-primary px-3 py-2 rounded">Start</button>
            ) : (
              <div className="text-xs text-gray-400 px-3 py-2">{status==='running'?'Running':'Finished'} {winner && `• Winner: ${winner}`}</div>
            )}
          </div>
          <div className="p-3 rounded bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Scores (first to 100)</div>
            <div className="flex flex-wrap gap-2">
              {players.map(p => (
                <div key={p.username} className="px-2 py-1 rounded bg-[#0f1720] border border-white/10 text-xs">{p.username}: <span className="text-emerald-400 font-semibold">{p.score}</span></div>
              ))}
              {players.length===0 && <div className="text-xs text-gray-500">Waiting for players…</div>}
            </div>
          </div>
          <div className="p-3 rounded bg-white/5 border border-white/10 min-h-[80px]">
            <div className="text-xs text-gray-400 mb-1">Question</div>
            <div className="text-sm">{current?.q || '—'}</div>
          </div>
          <div className="flex gap-2">
            <input value={answer} onChange={(e)=>setAnswer(e.target.value)} onKeyPress={(e)=>{ if(e.key==='Enter') submit(); }} placeholder="Your answer" className="flex-1 bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm"/>
            <button onClick={submit} className="btn-primary px-3 py-2 rounded">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}