import React, { useState } from 'react';
import { X as Close, Music2, Mic } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface TajwidCoachModalProps {
  open: boolean;
  onClose: () => void;
  haptics?: boolean;
}

export function TajwidCoachModal({ open, onClose, haptics }: TajwidCoachModalProps) {
  const [ref, setRef] = useState('الفاتحة 1:1');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const analyze = async () => {
    setLoading(true); setResult('');
    try {
      const prompt = `مدرب تجويد:
بالنسبة للآية التالية أعطني:
- أكثر الأخطاء الشائعة المحتملة
- ملاحظات عن المخارج والمدود
- تمارين قصيرة مركّزة
- اقتراحات للمقامات (اختياري)
المرجع: ${ref}`;
      const res = await geminiService.sendMessage(prompt);
      setResult(res);
    } catch (e: any) { setResult(e?.message || 'فشل التحليل'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-lg border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">مدرب التجويد</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Close className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-3">
          <input value={ref} onChange={(e)=>setRef(e.target.value)} placeholder="مثال: البقرة 2:255" className="w-full bg-[#2a3942] border border-white/10 rounded px-3 py-2 text-sm"/>
          <div className="flex gap-2">
            <button onClick={analyze} disabled={loading} className="btn-primary px-3 py-2 rounded disabled:opacity-50 flex items-center gap-2"><Music2 className="w-4 h-4"/> تحليل</button>
            <button onClick={()=>{ try { if(haptics) navigator.vibrate?.(30) } catch {} }} className="px-3 py-2 rounded bg-white/5 border border-white/10 flex items-center gap-2"><Mic className="w-4 h-4"/> تسجيل (قريباً)</button>
          </div>
          <div className="text-xs text-gray-300 whitespace-pre-wrap">
            {loading ? 'جار التحليل…' : (result || 'لا يوجد نتيجة')}
          </div>
        </div>
      </div>
    </div>
  );
}