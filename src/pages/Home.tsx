import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Heart, 
  Star, 
  TrendingUp, 
  Brain, 
  Gamepad2, 
  MessageCircle, 
  Camera, 
  Mic, 
  Zap, 
  Crown, 
  Target,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  Eye,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { useMovies } from '../contexts/MovieContext';
import { MovieData } from '../types';
import { geminiService } from '../services/geminiService';
import { findMovieLinks } from '../data/movieLinks';

export function Home() {
  const { getPopularMovies, getTrendingMovies, getTopRatedMovies } = useMovies();
  const [popularMovies, setPopularMovies] = useState<MovieData[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MovieData[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MovieData[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [featuredMovie, setFeaturedMovie] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovies();
    generateAIInsight();
  }, []);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const [popular, trending, topRated] = await Promise.all([
        getPopularMovies(),
        getTrendingMovies(),
        getTopRatedMovies()
      ]);
      
      setPopularMovies(popular.slice(0, 8));
      setTrendingMovies(trending.slice(0, 8));
      setTopRatedMovies(topRated.slice(0, 8));
      
      if (trending.length > 0) {
        setFeaturedMovie(trending[0]);
      }
    } catch (error) {
      console.error('Failed to load movies:', error);
    } finally {
      setLoading(false);
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

  const renderMovieCard = (movie: MovieData, index: number = 0) => {
    const downloadLinks = findMovieLinks(movie.title);
    const hasDownloads = downloadLinks.length > 0;
    
    return (
      <div key={movie.id} className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
        <div className="aspect-[2/3] relative overflow-hidden">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Download Badge */}
          {hasDownloads && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Download
            </div>
          )}
          
          {/* Rating */}
          <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium flex items-center">
            <Star className="h-3 w-3 mr-1 fill-current" />
            {movie.vote_average?.toFixed(1)}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
            <span>{movie.release_date?.split('-')[0]}</span>
            <span className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {Math.floor((movie.vote_average || 0) * 100)}K
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link
              to={`/movie/${movie.id}`}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              <Play className="h-3 w-3 mr-1" />
              Watch
            </Link>
            <button className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors">
              <Heart className="h-4 w-4" />
            </button>
            {hasDownloads && (
              <button 
                onClick={() => window.open(downloadLinks[0], '_blank')}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                title="Download"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <Link
          to={`/movie/${movie.id}`}
          className="absolute inset-0 z-10"
          aria-label={`View details for ${movie.title}`}
        />
      </div>
    );
  };

  const featureCards = [
    {
      icon: <Brain className="h-8 w-8 text-purple-400" />,
      title: "AI Chat Hub",
      description: "Conversational AI powered by Google Gemini with personality, image analysis, and voice recording.",
      link: "/ai-chat",
      color: "from-purple-600 to-pink-600",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: <Gamepad2 className="h-8 w-8 text-blue-400" />,
      title: "Gaming Experience",
      description: "AI-powered games with adaptive difficulty, quiz generation, and persistent leaderboards.",
      link: "/gaming",
      color: "from-blue-600 to-cyan-600",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: <Crown className="h-8 w-8 text-yellow-400" />,
      title: "Movie Analysis",
      description: "Deep AI insights into films, directors, and cinematic techniques with download links.",
      link: "/movies",
      color: "from-yellow-600 to-orange-600",
      gradient: "from-yellow-500/20 to-orange-500/20"
    },
    {
      icon: <Users className="h-8 w-8 text-green-400" />,
      title: "Community Chat",
      description: "Real-time messaging with AI assistance, reactions, and threaded conversations.",
      link: "/messages",
      color: "from-green-600 to-emerald-600",
      gradient: "from-green-500/20 to-emerald-500/20"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading your entertainment universe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      {featuredMovie && (
        <div className="relative h-[80vh] overflow-hidden rounded-2xl mb-12">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path})`
            }}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex items-end h-full p-8 lg:p-16">
            <div className="max-w-4xl">
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">Featured</span>
                <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium flex items-center">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {featuredMovie.vote_average?.toFixed(1)}
                </span>
                <span className="bg-slate-700 text-white text-xs px-2 py-1 rounded-full">
                  {featuredMovie.release_date?.split('-')[0]}
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {featuredMovie.title}
              </h1>
              <p className="text-lg lg:text-xl text-gray-300 mb-6 max-w-2xl line-clamp-3">
                {featuredMovie.overview}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to={`/movie/${featuredMovie.id}`}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg hover:scale-105 transition-all duration-200 font-semibold text-lg"
                >
                  <Play className="h-5 w-5" />
                  Watch Now
                </Link>
                <button className="flex items-center gap-2 px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-semibold">
                  <Heart className="h-5 w-5" />
                  Add to List
                </button>
                <button className="flex items-center gap-2 px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-semibold">
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insight */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-6 w-6 text-yellow-400" />
          <h3 className="text-xl font-semibold text-yellow-400">AI Insight of the Day</h3>
        </div>
        {isLoadingInsight ? (
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span>AI is thinking...</span>
          </div>
        ) : (
          <p className="text-slate-200 text-lg leading-relaxed">"{aiInsight}"</p>
        )}
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🌟 Revolutionary Features
          </h2>
          <p className="text-xl text-slate-400">Experience the power of AI-driven entertainment</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group relative overflow-hidden rounded-2xl p-6 hover:scale-105 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-300 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <div className={`inline-flex items-center gap-2 text-sm font-medium bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                  Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Movies */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-red-400" />
            Trending Now
          </h2>
          <Link
            to="/movies"
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 font-medium"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {trendingMovies.map(renderMovieCard)}
        </div>
      </div>

      {/* Popular Movies */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Star className="h-8 w-8 text-yellow-400" />
            Popular Movies
          </h2>
          <Link
            to="/movies"
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 font-medium"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {popularMovies.map(renderMovieCard)}
        </div>
      </div>

      {/* Top Rated Movies */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Award className="h-8 w-8 text-green-400" />
            Top Rated
          </h2>
          <Link
            to="/movies"
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 font-medium"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {topRatedMovies.map(renderMovieCard)}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of users already enjoying AI-powered entertainment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/ai-chat"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg hover:scale-105"
            >
              <Brain className="h-5 w-5" />
              Start AI Chat
            </Link>
            <Link
              to="/gaming"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg hover:scale-105"
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