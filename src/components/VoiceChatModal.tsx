import React, { useEffect, useRef, useState } from 'react';
import { X as Close, Mic, Volume2, Pause, Play, Radio } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface VoiceChatModalProps {
  open: boolean;
  onClose: () => void;
  language?: string; // e.g., 'auto', 'en-US', 'ar-SA'
}

export function VoiceChatModal({ open, onClose, language = 'auto' }: VoiceChatModalProps) {
  const recRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [listening, setListening] = useState(false);
  const [handsFree, setHandsFree] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState<string>('');
  const vadTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    try { setVoices(window.speechSynthesis.getVoices()); } catch {}
    const onVoices = () => setVoices(window.speechSynthesis.getVoices());
    window.speechSynthesis.onvoiceschanged = onVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null as any; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.interimResults = true;
    rec.continuous = true;
    rec.lang = language === 'auto' ? undefined : language;
    rec.onresult = (e: any) => {
      let txt = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) txt += e.results[i][0].transcript;
      setTranscript(txt);
      // silence timer resets on new text
      if (handsFree) resetVadTimer();
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
  }, [open, language, handsFree]);

  const start = async () => {
    if (!recRef.current) return;
    try {
      recRef.current.start(); setListening(true);
      if (handsFree) await initVAD();
    } catch {}
  };
  const stop = () => { try { recRef.current?.stop(); } catch {}; setListening(false); cleanupVAD(); };

  const initVAD = async () => {
    try {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const src = audioCtxRef.current.createMediaStreamSource(stream);
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 512; analyser.smoothingTimeConstant = 0.8;
      src.connect(analyser); analyserRef.current = analyser;
      monitorVAD();
    } catch {}
  };
  const cleanupVAD = () => { if (vadTimerRef.current) { window.clearTimeout(vadTimerRef.current); vadTimerRef.current = null; } try { audioCtxRef.current?.close(); } catch {} analyserRef.current = null; };

  const monitorVAD = () => {
    const analyser = analyserRef.current; if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      // simple energy estimate
      let sum = 0; for (let i=0;i<data.length;i++){ const v=(data[i]-128)/128; sum += v*v; }
      const rms = Math.sqrt(sum/data.length);
      if (rms < 0.02 && transcript.trim().length>0) scheduleAutoSend();
      requestAnimationFrame(tick);
    };
    tick();
  };

  const scheduleAutoSend = () => {
    if (vadTimerRef.current) return;
    vadTimerRef.current = window.setTimeout(async () => {
      vadTimerRef.current = null;
      if (!handsFree) return;
      await sendTranscript();
    }, 1200) as unknown as number;
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1; utter.pitch = 1; utter.volume = 1;
    const v = voices.find(v=>v.name===voiceName) || voices[0];
    if (v) utter.voice = v;
    window.speechSynthesis.speak(utter);
  };

  const sendTranscript = async () => {
    const text = transcript.trim(); if (!text) return;
    setTranscript('');
    try {
      const res = await geminiService.sendMessage(text);
      speak(res);
    } catch {
      speak('Sorry, I could not answer.');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-md border border-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="text-sm font-semibold flex items-center gap-2"><Radio className="w-4 h-4"/> Voice Chat</div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Close className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="text-xs text-gray-400">Mode</div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setHandsFree(false)} className={`px-3 py-1.5 rounded border ${!handsFree?'border-emerald-500 bg-emerald-600/20':'border-white/10 bg-white/5'}`}>Push‑to‑talk</button>
            <button onClick={()=>setHandsFree(true)} className={`px-3 py-1.5 rounded border ${handsFree?'border-emerald-500 bg-emerald-600/20':'border-white/10 bg-white/5'}`}>Hands‑free</button>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">TTS Voice</label>
            <select value={voiceName} onChange={(e)=>setVoiceName(e.target.value)} className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm">
              <option value="">System default</option>
              {voices.map(v=> <option key={v.name} value={v.name}>{v.name}</option>)}
            </select>
          </div>
          <div className="p-3 rounded bg-white/5 border border-white/10 min-h-[80px] text-sm text-gray-300">{transcript || 'Speak to start…'}</div>
          <div className="flex items-center gap-2">
            {!listening ? (
              <button onClick={start} className="btn-primary px-3 py-2 rounded flex items-center gap-2"><Mic className="w-4 h-4"/> Start</button>
            ) : (
              <button onClick={stop} className="px-3 py-2 rounded bg-white/5 border border-white/10 flex items-center gap-2"><Pause className="w-4 h-4"/> Stop</button>
            )}
            <button onClick={sendTranscript} className="px-3 py-2 rounded bg-white/5 border border-white/10 flex items-center gap-2"><Volume2 className="w-4 h-4"/> Reply</button>
          </div>
        </div>
      </div>
    </div>
  );
}