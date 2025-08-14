import React from 'react';
import { Star, Calendar, Download, ExternalLink, Copy } from 'lucide-react';
import { MovieData } from '../types';

interface MovieCardProps {
  movieData: MovieData;
}

export function MovieCard({ movieData }: MovieCardProps) {
  const posterUrl = movieData.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
    : 'https://via.placeholder.com/500x750/1e293b/64748b?text=No+Image';

  const rating = movieData.vote_average ? Math.round(movieData.vote_average * 10) / 10 : 0;

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  return (
    <div className="movie-card rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]">
      <div className="flex flex-col h-full">
        {/* Poster and Info */}
        <div className="flex flex-col md:flex-row">
          <div className="relative">
            <img 
              src={posterUrl} 
              alt={movieData.title}
              className="w-full md:w-48 h-64 md:h-72 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x750/1e293b/64748b?text=No+Image';
              }}
            />
            {movieData.downloadLinks && movieData.downloadLinks.length > 0 && (
              <div className="absolute top-3 right-3">
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                  Available
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">{movieData.title}</h3>
                {rating > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-yellow-400 font-semibold">{rating}/10</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-300">
                {movieData.release_date && (
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(movieData.release_date).getFullYear()}</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-300 leading-relaxed line-clamp-4">
                {movieData.overview || 'No description available.'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Download Section */}
        {movieData.downloadLinks && movieData.downloadLinks.length === 1 && (
          <div className="border-t border-white/10 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-purple-400" />
              Download Available
            </h4>
            
            <div className="space-y-3">
              {movieData.downloadLinks.map((link, index) => {
                const host = (() => {
                  try { return new URL(link).host; } catch { return 'link'; }
                })();
                return (
                  <div key={index} className="flex items-center gap-3">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all p-3 rounded-xl hover:shadow-lg flex-1 justify-center font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Download Now
                    </a>
                    <button 
                      onClick={() => copy(link)} 
                      className="text-gray-300 hover:text-white p-3 rounded-xl hover:bg-white/10 transition-all" 
                      title="Copy link"
                    >
                      <Copy className="w-5 h-5"/>
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