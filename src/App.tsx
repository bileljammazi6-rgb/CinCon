import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Image, Mic, Bot, Heart, Flame, Trash2, Eraser, Download as DownloadIcon, 
  Settings, Search, Sword, Users, Settings as SettingsIcon, Home as HomeIcon, 
  History as HistoryIcon, Film, Users as UsersIcon, MonitorPlay, Bell,
  Play, Tv, Star, Calendar, Download, ExternalLink, Copy, Menu, X, MessageCircle,
  Video, Crown, ChevronDown, User, LogOut, Plus, Eye, EyeOff
} from 'lucide-react';
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

interface User {
  id: string;
  name: string;
  isAdmin: boolean;
  avatar?: string;
  isOnline: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image';
  imageUrl?: string;
}

interface WatchTogetherSession {
  id: string;
  movieId: string;
  movieTitle: string;
  startedBy: string;
  participants: string[];
  isActive: boolean;
  currentTime: number;
  isPlaying: boolean;
}

function App() {
  // Core State
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

  // Navigation State
  const [activeTab, setActiveTab] = useState<'home'|'movies'|'series'|'chat'|'watch-together'|'profile'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Chat & Community State
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [communityInput, setCommunityInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [privateMessages, setPrivateMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Watch Together State
  const [watchTogetherSessions, setWatchTogetherSessions] = useState<WatchTogetherSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WatchTogetherSession | null>(null);
  const [movieSuggestions, setMovieSuggestions] = useState<{id: string, title: string, suggestedBy: string}[]>([]);

  // UI State
  const [moviesBanner, setMoviesBanner] = useState<string>('');
  const [notifyCenterOpen, setNotifyCenterOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showMovieSuggestions, setShowMovieSuggestions] = useState(false);

  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Constants
  const COMMUNITY_ROOM_ID = 'global';
  const ADMIN_EMAIL = 'bilel8x@example.com';
  const isAdmin = settings.displayName === 'bilel8x' || settings.displayName === 'bilel8x@example.com';

  // Mock Users (In real app, this would come from your backend)
  const mockUsers: User[] = [
    { id: '1', name: 'bilel8x', isAdmin: true, isOnline: true, avatar: '👑' },
    { id: '2', name: 'movie_lover', isAdmin: false, isOnline: true, avatar: '🎬' },
    { id: '3', name: 'series_fan', isAdmin: false, isOnline: false, avatar: '📺' },
    { id: '4', name: 'cinema_expert', isAdmin: false, isOnline: true, avatar: '🎭' },
  ];

  // Effects
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { const saved = localStorage.getItem('bilel_chat_history'); if (saved) try { setMessages(JSON.parse(saved).map((m: any)=>({ ...m, timestamp: new Date(m.timestamp) })) ); } catch {} }, []);
  useEffect(() => { localStorage.setItem('bilel_chat_history', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { if (activeTab === 'chat') { loadCommunityMessages(); } }, [activeTab]);
  useEffect(() => { if (activeTab === 'chat') { const unsubscribe = subscribeToMessages(COMMUNITY_ROOM_ID, setCommunityMessages); return unsubscribe; } }, [activeTab]);

  // Functions
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

  const handleSendPrivateMessage = () => {
    if (!selectedUser || !chatInput.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: settings.displayName || 'You',
      receiver: selectedUser.name,
      content: chatInput,
      timestamp: new Date(),
      type: 'text'
    };
    
    setPrivateMessages(prev => [...prev, newMessage]);
    setChatInput('');
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const startWatchTogether = (movieId: string, movieTitle: string) => {
    if (!isAdmin) {
      setNotifications(prev => [...prev, { id: Date.now().toString(), text: 'Only admins can start watch together sessions', ts: new Date().toISOString() }]);
      return;
    }

    const newSession: WatchTogetherSession = {
      id: Date.now().toString(),
      movieId,
      movieTitle,
      startedBy: settings.displayName || 'Admin',
      participants: [settings.displayName || 'Admin'],
      isActive: true,
      currentTime: 0,
      isPlaying: false
    };

    setWatchTogetherSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession);
    setActiveTab('watch-together');
  };

  const suggestMovie = (movieId: string, movieTitle: string) => {
    if (isAdmin) return; // Admins don't suggest, they approve
    
    const suggestion = { id: movieId, title: movieTitle, suggestedBy: settings.displayName || 'Anonymous' };
    setMovieSuggestions(prev => [...prev, suggestion]);
    setNotifications(prev => [...prev, { id: Date.now().toString(), text: `Movie suggestion sent: ${movieTitle}`, ts: new Date().toISOString() }]);
  };

  const approveMovieSuggestion = (suggestionId: string) => {
    if (!isAdmin) return;
    
    setMovieSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    setNotifications(prev => [...prev, { id: Date.now().toString(), text: 'Movie suggestion approved', ts: new Date().toISOString() }]);
  };

  const rejectMovieSuggestion = (suggestionId: string) => {
    if (!isAdmin) return;
    
    setMovieSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    setNotifications(prev => [...prev, { id: Date.now().toString(), text: 'Movie suggestion rejected', ts: new Date().toISOString() }]);
  };

  const clearChat = () => { setMessages([]); localStorage.removeItem('bilel_chat_history'); };
  const exportChat = () => { const text = messages.map(m => `${m.sender.toUpperCase()} [${m.timestamp.toLocaleString()}]: ${m.content}`).join('\n'); const blob = new Blob([text], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='chat.txt'; a.click(); URL.revokeObjectURL(url); };

  // Filter movies based on search
  const filteredMovies = Object.keys(movieLinks).filter(title => 
    title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
                <Film className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">StreamVerse</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'home' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              Home
            </button>
            
            <button
              onClick={() => setActiveTab('movies')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'movies' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Film className="w-5 h-5" />
              Movies
            </button>
            
            <button
              onClick={() => setActiveTab('series')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'series' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Tv className="w-5 h-5" />
              TV Series
            </button>
            
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'chat' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              Community Chat
            </button>
            
            <button
              onClick={() => setActiveTab('watch-together')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'watch-together' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <MonitorPlay className="w-5 h-5" />
              Watch Together
            </button>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
                {isAdmin ? <Crown className="w-5 h-5 text-yellow-400" /> : <User className="w-5 h-5 text-white" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{settings.displayName}</div>
                <div className="text-xs text-gray-400">{isAdmin ? 'Admin' : 'User'}</div>
              </div>
              <button onClick={() => setSettingsOpen(true)} className="text-gray-400 hover:text-white">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`md:ml-64 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-gray-300 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search movies, series, or users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 bg-gray-800 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 border border-gray-700"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setNotifyCenterOpen(true)}
                className="relative text-gray-300 hover:text-white"
              >
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 text-gray-300 hover:text-white"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:block">{settings.displayName}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {/* Home Tab */}
          {activeTab === 'home' && (
            <div className="space-y-8">
              {/* Hero Section */}
              <div className="relative h-96 rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Hero" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <h1 className="text-5xl font-bold text-white mb-4">Welcome to StreamVerse</h1>
                  <p className="text-xl text-gray-200 mb-6">Your ultimate destination for movies, series, and community</p>
                  <button 
                    onClick={() => setActiveTab('movies')}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Explore Content
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-red-600 transition-colors cursor-pointer" onClick={() => setActiveTab('movies')}>
                  <Film className="w-12 h-12 text-red-500 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Browse Movies</h3>
                  <p className="text-gray-400">Discover thousands of movies in our library</p>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-red-600 transition-colors cursor-pointer" onClick={() => setActiveTab('series')}>
                  <Tv className="w-12 h-12 text-red-500 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">TV Series</h3>
                  <p className="text-gray-400">Binge-watch your favorite TV shows</p>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-red-600 transition-colors cursor-pointer" onClick={() => setActiveTab('watch-together')}>
                  <MonitorPlay className="w-12 h-12 text-red-500 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Watch Together</h3>
                  <p className="text-gray-400">Enjoy movies with friends and family</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {messages.filter((m:any)=>m.type==='movie').slice(0,4).map((m:any)=>(
                    <div key={m.id} className="bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                      <img 
                        src={m.movieData?.poster_path ? `https://image.tmdb.org/t/p/w300${m.movieData.poster_path}` : 'https://via.placeholder.com/300x450/1e293b/64748b?text=No+Image'} 
                        alt={m.movieData?.title || 'Movie'} 
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-3">
                        <h4 className="font-semibold text-white text-sm truncate">{m.movieData?.title || 'Unknown'}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Movies Tab */}
          {activeTab === 'movies' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Movies</h1>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={movieInputText}
                    onChange={(e) => setMovieInputText(e.target.value)}
                    className="bg-gray-800 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 border border-gray-700"
                  />
                  <button 
                    onClick={handleSendMovieMessage}
                    disabled={isLoading || !movieInputText.trim()}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {moviesBanner && (
                <div className="bg-red-600/20 border border-red-600/30 rounded-xl p-4 text-red-200">
                  {moviesBanner}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMovies.map(title => {
                  const downloadLinks = movieLinks[title];
                  const isSeries = downloadLinks.length > 1;
                  
                  return (
                    <div key={title} className="group cursor-pointer">
                      {isSeries ? (
                        <TVSeriesCard 
                          movieData={{ title, overview: '', downloadLinks } as MovieData} 
                          downloadLinks={downloadLinks} 
                        />
                      ) : (
                        <MovieCard 
                          movieData={{ title, overview: '', downloadLinks } as MovieData} 
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Series Tab */}
          {activeTab === 'series' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white">TV Series</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.entries(movieLinks)
                  .filter(([title, links]) => links.length > 1)
                  .map(([title, downloadLinks]) => (
                    <div key={title} className="group cursor-pointer">
                      <TVSeriesCard 
                        movieData={{ title, overview: '', downloadLinks } as MovieData} 
                        downloadLinks={downloadLinks} 
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Users List */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Online Users</h3>
                <div className="space-y-2">
                  {mockUsers.map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUser?.id === user.id ? 'bg-red-600' : 'hover:bg-gray-800'
                      }`}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
                          <span className="text-lg">{user.avatar}</span>
                        </div>
                        {user.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{user.name}</span>
                          {user.isAdmin && <Crown className="w-4 h-4 text-yellow-400" />}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user.isOnline ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 flex flex-col">
                {selectedUser ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
                          <span className="text-lg">{selectedUser.avatar}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{selectedUser.name}</span>
                            {selectedUser.isAdmin && <Crown className="w-4 h-4 text-yellow-400" />}
                          </div>
                          <div className="text-sm text-gray-400">
                            {selectedUser.isOnline ? 'Online' : 'Offline'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {privateMessages.map(message => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === settings.displayName ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.sender === settings.displayName
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-800 text-white'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-gray-800">
                      <div className="flex items-center gap-3">
                        <ImageUpload onImageUpload={(img) => setUploadedImage(img)} />
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendPrivateMessage()}
                          placeholder="Type a message..."
                          className="flex-1 bg-gray-800 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 border border-gray-700"
                        />
                        <button
                          onClick={handleSendPrivateMessage}
                          disabled={!chatInput.trim()}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-medium mb-2">Select a user to start chatting</h3>
                      <p>Choose someone from the users list to begin a private conversation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Watch Together Tab */}
          {activeTab === 'watch-together' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Watch Together</h1>
                {isAdmin && (
                  <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Start Session
                  </button>
                )}
              </div>

              {/* Active Sessions */}
              {watchTogetherSessions.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Active Sessions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {watchTogetherSessions.map(session => (
                      <div key={session.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                        <h3 className="font-semibold text-white mb-2">{session.movieTitle}</h3>
                        <p className="text-gray-400 text-sm mb-3">Started by {session.startedBy}</p>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-gray-400">Participants: {session.participants.length}</span>
                          <span className={`w-2 h-2 rounded-full ${session.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                        </div>
                        <button
                          onClick={() => setCurrentSession(session)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                        >
                          Join Session
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Movie Suggestions (Admin Only) */}
              {isAdmin && movieSuggestions.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Movie Suggestions</h2>
                  <div className="space-y-3">
                    {movieSuggestions.map(suggestion => (
                      <div key={suggestion.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{suggestion.title}</h3>
                            <p className="text-gray-400 text-sm">Suggested by {suggestion.suggestedBy}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => approveMovieSuggestion(suggestion.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectMovieSuggestion(suggestion.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Movies */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Available Movies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Object.entries(movieLinks).slice(0, 12).map(([title, downloadLinks]) => (
                    <div key={title} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden group">
                      <div className="relative">
                        <img 
                          src="https://via.placeholder.com/300x450/1e293b/64748b?text=Movie" 
                          alt={title} 
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
                            {isAdmin ? (
                              <button
                                onClick={() => startWatchTogether(title, title)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                              >
                                <Play className="w-4 h-4" />
                                Start Session
                              </button>
                            ) : (
                              <button
                                onClick={() => suggestMovie(title, title)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Suggest Movie
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-white text-sm truncate">{title}</h3>
                        <p className="text-gray-400 text-xs">{downloadLinks.length} {downloadLinks.length === 1 ? 'file' : 'files'} available</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h1 className="text-3xl font-bold text-white">Profile</h1>
              
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
                    {isAdmin ? <Crown className="w-10 h-10 text-yellow-400" /> : <User className="w-10 h-10 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{settings.displayName}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{isAdmin ? 'Administrator' : 'User'}</span>
                      {isAdmin && <Crown className="w-5 h-5 text-yellow-400" />}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={settings.displayName}
                      onChange={(e) => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value as any }))}
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      <option value="auto">Auto-detect</option>
                      <option value="en">English</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSettingsOpen(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Advanced Settings
                    </button>
                    
                    <button
                      onClick={clearChat}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Clear Chat History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <SettingsModal open={settingsOpen} initial={settings} onClose={() => setSettingsOpen(false)} onSave={(s)=>{ setSettings(s); setSettingsOpen(false); }} />
      <NotificationCenter open={notifyCenterOpen} onClose={() => setNotifyCenterOpen(false)} items={notifications} onClearAll={()=>setNotifications([])} />
    </div>
  );
}

export default App;