import React from 'react';
import { Play, Info, Heart, Share2, Download } from 'lucide-react';

interface NetflixHeroProps {
  title: string;
  description: string;
  backgroundImage?: string;
  onPlay?: () => void;
  onInfo?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
}

const NetflixHero: React.FC<NetflixHeroProps> = ({
  title,
  description,
  backgroundImage = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  onPlay,
  onInfo,
  onFavorite,
  onShare,
  onDownload
}) => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-16">
        <div className="max-w-4xl">
          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
            {title}
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed">
            {description}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <button
              onClick={onPlay}
              className="netflix-button flex items-center space-x-2 hover-lift"
            >
              <Play className="w-5 h-5" />
              <span>Play</span>
            </button>
            
            <button
              onClick={onInfo}
              className="netflix-button-secondary flex items-center space-x-2 hover-lift"
            >
              <Info className="w-5 h-5" />
              <span>More Info</span>
            </button>
            
            <button
              onClick={onFavorite}
              className="p-3 bg-black/30 hover:bg-black/50 rounded-full transition-colors hover-lift"
            >
              <Heart className="w-5 h-5 text-white" />
            </button>
            
            <button
              onClick={onShare}
              className="p-3 bg-black/30 hover:bg-black/50 rounded-full transition-colors hover-lift"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
            
            <button
              onClick={onDownload}
              className="p-3 bg-black/30 hover:bg-black/50 rounded-full transition-colors hover-lift"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Additional Info */}
          <div className="flex items-center space-x-6 text-sm text-gray-300">
            <span className="text-green-400 font-semibold">98% Match</span>
            <span>2024</span>
            <span className="border border-gray-400 px-2 py-1 rounded">TV-MA</span>
            <span>2h 15m</span>
            <span className="border border-gray-400 px-2 py-1 rounded">HD</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
};

export default NetflixHero;