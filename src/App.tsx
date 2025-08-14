import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Mic, Bot, Heart, Flame, Trash2, Eraser, Download as DownloadIcon, Settings, Search, Sword, Users, Settings as SettingsIcon, Home as HomeIcon, History as HistoryIcon, Film as FilmIcon, Users as UsersIcon, MonitorPlay, Bell, Play, Tv, Star, Calendar, Download, ExternalLink, Copy } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { MovieCard } from './components/MovieCard';
import { TVSeriesCard } from './components/TVSeriesCard';
import { ImageUpload } from './components/ImageUpload';
import { VoiceRecorder } from './components/VoiceRecorder';
import { SpeechToText } from './components/SpeechToText';
import { SettingsModal, AppSettings } from './components/SettingsModal';
import { geminiService } from './services/geminiService';
import { tmdbService } from './services/tmdbService';
import { movieLinks } from './data/movieLinks';
import { Message, MovieData } from './types';
import { compressImageDataUrl } from './lib/image';
import { listMessages, sendMessage as sendCommunityMessage, CommunityMessage, subscribeToMessages, fetchProfiles, updateLastSeen, getUserProfile } from './services/communityService';
import { supabase } from './lib/supabase';
import { NotificationCenter, AppNotification } from './components/NotificationCenter';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [movieInputText, setMovieInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try { return JSON.parse(localStorage.getItem('bilel_settings') || '') || { displayName: (localStorage.getItem('last_username') || 'You'), language: 'auto' }; } catch { return { displayName: (localStorage.getItem('last_username') || 'You'), language: 'auto' }; }
  });
  const [activeTab, setActiveTab] = useState<'chat'|'movies'|'community'>('chat');
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [communityInput, setCommunityInput] = useState('');
  const COMMUNITY_ROOM_ID = 'global';
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [lastCommunityAiAt, setLastCommunityAiAt] = useState<number>(0);
  const [profileMap, setProfileMap] = useState<Record<string, { avatar_url?: string }>>({});
  const [myAvatar, setMyAvatar] = useState<string | undefined>(undefined);
  const [moviesBanner, setMoviesBanner] = useState<string>('');
  const [notifyCenterOpen, setNotifyCenterOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [globalSearch, setGlobalSearch] = useState('');

  const pushNotification = (text: string) => setNotifications(prev => [{ id: String(Date.now()), text, ts: new Date().toISOString() }, ...prev].slice(0,100));

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { const saved = localStorage.getItem('bilel_chat_history'); if (saved) try { setMessages(JSON.parse(saved).map((m: any)=>({ ...m, timestamp: new Date(m.timestamp) })) ); } catch {} }, []);
  useEffect(() => { localStorage.setItem('bilel_chat_history', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { if (activeTab === 'community') { loadCommunityMessages(); } }, [activeTab]);
  useEffect(() => { if (activeTab === 'community') { const unsubscribe = subscribeToMessages(COMMUNITY_ROOM_ID, setCommunityMessages); return unsubscribe; } }, [activeTab]);
  useEffect(() => { if (activeTab === 'community') { fetchProfiles().then(setProfileMap); } }, [activeTab]);
  useEffect(() => { if (activeTab === 'community') { updateLastSeen(); } }, [activeTab]);
  useEffect(() => { getUserProfile().then(profile => { if (profile?.avatar_url) setMyAvatar(profile.avatar_url); }); }, []);

  const loadCommunityMessages = async () => {
    try {
      const msgs = await listMessages(COMMUNITY_ROOM_ID);
      setCommunityMessages(msgs);
    } catch (e) {
      console.error('Failed to load community messages:', e);
    }
  };

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text && !uploadedImage) return;

    const userMessage: Message = { id: Date.now().toString(), type: 'text', content: text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setUploadedImage(null);
    setIsLoading(true);

    try {
      let response: string;
      if (uploadedImage) {
        response = await geminiService.sendMessage(text || 'Analyze this image', uploadedImage);
      } else {
        response = await geminiService.sendMessage(text);
      }
      
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'text', content: response, sender: 'ai', timestamp: new Date() }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'text', content: (error?.message || 'AI error.'), sender: 'ai', timestamp: new Date() }]);
    } finally { setIsLoading(false); }
  };

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,' ').trim();

  const handleMovieQuery = async (query: string) => {
    const qn = normalize(query);
    if (qn.length < 3) { setMoviesBanner('Please type at least 3 characters.'); return; }
    const movieTitleQuery = qn.replace(/\b(movie|film|recommend|show|watch|فيلم|سلسلة|أوصي|شاهد)\b/gi, '').trim();
    const matchedTitle = Object.keys(movieLinks).find(title => {
      const tn = normalize(title);
      return tn.includes(movieTitleQuery) || movieTitleQuery.includes(tn);
    });
    if (matchedTitle) {
      const movieData = await tmdbService.searchMovieOrTv(matchedTitle);
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'movie', content: `Here's what I found for "${matchedTitle}":`, sender: 'ai', timestamp: new Date(), movieData: { ...(movieData || { title: matchedTitle, overview: '' }), downloadLinks: movieLinks[matchedTitle] } }]);
    } else {
      const movieData = await tmdbService.searchMovieOrTv(movieTitleQuery);
      if (movieData) {
        const providers = movieData.id ? await tmdbService.getWatchProviders(movieData.id) : {};
        const extra = providers.link ? `\n\nWatch: ${providers.link}` : '';
        const movieMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'movie',
          content: `I found this content for you:${extra}`,
          sender: 'ai',
          timestamp: new Date(),
          movieData
        };
        setMessages(prev => [...prev, movieMessage]);
      } else {
        setMoviesBanner('No results found.');
      }
    }
  };

  const handleSendMovieMessage = async () => {
    const query = movieInputText.trim();
    if (!query) return;
    const qn = normalize(query);
    if (qn.length < 3) { setMoviesBanner('Please type at least 3 characters.'); return; }

    const userMessage: any = { id: Date.now().toString(), type: 'text', content: query, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setMovieInputText('');
    setIsLoading(true);

    try {
      if (settings.pixeldrainOnly) {
        const matchedTitle = Object.keys(movieLinks).find(t => normalize(t).includes(qn) || qn.includes(normalize(t)));
        if (matchedTitle) {
          const data = await tmdbService.searchMovieOrTv(matchedTitle);
          setMessages(prev => [...prev, { id: (Date.now()+1).toString(), type: 'movie', content: `Available in Pixeldrain: "${matchedTitle}"`, sender: 'ai', timestamp: new Date(), movieData: { ...(data || { title: matchedTitle, overview: '' }), downloadLinks: movieLinks[matchedTitle] } } as any]);
        } else {
          setMoviesBanner('Not available in Pixeldrain library.');
        }
      } else {
        if (/^(recommend|suggest)(\s|$)/i.test(query)) {
          const terms = normalize(query.replace(/^(recommend|suggest)\s*/i, ''));
          const candidates = Object.keys(movieLinks).filter(t => {
            const tn = normalize(t);
            return terms ? tn.includes(terms) : true;
          }).slice(0,5);
          if (candidates.length > 0) {
            for (const title of candidates) {
              const data = await tmdbService.searchMovieOrTv(title);
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

  const handleSendCommunity = async () => {
    const text = communityInput.trim();
    if (!text) return;
    setCommunityInput('');
    try {
      await sendCommunityMessage(COMMUNITY_ROOM_ID, settings.displayName || 'Anonymous', text);
      setCommunityMessages(prev => [...prev, { id: Date.now().toString(), room_id: COMMUNITY_ROOM_ID, sender: settings.displayName || 'Anonymous', content: text, created_at: new Date().toISOString() }]);
    } catch (e) {
      console.error('Failed to send community message:', e);
    }
  };

  const clearChat = () => { setMessages([]); localStorage.removeItem('bilel_chat_history'); };
  const exportChat = () => { const text = messages.map(m => `${m.sender.toUpperCase()} [${m.timestamp.toLocaleString()}]: ${m.content}`).join('\n'); const blob = new Blob([text], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='chat.txt'; a.click(); URL.revokeObjectURL(url); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Film className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">StreamVerse</h1>
            <div className="text-sm text-gray-300">Your Ultimate Streaming Hub</div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-2 rounded-full transition-all ${
                activeTab === 'chat' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4 inline mr-2" />
              AI Chat
            </button>
            <button
              onClick={() => setActiveTab('movies')}
              className={`px-6 py-2 rounded-full transition-all ${
                activeTab === 'movies' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4 inline mr-2" />
              Movies & Series
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-6 py-2 rounded-full transition-all ${
                activeTab === 'community' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Community
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
          {/* AI Chat Tab */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 max-h-[70vh]">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-10 animate-fadeIn">
                    <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">Welcome to StreamVerse AI</h3>
                    <p className="text-gray-500">Ask me anything about movies, series, or just chat!</p>
                  </div>
                )}
                {messages.filter((m:any)=>m.type!=='movie').map((message) => (
                  <div key={message.id} className="animate-slideUp">
                    <ChatMessage message={message} />
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Chat Input */}
              <div className="p-6 border-t border-white/10 bg-white/5">
                {uploadedImage && (
                  <div className="mb-4 flex items-center gap-2">
                    <img src={uploadedImage} alt="Uploaded" className="w-20 h-20 object-cover rounded-lg border border-white/20"/>
                    <button onClick={() => setUploadedImage(null)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                  </div>
                )}
                <div className="flex items-end gap-3">
                  <div className="flex gap-2">
                    <ImageUpload onImageUpload={(img)=>setUploadedImage(img)} />
                    <VoiceRecorder onRecording={()=>{}} isRecording={isRecording} setIsRecording={setIsRecording} onError={()=>{}} />
                    <SpeechToText onTranscript={setInputText} />
                  </div>
                  <textarea 
                    ref={inputRef} 
                    value={inputText} 
                    onChange={(e)=>setInputText(e.target.value)} 
                    onKeyPress={(e)=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); handleSendMessage(); } }} 
                    placeholder="Ask me anything..." 
                    className="flex-1 bg-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white/20" 
                    rows={1} 
                    style={{ minHeight:'48px', maxHeight:'120px' }}
                  />
                  <button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || (!inputText.trim() && !uploadedImage)} 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl disabled:opacity-50 hover:shadow-lg transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Movies Tab */}
          {activeTab === 'movies' && (
            <>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 max-h-[70vh]">
                {moviesBanner && (
                  <div className="text-sm px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-200">
                    {moviesBanner}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {messages.filter((m:any)=>m.type==='movie').map((m:any)=>(
                    m.movieData?.downloadLinks && m.movieData.downloadLinks.length > 1 ? (
                      <TVSeriesCard key={m.id} movieData={m.movieData} downloadLinks={m.movieData.downloadLinks} />
                    ) : (
                      <MovieCard key={m.id} movieData={m.movieData} />
                    )
                  ))}
                </div>
                
                {messages.filter((m:any)=>m.type==='movie').length === 0 && (
                  <div className="text-center text-gray-400 py-12">
                    <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">No content yet</h3>
                    <p className="text-gray-500">Search for movies or series to get started!</p>
                  </div>
                )}
              </div>
              
              {/* Movie Search Input */}
              <div className="p-6 border-t border-white/10 bg-white/5">
                <div className="flex items-end gap-3">
                  <textarea 
                    value={movieInputText} 
                    onChange={(e)=>setMovieInputText(e.target.value)} 
                    onKeyPress={(e)=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); handleSendMovieMessage(); } }} 
                    placeholder="Search for movies, series, or ask for recommendations..." 
                    className="flex-1 bg-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white/20" 
                    rows={1} 
                    style={{ minHeight:'48px', maxHeight:'120px' }} 
                  />
                  <button 
                    onClick={handleSendMovieMessage} 
                    disabled={isLoading || !movieInputText.trim()} 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl disabled:opacity-50 hover:shadow-lg transition-all"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Community Tab */}
          {activeTab === 'community' && (
            <>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 max-h-[70vh]">
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 text-purple-200 text-lg font-semibold">
                    <Users className="w-5 h-5"/> 
                    Global Community
                  </div>
                  <p className="text-purple-100 text-sm mt-1">Connect with other movie lovers and share your thoughts!</p>
                </div>
                
                <div className="space-y-3">
                  {communityMessages.map(m => (
                    <div key={m.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {m.sender.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{m.sender}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(m.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-200 text-sm">{m.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Community Input */}
              <div className="p-6 border-t border-white/10 bg-white/5">
                <div className="flex items-end gap-3">
                  <textarea 
                    value={communityInput} 
                    onChange={(e)=>setCommunityInput(e.target.value)} 
                    onKeyPress={(e)=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); handleSendCommunity(); } }} 
                    placeholder="Share your thoughts with the community..." 
                    className="flex-1 bg-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white/20" 
                    rows={1} 
                    style={{ minHeight:'48px', maxHeight:'120px' }} 
                  />
                  <button 
                    onClick={handleSendCommunity} 
                    disabled={!communityInput.trim()} 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl disabled:opacity-50 hover:shadow-lg transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Settings Button */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setSettingsOpen(true)}
            className="bg-white/10 backdrop-blur-md text-white p-3 rounded-full border border-white/20 hover:bg-white/20 transition-all hover:scale-110"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Modals */}
        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} onSettingsChange={setSettings} />
        <NotificationCenter open={notifyCenterOpen} onClose={() => setNotifyCenterOpen(false)} notifications={notifications} />
      </div>
    </div>
  );
}

export default App;