import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface DocsModalProps {
  open: boolean;
  onClose: () => void;
}

const refs: { title: string; url: string }[] = [
  { title: 'Tailwind CSS', url: 'https://tailwindcss.com/docs' },
  { title: 'Vite', url: 'https://vitejs.dev/guide/' },
  { title: 'React 18', url: 'https://react.dev/' },
  { title: 'react-markdown', url: 'https://github.com/remarkjs/react-markdown' },
  { title: 'remark-gfm', url: 'https://github.com/remarkjs/remark-gfm' },
  { title: 'react-syntax-highlighter', url: 'https://github.com/react-syntax-highlighter/react-syntax-highlighter' },
  { title: 'Google Gemini API (Generative Language)', url: 'https://ai.google.dev/gemini-api/docs' },
  { title: 'TMDB API', url: 'https://developer.themoviedb.org/reference/intro' },
  { title: 'Speech Synthesis API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis' },
  { title: 'Web Speech API (SpeechRecognition)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API' },
  { title: 'MediaRecorder API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder' },
  { title: 'Canvas API (toDataURL)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL' },
  { title: 'chess.js', url: 'https://github.com/jhlywa/chess.js' },
  { title: 'Pixeldrain', url: 'https://pixeldrain.com/' },
];

export function DocsModal({ open, onClose }: DocsModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-lg border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">References</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-2">
          {refs.map(ref => (
            <a key={ref.url} href={ref.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded px-3 py-2 text-sm">
              <span>{ref.title}</span>
              <ExternalLink className="w-4 h-4"/>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}