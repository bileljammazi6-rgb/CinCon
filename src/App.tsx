import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { MovieCard } from './components/MovieCard';
import { ImageUpload } from './components/ImageUpload';
import { VoiceRecorder } from './components/VoiceRecorder';
import { geminiService } from './services/geminiService';
import { tmdbService } from './services/tmdbService';
import { movieLinks } from './data/movieLinks';
import { Message } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
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
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    const serializable = messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() }));
    localStorage.setItem('bilel_chat_history', JSON.stringify(serializable));
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() && !uploadedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content: inputText,
      sender: 'user',
      timestamp: new Date(),
      image: uploadedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setUploadedImage(null);
    setIsLoading(true);

    try {
      // Quick path: if user mentions a movie that exists in pixeldrain list, reply with links
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

      // Check if it's a movie-related query
      const movieKeywords = ['movie', 'film', 'recommend', 'show', 'watch', 'فيلم', 'سلسلة', 'أوصي', 'شاهد'];
      const isMovieQuery = movieKeywords.some(keyword => 
        inputText.toLowerCase().includes(keyword)
      );

      if (isMovieQuery) {
        await handleMovieQuery(inputText);
      } else {
        // Regular AI chat
        const response = await geminiService.sendMessage(inputText, uploadedImage || undefined);
        
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

    // Check local movie links first
    const matchedTitle = Object.keys(movieLinks).find(title => 
      normalizedQuery.includes(title.toLowerCase()) || 
      title.toLowerCase().includes(normalizedQuery)
    );

    if (matchedTitle) {
      // Found in local database
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
      // Search TMDB for movie info
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

  const handleVoiceRecording = async () => {
    // Basic speech-to-text via Web Speech API when available
    try {
              if ('webkitSpeechRecognition' in window) {
        // Some browsers expose webkitSpeechRecognition; however it works on live mic, not blobs.
        // For now, we simply attach a message that audio was recorded.
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'text',
          content: '[Voice message recorded] Please describe or enable STT to transcribe.',
          sender: 'user',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
      } else {
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'text',
          content: '[Voice message recorded]',
          sender: 'user',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
      }
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
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
      <div className="chat-container w-full max-w-4xl h-[100vh] sm:h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="glass-effect p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Bilel Jammazi AI</h1>
              <p className="text-xs sm:text-sm text-gray-300">Advanced AI Assistant</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm text-gray-300 hidden sm:inline">Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 space-y-3 sm:space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10 sm:mt-20">
              <Bot className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-base sm:text-lg font-medium mb-2">Welcome to Bilel Jammazi AI</h3>
              <p className="text-sm px-4">Ask me anything - movies, books, philosophy, or just chat!</p>
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
            <div className="flex items-center gap-2 sm:gap-3 text-gray-400">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
              <span className="text-sm">Bilel is thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area p-3 sm:p-6 border-t border-white/10">
          {uploadedImage && (
            <div className="mb-3 sm:mb-4 flex items-center gap-3">
              <img 
                src={uploadedImage} 
                alt="Uploaded" 
                className="image-preview max-w-32 max-h-32 sm:max-w-48 sm:max-h-48"
              />
              <button
                onClick={() => setUploadedImage(null)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Remove
              </button>
            </div>
          )}
          
          <div className="flex items-end gap-2 sm:gap-3">
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
                placeholder="Ask Bilel anything..."
                className="w-full bg-gray-800/50 text-white placeholder-gray-400 rounded-xl px-3 sm:px-4 py-2 sm:py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/10 text-sm sm:text-base"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={isLoading || (!inputText.trim() && !uploadedImage)}
              className="btn-primary p-2 sm:p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;