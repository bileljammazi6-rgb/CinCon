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
  CheckCircle,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Plus,
  Shuffle,
  Fire,
  Rocket,
  Gem,
  Moon,
  Sun,
  Palette
} from 'lucide-react';
import { useMovies } from '../contexts/MovieContext';
import { MovieData } from '../types';
import { geminiService } from '../services/geminiService';
import { findMovieLinks, getAvailableMovies, getAvailableSeries, getAvailableMoviesOnly } from '../data/movieLinks';

export function Home() {
  const { getPopularMovies, getTrendingMovies, getTopRatedMovies, getUpcomingMovies, loading, error } = useMovies();
  const [downloadableMovies, setDownloadableMovies] = useState<MovieData[]>([]);
  const [downloadableSeries, setDownloadableSeries] = useState<MovieData[]>([]);
  const [tmdbMovies, setTmdbMovies] = useState<MovieData[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [featuredContent, setFeaturedContent] = useState<MovieData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [retryCount, setRetryCount] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const genres = ['all', 'action', 'adventure', 'comedy', 'drama', 'horror', 'sci-fi', 'romance', 'thriller', 'animation', 'documentary'];
  const years = ['all', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

  useEffect(() => {
    loadContent();
    generateAIInsight();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      
      // Get downloadable content
      const movies = getAvailableMoviesOnly();
      const series = getAvailableSeries();
      
      setDownloadableMovies(movies);
      setDownloadableSeries(series);
      
      // Set featured content (prioritize series)
      if (series.length > 0) {
        setFeaturedContent(series[0]);
      } else if (movies.length > 0) {
        setFeaturedContent(movies[0]);
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
      
      setTmdbMovies(uniqueTmdbMovies.slice(0, 24));
      
    } catch (error) {
      console.error('Failed to load content:', error);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const insight = await geminiService.getSmartSuggestions();
      setAiInsight(insight);
    } catch (error) {
      console.error('Failed to generate AI insight:', error);
      setAiInsight("🎬 Welcome to CineFlix AI! I'm Bilel, your personal entertainment guide. I've watched thousands of movies and anime, and I'm here to help you discover amazing content. Let me know what you're in the mood for!");
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const renderContentCard = (content: MovieData, index: number) => {
    const isSeries = content.isSeries;
    const hasDownloads = isSeries ? (content.episodes && content.episodes.length > 0) : (content.downloadLinks && content.downloadLinks.length > 0);
    
    return (
      <div key={index} className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-slate-700/50 backdrop-blur-sm">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {content.poster_path ? (
            <img
              src={content.poster_path}
              alt={content.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/300x450/1f2937/ffffff?text=${encodeURIComponent(content.title)}`;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <div className="text-center p-4">
                {isSeries ? (
                  <Tv className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                ) : (
                  <Film className="h-12 w-12 text-purple-500 mx-auto mb-2" />
                )}
                <p className="text-slate-400 text-sm font-medium">{content.title}</p>
              </div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Action Buttons */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex space-x-3">
              {hasDownloads && (
                <button
                  onClick={() => {
                    if (isSeries) {
                      // Dispatch series player event
                      window.dispatchEvent(new CustomEvent('openSeriesPlayer', {
                        detail: { series: content }
                      }));
                    } else {
                      // Dispatch movie player event
                      window.dispatchEvent(new CustomEvent('openMoviePlayer', {
                        detail: { 
                          movie: content, 
                          downloadLinks: content.downloadLinks || [] 
                        }
                      }));
                    }
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center space-x-2 shadow-lg"
                >
                  <Play className="h-5 w-5" />
                  <span>Watch {isSeries ? 'Series' : 'Now'}</span>
                </button>
              )}
              
              <button className="p-3 bg-slate-700/80 hover:bg-slate-600/80 text-white rounded-xl transition-all duration-200 hover:scale-105 backdrop-blur-sm">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {hasDownloads && (
              <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center space-x-1 shadow-lg">
                <CheckCircle className="h-3 w-3" />
                <span>Watch Available</span>
              </span>
            )}
            
            {isSeries && (
              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center space-x-1 shadow-lg">
                <Tv className="h-3 w-3" />
                <span>Series</span>
              </span>
            )}
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold flex items-center space-x-1 shadow-lg">
              <Star className="h-3 w-3 fill-current" />
              <span>{content.vote_average?.toFixed(1) || 'N/A'}</span>
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {content.title}
          </h3>
          
          <p className="text-slate-300 text-sm mb-3 line-clamp-2">
            {content.overview}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {content.release_date && (
                <span className="text-slate-400 text-xs bg-slate-700/50 px-2 py-1 rounded-full">
                  {new Date(content.release_date).getFullYear()}
                </span>
              )}
              
              {isSeries && content.episodes && (
                <span className="text-slate-400 text-xs bg-slate-700/50 px-2 py-1 rounded-full">
                  {content.episodes.length} Episodes
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-all duration-200 hover:scale-110">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-all duration-200 hover:scale-110">
                <Bookmark className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-300 text-lg">Loading amazing content...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && retryCount < 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto p-4">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={loadContent}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-4">
        {/* Hero Section */}
        {featuredContent && (
          <div className="relative mb-12 rounded-3xl overflow-hidden">
            <div className="aspect-[21/9] relative">
              {featuredContent.poster_path ? (
                <img
                  src={featuredContent.poster_path}
                  alt={featuredContent.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-800 to-pink-800 flex items-center justify-center">
                  <div className="text-center">
                    {featuredContent.isSeries ? (
                      <Tv className="h-24 w-24 text-white mx-auto mb-4" />
                    ) : (
                      <Film className="h-24 w-24 text-white mx-auto mb-4" />
                    )}
                    <h1 className="text-4xl font-bold text-white mb-2">{featuredContent.title}</h1>
                  </div>
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="p-8 md:p-12 max-w-2xl">
                  <div className="flex items-center space-x-3 mb-4">
                    {featuredContent.isSeries ? (
                      <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium flex items-center space-x-2">
                        <Tv className="h-4 w-4" />
                        <span>Series</span>
                      </span>
                    ) : (
                      <span className="bg-purple-600 text-white text-sm px-3 py-1 rounded-full font-medium flex items-center space-x-2">
                        <Film className="h-4 w-4" />
                        <span>Movie</span>
                      </span>
                    )}
                    <span className="bg-yellow-500 text-black text-sm px-3 py-1 rounded-full font-bold flex items-center space-x-2">
                      <Star className="h-4 w-4 fill-current" />
                      <span>{featuredContent.vote_average?.toFixed(1) || 'N/A'}</span>
                    </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                    {featuredContent.title}
                  </h1>
                  
                  <p className="text-lg text-slate-200 mb-6 line-clamp-3">
                    {featuredContent.overview}
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        if (featuredContent.isSeries) {
                          window.dispatchEvent(new CustomEvent('openSeriesPlayer', {
                            detail: { series: featuredContent }
                          }));
                        } else {
                          window.dispatchEvent(new CustomEvent('openMoviePlayer', {
                            detail: { 
                              movie: featuredContent, 
                              downloadLinks: featuredContent.downloadLinks || [] 
                            }
                          }));
                        }
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 flex items-center space-x-3 shadow-2xl"
                    >
                      <Play className="h-6 w-6" />
                      <span>Watch {featuredContent.isSeries ? 'Series' : 'Now'}</span>
                    </button>
                    
                    <button className="p-4 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl transition-all duration-200 hover:scale-105 backdrop-blur-sm">
                      <Heart className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Insight Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-purple-800/20 to-pink-800/20 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/30">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
                  <span>Bilel's AI Insights</span>
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                </h2>
                {isLoadingInsight ? (
                  <div className="flex items-center space-x-2 text-slate-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span>AI is thinking...</span>
                  </div>
                ) : (
                  <p className="text-slate-200 text-lg leading-relaxed">{aiInsight}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Downloadable Series Section */}
        {downloadableSeries.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Tv className="h-8 w-8 text-blue-400" />
                <h2 className="text-3xl font-bold text-white">Available Series</h2>
                <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                  {downloadableSeries.length} Series
                </span>
              </div>
              <Link
                to="/tv-shows"
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors group"
              >
                <span className="font-semibold">View All</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                : 'grid-cols-1'
            }`}>
              {downloadableSeries.slice(0, 10).map((series, index) => renderContentCard(series, index))}
            </div>
          </div>
        )}

        {/* Downloadable Movies Section */}
        {downloadableMovies.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Film className="h-8 w-8 text-purple-400" />
                <h2 className="text-3xl font-bold text-white">Available Movies</h2>
                <span className="bg-purple-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                  {downloadableMovies.length} Movies
                </span>
              </div>
              <Link
                to="/movies"
                className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors group"
              >
                <span className="font-semibold">View All</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                : 'grid-cols-1'
            }`}>
              {downloadableMovies.slice(0, 10).map((movie, index) => renderContentCard(movie, index))}
            </div>
          </div>
        )}

        {/* TMDB Discovery Section */}
        {tmdbMovies.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-green-400" />
                <h2 className="text-3xl font-bold text-white">Discover More</h2>
                <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                  TMDB Powered
                </span>
              </div>
              <Link
                to="/search"
                className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors group"
              >
                <span className="font-semibold">Explore</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' 
                : 'grid-cols-1'
            }`}>
              {tmdbMovies.map((movie, index) => renderContentCard(movie, index))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link
            to="/gaming"
            className="group bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Gamepad2 className="h-8 w-8 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Gaming Hub</h3>
            </div>
            <p className="text-slate-300 text-sm">Play chess, quizzes, and more with AI assistance</p>
          </Link>

          <Link
            to="/messages"
            className="group bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center space-x-3 mb-3">
              <MessageCircle className="h-8 w-8 text-green-400" />
              <h3 className="text-xl font-bold text-white">Community Chat</h3>
            </div>
            <p className="text-slate-300 text-sm">Connect with other movie and anime fans</p>
          </Link>

          <Link
            to="/ai-chat"
            className="group bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Brain className="h-8 w-8 text-purple-400" />
              <h3 className="text-xl font-bold text-white">AI Chat</h3>
            </div>
            <p className="text-slate-300 text-sm">Chat with Bilel AI for recommendations</p>
          </Link>

          <Link
            to="/search"
            className="group bg-gradient-to-r from-orange-600/20 to-red-600/20 hover:from-orange-600/30 hover:to-red-600/30 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/30 transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Search className="h-8 w-8 text-orange-400" />
              <h3 className="text-xl font-bold text-white">Search</h3>
            </div>
            <p className="text-slate-300 text-sm">Find your next favorite movie or series</p>
          </Link>
        </div>
      </div>
    </div>
  );
}