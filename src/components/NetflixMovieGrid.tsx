import React, { useState } from 'react';
import { Play, Heart, Plus, MoreVertical, Star, Clock, Download, Film } from 'lucide-react';
import { movieLinks } from '../data/movieLinks';

interface NetflixMovieGridProps {
  title?: string;
  subtitle?: string;
  onMovieSelect?: (movieName: string, links: string[]) => void;
  showHero?: boolean;
}

const NetflixMovieGrid: React.FC<NetflixMovieGridProps> = ({
  title = "Trending Now",
  subtitle = "Popular movies and TV shows",
  onMovieSelect,
  showHero = false
}) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null);

  const handleFavorite = (movieName: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(movieName)) {
        newFavorites.delete(movieName);
      } else {
        newFavorites.add(movieName);
      }
      return newFavorites;
    });
  };

  const handlePlay = (movieName: string, links: string[]) => {
    if (onMovieSelect) {
      onMovieSelect(movieName, links);
    }
  };

  const movieEntries = Object.entries(movieLinks);
  const featuredMovie = movieEntries[0]; // First movie as featured

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      {showHero && featuredMovie && (
        <div className="relative h-screen w-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)` 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          
          <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-16">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl capitalize">
                {featuredMovie[0]}
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
                Experience the latest in entertainment with our curated collection of movies and TV shows.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => handlePlay(featuredMovie[0], featuredMovie[1])}
                  className="netflix-button flex items-center space-x-2 hover-lift"
                >
                  <Play className="w-5 h-5" />
                  <span>Play Now</span>
                </button>
                <button className="netflix-button-secondary flex items-center space-x-2 hover-lift">
                  <Plus className="w-5 h-5" />
                  <span>My List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="px-4 md:px-8 lg:px-16 py-8">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-400 text-lg">{subtitle}</p>
        </div>

        {/* Movie Grid */}
        <div className="movie-grid">
          {movieEntries.map(([movieName, links]) => (
            <div
              key={movieName}
              className="netflix-card group cursor-pointer"
              onMouseEnter={() => setHoveredMovie(movieName)}
              onMouseLeave={() => setHoveredMovie(null)}
              onClick={() => handlePlay(movieName, links)}
            >
              {/* Movie Poster Placeholder */}
              <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film className="w-16 h-16 text-gray-600" />
                </div>
                
                {/* Hover Overlay */}
                {hoveredMovie === movieName && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center transition-all duration-300">
                    <div className="flex space-x-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(movieName, links);
                        }}
                        className="p-3 bg-white rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Play className="w-6 h-6 text-black fill-current" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavorite(movieName);
                        }}
                        className={`p-3 rounded-full transition-colors ${
                          favorites.has(movieName) 
                            ? 'bg-red-600 text-white' 
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        <Heart className={`w-6 h-6 ${favorites.has(movieName) ? 'fill-current' : ''}`} />
                      </button>
                      <button className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors">
                        <MoreVertical className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Episode Count Badge */}
                {links.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {links.length} Episodes
                  </div>
                )}
              </div>
              
              {/* Movie Info */}
              <div className="p-4">
                <h3 className="font-semibold text-white text-lg mb-2 capitalize line-clamp-2">
                  {movieName}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>4.5</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>2h 15m</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(movieName, links);
                    }}
                    className="flex-1 mr-2 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                  >
                    <Play className="w-4 h-4 inline mr-1" />
                    Play
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(movieName);
                    }}
                    className={`p-2 rounded transition-colors ${
                      favorites.has(movieName) 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(movieName) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetflixMovieGrid;