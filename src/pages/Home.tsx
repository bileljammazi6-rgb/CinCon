import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Heart, 
  Star, 
  TrendingUp, 
  Brain, 
  Gamepad2, 
  MessageSquare, 
  Camera, 
  Mic, 
  Zap, 
  Crown, 
  Target,
  Users,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useMovies } from '../contexts/MovieContext';
import { MovieData } from '../types';
import { geminiService } from '../services/geminiService';

export function Home() {
  const { getPopularMovies, getTrendingMovies } = useMovies();
  const [popularMovies, setPopularMovies] = useState<MovieData[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MovieData[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  useEffect(() => {
    loadMovies();
    generateAIInsight();
  }, []);

  const loadMovies = async () => {
    try {
      const [popular, trending] = await Promise.all([
        getPopularMovies(),
        getTrendingMovies()
      ]);
      setPopularMovies(popular.slice(0, 6));
      setTrendingMovies(trending.slice(0, 6));
    } catch (error) {
      console.error('Failed to load movies:', error);
    }
  };

  const generateAIInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const insight = await geminiService.sendMessage(
        "Give me a brief, witty insight about today's entertainment landscape and what makes a great movie experience. Keep it under 100 words and make it engaging."
      );
      setAiInsight(insight);
    } catch (error) {
      console.error('Failed to generate AI insight:', error);
      setAiInsight("Today's entertainment landscape is a wild mix of AI-powered creativity and human storytelling. The best experiences happen when technology meets imagination, creating worlds that feel both familiar and utterly new.");
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const renderMovieCard = (movie: MovieData) => (
    <div key={movie.id} className="group relative bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-white mb-2 line-clamp-2">{movie.title}</h3>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span>{movie.vote_average?.toFixed(1)}</span>
          </div>
          <span>{movie.release_date?.split('-')[0]}</span>
        </div>
      </div>
      
      <Link
        to={`/movie/${movie.id}`}
        className="absolute inset-0 z-10"
        aria-label={`View details for ${movie.title}`}
      />
    </div>
  );

  const featureCards = [
    {
      icon: <Brain className="h-8 w-8 text-purple-400" />,
      title: "AI Chat Hub",
      description: "Conversational AI powered by Google Gemini with personality, image analysis, and voice recording.",
      link: "/ai-chat",
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: <Gamepad2 className="h-8 w-8 text-blue-400" />,
      title: "Gaming Experience",
      description: "AI-powered games with adaptive difficulty, quiz generation, and persistent leaderboards.",
      link: "/gaming",
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: <Crown className="h-8 w-8 text-yellow-400" />,
      title: "Movie Analysis",
      description: "Deep AI insights into films, directors, and cinematic techniques with download links.",
      link: "/movies",
      color: "from-yellow-600 to-orange-600"
    },
    {
      icon: <Users className="h-8 w-8 text-green-400" />,
      title: "Community Chat",
      description: "Real-time messaging with AI assistance, reactions, and threaded conversations.",
      link: "/messages",
      color: "from-green-600 to-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative h-[80vh] overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center h-full px-6">
          <div className="text-center max-w-4xl">
            <div className="text-6xl mb-6">🚀</div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              CineFlix AI
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              The future of entertainment is here. Experience AI-powered movies, gaming, and conversations in one revolutionary platform.
            </p>
            
            {/* AI Insight */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-yellow-400">AI Insight of the Day</h3>
              </div>
              {isLoadingInsight ? (
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span>AI is thinking...</span>
                </div>
              ) : (
                <p className="text-gray-200 italic">"{aiInsight}"</p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/ai-chat"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg"
              >
                <Brain className="h-5 w-5" />
                Start AI Chat
              </Link>
              <Link
                to="/gaming"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg"
              >
                <Gamepad2 className="h-5 w-5" />
                Play Games
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">🌟 Revolutionary Features</h2>
            <p className="text-xl text-gray-400">Experience the power of AI-driven entertainment</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all duration-300 hover:scale-105"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-gray-200">
                  {feature.title}
                </h3>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <div className={`inline-flex items-center gap-2 text-sm font-medium bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                  Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Movies Section */}
      <div className="py-20 px-6 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">🔥 Popular Movies</h2>
            <Link
              to="/movies"
              className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularMovies.map(renderMovieCard)}
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">📈 Trending Now</h2>
            <Link
              to="/search"
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
            >
              Search More <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingMovies.map(renderMovieCard)}
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="py-20 px-6 bg-gray-800/30">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">🛠️ Powered By</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-2">🤖</div>
              <h3 className="font-semibold mb-2">Google Gemini AI</h3>
              <p className="text-sm text-gray-400">Advanced conversational AI</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🗄️</div>
              <h3 className="font-semibold mb-2">Supabase</h3>
              <p className="text-sm text-gray-400">Real-time database</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎬</div>
              <h3 className="font-semibold mb-2">TMDB API</h3>
              <p className="text-sm text-gray-400">Movie database</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">⚡</div>
              <h3 className="font-semibold mb-2">React 18</h3>
              <p className="text-sm text-gray-400">Modern frontend</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience the Future?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of users already enjoying AI-powered entertainment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/ai-chat"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg"
            >
              <Brain className="h-5 w-5" />
              Start AI Chat
            </Link>
            <Link
              to="/gaming"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg"
            >
              <Gamepad2 className="h-5 w-5" />
              Play Games
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}