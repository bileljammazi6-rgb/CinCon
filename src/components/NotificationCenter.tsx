import React from 'react';
import { X, Trash2 } from 'lucide-react';

export type AppNotification = { id: string; text: string; ts: string };

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  items: AppNotification[];
  onClearAll: () => void;
}

export function NotificationCenter({ open, onClose, items, onClearAll }: NotificationCenterProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50">
      <div className="w-full max-w-sm h-full bg-gray-900 text-white border-l border-white/10 shadow-2xl flex flex-col">
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <div className="text-sm font-semibold">Notifications</div>
          <div className="flex items-center gap-2">
            <button onClick={onClearAll} className="text-gray-300 hover:text-white text-xs flex items-center gap-1"><Trash2 className="w-4 h-4"/> Clear</button>
            <button onClick={onClose} className="text-gray-300 hover:text-white"><X className="w-5 h-5"/></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {items.length === 0 && <div className="text-xs text-gray-400 p-3">No notifications</div>}
          {items.map(n => (
            <div key={n.id} className="p-3 rounded bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400">{new Date(n.ts).toLocaleString()}</div>
              <div className="text-sm">{n.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}