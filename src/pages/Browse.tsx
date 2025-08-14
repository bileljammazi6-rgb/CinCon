import React, { useState, useMemo } from 'react';
import { useMovies } from '../contexts/MovieContext';
import { MovieCard } from '../components/MovieCard';
import { TVSeriesCard } from '../components/TVSeriesCard';
import { Search, Filter, Grid, List, Play, Download, Star, Clock, Users } from 'lucide-react';
import { movieLinks } from '../data/movieLinks';
import { MovieData } from '../types';

type ContentType = 'all' | 'movies' | 'series' | 'downloads';
type ViewMode = 'grid' | 'list';

export function Browse() {
  const { trending, popular, loading } = useMovies();
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState<ContentType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'name'>('rating');

  // Filter and search content
  const filteredContent = useMemo(() => {
    let content: Array<{ id: string; title: string; type: 'movie' | 'series'; data: any }> = [];

    // Add TMDB movies
    if (contentType === 'all' || contentType === 'movies') {
      content.push(...trending.map(movie => ({
        id: movie.id.toString(),
        title: movie.title,
        type: 'movie' as const,
        data: movie
      })));
    }

    // Add available downloads
    if (contentType === 'all' || contentType === 'downloads') {
      Object.entries(movieLinks).forEach(([title, links]) => {
        const isSeries = links.length > 1;
        content.push({
          id: title,
          title,
          type: isSeries ? 'series' : 'movie',
          data: { title, links, isSeries }
        });
      });
    }

    // Filter by search query
    if (searchQuery) {
      content = content.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort content
    content.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          if (a.type === 'movie' && b.type === 'movie') {
            return (b.data.vote_average || 0) - (a.data.vote_average || 0);
          }
          return 0;
        case 'year':
          if (a.type === 'movie' && b.type === 'movie') {
            return (b.data.release_date || '').localeCompare(a.data.release_date || '');
          }
          return 0;
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return content;
  }, [trending, contentType, searchQuery, sortBy]);

  const contentTypes = [
    { value: 'all', label: 'All Content', icon: Grid },
    { value: 'movies', label: 'Movies', icon: Play },
    { value: 'series', label: 'TV Series', icon: Users },
    { value: 'downloads', label: 'Available Downloads', icon: Download },
  ];

  const sortOptions = [
    { value: 'rating', label: 'Rating', icon: Star },
    { value: 'year', label: 'Year', icon: Clock },
    { value: 'name', label: 'Name', icon: Grid },
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
        <h1 className="text-4xl font-bold text-white mb-4">Browse Content</h1>
        <p className="text-gray-400 text-lg">Discover movies, TV series, and available downloads</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-900 rounded-xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for movies, TV shows, actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
            />
          </div>

          {/* Content Type Filter */}
          <div className="flex gap-2">
            {contentTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value as ContentType)}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
                    ${contentType === type.value
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort and View Options */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Sort by:</span>
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={`
                    flex items-center gap-1 px-3 py-1 rounded text-sm transition-all
                    ${sortBy === option.value
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="h-3 w-3" />
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-400">
          Found <span className="text-white font-semibold">{filteredContent.length}</span> items
        </p>
      </div>

      {/* Content Grid */}
      {filteredContent.length === 0 ? (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No content found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
            : 'space-y-4'
          }
        `}>
          {filteredContent.map((item) => {
            if (item.type === 'series' && item.data.isSeries) {
              return (
                <TVSeriesCard
                  key={item.id}
                  series={{
                    title: item.title,
                    episodes: item.data.links,
                    movieData: {
                      title: item.title,
                      overview: `TV Series with ${item.data.links.length} episodes`,
                      release_date: '2024',
                      vote_average: 8.0,
                      backdrop_path: '/path/to/backdrop.jpg'
                    } as MovieData
                  }}
                />
              );
            } else if (item.type === 'movie' && item.data.id) {
              return (
                <MovieCard key={item.id} movie={item.data} />
              );
            } else {
              // Available download
              return (
                <div key={item.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg">
                    <div className="aspect-[2/3] bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
                      <Download className="h-16 w-16 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-3 bg-green-600 text-white rounded-full hover:bg-green-700">
                        <Download className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Available
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-white font-medium text-sm truncate">{item.title}</h3>
                    <p className="text-gray-400 text-xs">Ready to download</p>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}