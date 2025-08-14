import React, { useState, useEffect } from 'react';
import { useMovies } from '../contexts/MovieContext';
import { MovieCard } from '../components/MovieCard';
import { TVSeriesCard } from '../components/TVSeriesCard';
import { Play, Info, ChevronLeft, ChevronRight, Tv, Film } from 'lucide-react';
import { MovieData } from '../types';
import { movieLinks } from '../data/movieLinks';

export function Home() {
  const { trending, popular, loading } = useMovies();
  const [featuredMovie, setFeaturedMovie] = useState<MovieData | null>(null);

  useEffect(() => {
    if (trending.length > 0) {
      setFeaturedMovie(trending[0]);
    }
  }, [trending]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {featuredMovie && (
        <div className="relative h-[80vh] overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path})`
            }}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex items-end h-full p-8 lg:p-16">
            <div className="max-w-4xl">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                {featuredMovie.title}
              </h1>
              <p className="text-lg lg:text-xl text-gray-300 mb-6 max-w-2xl">
                {featuredMovie.overview}
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                  <Play className="h-5 w-5" />
                  Play
                </button>
                <button className="flex items-center gap-2 px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold">
                  <Info className="h-5 w-5" />
                  More Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movie Rows */}
      <div className="px-8 lg:px-16 py-8 space-y-12">
        {/* Trending Now */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Trending Now</h2>
          <div className="relative group">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {trending.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        </section>

        {/* New TV Series */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Tv className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold text-white">New TV Series</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TVSeriesCard 
              series={{
                title: "The Chestnut Man",
                episodes: movieLinks["The Chestnut Man"] || [],
                movieData: { 
                  title: "The Chestnut Man",
                  overview: "A crime series about a detective investigating brutal murders in Copenhagen.",
                  release_date: "2021",
                  vote_average: 8.2,
                  backdrop_path: "/path/to/backdrop.jpg"
                } as MovieData
              }}
            />
          </div>
        </section>

        {/* Latest Movies 2025 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Film className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold text-white">Latest Movies 2025</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(movieLinks)
              .filter(([title]) => title.includes('2025'))
              .map(([title, links]) => (
                <div key={title} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="h-48 bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center">
                    <Film className="h-16 w-16 text-white" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                    <p className="text-gray-400 text-sm mb-4">Available for streaming</p>
                    <button
                      onClick={() => window.open(links[0], '_blank')}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <Play className="h-4 w-4" />
                      Watch Now
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Popular Movies */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Popular Movies</h2>
          <div className="relative group">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {popular.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        </section>

        {/* Continue Watching */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Continue Watching</h2>
          <div className="relative group">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {trending.slice(0, 5).map((movie) => (
                <MovieCard key={movie.id} movie={movie} showProgress />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}