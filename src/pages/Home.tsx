import React, { useState, useEffect } from 'react';
import { useMovies } from '../contexts/MovieContext';
import { MovieCard } from '../components/MovieCard';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieData } from '../types';

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