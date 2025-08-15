import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Settings, 
  Download, 
  Share2, 
  Heart, 
  Brain, 
  Crown, 
  Sparkles, 
  MessageCircle, 
  Info, 
  Clock, 
  Eye, 
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RotateCw,
  Zap
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { findMovieLinks } from '../data/movieLinks';

interface MoviePlayerProps {
  movie: any;
  isOpen: boolean;
  onClose: () => void;
}

export function MoviePlayer({ movie, isOpen, onClose }: MoviePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [showSettings, setShowSettings] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const downloadLinks = findMovieLinks(movie?.title || '');
  const hasDownloads = downloadLinks.length > 0;

  useEffect(() => {
    if (isOpen && movie) {
      generateAIInsight();
    }
  }, [isOpen, movie]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }
  }, [isOpen, isPlaying]);

  const generateAIInsight = async () => {
    if (!movie?.title) return;
    
    setIsLoadingInsight(true);
    try {
      const insight = await geminiService.analyzeMovie(movie.title, movie);
      setAiInsight(insight);
    } catch (error) {
      setAiInsight("🎬 Even the omnipotent Bilel needs a moment to analyze this masterpiece. Let me gather my thoughts about this cinematic gem...");
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
    setShowDownloadOptions(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div ref={containerRef} className="relative w-full h-full">
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        >
          <source src={movie?.videoUrl || '/sample-video.mp4'} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Top Controls */}
        <div className={`absolute top-0 left-0 right-0 p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="text-white">
                <h2 className="text-lg font-semibold">{movie?.title}</h2>
                <p className="text-sm text-gray-300">{movie?.release_date?.split('-')[0]} • {Math.floor((movie?.vote_average || 0) * 10)} min</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAIInsights(!showAIInsights)}
                className="p-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg transition-colors"
                title="Bilel's AI Insights"
              >
                <Brain className="h-5 w-5" />
              </button>
              {hasDownloads && (
                <button
                  onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                  className="p-2 bg-green-600/80 hover:bg-green-600 text-white rounded-lg transition-colors"
                  title="Download Options"
                >
                  <Download className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Center Play Button */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors backdrop-blur-sm"
          >
            <Play className="h-16 w-16 fill-current" />
          </button>
        )}

        {/* Bottom Controls */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(currentTime / (duration || 1)) * 100}%, #4b5563 ${(currentTime / (duration || 1)) * 100}%, #4b5563 100%)`
              }}
            />
            <div className="flex justify-between text-white text-sm mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => skipTime(-10)}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                title="Skip Back 10s"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button
                onClick={togglePlay}
                className="p-3 bg-white hover:bg-gray-200 text-black rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
              </button>
              
              <button
                onClick={() => skipTime(10)}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                title="Skip Forward 10s"
              >
                <SkipForward className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`p-2 rounded-lg transition-colors ${
                  showSubtitles ? 'bg-purple-600 text-white' : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
                title="Subtitles"
              >
                <Eye className="h-5 w-5" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        {showAIInsights && (
          <div className="absolute top-20 right-4 w-96 max-h-96 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Bilel's AI Insights</h3>
                  <p className="text-xs text-slate-400">Your Entertainment Guru</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIInsights(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {isLoadingInsight ? (
              <div className="flex items-center space-x-2 text-slate-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span>Bilel is analyzing...</span>
              </div>
            ) : (
              <div className="text-slate-200 text-sm leading-relaxed">
                <div className="mb-3 p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">🎬 Current Scene Analysis</p>
                  <p>You're watching "{movie?.title}" at {formatTime(currentTime)}</p>
                </div>
                <div className="prose prose-sm prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{aiInsight}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Download Options Panel */}
        {showDownloadOptions && hasDownloads && (
          <div className="absolute top-20 right-4 w-80 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Download Options</h3>
              <button
                onClick={() => setShowDownloadOptions(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {downloadLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleDownload(link)}
                  className="w-full flex items-center justify-between p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Download {index + 1}</span>
                  </div>
                  <span className="text-xs text-slate-400">Click to download</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-20 right-4 w-80 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Player Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Playback Speed</label>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x (Normal)</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Quality</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="4K">4K</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Subtitles</span>
                <button
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showSubtitles ? 'bg-purple-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showSubtitles ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}