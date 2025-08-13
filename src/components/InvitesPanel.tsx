import React, { useEffect, useState } from 'react';
import { Check, X as CloseIcon, Gamepad2 } from 'lucide-react';
import { listInvitesForUser, updateInviteStatus } from '../services/communityService';

interface InvitesPanelProps {
  username: string;
}

export function InvitesPanel({ username }: InvitesPanelProps) {
  const [invites, setInvites] = useState<any[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    try { setInvites(await listInvitesForUser(username)); } catch (e:any) { setError(e?.message||'Failed to load invites'); }
  };
  useEffect(() => { load(); }, [username]);

  const act = async (id: number, status: 'accepted'|'declined') => {
    try { await updateInviteStatus(id, status); await load(); } catch(e:any) { setError(e?.message||'Failed to update invite'); }
  };

  return (
    <div className="bg-white/5 rounded p-3">
      <div className="text-sm text-white font-semibold mb-2 flex items-center gap-2"><Gamepad2 className="w-4 h-4"/> My Invites</div>
      {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
      <div className="space-y-2 text-xs">
        {invites.length===0 && <div className="text-gray-400">No invites.</div>}
        {invites.map(inv => (
          <div key={inv.id} className="flex items-center justify-between bg-[#0f1720] rounded p-2">
            <div>
              <div className="text-white">{inv.type} from {inv.from_user}</div>
              <div className="text-[10px] text-gray-500">{new Date(inv.created_at).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>act(inv.id,'accepted')} className="px-2 py-1 bg-emerald-600/20 border border-emerald-500/30 rounded text-emerald-300">Accept</button>
              <button onClick={()=>act(inv.id,'declined')} className="px-2 py-1 bg-red-600/20 border border-red-500/30 rounded text-red-300">Decline</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}