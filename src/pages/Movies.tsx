import React, { useState } from 'react';
import { useMovies } from '../contexts/MovieContext';
import { MovieCard } from '../components/MovieCard';
import { TVSeriesCard } from '../components/TVSeriesCard';
import { Filter, Grid, List, Tv, Film } from 'lucide-react';
import { movieLinks } from '../data/movieLinks';

export function Movies() {
  const { movies, loading } = useMovies();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [contentType, setContentType] = useState<'all' | 'movies' | 'series'>('all');

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
        <h1 className="text-4xl font-bold text-white mb-4">Movies</h1>
        <p className="text-gray-400 text-lg">Discover the latest and greatest films</p>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Content Type Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">Content Type</label>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All', icon: Film },
              { value: 'movies', label: 'Movies', icon: Film },
              { value: 'series', label: 'TV Series', icon: Tv }
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setContentType(type.value as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  contentType === type.value
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <type.icon className="h-4 w-4" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

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

      {/* TV Series Section */}
      {(contentType === 'all' || contentType === 'series') && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Tv className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold text-white">TV Series</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(movieLinks)
              .filter(([title, links]) => links.length > 1) // Series have multiple episodes
              .map(([title, links]) => (
                <TVSeriesCard 
                  key={title}
                  series={{
                    title,
                    episodes: links,
                    movieData: { 
                      title,
                      overview: `Watch ${title} - A complete series with ${links.length} episodes.`,
                      release_date: "2021-2025",
                      vote_average: 8.0,
                      backdrop_path: "/path/to/backdrop.jpg"
                    } as any
                  }}
                />
              ))}
          </div>
        </section>
      )}

      {/* Movies Grid/List */}
      {(contentType === 'all' || contentType === 'movies') && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Film className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold text-white">Movies</h2>
          </div>
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
              <p className="text-gray-400 text-lg">No movies found</p>
            </div>
          )}
        </section>
      )}

      {/* Available Downloads Section */}
      <section className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <Film className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-white">Available Downloads</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(movieLinks)
            .filter(([title, links]) => links.length === 1) // Single movies
            .map(([title, links]) => (
              <div key={title} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="h-48 bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center">
                  <Film className="h-16 w-16 text-white" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm mb-4">Available for download</p>
                  <button
                    onClick={() => window.open(links[0], '_blank')}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Play className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}