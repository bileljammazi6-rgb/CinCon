import React, { useState, useEffect } from 'react';
import { useMovies } from '../contexts/MovieContext';
import { MovieCard } from '../components/MovieCard';
import { TVSeriesCard } from '../components/TVSeriesCard';
import { Play, Info, ChevronLeft, ChevronRight, Star, Clock, Users, Film } from 'lucide-react';
import { MovieData } from '../types';
import { movieLinks } from '../data/movieLinks';

export function Home() {
  const { trending, popular, loading } = useMovies();
  const [featuredMovie, setFeaturedMovie] = useState<MovieData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (trending.length > 0) {
      setFeaturedMovie(trending[0]);
    }
  }, [trending]);

  const featuredContent = [
    {
      title: "The Chestnut Man",
      description: "A gripping crime series about a detective investigating brutal murders in Copenhagen.",
      type: "TV Series",
      episodes: 6,
      rating: 8.5,
      year: 2021
    },
    {
      title: "Smurfs 2025",
      description: "The beloved blue creatures return in an all-new animated adventure.",
      type: "Movie",
      rating: 7.8,
      year: 2025
    },
    {
      title: "Jurassic World 2025",
      description: "Dinosaurs roam the Earth once again in this epic adventure.",
      type: "Movie",
      rating: 8.2,
      year: 2025
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredContent.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredContent.length) % featuredContent.length);
  };

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
      <div className="relative h-[80vh] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${featuredMovie?.backdrop_path || '/default-backdrop.jpg'})`
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all z-10"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all z-10"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Content */}
        <div className="relative z-10 flex items-end h-full p-8 lg:p-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-red-600 text-white text-sm rounded-full font-medium">
                {featuredContent[currentSlide].type}
              </span>
              <span className="text-gray-300">{featuredContent[currentSlide].year}</span>
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-white">{featuredContent[currentSlide].rating}</span>
              </div>
              {featuredContent[currentSlide].episodes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{featuredContent[currentSlide].episodes} Episodes</span>
                </div>
              )}
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              {featuredContent[currentSlide].title}
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-300 mb-8 max-w-2xl">
              {featuredContent[currentSlide].description}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                <Play className="h-5 w-5" />
                Play Now
              </button>
              <button className="flex items-center gap-2 px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold">
                <Info className="h-5 w-5" />
                More Info
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {featuredContent.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-8 lg:px-16 py-8 space-y-12">
        {/* Featured TV Series */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Featured TV Series</h2>
            <button className="text-red-600 hover:text-red-500 transition-colors">
              View All →
            </button>
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
                  vote_average: 8.5,
                  backdrop_path: "/path/to/backdrop.jpg"
                } as MovieData
              }}
            />
          </div>
        </section>

        {/* Latest Movies 2025 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Latest Movies 2025</h2>
            <button className="text-red-600 hover:text-red-500 transition-colors">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Object.entries(movieLinks)
              .filter(([title]) => title.includes('2025'))
              .map(([title, links]) => (
                <div key={title} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg">
                    <div className="aspect-[2/3] bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center">
                      <Film className="h-16 w-16 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-3 bg-red-600 text-white rounded-full hover:bg-red-700">
                        <Play className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-white font-medium mt-2 text-sm truncate">{title}</h3>
                </div>
              ))}
          </div>
        </section>

        {/* Trending Now */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Trending Now</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {trending.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Popular Movies */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Popular Movies</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {popular.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}