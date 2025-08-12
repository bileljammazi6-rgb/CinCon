import React, { useMemo, useState } from 'react';
import { X as Close } from 'lucide-react';

interface TicTacToeModalProps {
  open: boolean;
  onClose: () => void;
}

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function checkWinner(b: (null|'X'|'O')[]) {
  for (const [a,bIdx,c] of wins) {
    if (b[a] && b[a]===b[bIdx] && b[a]===b[c]) return b[a];
  }
  if (b.every(x=>x)) return 'D';
  return null;
}

export function TicTacToeModal({ open, onClose }: TicTacToeModalProps) {
  const [board, setBoard] = useState<(null|'X'|'O')[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X'|'O'>('X');
  const [online, setOnline] = useState(false);
  const winner = useMemo(()=>checkWinner(board), [board]);

  const aiMove = () => {
    const empties = board.map((v,idx)=>v?null:idx).filter(v=>v!==null) as number[];
    if (!empties.length) return;
    const choice = empties[Math.floor(Math.random()*empties.length)];
    setBoard(prev => { const copy=[...prev]; copy[choice]='O'; return copy; });
    setTurn('X');
  };

  const play = (i: number) => {
    if (winner || turn==='O' || board[i]) return;
    setBoard(prev => { const copy=[...prev]; copy[i]='X'; return copy; });
    setTurn('O');
    setTimeout(()=>{ aiMove(); }, 250);
  };

  const reset = () => { setBoard(Array(9).fill(null)); setTurn('X'); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-sm border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">Tic-Tac-Toe</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Close className="w-5 h-5"/></button>
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
            <div>Turn: <span className="text-white font-semibold">{turn}</span> {winner && (<span className="ml-2">Winner: {winner==='D'?'Draw':winner}</span>)}</div>
            <button onClick={()=>setOnline(!online)} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded">{online?'Online':'Local'}</button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {board.map((v, i) => (
              <button key={i} onClick={()=>play(i)} className="w-20 h-20 bg-[#2a3942] rounded-lg text-2xl font-bold hover:bg-[#31424c]">
                {v || ''}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2 text-xs">
            <button onClick={reset} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded">Restart</button>
          </div>
        </div>
      </div>
    </div>
  );
}