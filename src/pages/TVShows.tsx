import React, { useState } from 'react';
import { useMovies } from '../contexts/MovieContext';
import { MovieCard } from '../components/MovieCard';
import { Filter, Grid, List } from 'lucide-react';

export function TVShows() {
  const { movies, loading } = useMovies();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const genres = [
    'all', 'action', 'adventure', 'animation', 'comedy', 'crime', 
    'documentary', 'drama', 'family', 'fantasy', 'history', 'horror',
    'music', 'mystery', 'romance', 'science fiction', 'thriller', 'war'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">TV Shows</h1>
        <p className="text-gray-400 text-lg">Binge-worthy series and shows</p>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Genre Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full lg:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {genres.map((genre) => (
              <option key={genre} value={genre} className="capitalize">
                {genre === 'all' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-end">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* TV Shows Grid/List */}
      <div className={`
        ${viewMode === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6' 
          : 'space-y-4'
        }
      `}>
        {movies.map((movie) => (
          <MovieCard 
            key={movie.id} 
            movie={movie} 
            viewMode={viewMode}
          />
        ))}
      </div>

      {movies.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No TV shows found</p>
        </div>
      )}
    </div>
  );
}