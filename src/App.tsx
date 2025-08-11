import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Mic, Bot, User, Volume2, Download, Star, Calendar, Clock, PlusCircle, Heart, Flame } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { MovieCard } from './components/MovieCard';
import { ImageUpload } from './components/ImageUpload';
import { VoiceRecorder } from './components/VoiceRecorder';
import { geminiService } from './services/geminiService';
import { tmdbService } from './services/tmdbService';
import { movieLinks } from './data/movieLinks';
import { Message, MovieData } from './types';

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
  const quickPrompts = [
    'Recommend a sci-fi movie like Interstellar',
    'Top 5 thrillers of the last decade',
    'Suggest a feel-good animated movie',
    'Compare Inception vs. Shutter Island',
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const toggleFavorite = (title: string) => {
    setFavorites((prev) => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !uploadedImage) return;

    // If image only, send an image analysis prompt
    const isImageOnly = uploadedImage && !inputText.trim();
    const prompt = isImageOnly
      ? 'Analyze this image in detail: describe objects, layout, colors, text (OCR), context, and any movie/actor references.'
      : inputText;

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
      // Quick path: Pixeldrain titles detection
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

      // Movie intent
      const movieKeywords = ['movie', 'film', 'recommend', 'show', 'watch', 'فيلم', 'سلسلة', 'أوصي', 'شاهد'];
      const isMovieQuery = !isImageOnly && movieKeywords.some(keyword => 
        (inputText || '').toLowerCase().includes(keyword)
      );

      if (isMovieQuery) {
        await handleMovieQuery(inputText);
      } else {
        // AI chat + image analysis when present
        const response = await geminiService.sendMessage(prompt, isImageOnly ? uploadedImage! : undefined);
        
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
      console.error('Error sending message:', error);
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

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="glass-effect p-4 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Bilel Jammazi AI</h1>
                <p className="text-xs text-gray-300">Movies, images, and more</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
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
                <p className="text-xs">Ask me anything — try a quick prompt on the left.</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id}>
                {message.type === 'movie' && message.movieData ? (
                  <div className="relative">
                    <MovieCard movieData={message.movieData} />
                    <button
                      onClick={() => toggleFavorite(message.movieData!.title)}
                      className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-pink-600/80 text-white hover:bg-pink-500"
                    >
                      {favorites.includes(message.movieData!.title) ? 'Unfavorite' : 'Favorite'}
                    </button>
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
              </div>
              
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message, ask for movies, or analyze an image..."
                  className="w-full bg-gray-800/50 text-white placeholder-gray-400 rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/10"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
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
    </div>
  );
}

export default App;