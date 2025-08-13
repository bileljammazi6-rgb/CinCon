import React, { useEffect, useRef, useState } from 'react';
import { X as Close } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { saveQuizScore } from '../services/communityService';

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
}

const CATEGORIES = ['deen','knowledge','movies','music','life'] as const;

type Category = typeof CATEGORIES[number];

export function QuizModal({ open, onClose, username }: QuizModalProps) {
  const [category, setCategory] = useState<Category>('deen');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [time, setTime] = useState(20);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [state, setState] = useState<'idle'|'asking'|'answering'|'result'>('idle');
  const timerRef = useRef<number | null>(null);
  const correctRef = useRef<string>('');

  useEffect(() => { if (!open) return; reset(); }, [open]);

  const reset = () => { setQuestion(''); setAnswer(''); setTime(20); setState('idle'); };

  const ask = async () => {
    setState('asking'); setAnswer(''); setTime(20);
    try {
      const prompt = `اعطني سؤالاً واحداً قصيراً مع إجابته الصحيحة لاختبار سريع ضمن الفئة "${category}". أجب بهذا الشكل فقط:\nQuestion: <النص>\nAnswer: <النص>.`;
      const res = await geminiService.sendMessage(prompt);
      const q = /Question:\s*(.*)/i.exec(res)?.[1] || res.split('\n')[0];
      const a = /Answer:\s*(.*)/i.exec(res)?.[1] || res.split('\n')[1] || '';
      correctRef.current = a.trim();
      setQuestion(q.trim());
      setState('answering');
      setTime(20);
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(()=> setTime(t => {
        if (t<=1) { window.clearInterval(timerRef.current!); submit(); return 0; }
        return t-1;
      }), 1000) as unknown as number;
    } catch { setState('idle'); }
  };

  const submit = async () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    const ok = answer.trim().toLowerCase() === correctRef.current.toLowerCase();
    setState('result');
    if (ok) { setScore(s=>s+1); setStreak(s=>s+1); }
    else { setStreak(0); }
  };

  const next = async () => { await ask(); };

  const finish = async () => {
    try { await saveQuizScore(username, category, score, streak); } catch {}
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-sm border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">اختبار ذكاء اصطناعي</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Close className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="text-xs text-gray-400">الفئة</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {CATEGORIES.map(c => (
              <button key={c} onClick={()=>setCategory(c)} className={`px-3 py-2 rounded border ${category===c?'border-emerald-500 bg-emerald-600/20':'border-white/10 bg-white/5'}`}>{c}</button>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-300"><span>النتيجة: <span className="text-white font-semibold">{score}</span></span><span>السلسلة: <span className="text-white font-semibold">{streak}</span></span><span>الوقت: <span className="text-white font-semibold">{time}s</span></span></div>
          {state==='idle' && <button onClick={ask} className="btn-primary px-3 py-2 rounded">ابدأ</button>}
          {state!=='idle' && (
            <div className="space-y-2">
              <div className="text-sm text-white font-semibold">{question || '—'}</div>
              <input disabled={state!=='answering'} value={answer} onChange={(e)=>setAnswer(e.target.value)} onKeyPress={(e)=>{ if(e.key==='Enter') submit(); }} placeholder="اجابتك" className="w-full bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm"/>
              {state==='answering' && <button onClick={submit} className="btn-primary px-3 py-2 rounded">أرسل</button>}
              {state==='result' && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-300">الإجابة الصحيحة: <span className="text-white font-semibold">{correctRef.current}</span></div>
                  <div className="flex gap-2">
                    <button onClick={next} className="btn-primary px-3 py-2 rounded">التالي</button>
                    <button onClick={finish} className="px-3 py-2 rounded bg-white/5 border border-white/10">إنهاء</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}