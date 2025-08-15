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
  Zap,
  List,
  Grid,
  Calendar,
  Users,
  BookOpen,
  Film,
  Tv,
  ArrowRight,
  CheckCircle,
  Lock,
  Unlock,
  EyeOff,
  EyeOn
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { MovieData, SeriesEpisode } from '../data/movieLinks';

interface SeriesPlayerProps {
  series: MovieData;
  isOpen: boolean;
  onClose: () => void;
}

export function SeriesPlayer({ series, isOpen, onClose }: SeriesPlayerProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<SeriesEpisode | null>(null);
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
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [showSeasonSelector, setShowSeasonSelector] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Set first episode as default when component opens
  useEffect(() => {
    if (isOpen && series.episodes && series.episodes.length > 0) {
      setSelectedEpisode(series.episodes[0]);
    }
  }, [isOpen, series]);

  useEffect(() => { 
    if (isOpen && series) { 
      generateAIInsight(); 
    } 
  }, [isOpen, series]);

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
      const insight = await geminiService.analyzeMovie(series.title, series.overview || '');
      setAiInsight(insight);
    } catch (error) {
      console.error('Failed to generate AI insight:', error);
      setAiInsight("🎬 This series looks absolutely fascinating! The plot, the characters, the storytelling - it's got everything that makes television magical. I'd love to dive deeper into what makes this series special!");
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

  const changeEpisode = (episode: SeriesEpisode) => {
    setSelectedEpisode(episode);
    setIsPlaying(false);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.src = episode.links[0];
      videoRef.current.load();
    }
    setShowEpisodeSelector(false);
  };

  const nextEpisode = () => {
    if (!series.episodes || !selectedEpisode) return;
    const currentIndex = series.episodes.findIndex(ep => ep.episode === selectedEpisode.episode);
    if (currentIndex < series.episodes.length - 1) {
      changeEpisode(series.episodes[currentIndex + 1]);
    }
  };

  const previousEpisode = () => {
    if (!series.episodes || !selectedEpisode) return;
    const currentIndex = series.episodes.findIndex(ep => ep.episode === selectedEpisode.episode);
    if (currentIndex > 0) {
      changeEpisode(series.episodes[currentIndex - 1]);
    }
  };

  const getSeasonEpisodes = (season: number) => {
    return series.episodes?.filter(ep => ep.season === season) || [];
  };

  const getSeasons = () => {
    if (!series.episodes) return [];
    const seasons = new Set(series.episodes.map(ep => ep.season || 1));
    return Array.from(seasons).sort((a, b) => a - b);
  };

  if (!isOpen || !selectedEpisode) return null;

  const seasons = getSeasons();
  const currentSeasonEpisodes = getSeasonEpisodes(selectedSeason);

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
          onEnded={() => {
            setIsPlaying(false);
            // Auto-play next episode
            nextEpisode();
          }}
        >
          <source src={selectedEpisode.links[0]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Top Controls */}
        <div className={`absolute top-0 left-0 right-0 p-6 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-1">{series.title}</h2>
                <div className="flex items-center justify-center space-x-3">
                  <span className="bg-purple-600 text-white text-sm px-3 py-1 rounded-full font-medium flex items-center space-x-2">
                    <Tv className="h-4 w-4" />
                    <span>S{selectedEpisode.season || 1}E{selectedEpisode.episode}</span>
                  </span>
                  <span className="text-white text-sm bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                    {selectedEpisode.title}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSeasonSelector(!showSeasonSelector)}
                className="p-3 bg-blue-600/80 hover:bg-blue-700/80 text-white rounded-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm flex items-center space-x-2"
                title="Season Selector"
              >
                <BookOpen className="h-5 w-5" />
                <span className="hidden sm:inline">Season {selectedSeason}</span>
              </button>
              
              <button
                onClick={() => setShowEpisodeSelector(!showEpisodeSelector)}
                className="p-3 bg-green-600/80 hover:bg-green-700/80 text-white rounded-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm flex items-center space-x-2"
                title="Episode List"
              >
                <List className="h-5 w-5" />
                <span className="hidden sm:inline">Episodes</span>
              </button>
              
              <button
                onClick={() => setShowAIInsights(!showAIInsights)}
                className="p-3 bg-purple-600/80 hover:bg-purple-700/80 text-white rounded-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm flex items-center space-x-2"
                title="AI Insights"
              >
                <Crown className="h-5 w-5" />
                <span className="hidden sm:inline">AI Analysis</span>
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 bg-slate-600/80 hover:bg-slate-700/80 text-white rounded-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm"
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
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm"
          >
            <Play className="h-16 w-16" />
          </button>
        )}

        {/* Episode Navigation */}
        <div className="absolute top-1/2 left-6 transform -translate-y-1/2">
          <button
            onClick={previousEpisode}
            disabled={!series.episodes || selectedEpisode.episode <= 1}
            className="p-4 bg-black/50 hover:bg-black/70 disabled:bg-black/20 disabled:text-gray-500 text-white rounded-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm disabled:hover:scale-100"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        </div>

        <div className="absolute top-1/2 right-6 transform -translate-y-1/2">
          <button
            onClick={nextEpisode}
            disabled={!series.episodes || selectedEpisode.episode >= (series.episodes?.length || 0)}
            className="p-4 bg-black/50 hover:bg-black/70 disabled:bg-black/20 disabled:text-gray-500 text-white rounded-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm disabled:hover:scale-100"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>

        {/* Bottom Controls */}
        <div className={`absolute bottom-0 left-0 right-0 p-6 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : 'translate-y-full'
        }`}>
          {/* Seek Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-3 bg-slate-600/50 rounded-lg appearance-none cursor-pointer slider-thumb bg-gradient-to-r from-purple-500 to-pink-500"
              />
              <div className="flex justify-between text-sm text-white mt-3">
                <span className="bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">{formatTime(currentTime)}</span>
                <span className="bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => skipTime(-10)}
                className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm"
              >
                <SkipBack className="h-6 w-6" />
              </button>
              
              <button
                onClick={togglePlay}
                className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all duration-200 hover:scale-110 shadow-lg"
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </button>
              
              <button
                onClick={() => skipTime(10)}
                className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm"
              >
                <SkipForward className="h-6 w-6" />
              </button>

              <div className="flex items-center space-x-3 ml-6">
                <button
                  onClick={toggleMute}
                  className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm"
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
                  className="w-24 h-2 bg-slate-600/50 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm ${
                  showSubtitles 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm"
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Season Selector Panel */}
        {showSeasonSelector && (
          <div className="absolute top-24 right-6 w-80 bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Select Season</h3>
              </div>
              <button
                onClick={() => setShowSeasonSelector(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {seasons.map((season) => (
                <button
                  key={season}
                  onClick={() => {
                    setSelectedSeason(season);
                    setShowSeasonSelector(false);
                  }}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                    selectedSeason === season
                      ? 'bg-blue-600/20 border border-blue-500/50 text-blue-100'
                      : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 border border-transparent hover:border-slate-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">Season {season}</p>
                      <p className="text-sm opacity-80">
                        {getSeasonEpisodes(season).length} Episodes
                      </p>
                    </div>
                    {selectedSeason === season && (
                      <CheckCircle className="h-6 w-6 text-blue-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Episode Selector Panel */}
        {showEpisodeSelector && (
          <div className="absolute top-24 right-6 w-96 bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <List className="h-6 w-6 text-green-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Season {selectedSeason}</h3>
                  <p className="text-slate-400 text-sm">{currentSeasonEpisodes.length} Episodes</p>
                </div>
              </div>
              <button
                onClick={() => setShowEpisodeSelector(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {currentSeasonEpisodes.map((episode) => (
                <button
                  key={episode.episode}
                  onClick={() => changeEpisode(episode)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                    selectedEpisode.episode === episode.episode
                      ? 'bg-green-600/20 border border-green-500/50 text-green-100'
                      : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 border border-transparent hover:border-slate-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="bg-slate-600 text-white text-sm px-2 py-1 rounded-full font-medium">
                          E{episode.episode}
                        </span>
                        <span className="text-sm text-slate-400">
                          {episode.runtime || '45'} min
                        </span>
                      </div>
                      <p className="font-semibold text-white mb-1">{episode.title}</p>
                      {episode.overview && (
                        <p className="text-sm text-slate-300 line-clamp-2">{episode.overview}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-xs bg-slate-600 px-2 py-1 rounded-full text-slate-300">
                        {episode.links.length} source{episode.links.length > 1 ? 's' : ''}
                      </span>
                      {selectedEpisode.episode === episode.episode && (
                        <Play className="h-5 w-5 text-green-400" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights Panel */}
        {showAIInsights && (
          <div className="absolute top-24 right-6 w-96 bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Crown className="h-6 w-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">Bilel's Analysis</h3>
              </div>
              <button
                onClick={() => setShowAIInsights(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {isLoadingInsight ? (
              <div className="flex items-center space-x-3 text-slate-300">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span>AI is analyzing...</span>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-sm">
                  {aiInsight}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-24 right-6 w-80 bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Settings className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Player Settings</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Playback Speed</label>
                <select
                  value={playbackSpeed}
                  onChange={(e) => {
                    const speed = parseFloat(e.target.value);
                    setPlaybackSpeed(speed);
                    if (videoRef.current) {
                      videoRef.current.playbackRate = speed;
                    }
                  }}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-slate-300 mb-3">Quality</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    showSubtitles ? 'bg-purple-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
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