import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Users, 
  MessageCircle, 
  Crown,
  Settings,
  Share2,
  Heart,
  Plus
} from 'lucide-react';

interface WatchTogetherProps {
  currentUser?: {
    id: string;
    name: string;
    isAdmin: boolean;
  };
  onClose?: () => void;
}

const NetflixWatchTogether: React.FC<WatchTogetherProps> = ({
  currentUser = { id: '1', name: 'You', isAdmin: false },
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    user: string;
    message: string;
    timestamp: Date;
    isAdmin?: boolean;
  }>>([]);
  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [movieSuggestions, setMovieSuggestions] = useState<Array<{
    id: string;
    title: string;
    user: string;
    status: 'pending' | 'approved' | 'rejected';
  }>>([]);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [participants, setParticipants] = useState<Array<{
    id: string;
    name: string;
    isAdmin: boolean;
    isOnline: boolean;
  }>>([
    { id: '1', name: 'You', isAdmin: currentUser.isAdmin, isOnline: true },
    { id: '2', name: 'bilel8x', isAdmin: true, isOnline: true },
    { id: '3', name: 'Rim', isAdmin: false, isOnline: true },
    { id: '4', name: 'Alex', isAdmin: false, isOnline: false }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mock movie data
  const availableMovies = [
    'The Chestnut Man',
    'Smurfs 2025',
    'Weapons 2025',
    'The Pickup',
    'Jurassic World 2025',
    'Honest Thief',
    'Luck',
    'How to Train Your Dragon'
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

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
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const sendChatMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        user: currentUser.name,
        message: chatMessage,
        timestamp: new Date(),
        isAdmin: currentUser.isAdmin
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage('');
    }
  };

  const suggestMovie = () => {
    if (selectedMovie) {
      const suggestion = {
        id: Date.now().toString(),
        title: selectedMovie,
        user: currentUser.name,
        status: 'pending' as const
      };
      setMovieSuggestions(prev => [...prev, suggestion]);
      setSelectedMovie('');
    }
  };

  const handleMovieSuggestion = (suggestionId: string, status: 'approved' | 'rejected') => {
    if (!currentUser.isAdmin) return;
    
    setMovieSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, status } : s)
    );
  };

  const startStream = () => {
    if (!currentUser.isAdmin) return;
    setIsStreamActive(true);
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: 'System',
      message: '🎬 Stream started by admin!',
      timestamp: new Date()
    }]);
  };

  const stopStream = () => {
    if (!currentUser.isAdmin) return;
    setIsStreamActive(false);
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: 'System',
      message: '⏹️ Stream stopped by admin',
      timestamp: new Date()
    }]);
  };

  return (
    <div className="h-screen bg-black flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Video Player */}
        <div className="relative bg-gray-900 flex-1">
          {!isStreamActive ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Play className="w-16 h-16 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Watch Together</h2>
                <p className="text-gray-400 mb-6">Start a synchronized viewing session</p>
                
                {currentUser.isAdmin ? (
                  <div className="space-y-4">
                    <select
                      value={selectedMovie}
                      onChange={(e) => setSelectedMovie(e.target.value)}
                      className="w-full max-w-md px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="">Select a movie to stream</option>
                      {availableMovies.map(movie => (
                        <option key={movie} value={movie}>{movie}</option>
                      ))}
                    </select>
                    
                    <button
                      onClick={startStream}
                      disabled={!selectedMovie}
                      className="netflix-button disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      Start Stream
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">Waiting for admin to start stream...</p>
                )}
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                controls={false}
              >
                <source src="https://pixeldrain.com/api/file/bwLgnrZg" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    onClick={handlePlayPause}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white" />
                    )}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="p-2 hover:bg-white/20 rounded transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 text-white">
                    <span>{formatTime(currentTime)}</span>
                    <span>/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  
                  <button className="p-2 hover:bg-white/20 rounded transition-colors ml-auto">
                    <Maximize className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                {/* Progress Bar */}
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </>
          )}
        </div>
        
        {/* Movie Suggestions */}
        {currentUser.isAdmin && (
          <div className="p-4 bg-gray-900 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">Movie Suggestions</h3>
            <div className="space-y-2">
              {movieSuggestions.map(suggestion => (
                <div key={suggestion.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{suggestion.title}</p>
                    <p className="text-gray-400 text-sm">Suggested by {suggestion.user}</p>
                  </div>
                  <div className="flex space-x-2">
                    {suggestion.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleMovieSuggestion(suggestion.id, 'approved')}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleMovieSuggestion(suggestion.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {suggestion.status === 'approved' && (
                      <span className="px-3 py-1 bg-green-600 text-white text-sm rounded">Approved</span>
                    )}
                    {suggestion.status === 'rejected' && (
                      <span className="px-3 py-1 bg-red-600 text-white text-sm rounded">Rejected</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Watch Together</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-gray-300" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>
          
          {/* Participants */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Participants ({participants.length})</h3>
            <div className="space-y-2">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    {participant.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-gray-900 rounded-full"></div>
                    )}
                    {participant.isAdmin && (
                      <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <span className="text-white text-sm">{participant.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat */}
        {showChat && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(message => (
                <div key={message.id} className="flex flex-col">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-sm font-medium ${
                      message.isAdmin ? 'text-yellow-400' : 'text-gray-300'
                    }`}>
                      {message.user}
                    </span>
                    {message.isAdmin && (
                      <Crown className="w-3 h-3 text-yellow-500 fill-current" />
                    )}
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-white text-sm">{message.message}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatMessage.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetflixWatchTogether;