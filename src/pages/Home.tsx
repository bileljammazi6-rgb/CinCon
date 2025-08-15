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
  Share2,
  Download,
  Calendar,
  Filter,
  Grid,
  List,
  RefreshCw,
  Info,
  Bookmark,
  ExternalLink,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Search,
  Film,
  Tv,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useMovies } from '../contexts/MovieContext';
import { MovieData } from '../types';
import { geminiService } from '../services/geminiService';
import { findMovieLinks, getAvailableMovies } from '../data/movieLinks';

export function Home() {
  const { getPopularMovies, getTrendingMovies, getTopRatedMovies, getUpcomingMovies, loading, error } = useMovies();
  const [downloadableMovies, setDownloadableMovies] = useState<MovieData[]>([]);
  const [tmdbMovies, setTmdbMovies] = useState<MovieData[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [featuredMovie, setFeaturedMovie] = useState<MovieData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [retryCount, setRetryCount] = useState(0);

  const genres = ['all', 'action', 'adventure', 'comedy', 'drama', 'horror', 'sci-fi', 'romance', 'thriller'];
  const years = ['all', '2024', '2023', '2022', '2021', '2020'];

  useEffect(() => {
    loadMovies();
    generateAIInsight();
  }, []);

  const loadMovies = async () => {
    try {
      setIsLoading(true);
      
      // Get movies with download links (pixeldrain)
      const availableMovies = getAvailableMovies();
      setDownloadableMovies(availableMovies);
      
      if (availableMovies.length > 0) {
        setFeaturedMovie(availableMovies[0]);
      }
      
      // Get TMDB movies for discovery section
      const [popular, trending, topRated, upcoming] = await Promise.all([
        getPopularMovies().catch(() => []),
        getTrendingMovies().catch(() => []),
        getTopRatedMovies().catch(() => []),
        getUpcomingMovies().catch(() => [])
      ]);
      
      // Combine and deduplicate TMDB movies
      const allTmdbMovies = [...popular, ...trending, ...topRated, ...upcoming];
      const uniqueTmdbMovies = allTmdbMovies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );
      
      setTmdbMovies(uniqueTmdbMovies.slice(0, 20));
      
    } catch (error) {
      console.error('Failed to load movies:', error);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
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

  const renderMovieCard = (movie: MovieData, index: number) => {
    const isSeries = movie.isSeries;
    const hasDownloads = isSeries ? (movie.episodes && movie.episodes.length > 0) : (movie.downloadLinks && movie.downloadLinks.length > 0);
    
    return (
      <div key={index} className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-slate-700/50">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {movie.poster_path ? (
            <img
              src={movie.poster_path}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/300x450/1f2937/ffffff?text=' + encodeURIComponent(movie.title);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <div className="text-center p-4">
                <Film className="h-12 w-12 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm font-medium">{movie.title}</p>
              </div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Action Buttons */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex space-x-2">
              {hasDownloads && (
                <button
                  onClick={() => {
                    if (isSeries) {
                      // Dispatch series player event
                      window.dispatchEvent(new CustomEvent('openSeriesPlayer', {
                        detail: { series: movie }
                      }));
                    } else {
                      // Dispatch movie player event
                      window.dispatchEvent(new CustomEvent('openMoviePlayer', {
                        detail: { 
                          movie, 
                          downloadLinks: movie.downloadLinks || [] 
                        }
                      }));
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors hover:scale-105 flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Watch {isSeries ? 'Series' : 'Now'}</span>
                </button>
              )}
              
              <button className="bg-slate-700/80 hover:bg-slate-600/80 text-white px-3 py-2 rounded-lg transition-colors hover:scale-105">
                <Heart className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Badge */}
          {hasDownloads && (
            <div className="absolute top-2 left-2">
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>Watch Available</span>
              </span>
            </div>
          )}
          
          {/* Series Badge */}
          {isSeries && (
            <div className="absolute top-2 right-2">
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
                <Tv className="h-3 w-3" />
                <span>Series</span>
              </span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {movie.title}
          </h3>
          
          <p className="text-slate-300 text-sm mb-3 line-clamp-2">
            {movie.overview}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-slate-300 text-sm">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {movie.release_date && (
                <span className="text-slate-400 text-xs">
                  {new Date(movie.release_date).getFullYear()}
                </span>
              )}
              
              {isSeries && movie.episodes && (
                <span className="text-slate-400 text-xs bg-slate-700 px-2 py-1 rounded">
                  {movie.episodes.length} Episodes
                </span>
              )}
            </div>
          </div>
        </div>
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
      gradient: "from-purple-500/20 to-pink-500/20",
      features: ["Voice Recording", "Image Analysis", "Smart Suggestions"]
    },
    {
      icon: <Gamepad2 className="h-8 w-8 text-blue-400" />,
      title: "Gaming Experience",
      description: "AI-powered games with adaptive difficulty, quiz generation, and persistent leaderboards.",
      link: "/gaming",
      color: "from-blue-600 to-cyan-600",
      gradient: "from-blue-500/20 to-cyan-500/20",
      features: ["Tic-Tac-Toe", "Chess", "AI Quizzes"]
    },
    {
      icon: <Crown className="h-8 w-8 text-yellow-400" />,
      title: "Movie Analysis",
      description: "Deep AI insights into films, directors, and cinematic techniques with download links.",
      link: "/movies",
      color: "from-yellow-600 to-orange-600",
      gradient: "from-yellow-500/20 to-orange-500/20",
      features: ["AI Reviews", "Download Links", "Deep Analysis"]
    },
    {
      icon: <Users className="h-8 w-8 text-green-400" />,
      title: "Community Chat",
      description: "Real-time messaging with AI assistance, reactions, and threaded conversations.",
      link: "/messages",
      color: "from-green-600 to-emerald-600",
      gradient: "from-green-500/20 to-emerald-500/20",
      features: ["Real-time Chat", "AI Assistance", "Reactions"]
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-purple-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full border-2 border-purple-200/20"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading CineFlix AI</h2>
          <p className="text-slate-400 text-lg">Preparing your entertainment universe...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && retryCount > 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={loadMovies}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Hero Section */}
      {featuredMovie && (
        <div className="relative h-[70vh] md:h-[80vh] overflow-hidden rounded-2xl mb-8 md:mb-12 mx-4 md:mx-8">
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
          <div className="relative z-10 flex items-end h-full p-4 md:p-8 lg:p-16">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center shadow-lg">
                  <Download className="h-3 w-3 mr-1" />
                  Watch Available
                </span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">Featured</span>
                <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium flex items-center shadow-lg">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {featuredMovie.vote_average?.toFixed(1) || 'N/A'}
                </span>
                <span className="bg-slate-700 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                  {featuredMovie.release_date?.split('-')[0] || 'N/A'}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
                {featuredMovie.title}
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 max-w-2xl line-clamp-3 drop-shadow-lg">
                {featuredMovie.overview || 'Experience this amazing movie with AI-powered insights and direct streaming.'}
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <button
                  onClick={() => {
                    const downloadLinks = findMovieLinks(featuredMovie.title);
                    const event = new CustomEvent('openMoviePlayer', { 
                      detail: { movie: featuredMovie, downloadLinks } 
                    });
                    window.dispatchEvent(event);
                  }}
                  className="flex items-center gap-2 px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg hover:scale-105 transition-all duration-200 font-semibold text-base md:text-lg shadow-lg"
                >
                  <Play className="h-4 md:h-5 w-4 md:w-5" />
                  Watch Now
                </button>
                <button className="flex items-center gap-2 px-6 md:px-8 py-2 md:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-semibold shadow-lg">
                  <Heart className="h-4 md:h-5 w-4 md:w-5" />
                  Add to List
                </button>
                <button className="flex items-center gap-2 px-6 md:px-8 py-2 md:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-semibold shadow-lg">
                  <Share2 className="h-4 md:h-5 w-4 md:w-5" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insight */}
      <div className="mx-4 md:mx-8 mb-8 md:mb-12">
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700/50 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-yellow-400">AI Insight of the Day</h3>
          </div>
          {isLoadingInsight ? (
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span>AI is thinking...</span>
            </div>
          ) : (
            <p className="text-slate-200 text-base md:text-lg leading-relaxed">"{aiInsight}"</p>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-4 md:mx-8 mb-16">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🌟 Revolutionary Features
          </h2>
          <p className="text-lg md:text-xl text-slate-400">Experience the power of AI-driven entertainment</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {featureCards.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group relative overflow-hidden rounded-2xl p-6 hover:scale-105 transition-all duration-300 border border-slate-700/30 hover:border-purple-500/50 shadow-lg hover:shadow-2xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-300 mb-4 leading-relaxed text-sm">
                  {feature.description}
                </p>
                <ul className="text-xs text-slate-400 space-y-1 mb-4">
                  {feature.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center">
                      <div className="w-1 h-1 bg-purple-400 rounded-full mr-2"></div>
                      {feat}
                    </li>
                  ))}
                </ul>
                <div className={`inline-flex items-center gap-2 text-sm font-medium bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                  Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Downloadable Movies Section */}
      <div className="mx-4 md:mx-8 mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Download className="h-6 md:h-8 w-6 md:w-8 text-green-400" />
            Available for Streaming
          </h2>
          <Link
            to="/movies"
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 font-medium hover:scale-105"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {downloadableMovies.length > 0 ? (
          <div className={`grid gap-4 md:gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' 
              : 'grid-cols-1'
          }`}>
            {downloadableMovies.slice(0, 12).map(renderMovieCard)}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <Download className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">No Streams Available</h3>
            <p className="text-slate-500">Check back later for streaming content</p>
          </div>
        )}
      </div>

      {/* TMDB Discovery Section */}
      <div className="mx-4 md:mx-8 mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Search className="h-6 md:h-8 w-6 md:w-8 text-blue-400" />
            Discover More Movies
          </h2>
          <Link
            to="/search"
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 font-medium hover:scale-105"
          >
            Search All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className={`grid gap-4 md:gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' 
            : 'grid-cols-1'
        }`}>
          {tmdbMovies.slice(0, 12).map(renderMovieCard)}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="mx-4 md:mx-8 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <TrendingUp className="h-6 md:h-8 w-6 md:w-8 text-red-400" />
              Trending Now
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-slate-700/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-600/50 text-white px-3 py-2 rounded-lg transition-colors hover:scale-105"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadMovies}
              className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors hover:scale-105"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mx-4 md:mx-8 mb-8">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>
                      {genre === 'all' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year === 'all' ? 'All Years' : year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedGenre('all');
                    setSelectedYear('all');
                  }}
                  className="w-full bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors hover:scale-105"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Load More */}
      <div className="text-center mt-12 mx-4 md:mx-8">
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg">
          Load More Movies
        </button>
      </div>
    </div>
  );
}