import React from 'react';
import { Star, Calendar, Download, ExternalLink } from 'lucide-react';
import { MovieData } from '../types';

interface MovieCardProps {
  movieData: MovieData;
}

export function MovieCard({ movieData }: MovieCardProps) {
  const posterUrl = movieData.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
    : 'https://via.placeholder.com/500x750/1e293b/64748b?text=No+Image';

  const rating = movieData.vote_average ? Math.round(movieData.vote_average * 10) / 10 : 0;

  return (
    <div className="flex justify-start">
      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-2 sm:mr-3">
        <span className="text-white text-sm">🎬</span>
      </div>
      
      <div className="movie-card rounded-2xl overflow-hidden max-w-xs sm:max-w-md">
        <div className="flex flex-col sm:flex-row">
          <img 
            src={posterUrl} 
            alt={movieData.title}
            className="w-full h-48 sm:w-32 sm:h-48 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x750/1e293b/64748b?text=No+Image';
            }}
          />
          
          <div className="flex-1 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">{movieData.title}</h3>
              {movieData.downloadLinks && movieData.downloadLinks.length > 0 && (
                <span className="ml-2 text-xs px-1 sm:px-2 py-1 rounded bg-green-600/80 text-white">Pixeldrain</span>
              )}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-300">
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
            
            <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 sm:line-clamp-4 mb-3 sm:mb-4">
              {movieData.overview || 'No description available.'}
            </p>
          </div>
        </div>
        
        {movieData.downloadLinks && movieData.downloadLinks.length > 0 && (
          <div className="border-t border-white/10 p-3 sm:p-4 bg-gray-800/50">
            <h4 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Links
            </h4>
            
            <div className="space-y-2">
              {movieData.downloadLinks.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-white/5"
                >
                  <ExternalLink className="w-4 h-4" />
                  {movieData.downloadLinks!.length > 1 ? `Episode ${index + 1}` : 'Download'}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}