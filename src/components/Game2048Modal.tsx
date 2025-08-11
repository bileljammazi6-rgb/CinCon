import React, { useEffect, useState } from 'react';
import { X as Close } from 'lucide-react';

interface Game2048ModalProps {
  open: boolean;
  onClose: () => void;
}

const size = 4;

function spawn(board: number[][]) {
  const empties: [number, number][] = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!board[r][c]) empties.push([r, c]);
  if (empties.length === 0) return board;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
  return board;
}

function slideRow(row: number[]) {
  const arr = row.filter(v => v);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) { arr[i] *= 2; arr[i + 1] = 0; }
  }
  const merged = arr.filter(v => v);
  while (merged.length < size) merged.push(0);
  return merged;
}

function move(board: number[][], dir: 'left'|'right'|'up'|'down') {
  let moved = false;
  const clone = board.map(r => [...r]);
  if (dir === 'left') {
    for (let r = 0; r < size; r++) {
      const newRow = slideRow(clone[r]);
      if (newRow.some((v,i)=>v!==clone[r][i])) moved = true;
      clone[r] = newRow;
    }
  } else if (dir === 'right') {
    for (let r = 0; r < size; r++) {
      const reversed = [...clone[r]].reverse();
      const newRow = slideRow(reversed).reverse();
      if (newRow.some((v,i)=>v!==clone[r][i])) moved = true;
      clone[r] = newRow;
    }
  } else if (dir === 'up' || dir === 'down') {
    for (let c = 0; c < size; c++) {
      const col = clone.map(r => r[c]);
      const newCol = dir === 'up' ? slideRow(col) : slideRow([...col].reverse()).reverse();
      if (newCol.some((v,i)=>v!==clone[i][c])) moved = true;
      for (let r = 0; r < size; r++) clone[r][c] = newCol[r];
    }
  }
  return { board: clone, moved };
}

export function Game2048Modal({ open, onClose }: Game2048ModalProps) {
  const [board, setBoard] = useState<number[][]>(() => spawn(spawn(Array.from({ length: size }, () => Array(size).fill(0)))));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      let dir: 'left'|'right'|'up'|'down'|null = null;
      if (e.key === 'ArrowLeft') dir = 'left';
      if (e.key === 'ArrowRight') dir = 'right';
      if (e.key === 'ArrowUp') dir = 'up';
      if (e.key === 'ArrowDown') dir = 'down';
      if (!dir) return;
      e.preventDefault();
      const { board: nb, moved } = move(board, dir);
      if (moved) setBoard(spawn(nb.map(r => [...r])));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [board, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-sm border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">2048</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Close className="w-5 h-5"/></button>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-4 gap-1">
            {board.map((row, r) => row.map((v, c) => (
              <div key={`${r}-${c}`} className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-lg ${v? 'bg-emerald-600/30':'bg-[#2a3942]'} border border-white/10`}>
                {v || ''}
              </div>
            )))}
          </div>
          <div className="mt-2 text-xs text-gray-300">Use arrow keys to move tiles. Combine to reach 2048.</div>
          <div className="mt-3"><button onClick={()=>setBoard(spawn(spawn(Array.from({ length: size }, () => Array(size).fill(0)))))} className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded">Reset</button></div>
        </div>
      </div>
    </div>
  );
}