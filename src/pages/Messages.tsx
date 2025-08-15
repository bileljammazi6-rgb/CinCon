import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Image, 
  File, 
  Smile, 
  Mic, 
  Paperclip,
  User,
  MessageCircle,
  Crown,
  Sparkles,
  Brain,
  Gamepad2,
  Film,
  Tv,
  Heart,
  Star,
  Clock,
  Eye,
  Users,
  Settings,
  LogOut,
  Plus,
  Filter,
  Grid,
  List,
  RefreshCw,
  Info,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../services/supabaseService';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  room_id: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group';
  last_message?: string;
  last_message_time?: Date;
  participants: string[];
  unread_count: number;
}

export function Messages() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadRooms();
      loadAvailableUsers();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      subscribeToMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  const loadRooms = async () => {
    try {
      setIsLoading(true);
      const userRooms = await supabaseService.getUserRooms(user?.id || '');
      setRooms(userRooms || []);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const users = await supabaseService.getAllUsers();
      setAvailableUsers(users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const roomMessages = await supabaseService.getRoomMessages(roomId);
      setMessages(roomMessages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const subscribeToMessages = (roomId: string) => {
    return supabaseService.subscribeToRoomMessages(roomId, (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return;

    try {
      const message = await supabaseService.sendMessage({
        content: newMessage,
        room_id: selectedRoom.id,
        sender_id: user.id,
        type: 'text'
      });

      if (message) {
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim() || selectedParticipants.length === 0 || !user) return;

    try {
      const room = await supabaseService.createRoom({
        name: newRoomName,
        type: selectedParticipants.length === 1 ? 'direct' : 'group',
        participants: [...selectedParticipants, user.id]
      });

      if (room) {
        setRooms(prev => [room, ...prev]);
        setShowCreateRoom(false);
        setNewRoomName('');
        setSelectedParticipants([]);
        setSelectedRoom(room);
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-300 text-lg">Loading messages...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                <MessageCircle className="h-10 w-10 text-purple-400" />
                <span>Messages</span>
              </h1>
              <p className="text-slate-300 text-lg">Connect with your community</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateRoom(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Chat</span>
              </button>
              
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors"
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Chat Rooms */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Rooms List */}
              <div className="space-y-3">
                {filteredRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                      selectedRoom?.id === room.id
                        ? 'bg-purple-600/20 border border-purple-500/50'
                        : 'bg-slate-700/30 hover:bg-slate-600/30 border border-transparent hover:border-slate-600/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {room.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white truncate">{room.name}</h3>
                          {room.unread_count > 0 && (
                            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                              {room.unread_count}
                            </span>
                          )}
                        </div>
                        {room.last_message && (
                          <p className="text-slate-400 text-sm truncate">{room.last_message}</p>
                        )}
                        {room.last_message_time && (
                          <p className="text-slate-500 text-xs">
                            {new Date(room.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {filteredRooms.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No conversations yet</p>
                  <p className="text-slate-500 text-sm">Start a new chat to connect with others</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            {selectedRoom ? (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedRoom.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{selectedRoom.name}</h3>
                        <p className="text-slate-400 text-sm">
                          {selectedRoom.type === 'direct' ? 'Direct Message' : `${selectedRoom.participants.length} participants`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors">
                        <Video className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${
                        message.sender_id === user?.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700/50 text-slate-200'
                      } rounded-2xl px-4 py-2`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium opacity-80">
                            {message.sender_name}
                          </span>
                          <span className="text-xs opacity-60">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                      <Image className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                      <Smile className="h-5 w-5" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="w-full pl-4 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <button className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                      <Mic className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                  <p className="text-slate-400">Choose a chat from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Room Modal */}
        {showCreateRoom && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Create New Chat</h3>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Chat Name</label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Enter chat name..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Participants</label>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {availableUsers
                      .filter(u => u.id !== user?.id)
                      .map((user) => (
                        <label key={user.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedParticipants.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedParticipants(prev => [...prev, user.id]);
                              } else {
                                setSelectedParticipants(prev => prev.filter(id => id !== user.id));
                              }
                            }}
                            className="rounded border-slate-600 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-slate-200 text-sm">{user.username || user.email}</span>
                        </label>
                      ))}
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateRoom(false)}
                    className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createRoom}
                    disabled={!newRoomName.trim() || selectedParticipants.length === 0}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Create Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}