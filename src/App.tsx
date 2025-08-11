import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Mic, Bot, Heart, Flame, Trash2, Eraser, Download as DownloadIcon, Settings, Search, Sword } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { MovieCard } from './components/MovieCard';
import { ImageUpload } from './components/ImageUpload';
import { VoiceRecorder } from './components/VoiceRecorder';
import { SpeechToText } from './components/SpeechToText';
import { SettingsModal, AppSettings } from './components/SettingsModal';
import { ChessModal } from './components/ChessModal';
import { geminiService } from './services/geminiService';
import { tmdbService } from './services/tmdbService';
import { movieLinks } from './data/movieLinks';
import { Message, MovieData } from './types';
import { compressImageDataUrl } from './lib/image';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try { return JSON.parse(localStorage.getItem('bilel_settings') || '') || { displayName: 'Rim', language: 'auto' }; } catch { return { displayName: 'Rim', language: 'auto' }; }
  });
  const [chessOpen, setChessOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { const saved = localStorage.getItem('bilel_chat_history'); if (saved) try { setMessages(JSON.parse(saved).map((m: any)=>({ ...m, timestamp: new Date(m.timestamp) })) ); } catch {} }, []);
  useEffect(() => { localStorage.setItem('bilel_chat_history', JSON.stringify(messages.map(m=>({ ...m, timestamp: m.timestamp.toISOString() })))); }, [messages]);
  useEffect(() => { localStorage.setItem('bilel_settings', JSON.stringify(settings)); }, [settings]);

  useEffect(() => {
    const node = dropRef.current; if (!node) return;
    const prevent = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onDrop = (e: DragEvent) => { prevent(e); const f=e.dataTransfer?.files?.[0]; if (!f||!f.type.startsWith('image/')) return; const r=new FileReader(); r.onload=ev=>setUploadedImage(ev.target?.result as string); r.readAsDataURL(f); };
    ['dragenter','dragover','dragleave','drop'].forEach(evt => node.addEventListener(evt, prevent)); node.addEventListener('drop', onDrop);
    return () => { ['dragenter','dragover','dragleave','drop'].forEach(evt => node.removeEventListener(evt, prevent)); node.removeEventListener('drop', onDrop); };
  }, []);

  const buildPrompt = (raw: string, isImageOnly: boolean) => {
    const lang = settings.language === 'auto' ? 'auto-detect' : settings.language;
    const prefix = `User: ${settings.displayName}\nPreferred language: ${lang}`;
    return isImageOnly ? `${prefix}\nTask: Analyze the provided image in detail (objects, layout, colors, text/OCR, context, movie/actor references if any).` : `${prefix}\nTask: ${raw}`;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !uploadedImage) return;
    const isImageOnly = uploadedImage && !inputText.trim();
    const prompt = buildPrompt(isImageOnly ? '' : inputText, !!isImageOnly);
    let imageForAnalysis: string | undefined;
    if (uploadedImage) { try { imageForAnalysis = await compressImageDataUrl(uploadedImage, 1280, 0.8); } catch { imageForAnalysis = uploadedImage; } }

    const userMessage: Message = { id: Date.now().toString(), type: 'text', content: inputText || '[Image analysis request] ', sender: 'user', timestamp: new Date(), image: uploadedImage || undefined };
    setMessages(prev => [...prev, userMessage]); setInputText(''); setUploadedImage(null); setIsLoading(true);

    try {
      // Pixeldrain recommendation command
      if (/^recommend(\s|$)/i.test(userMessage.content) || /^suggest(\s|$)/i.test(userMessage.content)) {
        const terms = userMessage.content.replace(/^(recommend|suggest)\s*/i, '').trim().toLowerCase();
        const candidates = Object.keys(movieLinks)
          .filter(title => terms ? title.includes(terms) : true)
          .slice(0, 5);
        if (candidates.length > 0) {
          for (const title of candidates) {
            const data = await tmdbService.searchMovie(title);
            setMessages(prev => [...prev, { id: `${Date.now()}-${title}`, type: 'movie', content: `Available in Pixeldrain: "${title}"`, sender: 'ai', timestamp: new Date(), movieData: { ...(data || { title, overview: '' }), downloadLinks: movieLinks[title] } }]);
          }
          setIsLoading(false);
          return;
        }
      }

      if (!isImageOnly && userMessage.content.trim()) {
        const normalizedQuery = userMessage.content.toLowerCase().trim();
        const matchedTitle = Object.keys(movieLinks).find(title => normalizedQuery.includes(title.toLowerCase()) || title.toLowerCase().includes(normalizedQuery));
        if (matchedTitle) {
          const movieData = await tmdbService.searchMovie(matchedTitle);
          setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'movie', content: `This title exists in our Pixeldrain library: "${matchedTitle}"`, sender: 'ai', timestamp: new Date(), movieData: { ...(movieData || { title: matchedTitle, overview: '' }), downloadLinks: movieLinks[matchedTitle] } }]);
          setIsLoading(false);
          return;
        }
      }

      const movieKeywords = ['movie','film','recommend','show','watch','فيلم','سلسلة','أوصي','شاهد'];
      const isMovieQuery = !isImageOnly && movieKeywords.some(k => userMessage.content.toLowerCase().includes(k));
      if (isMovieQuery) {
        await handleMovieQuery(userMessage.content);
      } else {
        const response = await geminiService.sendMessage(prompt, isImageOnly ? imageForAnalysis : undefined, { model: settings.model || 'flash' });
        setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'text', content: response, sender: 'ai', timestamp: new Date() }]);
      }
    } catch {
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'text', content: 'Sorry, I encountered an error. Please try again.', sender: 'ai', timestamp: new Date() }]);
    } finally { setIsLoading(false); }
  };

  const handleMovieQuery = async (query: string) => {
    const movieTitleQuery = query.replace(/movie|film|recommend|show|watch|فيلم|سلسلة|أوصي|شاهد/gi, '').trim();
    const normalizedQuery = movieTitleQuery.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const matchedTitle = Object.keys(movieLinks).find(title => normalizedQuery.includes(title.toLowerCase()) || title.toLowerCase().includes(normalizedQuery));
    if (matchedTitle) {
      const movieData = await tmdbService.searchMovie(matchedTitle);
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'movie', content: `Here's what I found for "${matchedTitle}":`, sender: 'ai', timestamp: new Date(), movieData: { ...(movieData || { title: matchedTitle, overview: '' }), downloadLinks: movieLinks[matchedTitle] } }]);
    } else {
      const movieData = await tmdbService.searchMovie(movieTitleQuery);
      if (movieData) setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'movie', content: 'I found this movie for you:', sender: 'ai', timestamp: new Date(), movieData }]);
      else { const response = await geminiService.sendMessage(query); setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'text', content: response, sender: 'ai', timestamp: new Date() }]); }
    }
  };

  const handleImageUpload = (imageData: string) => setUploadedImage(imageData);
  const handleVoiceRecording = async () => setMessages(prev => [...prev, { id: Date.now().toString(), type: 'text', content: '[Voice message recorded]', sender: 'user', timestamp: new Date() }]);
  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
  const clearChat = () => { setMessages([]); localStorage.removeItem('bilel_chat_history'); };
  const exportChat = () => { const text = messages.map(m => `${m.sender.toUpperCase()} [${m.timestamp.toLocaleString()}]: ${m.content}`).join('\n'); const blob = new Blob([text], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='chat.txt'; a.click(); URL.revokeObjectURL(url); };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Left sidebar: chats list (stub) */}
        <aside className="hidden md:flex md:w-72 flex-col bg-[#111b21] border-r border-white/10">
          <div className="p-3 border-b border-white/10 flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center"><Bot className="w-4 h-4 text-white"/></div>
            <div className="text-sm text-white font-semibold">Bilel Jammazi AI</div>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setSettingsOpen(true)} className="text-gray-300 hover:text-white"><Settings className="w-4 h-4"/></button>
            </div>
          </div>
          <div className="p-3"><div className="flex items-center gap-2 bg-white/5 rounded px-2 py-1 text-gray-300 text-sm"><Search className="w-4 h-4"/><input className="bg-transparent outline-none flex-1" placeholder="Search or start a new chat"/></div></div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2 text-xs text-gray-400">Recent</div>
            <button className="w-full text-left px-3 py-2 hover:bg-white/5">
              <div className="text-sm text-white">Rim</div>
              <div className="text-xs text-gray-400">Open chat</div>
            </button>
          </div>
        </aside>

        {/* Right chat pane */}
        <div className="flex-1 flex flex-col wa-bg" ref={dropRef}>
          {/* Header */}
          <div className="glass-effect p-3 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center"><Bot className="w-4 h-4 text-white"/></div>
            <div className="flex-1">
              <div className="text-sm text-white font-semibold">{settings.displayName}</div>
              <div className="text-[11px] text-emerald-400">online</div>
            </div>
            <button onClick={()=>setChessOpen(true)} className="text-gray-300 hover:text-white text-xs flex items-center gap-1"><Sword className="w-4 h-4"/> Chess</button>
            <button onClick={clearChat} className="text-gray-300 hover:text-white text-xs flex items-center gap-1"><Eraser className="w-4 h-4"/> Clear</button>
            <button onClick={exportChat} className="text-gray-300 hover:text-white text-xs flex items-center gap-1"><DownloadIcon className="w-4 h-4"/> Export</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-12">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <h3 className="text-sm font-medium mb-1">Welcome, {settings.displayName}</h3>
                <p className="text-xs">Send a message or drop an image to analyze.</p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id}>
                {message.type === 'movie' && message.movieData ? (
                  <MovieCard movieData={message.movieData} />
                ) : (
                  <ChatMessage message={message} />
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="typing-indicator"><div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div></div>
                <span className="text-xs">Typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="input-area p-3 border-t border-white/10">
            {uploadedImage && (
              <div className="mb-2 flex items-center gap-2">
                <img src={uploadedImage} alt="Uploaded" className="image-preview"/>
                <button onClick={() => setUploadedImage(null)} className="text-red-400 hover:text-red-300">Remove</button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <div className="flex gap-1">
                <ImageUpload onImageUpload={(img)=>setUploadedImage(img)} />
                <VoiceRecorder onRecording={()=>{}} isRecording={isRecording} setIsRecording={setIsRecording} onError={()=>{}} />
                <SpeechToText onTranscript={setInputText} />
              </div>
              <textarea ref={inputRef} value={inputText} onChange={(e)=>setInputText(e.target.value)} onKeyPress={(e)=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); handleSendMessage(); } }} placeholder="Type a message" className="flex-1 bg-[#2a3942] text-white placeholder-gray-400 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-white/5" rows={1} style={{ minHeight:'42px', maxHeight:'120px' }}/>
              <button onClick={handleSendMessage} disabled={isLoading || (!inputText.trim() && !uploadedImage)} className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50"><Send className="w-5 h-5 text-white"/></button>
            </div>
          </div>
        </div>
      </div>

      <SettingsModal open={settingsOpen} initial={settings} onClose={()=>setSettingsOpen(false)} onSave={(s)=>{ setSettings(s); setSettingsOpen(false); }} />
      <ChessModal open={chessOpen} onClose={()=>setChessOpen(false)} />
    </div>
  );
}

export default App;