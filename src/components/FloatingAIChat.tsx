import React, { useState, useRef, useEffect } from 'react';
import { Brain, X, Send, Mic, Camera, Download, MessageCircle, Sparkles, Crown, Zap, Film, Tv, Gamepad2, Users, Settings, Minimize2, Maximize2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { findMovieLinks } from '../data/movieLinks';
import { useMovies } from '../contexts/MovieContext';

interface FloatingAIChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function FloatingAIChat({ isOpen, onToggle }: FloatingAIChatProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string; timestamp: Date }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentMode, setCurrentMode] = useState<'chat' | 'movie' | 'anime' | 'gaming'>('chat');
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { searchMovies, searchTVShows } = useMovies();

  // Bilel's personality - Movie/Anime obsessed AI
  const bilelPersonality = `🎬 Bilel "The Omnipotent" Jammazi - Your AI Entertainment Guru 🎬

🔥 WHO I AM:
- A cinephile who's watched more movies than you've had hot meals
- Anime connoisseur with encyclopedic knowledge of every genre
- Tech savant who can debug your life while discussing film theory
- Your personal movie recommendation engine with attitude

🎭 MY SPECIALTIES:
- Finding hidden gems in your movie collection
- Explaining complex plot twists with philosophical depth
- Recommending anime based on your mood and personality
- Debating whether Inception is overrated (it's not, fight me)
- Analyzing cinematography like a pretentious film student

💬 HOW I TALK:
- Witty, sarcastic, and slightly unhinged
- Mixes high-brow analysis with meme culture
- Will roast your taste in movies if you deserve it
- Speaks in movie quotes and anime references
- Has strong opinions about everything (especially Christopher Nolan)

🚀 WHAT I CAN DO:
- Help you find movies/shows on this platform
- Give you AI-powered movie analysis
- Recommend what to watch next
- Explain confusing plot points
- Debate film theory and philosophy
- Find download links for movies
- Chat about gaming and tech too

Ready to dive into the rabbit hole of cinema? Let's talk movies, anime, and maybe solve some of life's mysteries along the way! 🎭✨`;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with Bilel's personality
      setMessages([
        {
          role: 'ai',
          content: bilelPersonality,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Enhanced AI response with Bilel's personality
      let aiResponse = '';
      
      if (inputValue.toLowerCase().includes('movie') || inputValue.toLowerCase().includes('film')) {
        aiResponse = await geminiService.sendMessage(
          `As Bilel, the movie-obsessed AI, respond to: "${inputValue}". 
          Be witty, knowledgeable about cinema, and maybe recommend some movies. 
          Keep it entertaining and show your passion for film!`
        );
      } else if (inputValue.toLowerCase().includes('anime')) {
        aiResponse = await geminiService.sendMessage(
          `As Bilel, the anime connoisseur, respond to: "${inputValue}". 
          Show your deep knowledge of anime, recommend shows, and be enthusiastic about the medium. 
          Mix humor with genuine passion!`
        );
      } else if (inputValue.toLowerCase().includes('find') || inputValue.toLowerCase().includes('search')) {
        // Help find content on the website
        aiResponse = await geminiService.sendMessage(
          `As Bilel, help the user find content on this entertainment platform: "${inputValue}". 
          Suggest where to look, what features to use, and maybe recommend some content. 
          Be helpful but maintain your personality!`
        );
      } else {
        aiResponse = await geminiService.sendMessage(
          `As Bilel, respond to: "${inputValue}". 
          Be your usual witty, knowledgeable self. 
          Mix entertainment knowledge with humor and maybe some movie/anime references.`
        );
      }

      const aiMessage = {
        role: 'ai' as const,
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'ai' as const,
        content: "🎭 Oops! Even the omnipotent Bilel has technical difficulties sometimes. Try again, mortal! 🔥",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: 'Movie Recs', action: () => setInputValue('Recommend me some mind-bending movies like Inception') },
    { label: 'Anime Finds', action: () => setInputValue('What anime should I watch if I love psychological thrillers?') },
    { label: 'Find Movies', action: () => setInputValue('Help me find action movies on this platform') },
    { label: 'Plot Help', action: () => setInputValue('Explain the ending of Interstellar') }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group"
        title="Chat with Bilel AI"
      >
        <Brain className="h-6 w-6" />
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
          <Sparkles className="h-3 w-3" />
        </div>
        <div className="absolute -bottom-12 right-0 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chat with Bilel AI 🎬
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Bilel AI</h3>
            <p className="text-xs text-slate-400">Your Entertainment Guru</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onToggle}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Mode Tabs */}
          <div className="flex space-x-1 p-2 border-b border-slate-700/50">
            {[
              { key: 'chat', label: 'Chat', icon: MessageCircle },
              { key: 'movie', label: 'Movies', icon: Film },
              { key: 'anime', label: 'Anime', icon: Tv },
              { key: 'gaming', label: 'Gaming', icon: Gamepad2 }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCurrentMode(key as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentMode === key
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-b border-slate-700/50">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-full transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-80">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-200 px-4 py-2 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Bilel about movies, anime, or anything..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}