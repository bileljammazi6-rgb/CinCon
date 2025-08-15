import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovies } from '../contexts/MovieContext';
import { Play, Plus, Heart, Share2, Star, Calendar, Clock, Users, Download, Brain, MessageCircle, Eye, Info } from 'lucide-react';
import { MovieData } from '../types';
import { findMovieLinks } from '../data/movieLinks';
import { geminiService } from '../services/geminiService';

const TMDB_IMG = (import.meta.env.VITE_TMDB_IMAGE_BASE_URL as string) || 'https://image.tmdb.org/t/p';

export function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMovieById, loading } = useMovies();
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDownloadLinks, setShowDownloadLinks] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'downloads'>('overview');

  useEffect(() => {
    if (id) {
      getMovieById(id).then(setMovie);
    }
  }, [id, getMovieById]);

  useEffect(() => {
    if (movie) {
      const links = findMovieLinks(movie.title);
      setDownloadLinks(links);
    }
  }, [movie]);

  const handleAiAnalysis = async () => {
    if (!movie) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await geminiService.analyzeMovie(movie.title, movie);
      setAiAnalysis(analysis);
      setActiveTab('analysis');
    } catch (error) {
      console.error('Failed to get AI analysis:', error);
      setAiAnalysis('Sorry, I encountered an error while analyzing this movie. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadClick = (url: string) => {
    window.open(url, '_blank');
  };

  if (loading || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${TMDB_IMG}/original${movie.backdrop_path})`
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-end h-full p-8 lg:p-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              {movie.title}
            </h1>
            
            {/* Movie Meta */}
            <div className="flex items-center gap-6 text-gray-300 mb-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span>{movie.vote_average?.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{movie.release_date?.split('-')[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>2h 15m</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{movie.vote_count?.toLocaleString()} votes</span>
              </div>
            </div>

            <p className="text-lg lg:text-xl text-gray-300 mb-8 max-w-3xl">
              {movie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
                <Play className="h-5 w-5" />
                Play Now
              </button>
              
              {downloadLinks.length > 0 && (
                <button 
                  onClick={() => setShowDownloadLinks(!showDownloadLinks)}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <Download className="h-5 w-5" />
                  Download ({downloadLinks.length})
                </button>
              )}
              
              <button 
                onClick={handleAiAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 transition-colors font-semibold"
              >
                <Brain className="h-5 w-5" />
                {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
              </button>
              
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg transition-colors font-semibold ${
                  isFavorite 
                    ? 'bg-pink-600 text-white hover:bg-pink-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
              
              <button className="flex items-center gap-2 px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold">
                <Share2 className="h-5 w-5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-white border-b-2 border-red-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Info className="inline mr-2" size={20} />
            Overview
          </button>
          
          {aiAnalysis && (
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'analysis'
                  ? 'text-white border-b-2 border-red-600'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Brain className="inline mr-2" size={20} />
              AI Analysis
            </button>
          )}
          
          {downloadLinks.length > 0 && (
            <button
              onClick={() => setActiveTab('downloads')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'downloads'
                  ? 'text-white border-b-2 border-red-600'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Download className="inline mr-2" size={20} />
              Downloads
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Movie Poster */}
              <div className="lg:col-span-1">
                <img
                  src={`${TMDB_IMG}/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-2xl"
                />
              </div>
              
              {/* Movie Details */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-4">Movie Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-300">Title</h3>
                    <p className="text-white">{movie.title}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-300">Overview</h3>
                    <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-300">Release Date</h3>
                    <p className="text-white">{movie.release_date}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-300">Rating</h3>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="text-white">{movie.vote_average?.toFixed(1)}/10</span>
                      <span className="text-gray-400">({movie.vote_count?.toLocaleString()} votes)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && aiAnalysis && (
            <div className="bg-gray-800 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="h-8 w-8 text-purple-400" />
                <h2 className="text-2xl font-bold">AI Movie Analysis</h2>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <div className="bg-gray-700 rounded-lg p-6">
                  <p className="whitespace-pre-wrap text-gray-200 leading-relaxed">{aiAnalysis}</p>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-gray-400">
                <p>💡 This analysis was generated by Google Gemini AI, providing unique insights and perspectives on the film.</p>
              </div>
            </div>
          )}

          {activeTab === 'downloads' && downloadLinks.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Download className="h-8 w-8 text-green-400" />
                <h2 className="text-2xl font-bold">Download Links</h2>
                <span className="text-gray-400">({downloadLinks.length} available)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {downloadLinks.map((link, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">Link {index + 1}</span>
                      <button
                        onClick={() => handleDownloadClick(link)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Download
                      </button>
                    </div>
                    <div className="text-xs text-gray-300 break-all">
                      {link}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-semibold mb-1">Download Notice:</p>
                    <p>These download links are provided for convenience. Please ensure you have the right to download this content and respect copyright laws.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}