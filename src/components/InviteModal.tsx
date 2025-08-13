import React, { useEffect, useState } from 'react';
import { X as Close, Gamepad2, Bot, Grid3x3 } from 'lucide-react';
import { listUsers, createInvite, createRoom } from '../services/communityService';

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  fromUser: string;
}

export function InviteModal({ open, onClose, fromUser }: InviteModalProps) {
  const [users, setUsers] = useState<{ username: string; avatar_url?: string }[]>([]);
  const [toUser, setToUser] = useState('');
  const [game, setGame] = useState<'chess'|'tictactoe'>('chess');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { if (!open) return; listUsers(100).then(setUsers).catch(()=>{}); }, [open]);

  const send = async () => {
    setLoading(true); setError(''); setMessage('');
    try {
      if (!toUser) throw new Error('Select a user');
      const roomId = `${game}-${fromUser}-${toUser}-${Date.now()}`;
      await createRoom(roomId, `${game} vs ${fromUser} & ${toUser}`, 'game');
      await createInvite('game', fromUser, toUser, { game, roomId });
      setMessage('Invite sent!');
    } catch (e:any) { setError(e?.message||'Failed to send invite'); }
    setLoading(false);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-sm border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">Invite a player</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Close className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-3">
          {error && <div className="text-red-400 text-xs">{error}</div>}
          {message && <div className="text-emerald-400 text-xs">{message}</div>}
          <div>
            <div className="text-xs text-gray-400 mb-1">Game</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={()=>setGame('chess')} className={`px-3 py-2 rounded border ${game==='chess'?'border-emerald-500 bg-emerald-600/20':'border-white/10 bg-white/5'}`}><Bot className="w-4 h-4 inline mr-1"/>Chess</button>
              <button onClick={()=>setGame('tictactoe')} className={`px-3 py-2 rounded border ${game==='tictactoe'?'border-emerald-500 bg-emerald-600/20':'border-white/10 bg-white/5'}`}><Grid3x3 className="w-4 h-4 inline mr-1"/>Tic‑Tac‑Toe</button>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Player</div>
            <select value={toUser} onChange={(e)=>setToUser(e.target.value)} className="w-full bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm">
              <option value="">Select user…</option>
              {users.filter(u=>u.username!==fromUser).map(u=> (
                <option key={u.username} value={u.username}>{u.username}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded">Cancel</button>
            <button onClick={send} disabled={loading||!toUser} className="btn-primary px-3 py-1.5 text-xs rounded disabled:opacity-50">Send invite</button>
          </div>
        </div>
      </div>
    </div>
  );
}