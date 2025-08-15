import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Heart, 
  Star, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye,
  Download,
  Share2,
  Clock,
  Calendar,
  Users,
  ArrowRight,
  ChevronDown,
  X
} from 'lucide-react';
import { useMovies } from '../contexts/MovieContext';
import { MovieData } from '../types';
import { findMovieLinks } from '../data/movieLinks';

export function Movies() {
  const { getPopularMovies, getTopRatedMovies, getUpcomingMovies, searchMovies } = useMovies();
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<MovieData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'date' | 'title'>('popularity');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const genres = [
    'all', 'action', 'adventure', 'animation', 'comedy', 'crime', 'documentary',
    'drama', 'family', 'fantasy', 'history', 'horror', 'music', 'mystery',
    'romance', 'science fiction', 'thriller', 'war', 'western'
  ];

  const years = ['all', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'];

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    filterAndSortMovies();
  }, [movies, searchQuery, sortBy, genreFilter, yearFilter]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const [popular, topRated, upcoming] = await Promise.all([
        getPopularMovies(),
        getTopRatedMovies(),
        getUpcomingMovies()
      ]);
      
      // Combine and deduplicate movies
      const allMovies = [...popular, ...topRated, ...upcoming];
      const uniqueMovies = allMovies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );
      
      setMovies(uniqueMovies);
    } catch (error) {
      console.error('Failed to load movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMovies = () => {
    let filtered = [...movies];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.overview?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Genre filter
    if (genreFilter !== 'all') {
      filtered = filtered.filter(movie =>
        movie.genre_ids?.includes(getGenreId(genreFilter))
      );
    }

    // Year filter
    if (yearFilter !== 'all') {
      filtered = filtered.filter(movie =>
        movie.release_date?.startsWith(yearFilter)
      );
    }

    // Sort
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case 'date':
        filtered.sort((a, b) => new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredMovies(filtered);
  };

  const getGenreId = (genreName: string): number => {
    const genreMap: { [key: string]: number } = {
      'action': 28, 'adventure': 12, 'animation': 16, 'comedy': 35, 'crime': 80,
      'documentary': 99, 'drama': 18, 'family': 10751, 'fantasy': 14, 'history': 36,
      'horror': 27, 'music': 10402, 'mystery': 9648, 'romance': 10749, 'science fiction': 878,
      'thriller': 53, 'war': 10752, 'western': 37
    };
    return genreMap[genreName] || 0;
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        setLoading(true);
        const results = await searchMovies(searchQuery);
        setMovies(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderMovieCard = (movie: MovieData) => {
    const downloadLinks = findMovieLinks(movie.title);
    const hasDownloads = downloadLinks.length > 0;
    
    if (viewMode === 'list') {
      return (
        <div key={movie.id} className="group bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl">
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
      <div key={movie.id} className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🎬 Movies
        </h1>
        <p className="text-xl text-slate-400">
          Discover the latest and greatest films with AI-powered insights
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search movies by title, genre, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* View Mode */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition-colors"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="popularity">Popularity</option>
                  <option value="rating">Rating</option>
                  <option value="date">Release Date</option>
                  <option value="title">Title</option>
                </select>
              </div>

              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>
                      {genre === 'all' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Year</label>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year === 'all' ? 'All Years' : year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setGenreFilter('all');
                  setYearFilter('all');
                  setSortBy('popularity');
                  setSearchQuery('');
                }}
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-400">
          Showing {filteredMovies.length} of {movies.length} movies
        </p>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              loadMovies();
            }}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Movies Grid/List */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-2xl font-bold mb-2">No movies found</h3>
          <p className="text-slate-400 mb-6">
            {searchQuery ? 'Try adjusting your search terms or filters' : 'Check back later for new releases'}
          </p>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                loadMovies();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Browse All Movies
            </button>
          )}
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' 
            : 'grid-cols-1'
        }`}>
          {filteredMovies.map(renderMovieCard)}
        </div>
      )}

      {/* Load More */}
      {filteredMovies.length > 0 && (
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-105">
            Load More Movies
          </button>
        </div>
      )}
    </div>
  );
}