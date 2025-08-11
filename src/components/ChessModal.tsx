import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Chess, Square, Move } from 'chess.js';

interface ChessModalProps {
  open: boolean;
  onClose: () => void;
}

const pieceToEmoji: Record<string, string> = {
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
  P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
};

export function ChessModal({ open, onClose }: ChessModalProps) {
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [from, setFrom] = useState<Square | null>(null);
  const [status, setStatus] = useState<string>('Your move (White).');
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);

  useEffect(() => {
    if (!open) return;
    setFen(game.fen());
    updateStatus();
    setFrom(null); setLastMove(null); setLegalTargets([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const board = useMemo(() => {
    const rows: { square: Square; piece?: string }[][] = [];
    const ranks = [8,7,6,5,4,3,2,1];
    const files = ['a','b','c','d','e','f','g','h'];
    const state = game.board();
    for (let r = 0; r < 8; r++) {
      const row: { square: Square; piece?: string }[] = [];
      for (let f = 0; f < 8; f++) {
        const sq = (files[f] + ranks[r]) as Square;
        const piece = state[r][f];
        row.push({ square: sq, piece: piece ? pieceToEmoji[piece.color === 'w' ? piece.type.toUpperCase() : piece.type] : undefined });
      }
      rows.push(row);
    }
    return rows;
  }, [fen, game]);

  const updateStatus = () => {
    if (game.isCheckmate()) setStatus(game.turn()==='w' ? 'Black wins by checkmate.' : 'White wins by checkmate.');
    else if (game.isDraw()) setStatus('Draw.');
    else setStatus(game.turn()==='w' ? 'Your move (White).' : "AI's move (Black)...");
  };

  const aiMove = () => {
    const moves = game.moves({ verbose: true }) as Move[];
    if (moves.length === 0) return;
    const move = moves[Math.floor(Math.random() * moves.length)];
    game.move({ from: move.from, to: move.to, promotion: 'q' });
    setLastMove({ from: move.from as Square, to: move.to as Square });
    setFen(game.fen());
    updateStatus();
  };

  const onSquareClick = (sq: Square) => {
    if (game.turn() !== 'w') return; // user plays white
    if (!from) {
      setFrom(sq);
      const legals = (game.moves({ square: sq, verbose: true }) as Move[]).map(m => m.to as Square);
      setLegalTargets(legals);
      return;
    }
    try {
      const move = game.move({ from, to: sq, promotion: 'q' });
      if (move) {
        setFrom(null);
        setLegalTargets([]);
        setLastMove({ from: move.from as Square, to: move.to as Square });
        setFen(game.fen());
        updateStatus();
        setTimeout(aiMove, 300);
      } else {
        setFrom(null);
        setLegalTargets([]);
      }
    } catch {
      setFrom(null);
      setLegalTargets([]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-md border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">Chess vs AI</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-8 gap-0 border border-white/10 rounded overflow-hidden">
            {board.map((row, rIdx) => (
              <React.Fragment key={rIdx}>
                {row.map((cell, cIdx) => {
                  const dark = (rIdx + cIdx) % 2 === 1;
                  const isFrom = from === cell.square;
                  const isLast = lastMove && (cell.square === lastMove.from || cell.square === lastMove.to);
                  const isLegal = legalTargets.includes(cell.square);
                  return (
                    <button
                      key={cell.square}
                      onClick={() => onSquareClick(cell.square)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center relative ${dark ? 'bg-[#3b4a54]' : 'bg-[#2a3942]'} ${isFrom ? 'ring-2 ring-emerald-500' : ''} ${isLast ? 'outline outline-2 outline-yellow-400/70' : ''}`}
                      title={cell.square}
                    >
                      {isLegal && <span className="absolute w-2 h-2 bg-emerald-400/70 rounded-full"></span>}
                      <span className="text-lg select-none">{cell.piece || ''}</span>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-300">{status}</div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { game.reset(); setFen(game.fen()); setFrom(null); setLastMove(null); setLegalTargets([]); updateStatus(); }} className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}