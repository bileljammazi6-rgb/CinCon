import React, { useState } from 'react';
import { Play, ChevronDown, ChevronUp, Download, ExternalLink } from 'lucide-react';
import { MovieData } from '../types';

interface TVSeriesCardProps {
  series: {
    title: string;
    episodes: string[];
    movieData?: MovieData;
  };
}

export function TVSeriesCard({ series }: TVSeriesCardProps) {
  const [showEpisodes, setShowEpisodes] = useState(false);

  const handleEpisodeClick = (episodeUrl: string, episodeNumber: number) => {
    // Open episode in new tab
    window.open(episodeUrl, '_blank');
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Series Header */}
      <div className="relative">
        {series.movieData?.backdrop_path ? (
          <img 
            src={`https://image.tmdb.org/t/p/w500${series.movieData.backdrop_path}`}
            alt={series.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center">
            <Play className="h-16 w-16 text-white" />
          </div>
        )}
        
        {/* Episode Count Badge */}
        <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-full text-sm font-semibold">
          {series.episodes.length} Episodes
        </div>
      </div>

      {/* Series Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-white">{series.title}</h3>
          <button
            onClick={() => setShowEpisodes(!showEpisodes)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            {showEpisodes ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {series.movieData?.overview && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {series.movieData.overview}
          </p>
        )}

        {/* Series Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          {series.movieData?.release_date && (
            <span>{series.movieData.release_date.split('-')[0]}</span>
          )}
          {series.movieData?.vote_average && (
            <span>⭐ {series.movieData.vote_average.toFixed(1)}</span>
          )}
          <span>TV Series</span>
        </div>

        {/* Episodes List */}
        {showEpisodes && (
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-white font-semibold mb-3">Episodes</h4>
            <div className="space-y-2">
              {series.episodes.map((episodeUrl, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Episode {index + 1}</p>
                      <p className="text-gray-400 text-sm">Click to watch</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEpisodeClick(episodeUrl, index + 1)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="Watch Episode"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.open(episodeUrl, '_blank')}
                      className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      title="Open Link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowEpisodes(!showEpisodes)}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            {showEpisodes ? 'Hide Episodes' : 'Show Episodes'}
          </button>
          <button
            onClick={() => setShowEpisodes(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Play className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}