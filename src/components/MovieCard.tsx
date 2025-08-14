
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Heart, Info } from 'lucide-react';
import { MovieData } from '../types';

interface MovieCardProps {
  movie: MovieData;
  viewMode?: 'grid' | 'list';
  showProgress?: boolean;
}

export function MovieCard({ movie, viewMode = 'grid', showProgress = false }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  if (viewMode === 'list') {
    return (
      <Link to={`/movie/${movie.id}`} className="block">
        <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
          <img 
            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
            alt={movie.title}
            className="w-20 h-30 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">{movie.title}</h3>
            <p className="text-gray-400 text-sm mb-2">{movie.overview}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{movie.release_date?.split('-')[0]}</span>
              <span>•</span>
              <span>{movie.vote_average?.toFixed(1)} ⭐</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <Play className="h-4 w-4" />
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                setIsFavorite(!isFavorite);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'bg-pink-600 text-white hover:bg-pink-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Movie Poster */}
      <Link to={`/movie/${movie.id}`}>
        <div className="relative overflow-hidden rounded-lg">
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Progress Bar for Continue Watching */}
          {showProgress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
              <div className="h-full bg-red-600" style={{ width: '65%' }}></div>
            </div>
          )}

          {/* Hover Overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
              <div className="flex gap-2">
                <button className="p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors">
                  <Play className="h-5 w-5" />
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setIsFavorite(!isFavorite);
                  }}
                  className={`p-3 rounded-full transition-colors ${
                    isFavorite 
                      ? 'bg-pink-600 text-white hover:bg-pink-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Movie Info */}
      <div className="mt-3">
        <h3 className="text-sm font-medium text-white mb-1 line-clamp-1">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{movie.release_date?.split('-')[0]}</span>
          <span>•</span>
          <span>{movie.vote_average?.toFixed(1)} ⭐</span>
        </div>
      </div>
    </div>
  );
}