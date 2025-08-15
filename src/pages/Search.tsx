import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  Play, 
  Heart, 
  Star, 
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
  X,
  Film,
  Tv,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react';
import { useMovies } from '../contexts/MovieContext';
import { MovieData } from '../types';
import { findMovieLinks } from '../data/movieLinks';

export function Search() {
  const { searchMovies, searchTVShows } = useMovies();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<MovieData[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [contentType, setContentType] = useState<'all' | 'movies' | 'tv'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'date' | 'title'>('relevance');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const genres = [
    'all', 'action', 'adventure', 'animation', 'comedy', 'crime', 'documentary',
    'drama', 'family', 'fantasy', 'history', 'horror', 'music', 'mystery',
    'romance', 'science fiction', 'thriller', 'war', 'western', 'reality'
  ];

  const years = ['all', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'];

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      let searchResults: MovieData[] = [];
      
      if (contentType === 'all' || contentType === 'movies') {
        const movieResults = await searchMovies(query);
        searchResults.push(...movieResults);
      }
      
      if (contentType === 'all' || contentType === 'tv') {
        const tvResults = await searchTVShows(query);
        searchResults.push(...tvResults);
      }
      
      // Deduplicate results
      const uniqueResults = searchResults.filter((item, index, self) => 
        index === self.findIndex(r => r.id === item.id)
      );
      
      setResults(uniqueResults);
      setSearchParams({ q: query });
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const filterAndSortResults = () => {
    let filtered = [...results];

    // Genre filter
    if (genreFilter !== 'all') {
      filtered = filtered.filter(item =>
        item.genre_ids?.includes(getGenreId(genreFilter))
      );
    }

    // Year filter
    if (yearFilter !== 'all') {
      filtered = filtered.filter(item => {
        const date = item.release_date || item.first_air_date;
        return date?.startsWith(yearFilter);
      });
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case 'date':
        filtered.sort((a, b) => {
          const dateA = new Date(a.release_date || a.first_air_date || '').getTime();
          const dateB = new Date(b.release_date || b.first_air_date || '').getTime();
          return dateB - dateA;
        });
        break;
      case 'title':
        filtered.sort((a, b) => {
          const titleA = (a.title || a.name || '').toLowerCase();
          const titleB = (b.title || b.name || '').toLowerCase();
          return titleA.localeCompare(titleB);
        });
        break;
      default: // relevance - keep original order
        break;
    }

    return filtered;
  };

  const getGenreId = (genreName: string): number => {
    const genreMap: { [key: string]: number } = {
      'action': 28, 'adventure': 12, 'animation': 16, 'comedy': 35, 'crime': 80,
      'documentary': 99, 'drama': 18, 'family': 10751, 'fantasy': 14, 'history': 36,
      'horror': 27, 'music': 10402, 'mystery': 9648, 'romance': 10749, 'science fiction': 878,
      'thriller': 53, 'war': 10752, 'western': 37, 'reality': 10764
    };
    return genreMap[genreName] || 0;
  };

  const renderResultCard = (item: MovieData) => {
    const downloadLinks = findMovieLinks(item.title || item.name || '');
    const hasDownloads = downloadLinks.length > 0;
    const isTVShow = item.name && !item.title;
    
    if (viewMode === 'list') {
      return (
        <div key={item.id} className="group bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl">
          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <img
                src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                alt={item.title || item.name}
                className="w-24 h-36 object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {item.title || item.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isTVShow ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                    }`}>
                      {isTVShow ? 'TV Show' : 'Movie'}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm line-clamp-3 mb-3">
                    {item.overview}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {(item.release_date || item.first_air_date)?.split('-')[0]}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {Math.floor((item.vote_average || 0) * 10)} min
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {Math.floor((item.vote_average || 0) * 100)}K views
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-yellow-500 text-black text-sm px-2 py-1 rounded-full font-medium flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {item.vote_average?.toFixed(1)}
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
                  to={isTVShow ? `/tv/${item.id}` : `/movie/${item.id}`}
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
      <div key={item.id} className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
        <div className="aspect-[2/3] relative overflow-hidden">
          <img
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={item.title || item.name}
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
            {item.vote_average?.toFixed(1)}
          </div>
          
          <div className="absolute top-2 right-2 bg-slate-800 text-white text-xs px-2 py-1 rounded-full font-medium">
            {item.name && !item.title ? 'TV' : 'Movie'}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {item.title || item.name}
          </h3>
          <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
            <span>{(item.release_date || item.first_air_date)?.split('-')[0]}</span>
            <span className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {Math.floor((item.vote_average || 0) * 100)}K
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link
              to={item.name && !item.title ? `/tv/${item.id}` : `/movie/${item.id}`}
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
          to={item.name && !item.title ? `/tv/${item.id}` : `/movie/${item.id}`}
          className="absolute inset-0 z-10"
          aria-label={`View details for ${item.title || item.name}`}
        />
      </div>
    );
  };

  const filteredResults = filterAndSortResults();

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🔍 Search
        </h1>
        <p className="text-xl text-slate-400">
          Find your favorite movies, TV shows, and more with AI-powered search
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700/50">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for movies, TV shows, actors, directors..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Content Type */}
            <div className="lg:w-48">
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as any)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Content</option>
                <option value="movies">Movies Only</option>
                <option value="tv">TV Shows Only</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <SearchIcon className="h-4 w-4" />
                  Search
                </div>
              )}
            </button>
          </div>

          {/* Quick Search Suggestions */}
          <div className="flex flex-wrap gap-2">
            {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance'].map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setQuery(genre)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-full text-sm transition-colors"
              >
                {genre}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <>
          {/* Results Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">
                Search Results for "{query}"
              </h2>
              <span className="text-slate-400">
                {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
              </span>
            </div>

            <div className="flex items-center gap-4">
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
                className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="relevance">Relevance</option>
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
                    setSortBy('relevance');
                  }}
                  className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Clear Filters</span>
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-slate-400 text-lg">Searching...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-2">No results found</h3>
              <p className="text-slate-400 mb-6">
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setHasSearched(false);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Start New Search
              </button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' 
                : 'grid-cols-1'
            }`}>
              {filteredResults.map(renderResultCard)}
            </div>
          )}
        </>
      )}

      {/* Search Tips */}
      {!hasSearched && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-2xl font-bold mb-4">Ready to discover amazing content?</h3>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Search for your favorite movies, TV shows, actors, directors, or genres. 
            Our AI-powered search will help you find exactly what you're looking for.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <Film className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Movies</h4>
              <p className="text-slate-400 text-sm">Find the latest blockbusters and classic films</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <Tv className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">TV Shows</h4>
              <p className="text-slate-400 text-sm">Discover binge-worthy series and episodes</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <Sparkles className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">AI Powered</h4>
              <p className="text-slate-400 text-sm">Smart search with intelligent recommendations</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}