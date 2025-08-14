import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMovies } from '../../contexts/MovieContext';
import { Play, Pause, Volume2, VolumeX, Users, Crown, MessageCircle, Film } from 'lucide-react';
import { MovieData } from '../../types';

const TMDB_IMG = (import.meta.env.VITE_TMDB_IMAGE_BASE_URL as string) || 'https://image.tmdb.org/t/p';

interface WatchTogetherProps {
  onClose: () => void;
}

export function WatchTogether({ onClose }: WatchTogetherProps) {
  const { user } = useAuth();
  const { movies } = useMovies();
  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [viewers, setViewers] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showMovieSelector, setShowMovieSelector] = useState(false);
  const [movieSuggestions, setMovieSuggestions] = useState<any[]>([]);
  const [isAdmin] = useState(user?.email === 'bilel8x@example.com'); // Mock admin check

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Mock viewers
    setViewers([
      { id: '1', username: 'bilel8x', isAdmin: true, isOnline: true },
      { id: '2', username: 'john_doe', isAdmin: false, isOnline: true },
      { id: '3', username: 'jane_smith', isAdmin: false, isOnline: true },
    ]);

    // Mock movie suggestions
    setMovieSuggestions([
      { id: '1', title: 'Inception', username: 'john_doe', status: 'pending' },
      { id: '2', title: 'The Matrix', username: 'jane_smith', status: 'accepted' },
    ]);
  }, []);

  const handlePlayPause = () => {
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
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMovieSelect = (movie: MovieData) => {
    if (isAdmin) {
      setSelectedMovie(movie);
      setShowMovieSelector(false);
    }
  };

  const handleMovieSuggestion = (title: string) => {
    if (title.trim()) {
      const newSuggestion = {
        id: Date.now().toString(),
        title,
        username: user?.username || 'Anonymous',
        status: 'pending'
      };
      setMovieSuggestions(prev => [...prev, newSuggestion]);
    }
  };

  const handleSuggestionResponse = (suggestionId: string, accepted: boolean) => {
    if (isAdmin) {
      setMovieSuggestions(prev => 
        prev.map(s => s.id === suggestionId ? { ...s, status: accepted ? 'accepted' : 'rejected' } : s)
      );
    }
  };

  const sendChatMessage = () => {
    if (chatInput.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        content: chatInput,
        username: user?.username || 'Anonymous',
        timestamp: new Date(),
        isAdmin: isAdmin
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-gray-800 rounded-lg"
          >
            <Film className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-white">Watch Together</h1>
          {isAdmin && (
            <span className="px-2 py-1 bg-yellow-500 text-gray-900 text-xs rounded-full flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Admin
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            <span>{viewers.length} watching</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Video Player */}
        <div className="flex-1 flex flex-col">
          {/* Video Container */}
          <div className="flex-1 relative bg-black">
            {selectedMovie ? (
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                src={`https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <Film className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold mb-2">No movie selected</h3>
                  <p className="text-gray-400 mb-4">
                    {isAdmin ? 'Select a movie to start streaming' : 'Waiting for admin to select a movie'}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => setShowMovieSelector(true)}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Select Movie
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Video Controls Overlay */}
            {selectedMovie && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                {/* Progress Bar */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-white text-sm mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className="p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="p-2 text-white hover:bg-gray-800 rounded-lg"
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
                      className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div className="flex-1" />
                  
                  <div className="text-white text-sm">
                    <h4 className="font-semibold">{selectedMovie.title}</h4>
                    <p className="text-gray-300">{selectedMovie.release_date?.split('-')[0]}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Movie Suggestions */}
          <div className="bg-gray-900 p-4 border-t border-gray-800">
            <h3 className="text-white font-semibold mb-3">Movie Suggestions</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {movieSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`flex-shrink-0 p-3 rounded-lg border ${
                    suggestion.status === 'accepted' 
                      ? 'border-green-500 bg-green-500/10' 
                      : suggestion.status === 'rejected'
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-gray-600 bg-gray-800'
                  }`}
                >
                  <p className="text-white font-medium text-sm">{suggestion.title}</p>
                  <p className="text-gray-400 text-xs">by {suggestion.username}</p>
                  {suggestion.status === 'pending' && isAdmin && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleSuggestionResponse(suggestion.id, true)}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleSuggestionResponse(suggestion.id, false)}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {suggestion.status !== 'pending' && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      suggestion.status === 'accepted' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {suggestion.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Add Suggestion */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Suggest a movie..."
                className="flex-1 px-3 py-2 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleMovieSuggestion(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Suggest a movie..."]') as HTMLInputElement;
                  if (input) {
                    handleMovieSuggestion(input.value);
                    input.value = '';
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Suggest
              </button>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Live Chat
            </h3>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">
                    {msg.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">{msg.username}</span>
                    {msg.isAdmin && (
                      <span className="text-xs bg-yellow-500 text-gray-900 px-1 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                    <span className="text-gray-400 text-xs">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendChatMessage();
                  }
                }}
              />
              <button
                onClick={sendChatMessage}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Selector Modal */}
      {showMovieSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white">Select Movie to Stream</h2>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {movies.slice(0, 20).map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => handleMovieSelect(movie)}
                    className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    <img 
                      src={`${TMDB_IMG}/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-auto"
                    />
                    <div className="p-3">
                      <h3 className="text-white font-medium text-sm truncate">{movie.title}</h3>
                      <p className="text-gray-400 text-xs">{movie.release_date?.split('-')[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-800">
              <button
                onClick={() => setShowMovieSelector(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}