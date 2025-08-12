import React, { useEffect, useRef, useState } from 'react';
import { X as Close } from 'lucide-react';

interface SnakeModalProps {
  open: boolean;
  onClose: () => void;
}

const SIZE = 16; // grid size
const HAPTIC = (ms = 10) => { try { (navigator as any).vibrate?.(ms); } catch {} };

type Point = { x: number; y: number };

function eq(a: Point, b: Point) { return a.x===b.x && a.y===b.y; }
function randPoint(): Point { return { x: Math.floor(Math.random()*SIZE), y: Math.floor(Math.random()*SIZE) }; }

export function SnakeModal({ open, onClose }: SnakeModalProps) {
  const [snake, setSnake] = useState<Point[]>([{x:8,y:8}]);
  const [dir, setDir] = useState<Point>({x:1,y:0});
  const [food, setFood] = useState<Point>(randPoint());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number>(() => { try { return parseInt(localStorage.getItem('snake_best')||'0'); } catch { return 0; } });
  const loopRef = useRef<number | null>(null);

  const reset = () => {
    setSnake([{x:8,y:8}]); setDir({x:1,y:0}); setFood(randPoint()); setScore(0);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key==='ArrowUp' && dir.y!==1) setDir({x:0,y:-1});
      if (e.key==='ArrowDown' && dir.y!==-1) setDir({x:0,y:1});
      if (e.key==='ArrowLeft' && dir.x!==1) setDir({x:-1,y:0});
      if (e.key==='ArrowRight' && dir.x!==-1) setDir({x:1,y:0});
    };
    window.addEventListener('keydown', onKey);
    loopRef.current = window.setInterval(step, 150) as unknown as number;
    return () => { window.removeEventListener('keydown', onKey); if (loopRef.current) window.clearInterval(loopRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dir]);

  const step = () => {
    setSnake(prev => {
      const head = { x: (prev[0].x + dir.x + SIZE) % SIZE, y: (prev[0].y + dir.y + SIZE) % SIZE };
      if (prev.some(p => eq(p, head))) { // self-collision
        HAPTIC(20);
        if (score > best) { setBest(score); try { localStorage.setItem('snake_best', String(score)); } catch {} }
        reset();
        return [{x:8,y:8}];
      }
      const ate = eq(head, food);
      const next = [head, ...prev.slice(0, ate ? prev.length : prev.length - 1)];
      if (ate) { HAPTIC(12); setScore(s=>s+1); setFood(randPoint()); }
      return next;
    });
  };

  if (!open) return null;

  const cells = [] as JSX.Element[];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const isFood = food.x===x && food.y===y;
      const isSnake = snake.some(p => p.x===x && p.y===y);
      cells.push(
        <div key={`${x}-${y}`} className={`w-4 h-4 sm:w-5 sm:h-5 ${isSnake? 'bg-emerald-500' : isFood? 'bg-yellow-400' : 'bg-[#2a3942]'} rounded-sm`} />
      );
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-sm border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">Snake</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Close className="w-5 h-5"/></button>
        </div>
        <div className="p-3 space-y-3">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}>
            {cells}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>Score: <span className="text-white font-semibold">{score}</span></span>
            <span>Best: <span className="text-white font-semibold">{best}</span></span>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded">Restart</button>
          </div>
        </div>
      </div>
    </div>
  );
}