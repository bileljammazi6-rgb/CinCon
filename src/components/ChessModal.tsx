import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Chess, Square, Move } from 'chess.js';

interface ChessModalProps {
  open: boolean;
  onClose: () => void;
  onComment?: (text: string) => void;
}

const pieceToEmoji: Record<string, string> = {
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
  P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
};

export function ChessModal({ open, onClose, onComment }: ChessModalProps) {
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [from, setFrom] = useState<Square | null>(null);
  const [status, setStatus] = useState<string>("White's Turn");
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);
  const [showPromotion, setShowPromotion] = useState<{ row: number; col: number; color: 'w'|'b' } | null>(null);

  useEffect(() => {
    if (!open) return;
    setFen(game.fen());
    updateStatus();
    setFrom(null); setLastMove(null); setLegalTargets([]); setShowPromotion(null);
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
    else setStatus(game.turn()==='w' ? "White's Turn" : "Black's Turn");
  };

  const aiMove = () => {
    const moves = game.moves({ verbose: true }) as Move[];
    if (moves.length === 0) return;
    const move = moves[Math.floor(Math.random() * moves.length)];
    const played = game.move({ from: move.from, to: move.to, promotion: 'q' }) as Move | null;
    if (played) {
      setLastMove({ from: played.from as Square, to: played.to as Square });
      setFen(game.fen());
      updateStatus();
      onComment?.(`Chess AI played ${played.san}. FEN: ${game.fen()}`);
    }
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
      const move = game.move({ from, to: sq, promotion: 'q' }) as Move | null;
      if (move) {
        setFrom(null);
        setLegalTargets([]);
        setLastMove({ from: move.from as Square, to: move.to as Square });
        setFen(game.fen());
        updateStatus();
        onComment?.(`Player played ${move.san}. FEN: ${game.fen()}`);
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
      <div className="bg-[#1a1a1a] text-[#e0e0e0] rounded-xl w-full max-w-xl border-[8px] border-[#4a4a4a] shadow-2xl">
        <div className="flex items-center justify-between p-3">
          <div id="message-box" className="bg-[#2e2e2e] px-4 py-2 rounded text-base font-bold">{status}</div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <div className="px-4 pb-4 flex flex-col items-center gap-3">
          <div className="rounded-xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#2e2e2e' }}>
            <div className="grid grid-cols-8 gap-0" style={{ borderRadius: 12 }}>
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
                        className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center relative ${dark ? 'bg-[#b58863]' : 'bg-[#f0d9b5]'} ${isFrom ? 'ring-2 ring-yellow-400/80' : ''} ${isLast ? 'outline outline-2 outline-green-400/70' : ''}`}
                        title={cell.square}
                        style={{ border: '1px solid rgba(0,0,0,0.1)' }}
                      >
                        {isLegal && <span className="absolute w-2 h-2 bg-emerald-600/80 rounded-full"></span>}
                        <span className="text-2xl select-none" style={{ color: dark ? '#000' : '#000' }}>{cell.piece || ''}</span>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="button-container mt-2">
            <button onClick={() => { game.reset(); setFen(game.fen()); setFrom(null); setLastMove(null); setLegalTargets([]); updateStatus(); }} className="action-button px-4 py-2 rounded font-bold" style={{ background: 'linear-gradient(145deg, #444444, #2c2c2c)', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>New Game</button>
          </div>
        </div>
      </div>
    </div>
  );
}