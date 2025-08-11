import React, { useState } from 'react';
import { X as Close } from 'lucide-react';

interface RPSModalProps {
  open: boolean;
  onClose: () => void;
}

const choices = ['Rock', 'Paper', 'Scissors'] as const;
type Choice = typeof choices[number];

function decide(user: Choice, ai: Choice) {
  if (user === ai) return 'Draw';
  if ((user==='Rock'&&ai==='Scissors')||(user==='Paper'&&ai==='Rock')||(user==='Scissors'&&ai==='Paper')) return 'You win!';
  return 'AI wins.';
}

export function RockPaperScissorsModal({ open, onClose }: RPSModalProps) {
  const [result, setResult] = useState<string>('Make a choice.');
  const [last, setLast] = useState<{ user?: Choice; ai?: Choice }>({});

  const play = (user: Choice) => {
    const ai = choices[Math.floor(Math.random()*choices.length)];
    setLast({ user, ai });
    setResult(decide(user, ai));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-sm border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">Rock • Paper • Scissors</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Close className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <button onClick={()=>play('Rock')} className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded">🪨 Rock</button>
            <button onClick={()=>play('Paper')} className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded">📄 Paper</button>
            <button onClick={()=>play('Scissors')} className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded">✂️ Scissors</button>
          </div>
          <div className="text-xs text-gray-300 text-center">
            {last.user && last.ai ? `You: ${last.user} • AI: ${last.ai}` : '—'}
          </div>
          <div className="text-sm text-center font-semibold">{result}</div>
        </div>
      </div>
    </div>
  );
}