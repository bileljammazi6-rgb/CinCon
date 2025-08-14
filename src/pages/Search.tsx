import React, { useState, useEffect } from 'react';
import { useMovies } from '../contexts/MovieContext';
import { MovieCard } from '../components/MovieCard';
import { Search as SearchIcon, Filter, X } from 'lucide-react';

export function Search() {
  const { searchMovies, movies, loading } = useMovies();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timeoutId = setTimeout(() => {
        searchMovies(searchQuery);
        setIsSearching(false);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchMovies]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      searchMovies(searchQuery);
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Search</h1>
        <p className="text-gray-400 text-lg">Find your next favorite movie or TV show</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for movies, TV shows, actors, directors..."
            className="w-full pl-12 pr-16 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-lg"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results */}
      {searchQuery && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Search Results for "{searchQuery}"
            </h2>
            {isSearching && (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                Searching...
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
            </div>
          ) : movies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <SearchIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
              <p className="text-gray-400">
                Try adjusting your search terms or browse our popular content
              </p>
            </div>
          )}
        </div>
      )}

      {/* Popular Searches */}
      {!searchQuery && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Popular Searches</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Action Movies', 'Comedy Shows', 'Sci-Fi', 'Romance', 'Horror', 'Documentaries', 'Anime', 'Thrillers'].map((category) => (
              <button
                key={category}
                onClick={() => setSearchQuery(category)}
                className="p-4 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors text-center"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}