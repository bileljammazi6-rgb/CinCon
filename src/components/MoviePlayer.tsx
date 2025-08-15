import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2, Settings, Download, Share2, Heart, Brain, Crown, Sparkles, MessageCircle, Info, Clock, Eye, Star, X, ChevronLeft, ChevronRight, RotateCcw, RotateCw, Zap } from 'lucide-react';
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
  const [selectedVideoSource, setSelectedVideoSource] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const downloadLinks = findMovieLinks(movie?.title || '');
  const hasDownloads = downloadLinks.length > 0;

  // Set the first available video source when component opens
  useEffect(() => {
    if (isOpen && hasDownloads && downloadLinks.length > 0) {
      setSelectedVideoSource(downloadLinks[0]);
    }
  }, [isOpen, hasDownloads, downloadLinks]);

  useEffect(() => { 
    if (isOpen && movie) { 
      generateAIInsight(); 
    } 
  }, [isOpen, movie]);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const handleMouseLeave = () => {
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 1000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isOpen, isPlaying]);

  const generateAIInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const insight = await geminiService.analyzeMovie(movie.title, movie.overview || '');
      setAiInsight(insight);
    } catch (error) {
      console.error('Failed to generate AI insight:', error);
      setAiInsight("🎬 This movie looks absolutely fascinating! The plot, the cinematography, the performances - it's got everything that makes cinema magical. I'd love to dive deeper into what makes this film special!");
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
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const changeVideoSource = (url: string) => {
    setSelectedVideoSource(url);
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.load();
      setIsPlaying(false);
    }
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
          {selectedVideoSource ? (
            <source src={selectedVideoSource} type="video/mp4" />
          ) : (
            <source src="/sample-video.mp4" type="video/mp4" />
          )}
          Your browser does not support the video tag.
        </video>

        {/* Overlay */}
        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Top Controls */}
        <div className={`absolute top-0 left-0 right-0 p-4 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              <h2 className="text-white font-semibold text-lg">{movie?.title}</h2>
              <button
                onClick={() => setShowAIInsights(!showAIInsights)}
                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                title="AI Insights"
              >
                <Brain className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                title="Download Options"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Center Play Button */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          >
            <Play className="h-12 w-12" />
          </button>
        )}

        {/* Bottom Controls */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : 'translate-y-full'
        }`}>
          {/* Seek Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-white mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => skipTime(-10)}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button
                onClick={togglePlay}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              
              <button
                onClick={() => skipTime(10)}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
              >
                <SkipForward className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={toggleMute}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`p-2 rounded-lg transition-colors ${
                  showSubtitles 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        {showAIInsights && (
          <div className="absolute top-20 right-4 w-80 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Bilel's AI Analysis</h3>
              </div>
              <button
                onClick={() => setShowAIInsights(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {isLoadingInsight ? (
              <div className="flex items-center space-x-2 text-slate-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span>AI is analyzing...</span>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-200 leading-relaxed text-sm">
                  {aiInsight}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Download Options Panel */}
        {showDownloadOptions && (
          <div className="absolute top-20 right-4 w-80 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Download Options</h3>
              </div>
              <button
                onClick={() => setShowDownloadOptions(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {hasDownloads ? (
              <div className="space-y-3">
                <p className="text-slate-300 text-sm mb-3">
                  Choose a video source to watch or download:
                </p>
                {downloadLinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-white">Source {index + 1}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => changeVideoSource(link)}
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                          selectedVideoSource === link
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-600 hover:bg-slate-500 text-white'
                        }`}
                      >
                        {selectedVideoSource === link ? 'Playing' : 'Watch'}
                      </button>
                      <button
                        onClick={() => handleDownload(link)}
                        className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Download className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">No download links available</p>
              </div>
            )}
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-20 right-4 w-80 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Player Settings</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Playback Speed</label>
                <select
                  value={playbackSpeed}
                  onChange={(e) => {
                    const speed = parseFloat(e.target.value);
                    setPlaybackSpeed(speed);
                    if (videoRef.current) {
                      videoRef.current.playbackRate = speed;
                    }
                  }}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="auto">Auto</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
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