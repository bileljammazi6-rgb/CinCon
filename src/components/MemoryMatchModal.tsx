import React, { useEffect, useMemo, useState } from 'react';
import { X as Close } from 'lucide-react';

interface MemoryMatchModalProps {
  open: boolean;
  onClose: () => void;
}

type Card = { id: number; value: string; flipped: boolean; matched: boolean };

const EMOJIS = ['🍎','🍌','🍇','🍉','🍓','🍍','🥝','🍑'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const HAPTIC = (ms = 10) => { try { (navigator as any).vibrate?.(ms); } catch {} };

export function MemoryMatchModal({ open, onClose }: MemoryMatchModalProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [moves, setMoves] = useState(0);
  const [selection, setSelection] = useState<number[]>([]);
  const [best, setBest] = useState<number | null>(() => {
    try { const v = localStorage.getItem('mm_best'); return v ? parseInt(v) : null; } catch { return null; }
  });

  const reset = () => {
    const deck: Card[] = shuffle([...EMOJIS, ...EMOJIS]).map((v, idx) => ({ id: idx, value: v, flipped: false, matched: false }));
    setCards(deck); setMoves(0); setSelection([]);
  };

  useEffect(() => { if (open) reset(); }, [open]);

  const allMatched = useMemo(() => cards.length > 0 && cards.every(c => c.matched), [cards]);

  useEffect(() => {
    if (allMatched) {
      if (best === null || moves < best) {
        setBest(moves); try { localStorage.setItem('mm_best', String(moves)); } catch {}
      }
    }
  }, [allMatched, best, moves]);

  const flip = (idx: number) => {
    if (cards[idx].flipped || cards[idx].matched || selection.length === 2) return;
    HAPTIC(8);
    const next = cards.map((c,i)=> i===idx ? { ...c, flipped: true } : c);
    const nextSel = [...selection, idx];
    setCards(next); setSelection(nextSel);
    if (nextSel.length === 2) {
      setMoves(m => m + 1);
      const [a,b] = nextSel;
      if (next[a].value === next[b].value) {
        const matched = next.map((c,i)=> (i===a||i===b)? { ...c, matched: true } : c);
        setTimeout(()=>{ setCards(matched); setSelection([]); HAPTIC(15); }, 300);
      } else {
        setTimeout(()=>{
          const unflip = next.map((c,i)=> (i===a||i===b)? { ...c, flipped: false } : c);
          setCards(unflip); setSelection([]);
        }, 600);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-sm border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">Memory Match</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Close className="w-5 h-5"/></button>
        </div>
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {cards.map((c, idx) => (
              <button key={c.id} onClick={()=>flip(idx)} className={`h-16 rounded-lg flex items-center justify-center text-2xl font-bold border border-white/10 ${c.flipped||c.matched? 'bg-emerald-700/30' : 'bg-[#2a3942]'} ${c.matched? 'outline outline-2 outline-emerald-400/70' : ''}`}>{(c.flipped||c.matched) ? c.value : '❓'}</button>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>Moves: <span className="text-white font-semibold">{moves}</span></span>
            <span>Best: <span className="text-white font-semibold">{best ?? '-'}</span></span>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded">Restart</button>
          </div>
        </div>
      </div>
    </div>
  );
}