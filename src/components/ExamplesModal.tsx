import React from 'react';
import { X, Lightbulb } from 'lucide-react';

interface ExamplesModalProps {
  open: boolean;
  onClose: () => void;
  onPick: (text: string) => void;
}

const EXAMPLES: { title: string; prompt: string }[] = [
  { title: 'Explain a concept', prompt: 'Explain quantum computing in simple terms.' },
  { title: 'Generate code', prompt: 'Write a Python script to scrape a website for article titles.' },
  { title: 'Plan a trip', prompt: 'Plan a 5-day Tokyo itinerary with food and anime spots.' },
  { title: 'Brainstorm ideas', prompt: 'Brainstorm creative marketing ideas for a coffee shop.' },
  { title: 'Write an email', prompt: 'Draft a polite email asking for a project deadline extension.' },
  { title: 'Summarize an article', prompt: 'Summarize the key points of the latest article on renewable energy.' },
  { title: 'Translate a phrase', prompt: 'Translate "Where is the nearest cafe?" to French.' },
  { title: 'Create a recipe', prompt: 'Give me a simple chocolate cake recipe with steps.' },
];

export function ExamplesModal({ open, onClose, onPick }: ExamplesModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-950 p-6 rounded-xl max-w-2xl w-full max-h-full overflow-y-auto border border-neutral-800 text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Lightbulb className="w-5 h-5"/>Explore Prompts</h2>
          <button onClick={onClose} className="p-2 bg-neutral-800 text-neutral-300 rounded-full hover:bg-neutral-700"><X className="w-4 h-4"/></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={()=>{ onPick(ex.prompt); onClose(); }} className="text-left p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 border border-neutral-700">
              <div className="font-semibold text-lg flex items-center gap-2"><Lightbulb className="w-4 h-4"/>{ex.title}</div>
              <div className="text-sm text-neutral-400 mt-1">{ex.prompt}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}