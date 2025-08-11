import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Mic, Bot, User, Volume2, Star, Calendar, Clock, PlusCircle, Heart, Flame, Trash2, Eraser, Download as DownloadIcon, Settings } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { MovieCard } from './components/MovieCard';
import { ImageUpload } from './components/ImageUpload';
import { VoiceRecorder } from './components/VoiceRecorder';
import { SpeechToText } from './components/SpeechToText';
import { SettingsModal, AppSettings } from './components/SettingsModal';
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
  const [trending, setTrending] = useState<MovieData[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bilel_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('bilel_ratings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const quickPrompts = [
    'Recommend a sci-fi movie like Interstellar',
    'Top 5 thrillers of the last decade',
    'Suggest a feel-good animated movie',
    'Compare Inception vs. Shutter Island',
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('bilel_settings');
      return saved ? JSON.parse(saved) : { displayName: 'Rim', language: 'auto' };
    } catch {
      return { displayName: 'Rim', language: 'auto' };
    }
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Persist chat history in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bilel_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as (Omit<Message, 'timestamp'> & { timestamp: string })[];
        setMessages(parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    const serializable = messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() }));
    localStorage.setItem('bilel_chat_history', JSON.stringify(serializable));
  }, [messages]);

  // Fetch trending panel
  useEffect(() => {
    (async () => {
      const data = await tmdbService.getTrendingMovies();
      setTrending(data.slice(0, 6));
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('bilel_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('bilel_ratings', JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    localStorage.setItem('bilel_settings', JSON.stringify(settings));
  }, [settings]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'enter') {
        e.preventDefault();
        handleSendMessage();
      }
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inputText, uploadedImage]);

  const toggleFavorite = (title: string) => {
    setFavorites((prev) => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };

  const setMovieRating = (title: string, value: number) => {
    setRatings(prev => ({ ...prev, [title]: value }));
  };

  const buildPrompt = (raw: string, isImageOnly: boolean) => {
    const lang = settings.language === 'auto' ? 'auto-detect' : settings.language;
    const prefix = `User: ${settings.displayName}\nPreferred language: ${lang}`;
    if (isImageOnly) {
      return `${prefix}\nTask: Analyze the provided image in detail (objects, layout, colors, text/OCR, context, movie/actor references if any).`;
    }
    return `${prefix}\nTask: ${raw}`;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !uploadedImage) return;
    const isImageOnly = uploadedImage && !inputText.trim();
    const prompt = buildPrompt(isImageOnly ? '' : inputText, !!isImageOnly);

    // If there is an image, compress before sending to reduce payload and improve analysis
    let imageForAnalysis: string | undefined;
    if (uploadedImage) {
      try {
        imageForAnalysis = await compressImageDataUrl(uploadedImage, 1280, 0.8);
      } catch {
        imageForAnalysis = uploadedImage;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content: inputText || '[Image analysis request] ',
      sender: 'user',
      timestamp: new Date(),
      image: uploadedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setUploadedImage(null);
    setIsLoading(true);

    try {
      if (!isImageOnly && inputText.trim()) {
        const normalizedQuery = inputText.toLowerCase().trim();
        const matchedTitle = Object.keys(movieLinks).find(title =>
          normalizedQuery.includes(title.toLowerCase()) ||
          title.toLowerCase().includes(normalizedQuery)
        );
        if (matchedTitle) {
          const movieData = await tmdbService.searchMovie(matchedTitle);
          const movieMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'movie',
            content: `This title exists in our Pixeldrain library: "${matchedTitle}"`,
            sender: 'ai',
            timestamp: new Date(),
            movieData: {
              ...(movieData || { title: matchedTitle, overview: '' }),
              downloadLinks: movieLinks[matchedTitle]
            }
          };
          setMessages(prev => [...prev, movieMessage]);
          return;
        }
      }

      const movieKeywords = ['movie', 'film', 'recommend', 'show', 'watch', 'فيلم', 'سلسلة', 'أوصي', 'شاهد'];
      const isMovieQuery = !isImageOnly && movieKeywords.some(keyword => 
        (inputText || '').toLowerCase().includes(keyword)
      );

      if (isMovieQuery) {
        await handleMovieQuery(inputText);
      } else {
        const response = await geminiService.sendMessage(prompt, isImageOnly ? imageForAnalysis : undefined);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'text',
          content: response,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'text',
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieQuery = async (query: string) => {
    const movieTitleQuery = query.replace(/movie|film|recommend|show|watch|فيلم|سلسلة|أوصي|شاهد/gi, '').trim();
    const normalizedQuery = movieTitleQuery.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    const matchedTitle = Object.keys(movieLinks).find(title => 
      normalizedQuery.includes(title.toLowerCase()) || 
      title.toLowerCase().includes(normalizedQuery)
    );

    if (matchedTitle) {
      const movieData = await tmdbService.searchMovie(matchedTitle);
      const movieMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'movie',
        content: `Here's what I found for "${matchedTitle}":`,
        sender: 'ai',
        timestamp: new Date(),
        movieData: {
          ...(movieData || { title: matchedTitle, overview: '' }),
          downloadLinks: movieLinks[matchedTitle]
        }
      };
      setMessages(prev => [...prev, movieMessage]);
    } else {
      const movieData = await tmdbService.searchMovie(movieTitleQuery);
      if (movieData) {
        const movieMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'movie',
          content: `I found this movie for you:`,
          sender: 'ai',
          timestamp: new Date(),
          movieData
        };
        setMessages(prev => [...prev, movieMessage]);
      } else {
        const response = await geminiService.sendMessage(query);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'text',
          content: response,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    }
  };

  const handleImageUpload = (imageData: string) => {
    setUploadedImage(imageData);
  };

  // Drag and drop image upload
  useEffect(() => {
    const node = dropRef.current;
    if (!node) return;
    const prevent = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onDrop = (e: DragEvent) => {
      prevent(e);
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = ev => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    };
    ['dragenter','dragover','dragleave','drop'].forEach(evt => node.addEventListener(evt, prevent));
    node.addEventListener('drop', onDrop);
    return () => {
      ['dragenter','dragover','dragleave','drop'].forEach(evt => node.removeEventListener(evt, prevent));
      node.removeEventListener('drop', onDrop);
    };
  }, []);

  const handleVoiceRecording = async (_audioBlob: Blob) => {
    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'text',
        content: '[Voice message recorded]',
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
    } catch (err) {
      console.error('Voice processing error', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('bilel_chat_history');
  };

  const exportChat = () => {
    const text = messages.map(m => `${m.sender.toUpperCase()} [${m.timestamp.toLocaleString()}]: ${m.content}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="chat-container w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Left rail */}
        <aside className="hidden md:flex md:w-64 flex-col border-r border-white/10 p-4 gap-4 bg-gray-900/40">
          <div>
            <h3 className="text-sm text-gray-300 mb-2">Quick prompts</h3>
            <div className="space-y-2">
              {quickPrompts.map((q) => (
                <button key={q} onClick={() => setInputText(q)} className="w-full text-left text-xs p-2 rounded bg-white/5 hover:bg-white/10 text-gray-200">
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm text-gray-300 mb-2 flex items-center gap-2"><Heart className="w-4 h-4 text-pink-400"/> Favorites</h3>
            {favorites.length === 0 ? (
              <p className="text-xs text-gray-500">No favorites yet.</p>
            ) : (
              <ul className="space-y-2 text-xs text-gray-200">
                {favorites.map((t) => (
                  <li key={t} className="flex items-center justify-between bg-white/5 rounded p-2">
                    <span className="line-clamp-1">{t}</span>
                    <button className="text-pink-400 hover:text-pink-300 text-xs" onClick={() => setInputText(`Tell me about ${t}`)}>Ask</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Center content */}
        <div className="flex-1 flex flex-col overflow-hidden" ref={dropRef}>
          {/* Header */}
          <div className="glass-effect p-4 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Bilel Jammazi AI</h1>
                <p className="text-xs text-gray-300">Hello, {settings.displayName}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => setSettingsOpen(true)} className="text-gray-300 hover:text-white text-xs flex items-center gap-1"><Settings className="w-4 h-4"/> Settings</button>
                <button onClick={clearChat} className="text-gray-300 hover:text-white text-xs flex items-center gap-1"><Eraser className="w-4 h-4"/> Clear</button>
                <button onClick={exportChat} className="text-gray-300 hover:text-white text-xs flex items-center gap-1"><DownloadIcon className="w-4 h-4"/> Export</button>
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-300">Online</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-16">
                <Bot className="w-14 h-14 mx-auto mb-3 opacity-50" />
                <h3 className="text-base font-medium mb-1">Welcome, Rim</h3>
                <p className="text-xs">Ask me anything — drop an image to analyze or try a quick prompt.</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className="group relative">
                <button onClick={() => deleteMessage(message.id)} className="opacity-0 group-hover:opacity-100 absolute -left-2 -top-2 bg-red-600 text-white rounded-full p-1"><Trash2 className="w-3 h-3"/></button>
                {message.type === 'movie' && message.movieData ? (
                  <div className="relative">
                    <MovieCard movieData={{...message.movieData, vote_average: ratings[message.movieData.title] ?? message.movieData.vote_average}} />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <select
                        className="text-xs bg-black/40 text-white rounded px-2 py-1 border border-white/10"
                        value={ratings[message.movieData.title] ?? ''}
                        onChange={(e) => setMovieRating(message.movieData!.title, Number(e.target.value))}
                      >
                        <option value="">Rate</option>
                        {[...Array(10)].map((_, i) => (
                          <option key={i+1} value={i+1}>{i+1}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => toggleFavorite(message.movieData!.title)}
                        className="text-xs px-2 py-1 rounded bg-pink-600/80 text-white hover:bg-pink-500"
                      >
                        {favorites.includes(message.movieData!.title) ? 'Unfavorite' : 'Favorite'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <ChatMessage message={message} />
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-area p-4 border-t border-white/10">
            {uploadedImage && (
              <div className="mb-3 flex items-center gap-3">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded" 
                  className="image-preview"
                />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
            
            <div className="flex items-end gap-3">
              <div className="flex gap-2">
                <ImageUpload onImageUpload={handleImageUpload} />
                <VoiceRecorder 
                  onRecording={handleVoiceRecording}
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                  onError={() => {
                    const errorMessage: Message = {
                      id: (Date.now() + 2).toString(),
                      type: 'text',
                      content: 'Microphone permission denied or not available.',
                      sender: 'ai',
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, errorMessage]);
                  }}
                />
                <SpeechToText onTranscript={(t) => setInputText(t)} />
              </div>
              
              <div className="flex-1 relative">
                <textarea ref={inputRef} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type a message, ask for movies, or analyze an image (drag-and-drop supported)..." className="w-full bg-gray-800/50 text-white placeholder-gray-400 rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/10" rows={1} style={{ minHeight: '48px', maxHeight: '120px' }} />
                {/* Quick suggestions below input */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {['What should I watch tonight?', 'Summarize this image', 'Trending sci-fi', 'Best comedy in 2023'].map(s => (
                    <button key={s} onClick={() => setInputText(s)} className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 rounded px-2 py-1">{s}</button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={isLoading || (!inputText.trim() && !uploadedImage)}
                className="btn-primary p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <aside className="hidden lg:flex lg:w-72 flex-col border-l border-white/10 p-4 gap-3 bg-gray-900/40">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm text-gray-300 flex items-center gap-1"><Flame className="w-4 h-4 text-orange-400"/> Trending</h3>
            <button className="text-xs text-gray-400 hover:text-gray-200" onClick={async () => setTrending((await tmdbService.getTrendingMovies()).slice(0,6))}>Refresh</button>
          </div>
          <div className="space-y-2 overflow-y-auto">
            {trending.map((m) => (
              <button key={m.id} onClick={() => setInputText(`Tell me about ${m.title}`)} className="w-full bg-white/5 hover:bg-white/10 rounded p-2 text-left">
                <div className="flex items-center gap-2">
                  <img src={m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : 'https://via.placeholder.com/92x138/1e293b/64748b?text=No+Image'} alt={m.title} className="w-[46px] h-[69px] object-cover rounded" />
                  <div className="flex-1">
                    <div className="text-xs text-white line-clamp-1">{m.title}</div>
                    <div className="text-[10px] text-gray-400 line-clamp-2">{m.overview}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <SettingsModal open={settingsOpen} initial={settings} onClose={() => setSettingsOpen(false)} onSave={(s) => { setSettings(s); setSettingsOpen(false); }} />
    </div>
  );
}

export default App;