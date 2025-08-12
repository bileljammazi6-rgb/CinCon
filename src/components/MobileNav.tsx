import React from 'react';
import { MessageCircle, Film, Gamepad2, Settings } from 'lucide-react';

interface MobileNavProps {
  active: 'chat' | 'movies' | 'games';
  onChange: (tab: 'chat' | 'movies' | 'games') => void;
  onSettings: () => void;
}

export function MobileNav({ active, onChange, onSettings }: MobileNavProps) {
  const item = (key: 'chat'|'movies'|'games', label: string, Icon: any) => (
    <button
      onClick={() => onChange(key)}
      className={`flex flex-col items-center justify-center flex-1 py-2 ${active===key? 'text-emerald-400' : 'text-gray-300'}`}
      aria-label={label}
    >
      <Icon className="w-6 h-6" />
      <span className="text-[10px] mt-0.5">{label}</span>
    </button>
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111b21] border-t border-white/10">
      <div className="flex items-center">
        {item('chat', 'Chat', MessageCircle)}
        {item('movies', 'Movies', Film)}
        {item('games', 'Games', Gamepad2)}
        <button onClick={onSettings} className="flex flex-col items-center justify-center flex-1 py-2 text-gray-300" aria-label="Settings">
          <Settings className="w-6 h-6" />
          <span className="text-[10px] mt-0.5">Settings</span>
        </button>
      </div>
    </nav>
  );
}