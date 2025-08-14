import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Mic, MoreVertical, Phone, Video, Search, UserPlus, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isImage?: boolean;
  imageUrl?: string;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  isAdmin?: boolean;
}

interface NetflixChatProps {
  currentUser?: User;
  onClose?: () => void;
}

const NetflixChat: React.FC<NetflixChatProps> = ({
  currentUser = { id: '1', name: 'You', isOnline: true },
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to Netflix Chat! 🎬',
      sender: 'system',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock users
  const users: User[] = [
    { id: '1', name: 'You', isOnline: true, isAdmin: true },
    { id: '2', name: 'bilel8x', isOnline: true, isAdmin: true },
    { id: '3', name: 'Rim', isOnline: true },
    { id: '4', name: 'Alex', isOnline: false },
    { id: '5', name: 'Sarah', isOnline: true },
    { id: '6', name: 'Mike', isOnline: false }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: currentUser.name,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(false);

    // Simulate typing indicator
    if (selectedUser) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          text: `Thanks for your message! I'll get back to you soon.`,
          sender: selectedUser.name,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, reply]);
      }, 2000);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newMessage: Message = {
          id: Date.now().toString(),
          text: 'Image shared',
          sender: currentUser.name,
          timestamp: new Date(),
          isImage: true,
          imageUrl
        };
        setMessages(prev => [...prev, newMessage]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Messages</h2>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <UserPlus className="w-5 h-5 text-gray-300" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`p-4 cursor-pointer transition-colors ${
                selectedUser?.id === user.id ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                  )}
                  {user.isAdmin && (
                    <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-black font-bold">A</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-white">{user.name}</h3>
                    {user.isAdmin && (
                      <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded">ADMIN</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    {user.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-800">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-400">
                      {selectedUser.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Phone className="w-5 h-5 text-gray-300" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Video className="w-5 h-5 text-gray-300" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === currentUser.name ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${
                    message.sender === currentUser.name ? 'order-2' : 'order-1'
                  }`}>
                    {message.sender !== currentUser.name && (
                      <p className="text-sm text-gray-400 mb-1">{message.sender}</p>
                    )}
                    <div className={`rounded-lg p-3 ${
                      message.sender === currentUser.name
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}>
                      {message.isImage && message.imageUrl ? (
                        <img
                          src={message.imageUrl}
                          alt="Shared image"
                          className="max-w-full rounded-lg"
                        />
                      ) : (
                        <p>{message.text}</p>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      message.sender === currentUser.name ? 'text-right text-gray-400' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Image className="w-5 h-5 text-gray-300" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Mic className="w-5 h-5 text-gray-300" />
                </button>
                <div className="flex-1">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
                    rows={1}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="p-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </>
        ) : (
          // No user selected
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Select a conversation</h3>
              <p className="text-gray-400">Choose a user from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetflixChat;