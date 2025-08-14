import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovies } from '../contexts/MovieContext';
import { Play, Plus, Heart, Share2, Star, Calendar, Clock, Users } from 'lucide-react';
import { MovieData } from '../types';

export function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMovieById, loading } = useMovies();
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      getMovieById(id).then(setMovie);
    }
  }, [id, getMovieById]);

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
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
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

      {/* Movie Details */}
      <div className="px-8 lg:px-16 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">About this movie</h2>
            <p className="text-gray-300 leading-relaxed mb-8">
              {movie.overview}
            </p>

            {/* Cast & Crew */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Cast & Crew</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Tom Hanks', 'Emma Watson', 'John Smith', 'Sarah Johnson'].map((actor, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-300">{actor}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Movies */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">You might also like</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="w-full h-32 bg-gray-700"></div>
                    <div className="p-3">
                      <p className="text-white text-sm font-medium">Similar Movie {item}</p>
                      <p className="text-gray-400 text-xs">2024 • Action</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Movie Poster */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-auto"
              />
            </div>

            {/* Quick Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Genre:</span>
                  <span className="text-white">Action, Adventure</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Release Date:</span>
                  <span className="text-white">{movie.release_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Runtime:</span>
                  <span className="text-white">2h 15m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Language:</span>
                  <span className="text-white">English</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating:</span>
                  <span className="text-white">PG-13</span>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Reviews</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-white text-sm">4.5/5</span>
                </div>
                <p className="text-gray-400 text-sm">
                  "Amazing movie with great performances and stunning visuals!"
                </p>
                <p className="text-gray-500 text-xs">- MovieFan123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}