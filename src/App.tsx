import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Mic, Bot, Heart, Flame, Trash2, Eraser, Download as DownloadIcon, Settings, Search, Sword, Users } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { MovieCard } from './components/MovieCard';
import { ImageUpload } from './components/ImageUpload';
import { VoiceRecorder } from './components/VoiceRecorder';
import { SpeechToText } from './components/SpeechToText';
import { SettingsModal, AppSettings } from './components/SettingsModal';
import { ChessModal } from './components/ChessModal';
import { DocsModal } from './components/DocsModal';
import { TicTacToeModal } from './components/TicTacToeModal';
import { Game2048Modal } from './components/Game2048Modal';
import { geminiService } from './services/geminiService';
import { tmdbService } from './services/tmdbService';
import { movieLinks } from './data/movieLinks';
import { Message, MovieData } from './types';
import { compressImageDataUrl } from './lib/image';
import { RockPaperScissorsModal } from './components/RockPaperScissorsModal';
import { MobileNav } from './components/MobileNav';
import { MemoryMatchModal } from './components/MemoryMatchModal';
import { SnakeModal } from './components/SnakeModal';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [movieInputText, setMovieInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try { return JSON.parse(localStorage.getItem('bilel_settings') || '') || { displayName: 'Rim', language: 'auto' }; } catch { return { displayName: 'Rim', language: 'auto' }; }
  });
  const [chessOpen, setChessOpen] = useState(false);
  const [tttOpen, setTttOpen] = useState(false);
  const [g2048Open, setG2048Open] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [rpsOpen, setRpsOpen] = useState(false);
  const [mmOpen, setMmOpen] = useState(false);
  const [snakeOpen, setSnakeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat'|'movies'|'games'|'community'>('chat');
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

  const maybeAppendCitations = async (context: string) => {
    if (!settings.autoCitations) return;
    try {
      const prompt = `Provide 2-5 concise, credible references (URLs or precise citations) that support the previous answer. Format as bullet points.`;
      const refs = await geminiService.sendMessage(prompt, undefined, { model: settings.model || 'flash' });
      setMessages(prev => [...prev, { id: (Date.now()+2).toString(), type: 'text', content: `Sources / Evidence:\n\n${refs}`, sender: 'ai', timestamp: new Date() } as any]);
    } catch {}
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
        const titles = Object.keys(movieLinks);
        const filtered = settings.pixeldrainOnly ? titles : titles; // currently all are pixeldrain by definition
        const candidates = filtered.filter(title => terms ? title.includes(terms) : true).slice(0, 5);
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
        if (settings.pixeldrainOnly) {
          // Only answer if locally available
          const normalizedQuery = userMessage.content.toLowerCase();
          const matchedTitle = Object.keys(movieLinks).find(t => normalizedQuery.includes(t.toLowerCase()) || t.toLowerCase().includes(normalizedQuery));
          if (matchedTitle) {
            const data = await tmdbService.searchMovie(matchedTitle);
            setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'movie', content: `This title exists in our Pixeldrain library: "${matchedTitle}"`, sender: 'ai', timestamp: new Date(), movieData: { ...(data || { title: matchedTitle, overview: '' }), downloadLinks: movieLinks[matchedTitle] } }]);
          } else {
            setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'text', content: 'Not available in Pixeldrain library.', sender: 'ai', timestamp: new Date() }]);
          }
        } else {
          await handleMovieQuery(userMessage.content);
        }
      } else {
        const response = await geminiService.sendMessage(prompt, isImageOnly ? imageForAnalysis : undefined, { model: settings.model || 'flash' });
        setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'text', content: response, sender: 'ai', timestamp: new Date() }]);
        await maybeAppendCitations(response);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'text', content: (error?.message || 'AI error.'), sender: 'ai', timestamp: new Date() }]);
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

  const handleSendMovieMessage = async () => {
    const query = movieInputText.trim();
    if (!query) return;

    const userMessage: any = { id: Date.now().toString(), type: 'text', content: query, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setMovieInputText('');
    setIsLoading(true);

    try {
      if (settings.pixeldrainOnly) {
        const normalized = query.toLowerCase();
        const matchedTitle = Object.keys(movieLinks).find(t => normalized.includes(t.toLowerCase()) || t.toLowerCase().includes(normalized));
        if (matchedTitle) {
          const data = await tmdbService.searchMovie(matchedTitle);
          setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'movie', content: `Available in Pixeldrain: "${matchedTitle}"`, sender: 'ai', timestamp: new Date(), movieData: { ...(data || { title: matchedTitle, overview: '' }), downloadLinks: movieLinks[matchedTitle] } } as any]);
        } else {
          setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'text', content: 'Not available in Pixeldrain library.', sender: 'ai', timestamp: new Date() } as any]);
        }
      } else {
        if (/^(recommend|suggest)(\s|$)/i.test(query)) {
          const terms = query.replace(/^(recommend|suggest)\s*/i, '').trim().toLowerCase();
          const candidates = Object.keys(movieLinks).filter(t => terms ? t.includes(terms) : true).slice(0,5);
          if (candidates.length > 0) {
            for (const title of candidates) {
              const data = await tmdbService.searchMovie(title);
              setMessages(prev => [...prev, { id: `${Date.now()}-${title}`, type: 'movie', content: `Available in Pixeldrain: "${title}"`, sender: 'ai', timestamp: new Date(), movieData: { ...(data || { title, overview: '' }), downloadLinks: movieLinks[title] } } as any]);
            }
            setIsLoading(false);
            return;
          }
        }
        await handleMovieQuery(query);
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'text', content: 'Sorry, I encountered an error. Please try again.', sender: 'ai', timestamp: new Date() } as any]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:min-h-0 flex items-stretch md:items-center justify-stretch md:justify-center pb-14 md:pb-0">
      <div className="w-full md:max-w-6xl h-[100svh] md:h-[90vh] rounded-none md:rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Left sidebar: hidden on mobile */}
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
          <div className="glass-effect p-2 md:p-3 border-b border-white/10 flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-emerald-600 flex items-center justify-center"><Bot className="w-4 h-4 text-white"/></div>
            <div className="flex-1">
              <div className="text-sm text-white font-semibold truncate">{settings.displayName}</div>
              <div className="text-[10px] md:text-[11px] text-emerald-400">online</div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={()=>setActiveTab('chat')} className={`text-xs px-2 py-1 rounded ${activeTab==='chat'?'bg-emerald-600 text-white':'text-gray-300 bg-white/5 hover:bg-white/10'}`}>Chat</button>
              <button onClick={()=>setActiveTab('movies')} className={`text-xs px-2 py-1 rounded ${activeTab==='movies'?'bg-emerald-600 text-white':'text-gray-300 bg-white/5 hover:bg-white/10'}`}>Movies</button>
              <button onClick={()=>setActiveTab('games')} className={`text-xs px-2 py-1 rounded ${activeTab==='games'?'bg-emerald-600 text-white':'text-gray-300 bg-white/5 hover:bg-white/10'}`}>Games</button>
              <button onClick={()=>setActiveTab('community')} className={`text-xs px-2 py-1 rounded ${activeTab==='community'?'bg-emerald-600 text-white':'text-gray-300 bg-white/5 hover:bg-white/10'}`}>Community</button>
            </div>
            <button onClick={()=>setChessOpen(true)} className="text-gray-300 hover:text-white text-xs px-2 py-1 rounded bg-white/5 md:bg-transparent"><Sword className="w-4 h-4"/></button>
            <button onClick={clearChat} className="hidden md:inline-flex text-gray-300 hover:text-white text-xs flex items-center gap-1"><Eraser className="w-4 h-4"/> Clear</button>
            <button onClick={exportChat} className="hidden md:inline-flex text-gray-300 hover:text-white text-xs flex items-center gap-1"><DownloadIcon className="w-4 h-4"/> Export</button>
          </div>

          {/* Body */}
          {activeTab==='chat' && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 md:p-4 space-y-2 md:space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-10 md:mt-12">
                    <Bot className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 opacity-50" />
                    <h3 className="text-sm font-medium mb-1">Welcome, {settings.displayName}</h3>
                    <p className="text-xs">Send a message or drop an image to analyze.</p>
                  </div>
                )}
                {messages.map((message) => (
                  <div key={message.id}>
                    {(message as any).type === 'movie' && (message as any).movieData ? (
                      <MovieCard movieData={(message as any).movieData} />
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
              <div className="input-area p-2 md:p-3 border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
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
                  <textarea ref={inputRef} value={inputText} onChange={(e)=>setInputText(e.target.value)} onKeyPress={(e)=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); handleSendMessage(); } }} placeholder="Type a message" className="flex-1 bg-[#2a3942] text-white placeholder-gray-400 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-white/5" rows={1} style={{ minHeight:'44px', maxHeight:'120px' }}/>
                  <button onClick={handleSendMessage} disabled={isLoading || (!inputText.trim() && !uploadedImage)} className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50"><Send className="w-5 h-5 text-white"/></button>
                </div>
              </div>
            </>
          )}

          {activeTab==='movies' && (
            <>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 rounded p-2">
                    <div className="text-xs text-gray-400 mb-1">Trending</div>
                    <div className="flex gap-2 overflow-x-auto">
                      {messages.filter((m:any)=>m.type==='movie').slice(0,5).map((m:any)=> (
                        <img key={m.id} src={m.movieData?.poster_path ? `https://image.tmdb.org/t/p/w92${m.movieData.poster_path}` : 'https://via.placeholder.com/92x138/1e293b/64748b?text=No+Image'} className="w-[46px] h-[69px] rounded" />
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <div className="text-xs text-gray-400 mb-1">Popular</div>
                    <div className="flex gap-2 overflow-x-auto">
                      {messages.filter((m:any)=>m.type==='movie').slice(5,10).map((m:any)=> (
                        <img key={m.id} src={m.movieData?.poster_path ? `https://image.tmdb.org/t/p/w92${m.movieData.poster_path}` : 'https://via.placeholder.com/92x138/1e293b/64748b?text=No+Image'} className="w-[46px] h-[69px] rounded" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">Ask for recommendations or type “recommend ... / suggest ...”. Pixeldrain-only filter is in Settings.</div>
                {messages.filter((m:any)=>m.type==='movie').length===0 && (
                  <div className="text-gray-400 text-xs">No movies yet. Try asking for a title.</div>
                )}
                {messages.filter((m:any)=>m.type==='movie').map((m:any)=>(
                  <MovieCard key={m.id} movieData={m.movieData} />
                ))}
              </div>
              <div className="input-area p-2 md:p-3 border-t border-white/10">
                <div className="flex items-end gap-2">
                  <textarea value={movieInputText} onChange={(e)=>setMovieInputText(e.target.value)} onKeyPress={(e)=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); handleSendMovieMessage(); } }} placeholder="Search movies/series or ask for recommendations" className="flex-1 bg-[#2a3942] text-white placeholder-gray-400 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-white/5" rows={1} style={{ minHeight:'44px', maxHeight:'120px' }} />
                  <button onClick={handleSendMovieMessage} disabled={isLoading || !movieInputText.trim()} className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50"><Send className="w-5 h-5 text-white"/></button>
                </div>
              </div>
            </>
          )}

          {activeTab==='games' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button onClick={()=>setChessOpen(true)} className="bg-white/5 hover:bg-white/10 rounded p-3 text-left text-sm text-white">♟ Chess</button>
                <button onClick={()=>setTttOpen(true)} className="bg-white/5 hover:bg-white/10 rounded p-3 text-left text-sm text-white">◻ Tic‑Tac‑Toe</button>
                <button onClick={()=>setG2048Open(true)} className="bg-white/5 hover:bg-white/10 rounded p-3 text-left text-sm text-white">2048</button>
                <button onClick={()=>setRpsOpen(true)} className="bg-white/5 hover:bg-white/10 rounded p-3 text-left text-sm text-white">✂ Rock/Paper/Scissors</button>
                <button onClick={()=>setMmOpen(true)} className="bg-white/5 hover:bg-white/10 rounded p-3 text-left text-sm text-white">🧠 Memory Match</button>
                <button onClick={()=>setSnakeOpen(true)} className="bg-white/5 hover:bg-white/10 rounded p-3 text-left text-sm text-white">🐍 Snake</button>
              </div>
              <div className="text-xs text-gray-400">While playing, the assistant can comment on moves (chess) directly in chat.</div>
            </div>
          )}

          {activeTab==='community' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
              <div className="bg-white/5 rounded p-3">
                <div className="flex items-center gap-2 text-white text-sm font-semibold"><Users className="w-4 h-4"/> Community (Coming Soon)</div>
                <div className="text-xs text-gray-400 mt-2">
                  - Realtime chat every 2s refresh (to be moved to websockets).<br/>
                  - Friend invites for games and movies.<br/>
                  - Neon Postgres for users, rooms, messages, invites.<br/>
                </div>
              </div>
              <div className="bg-white/5 rounded p-3">
                <div className="text-xs text-gray-300 mb-2">Global Chat (prototype)</div>
                <div className="h-48 overflow-y-auto bg-[#0f1720] rounded p-2 text-xs text-gray-200">This will display realtime messages.</div>
                <div className="mt-2 flex gap-2">
                  <input placeholder="Type to the community..." className="flex-1 bg-[#2a3942] text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-white/5"/>
                  <button className="btn-primary px-3 py-2 rounded">Send</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <SettingsModal open={settingsOpen} initial={settings} onClose={()=>setSettingsOpen(false)} onSave={(s)=>{ setSettings(s); setSettingsOpen(false); }} />
      <ChessModal open={chessOpen} onClose={()=>setChessOpen(false)} onComment={(text)=>setMessages(prev=>[...prev,{ id: (Date.now()+3).toString(), type: 'text', content: text, sender: 'ai', timestamp: new Date() } as any])} />
      <TicTacToeModal open={tttOpen} onClose={()=>setTttOpen(false)} />
      <Game2048Modal open={g2048Open} onClose={()=>setG2048Open(false)} />
      <DocsModal open={docsOpen} onClose={()=>setDocsOpen(false)} />
      <RockPaperScissorsModal open={rpsOpen} onClose={()=>setRpsOpen(false)} />
      <MobileNav active={activeTab} onChange={setActiveTab} onSettings={()=>setSettingsOpen(true)} />
      <MemoryMatchModal open={mmOpen} onClose={()=>setMmOpen(false)} />
      <SnakeModal open={snakeOpen} onClose={()=>setSnakeOpen(false)} />
    </div>
  );
}

export default App;