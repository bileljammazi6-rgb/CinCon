import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Play, 
  Heart, 
  Star, 
  Download, 
  Share2, 
  Clock, 
  Calendar, 
  Users, 
  Eye, 
  ThumbsUp, 
  Brain, 
  Crown, 
  Sparkles, 
  ArrowLeft, 
  ExternalLink,
  MessageCircle,
  Gamepad2,
  Zap
} from 'lucide-react';
import { useMovies } from '../contexts/MovieContext';
import { findMovieLinks } from '../data/movieLinks';
import { geminiService } from '../services/geminiService';
import { MoviePlayer } from '../components/MoviePlayer';

export function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const { getMovieById } = useMovies();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDownloadLinks, setShowDownloadLinks] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-analysis' | 'downloads'>('overview');
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadMovie();
    }
  }, [id]);

  useEffect(() => {
    if (movie) {
      const links = findMovieLinks(movie.title);
      setDownloadLinks(links);
    }
  }, [movie]);

  const loadMovie = async () => {
    try {
      setLoading(true);
      const movieData = await getMovieById(id!);
      if (movieData) {
        setMovie(movieData);
      }
    } catch (error) {
      console.error('Failed to load movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiAnalysis = async () => {
    if (!movie) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await geminiService.analyzeMovie(movie.title, movie);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze movie:', error);
      setAiAnalysis("🎬 Even the omnipotent Bilel needs a moment to analyze this masterpiece. Let me gather my thoughts about this cinematic gem...");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handlePlayMovie = () => {
    setIsPlayerOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg">Movie not found</p>
          <Link to="/" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const hasDownloads = downloadLinks.length > 0;

  return (
    <div className="min-h-screen text-white">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden rounded-2xl mb-8">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-end h-full p-8 lg:p-16">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {hasDownloads && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
                  <Download className="h-3 w-3 mr-1" />
                  Download Available
                </span>
              )}
              <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium flex items-center">
                <Star className="h-3 w-3 mr-1 fill-current" />
                {movie.vote_average?.toFixed(1)}
              </span>
              <span className="bg-slate-700 text-white text-xs px-2 py-1 rounded-full">
                {movie.release_date?.split('-')[0]}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {movie.title}
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 max-w-2xl line-clamp-3">
              {movie.overview}
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <button
                onClick={handlePlayMovie}
                className="flex items-center gap-2 px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg hover:scale-105 transition-all duration-200 font-semibold text-base md:text-lg"
              >
                <Play className="h-4 md:h-5 w-4 md:w-5" />
                Watch Now
              </button>
              <button className="flex items-center gap-2 px-6 md:px-8 py-2 md:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-semibold">
                <Heart className="h-4 md:h-5 w-4 md:w-5" />
                Add to List
              </button>
              {hasDownloads && (
                <button 
                  onClick={() => setShowDownloadLinks(!showDownloadLinks)}
                  className="flex items-center gap-2 px-6 md:px-8 py-2 md:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
                >
                  <Download className="h-4 md:h-5 w-4 md:w-5" />
                  Download
                </button>
              )}
              <button className="flex items-center gap-2 px-6 md:px-8 py-2 md:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-semibold">
                <Share2 className="h-4 md:h-5 w-4 md:w-5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-3 mb-3">
            <Clock className="h-6 w-6 text-blue-400" />
            <h3 className="text-lg font-semibold">Runtime</h3>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {Math.floor((movie.vote_average || 0) * 10)} min
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-3 mb-3">
            <Calendar className="h-6 w-6 text-green-400" />
            <h3 className="text-lg font-semibold">Release Date</h3>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {movie.release_date?.split('-')[0]}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-3 mb-3">
            <Users className="h-6 w-6 text-purple-400" />
            <h3 className="text-lg font-semibold">Popularity</h3>
          </div>
          <p className="text-2xl font-bold text-purple-400">
            {Math.floor((movie.vote_average || 0) * 100)}K
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Overview', icon: Eye },
            { key: 'ai-analysis', label: 'AI Analysis', icon: Brain },
            { key: 'downloads', label: 'Downloads', icon: Download }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <Eye className="h-6 w-6 mr-3 text-blue-400" />
              Movie Overview
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-3 text-purple-300">Synopsis</h4>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {movie.overview}
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3 text-purple-300">Details</h4>
                <div className="space-y-3 text-slate-300">
                  <div className="flex justify-between">
                    <span>Original Title:</span>
                    <span className="font-medium">{movie.original_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Language:</span>
                    <span className="font-medium">{movie.original_language?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adult Content:</span>
                    <span className="font-medium">{movie.adult ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Video:</span>
                    <span className="font-medium">{movie.video ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Tab */}
        {activeTab === 'ai-analysis' && (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center">
                <Brain className="h-6 w-6 mr-3 text-purple-400" />
                Bilel's AI Analysis
              </h3>
              <button
                onClick={handleAiAnalysis}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Get AI Analysis</span>
                  </>
                )}
              </button>
            </div>
            
            {aiAnalysis ? (
              <div className="prose prose-invert max-w-none">
                <div className="bg-slate-700/50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-purple-300">Bilel's Take</h4>
                      <p className="text-sm text-slate-400">Your AI Entertainment Guru</p>
                    </div>
                  </div>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {aiAnalysis}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-slate-400 mb-2">Ready for AI Analysis?</h4>
                <p className="text-slate-500">
                  Click the button above to get Bilel's deep insights into this movie
                </p>
              </div>
            )}
          </div>
        )}

        {/* Downloads Tab */}
        {activeTab === 'downloads' && (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <Download className="h-6 w-6 mr-3 text-green-400" />
              Download Options
            </h3>
            
            {hasDownloads ? (
              <div className="space-y-4">
                <p className="text-slate-300 mb-6">
                  Multiple download options are available for this movie. Choose the one that works best for you.
                </p>
                {downloadLinks.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:border-green-500/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Download className="h-5 w-5 text-green-400" />
                      <div>
                        <h4 className="font-medium text-white">Download Option {index + 1}</h4>
                        <p className="text-sm text-slate-400">Click to download</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadClick(link)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Download className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-slate-400 mb-2">No Downloads Available</h4>
                <p className="text-slate-500">
                  Download links for this movie are not currently available
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Movie Player */}
      <MoviePlayer
        movie={movie}
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
      />
    </div>
  );
}