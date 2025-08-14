import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChatMessage } from './ChatMessage';
import { ChatSidebar } from './ChatSidebar';
import { ImageUpload } from '../ImageUpload';
import { Send, Image, Users, Video, MoreVertical } from 'lucide-react';

interface ChatInterfaceProps {
  selectedUser?: any;
  onUserSelect: (user: any) => void;
}

export function ChatInterface({ selectedUser, onUserSelect }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() && !uploadedImage) return;

    const newMessage = {
      id: Date.now().toString(),
      content: inputText,
      image: uploadedImage,
      sender: user?.id,
      receiver: selectedUser?.id,
      timestamp: new Date(),
      type: uploadedImage ? 'image' : 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setUploadedImage(null);
  };

  const handleImageUpload = (imageData: string) => {
    setUploadedImage(imageData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Select a user to start chatting</h3>
          <p className="text-gray-400">Choose someone from your contacts to begin a conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden p-2 text-white hover:bg-gray-700 rounded-lg"
          >
            <Users className="h-5 w-5" />
          </button>
          
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {selectedUser.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div>
            <h3 className="text-white font-semibold">{selectedUser.username}</h3>
            <p className="text-sm text-gray-400">
              {isTyping ? 'typing...' : 'online'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-white hover:bg-gray-700 rounded-lg">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 text-white hover:bg-gray-700 rounded-lg">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isOwn={message.sender === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-gray-800">
        {uploadedImage && (
          <div className="mb-3 flex items-center gap-3">
            <img 
              src={uploadedImage} 
              alt="Uploaded" 
              className="w-16 h-16 object-cover rounded-lg"
            />
            <button
              onClick={() => setUploadedImage(null)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Remove
            </button>
          </div>
        )}
        
        <div className="flex items-end gap-3">
          <ImageUpload onImageUpload={handleImageUpload} />
          
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-600"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() && !uploadedImage}
            className="p-3 bg-red-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowSidebar(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-gray-900">
            <ChatSidebar 
              selectedUser={selectedUser}
              onUserSelect={onUserSelect}
              onClose={() => setShowSidebar(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}