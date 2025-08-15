import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Image, 
  File, 
  Smile, 
  Mic, 
  Crown, 
  Brain, 
  Users, 
  Settings, 
  Plus,
  Filter,
  Star,
  Heart,
  Zap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../services/supabaseService';
import { geminiService } from '../services/geminiService';

interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  last_seen?: string;
  online?: boolean;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  type: 'text' | 'image' | 'file';
  reactions?: string[];
}

interface ChatRoom {
  id: string;
  user: User;
  lastMessage?: Message;
  unreadCount: number;
}

export function Messages() {
  const { user: currentUser } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [aiAssistant, setAiAssistant] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadUsers();
      loadChatRooms();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const loadUsers = async () => {
    try {
      // Get all users from the database
      const { data: usersData, error } = await supabaseService.supabase
        .from('users')
        .select('*')
        .neq('id', currentUser?.id);

      if (error) throw error;

      if (usersData) {
        setUsers(usersData.map(user => ({
          ...user,
          online: Math.random() > 0.3, // Simulate online status
          last_seen: new Date(Date.now() - Math.random() * 86400000).toISOString() // Simulate last seen
        })));
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      // Fallback to sample users if database fails
      setUsers([
        {
          id: '1',
          email: 'bilel@cineflix.ai',
          username: 'Bilel AI',
          avatar_url: undefined,
          online: true,
          last_seen: new Date().toISOString()
        },
        {
          id: '2',
          email: 'movie_lover@example.com',
          username: 'MovieLover',
          avatar_url: undefined,
          online: true,
          last_seen: new Date().toISOString()
        },
        {
          id: '3',
          email: 'anime_fan@example.com',
          username: 'AnimeFan',
          avatar_url: undefined,
          online: false,
          last_seen: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    }
  };

  const loadChatRooms = async () => {
    try {
      // Create chat rooms from users
      const rooms: ChatRoom[] = users.map(user => ({
        id: `chat_${currentUser?.id}_${user.id}`,
        user,
        lastMessage: {
          id: '1',
          content: 'Hello! Welcome to CineFlix AI community!',
          sender_id: user.id,
          receiver_id: currentUser?.id || '',
          created_at: new Date().toISOString(),
          type: 'text'
        },
        unreadCount: Math.floor(Math.random() * 3)
      }));

      setChatRooms(rooms);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      // In a real app, this would load messages from the database
      // For now, we'll simulate messages
      const sampleMessages: Message[] = [
        {
          id: '1',
          content: 'Hey! How are you doing today?',
          sender_id: selectedChat?.user.id || '',
          receiver_id: currentUser?.id || '',
          created_at: new Date(Date.now() - 300000).toISOString(),
          type: 'text'
        },
        {
          id: '2',
          content: 'I\'m doing great! Just discovered some amazing new movies on the platform.',
          sender_id: currentUser?.id || '',
          receiver_id: selectedChat?.user.id || '',
          created_at: new Date(Date.now() - 240000).toISOString(),
          type: 'text'
        },
        {
          id: '3',
          content: 'That sounds awesome! What kind of movies are you into?',
          sender_id: selectedChat?.user.id || '',
          receiver_id: currentUser?.id || '',
          created_at: new Date(Date.now() - 180000).toISOString(),
          type: 'text'
        },
        {
          id: '4',
          content: 'I love sci-fi and psychological thrillers. Have you seen Inception?',
          sender_id: currentUser?.id || '',
          receiver_id: selectedChat?.user.id || '',
          created_at: new Date(Date.now() - 120000).toISOString(),
          type: 'text'
        },
        {
          id: '5',
          content: 'Inception is a masterpiece! Christopher Nolan really knows how to mess with your mind. Have you tried the AI analysis feature yet?',
          sender_id: selectedChat?.user.id || '',
          receiver_id: currentUser?.id || '',
          created_at: new Date(Date.now() - 60000).toISOString(),
          type: 'text'
        }
      ];

      setMessages(sampleMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender_id: currentUser?.id || '',
      receiver_id: selectedChat.user.id,
      created_at: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate AI response if AI assistant is enabled
    if (aiAssistant) {
      setTimeout(async () => {
        try {
          const aiResponse = await geminiService.sendMessage(
            `As Bilel AI, respond to this message in a helpful and entertaining way: "${newMessage}". 
            Keep it short, witty, and maybe suggest a movie or show related to the conversation.`
          );
          
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: aiResponse,
            sender_id: 'ai-assistant',
            receiver_id: currentUser?.id || '',
            created_at: new Date().toISOString(),
            type: 'text'
          };

          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          console.error('AI response failed:', error);
        }
      }, 1000);
    }
  };

  const startNewChat = (user: User) => {
    const newChat: ChatRoom = {
      id: `chat_${currentUser?.id}_${user.id}`,
      user,
      lastMessage: undefined,
      unreadCount: 0
    };
    setSelectedChat(newChat);
    setShowUserList(false);
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
          <MessageCircle className="h-8 md:h-10 w-8 md:w-10 text-purple-400" />
          Messages
        </h1>
        <p className="text-lg text-slate-400">
          Connect with the CineFlix AI community
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Conversations</h2>
              <button
                onClick={() => setShowUserList(!showUserList)}
                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                title="New Chat"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* AI Assistant Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg mb-4">
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Bilel AI Assistant</p>
                  <p className="text-xs text-slate-400">Get AI-powered responses</p>
                </div>
              </div>
              <button
                onClick={() => setAiAssistant(!aiAssistant)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  aiAssistant ? 'bg-purple-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    aiAssistant ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Chat Rooms */}
          <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
            {showUserList ? (
              <div className="p-4">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Start New Chat</h3>
                <div className="space-y-2">
                  {filteredUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => startNewChat(user)}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-slate-700/50 rounded-lg transition-colors text-left"
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {user.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {user.online && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-slate-800" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.username || user.email}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {user.online ? 'Online' : `Last seen ${new Date(user.last_seen || '').toLocaleTimeString()}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {chatRooms.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full p-4 hover:bg-slate-700/50 transition-colors text-left ${
                      selectedChat?.id === chat.id ? 'bg-slate-700/50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {chat.user.username?.charAt(0).toUpperCase() || chat.user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {chat.user.online && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-slate-800" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-white truncate">
                            {chat.user.username || chat.user.email}
                          </p>
                          {chat.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                        {chat.lastMessage && (
                          <p className="text-xs text-slate-400 truncate">
                            {chat.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-700/50 bg-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {selectedChat.user.username?.charAt(0).toUpperCase() || selectedChat.user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {selectedChat.user.online && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-slate-800" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {selectedChat.user.username || selectedChat.user.email}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {selectedChat.user.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                      <Video className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-400px)]">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        message.sender_id === currentUser?.id
                          ? 'bg-purple-600 text-white'
                          : message.sender_id === 'ai-assistant'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {message.sender_id === 'ai-assistant' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Crown className="h-3 w-3" />
                          <span className="text-xs opacity-80">Bilel AI</span>
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-700/50">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                    <Image className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                    <File className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                    <Smile className="h-4 w-4" />
                  </button>
                  
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                    <Mic className="h-4 w-4" />
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-400 mb-2">Select a conversation</h3>
                <p className="text-slate-500">Choose a chat from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}