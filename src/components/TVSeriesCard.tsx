import React from 'react';
import { Star, Calendar, Download, ExternalLink, Copy, Tv, Play } from 'lucide-react';
import { MovieData } from '../types';

interface TVSeriesCardProps {
  movieData: MovieData;
  downloadLinks: string[];
}

export function TVSeriesCard({ movieData, downloadLinks }: TVSeriesCardProps) {
  const posterUrl = movieData.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
    : 'https://via.placeholder.com/500x750/1e293b/64748b?text=No+Image';

  const rating = movieData.vote_average ? Math.round(movieData.vote_average * 10) / 10 : 0;
  const isMultiEpisode = downloadLinks.length > 1;

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  return (
    <div className="flex justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 mr-3">
        <span className="text-white text-sm">📺</span>
      </div>
      
      <div className="tv-series-card rounded-2xl overflow-hidden max-w-md">
        <div className="flex">
          <img 
            src={posterUrl} 
            alt={movieData.title}
            className="w-32 h-48 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x750/1e293b/64748b?text=No+Image';
            }}
          />
          
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white mb-2">{movieData.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded bg-purple-600/80 text-white flex items-center gap-1">
                  <Tv className="w-3 h-3" />
                  Series
                </span>
                {downloadLinks.length > 0 && (
                  <span className="text-xs px-2 py-1 rounded bg-green-600/80 text-white">Pixeldrain</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-300">
              {movieData.release_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(movieData.release_date).getFullYear()}
                </div>
              )}
              
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  {rating}/10
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-300 line-clamp-4 mb-4">
              {movieData.overview || 'No description available.'}
            </p>

            {isMultiEpisode && (
              <div className="text-xs text-purple-300 bg-purple-900/20 px-2 py-1 rounded">
                📺 {downloadLinks.length} Episodes Available
              </div>
            )}
          </div>
        </div>
        
        {downloadLinks.length > 0 && (
          <div className="border-t border-white/10 p-4 bg-gray-800/50">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Download className="w-4 h-4" />
              {isMultiEpisode ? 'Episode Downloads' : 'Download'}
            </h4>
            
            <div className="grid grid-cols-1 gap-2">
              {downloadLinks.map((link, index) => {
                const host = (() => {
                  try { return new URL(link).host; } catch { return 'link'; }
                })();
                return (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-white/5 flex-1"
                    >
                      {isMultiEpisode ? (
                        <>
                          <Play className="w-4 h-4" />
                          Episode {index + 1}
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          Download
                        </>
                      )}
                      <span className="text-xs text-gray-400">({host})</span>
                    </a>
                    <button onClick={() => copy(link)} className="text-gray-300 hover:text-white p-2 rounded hover:bg-white/10" title="Copy link">
                      <Copy className="w-4 h-4"/>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}