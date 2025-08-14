import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovies } from '../contexts/MovieContext';
import { useAuth } from '../contexts/AuthContext';
import { Play, Heart, Share2, Download, Star, Clock, Users, ArrowLeft, Crown, Film } from 'lucide-react';
import { movieLinks } from '../data/movieLinks';
import { MovieData } from '../types';

export function Watch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMovieById, loading } = useMovies();
  const { user } = useAuth();
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);

  const isAdmin = user?.email === 'bilel8x@example.com';

  useEffect(() => {
    if (id) {
      const movieData = getMovieById(parseInt(id));
      if (movieData) {
        setMovie(movieData);
      }
    }
  }, [id, getMovieById]);

  // Check if this movie is available in our links
  const availableContent = Object.entries(movieLinks).find(([title]) => 
    movie?.title.toLowerCase().includes(title.toLowerCase()) ||
    title.toLowerCase().includes(movie?.title.toLowerCase() || '')
  );

  const isSeries = availableContent && availableContent[1].length > 1;
  const episodes = availableContent ? availableContent[1] : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Film className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-400 mb-2">Movie not found</h2>
          <button
            onClick={() => navigate('/browse')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 z-20 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
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
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-red-600 text-white text-sm rounded-full font-medium">
                {isSeries ? 'TV Series' : 'Movie'}
              </span>
              <span className="text-gray-300">{movie.release_date?.split('-')[0]}</span>
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-white">{movie.vote_average?.toFixed(1)}</span>
              </div>
              {isSeries && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{episodes.length} Episodes</span>
                </div>
              )}
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              {movie.title}
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-300 mb-8 max-w-2xl">
              {movie.overview}
            </p>
            
            <div className="flex flex-wrap gap-4">
              {availableContent ? (
                <>
                  <button className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                    <Play className="h-5 w-5" />
                    {isSeries ? 'Watch Episode 1' : 'Watch Now'}
                  </button>
                  <button className="flex items-center gap-2 px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold">
                    <Download className="h-5 w-5" />
                    Download
                  </button>
                </>
              ) : (
                <button className="flex items-center gap-2 px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold">
                  <Play className="h-5 w-5" />
                  Watch Trailer
                </button>
              )}
              
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-semibold ${
                  isLiked 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </button>
              
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold">
                <Share2 className="h-5 w-5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Details */}
      <div className="px-8 lg:px-16 py-8 space-y-8">
        {/* Episodes Section (for series) */}
        {isSeries && (
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Episodes</h2>
              <button
                onClick={() => setShowEpisodes(!showEpisodes)}
                className="text-red-600 hover:text-red-500 transition-colors"
              >
                {showEpisodes ? 'Hide' : 'Show'} Episodes
              </button>
            </div>
            
            {showEpisodes && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {episodes.map((episode, index) => (
                  <div
                    key={index}
                    className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedEpisode === index ? 'ring-2 ring-red-500' : 'hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedEpisode(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">Episode {index + 1}</h3>
                        <p className="text-gray-400 text-sm">Available for download</p>
                      </div>
                      {isAdmin && (
                        <button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Movie Information */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">About</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Details</h3>
              <div className="space-y-2 text-gray-300">
                <p><span className="text-gray-400">Release Date:</span> {movie.release_date}</p>
                <p><span className="text-gray-400">Rating:</span> {movie.vote_average?.toFixed(1)}/10</p>
                <p><span className="text-gray-400">Popularity:</span> {movie.popularity?.toFixed(0)}</p>
                <p><span className="text-gray-400">Language:</span> {movie.original_language?.toUpperCase()}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {movie.genre_ids?.map((genreId) => (
                  <span
                    key={genreId}
                    className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                  >
                    Genre {genreId}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-white font-medium">12 watching</p>
              <p className="text-gray-400 text-sm">Right now</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-white font-medium">4.8/5</p>
              <p className="text-gray-400 text-sm">Community rating</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-white font-medium">89%</p>
              <p className="text-gray-400 text-sm">Liked this</p>
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        {isAdmin && availableContent && (
          <div className="bg-gradient-to-r from-yellow-900 to-orange-900 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-white">Admin Controls</h2>
            </div>
            <p className="text-yellow-100 mb-4">You can start streaming this content for the community.</p>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-black rounded-lg hover:bg-yellow-700 transition-colors font-semibold">
                <Play className="h-5 w-5" />
                Start Community Stream
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold">
                <Users className="h-5 w-5" />
                Manage Viewers
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}