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
  Tv
} from 'lucide-react';
import { useMovies } from '../contexts/MovieContext';
import { MovieData } from '../types';
import { geminiService } from '../services/geminiService';
import { findMovieLinks, getAvailableMovies } from '../data/movieLinks';

export function Home() {
  const { getPopularMovies, getTrendingMovies, getTopRatedMovies, getUpcomingMovies } = useMovies();
  const [downloadableMovies, setDownloadableMovies] = useState<MovieData[]>([]);
  const [tmdbMovies, setTmdbMovies] = useState<MovieData[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [featuredMovie, setFeaturedMovie] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const genres = ['all', 'action', 'adventure', 'comedy', 'drama', 'horror', 'sci-fi', 'romance', 'thriller'];
  const years = ['all', '2024', '2023', '2022', '2021', '2020'];

  useEffect(() => {
    loadMovies();
    generateAIInsight();
  }, []);

  const loadMovies = async () => {
    try {
      setLoading(true);
      
      // Get movies with download links (pixeldrain)
      const availableMovies = getAvailableMovies();
      setDownloadableMovies(availableMovies);
      
      if (availableMovies.length > 0) {
        setFeaturedMovie(availableMovies[0]);
      }
      
      // Get TMDB movies for discovery section
      const [popular, trending, topRated, upcoming] = await Promise.all([
        getPopularMovies(),
        getTrendingMovies(),
        getTopRatedMovies(),
        getUpcomingMovies()
      ]);
      
      // Combine and deduplicate TMDB movies
      const allTmdbMovies = [...popular, ...trending, ...topRated, ...upcoming];
      const uniqueTmdbMovies = allTmdbMovies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );
      
      setTmdbMovies(uniqueTmdbMovies.slice(0, 20));
      
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
    
    if (viewMode === 'list') {
      return (
        <div key={movie.id} className="group bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl border border-slate-700/30">
          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="w-24 h-36 object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors mb-2">
                    {movie.title}
                  </h3>
                  <p className="text-slate-300 text-sm line-clamp-3 mb-3">
                    {movie.overview}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {movie.release_date?.split('-')[0]}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {Math.floor((movie.vote_average || 0) * 10)} min
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {Math.floor((movie.vote_average || 0) * 100)}K views
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-yellow-500 text-black text-sm px-2 py-1 rounded-full font-medium flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {movie.vote_average?.toFixed(1)}
                  </div>
                  {hasDownloads && (
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Download
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to={`/movie/${movie.id}`}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center"
                >
                  <Play className="h-4 w-4 mr-2" />
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
                    <Download className="h-4 w-4" />
                  </button>
                )}
                <button className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={movie.id} className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border border-slate-700/30">
        <div className="aspect-[2/3] relative overflow-hidden">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {hasDownloads && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Download
            </div>
          )}
          
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
                <Download className="h-4 w-4" />
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
        <div className="relative h-[70vh] md:h-[80vh] overflow-hidden rounded-2xl mb-8 md:mb-12">
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
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
                  <Download className="h-3 w-3 mr-1" />
                  Download Available
                </span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">Featured</span>
                <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium flex items-center">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {featuredMovie.vote_average?.toFixed(1)}
                </span>
                <span className="bg-slate-700 text-white text-xs px-2 py-1 rounded-full">
                  {featuredMovie.release_date?.split('-')[0]}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {featuredMovie.title}
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 max-w-2xl line-clamp-3">
                {featuredMovie.overview}
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <Link
                  to={`/movie/${featuredMovie.id}`}
                  className="flex items-center gap-2 px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg hover:scale-105 transition-all duration-200 font-semibold text-base md:text-lg"
                >
                  <Play className="h-4 md:h-5 w-4 md:w-5" />
                  Watch Now
                </Link>
                <button className="flex items-center gap-2 px-6 md:px-8 py-2 md:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-semibold">
                  <Heart className="h-4 md:h-5 w-4 md:w-5" />
                  Add to List
                </button>
                <button className="flex items-center gap-2 px-6 md:px-8 py-2 md:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-semibold">
                  <Share2 className="h-4 md:h-5 w-4 md:w-5" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insight */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8 md:mb-12 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-6 w-6 text-yellow-400" />
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

      {/* Features Section */}
      <div className="mb-16">
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
              className="group relative overflow-hidden rounded-2xl p-6 hover:scale-105 transition-all duration-300 border border-slate-700/30"
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
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Download className="h-6 md:h-8 w-6 md:w-8 text-green-400" />
            Available for Download
          </h2>
          <Link
            to="/movies"
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 font-medium"
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
          <div className="text-center py-12 bg-slate-800/50 rounded-2xl">
            <Download className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">No Downloads Available</h3>
            <p className="text-slate-500">Check back later for downloadable content</p>
          </div>
        )}
      </div>

      {/* TMDB Discovery Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Search className="h-6 md:h-8 w-6 md:w-8 text-blue-400" />
            Discover More Movies
          </h2>
          <Link
            to="/search"
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 font-medium"
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
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
            className="flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-600/50 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadMovies}
            className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700/50">
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
                className="w-full bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load More */}
      <div className="text-center mt-12">
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-105">
          Load More Movies
        </button>
      </div>
    </div>
  );
}