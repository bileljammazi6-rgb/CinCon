import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Smile, Paperclip } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { ChatMessage } from './ChatMessage';

interface ChatInterfaceProps {
  selectedUser: any;
  onUserSelect: (user: any) => void;
}

export function ChatInterface({ selectedUser, onUserSelect }: ChatInterfaceProps) {
  const { messages, sendMessage } = useChat();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter messages for this conversation
  const conversationMessages = messages.filter(
    msg => 
      (msg.sender === user?.email && msg.receiver === selectedUser?.username) ||
      (msg.sender === selectedUser?.username && msg.receiver === user?.email)
  );

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputText.trim() && !uploadedImage) return;

    sendMessage(inputText, uploadedImage || undefined);
    setInputText('');
    setUploadedImage(null);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  if (!selectedUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a user to start chatting</h3>
          <p className="text-gray-600">Choose someone from the sidebar to begin your conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {selectedUser.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
              selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-500'
            }`}></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">{selectedUser.username}</h3>
              {selectedUser.isAdmin && (
                <span className="px-2 py-1 bg-yellow-600 text-black text-xs rounded-full font-medium">
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400">
              {selectedUser.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {conversationMessages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👋</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Start a conversation</h3>
            <p className="text-gray-600">Send a message to begin chatting with {selectedUser.username}</p>
          </div>
        ) : (
          conversationMessages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwn={message.sender === user?.email}
            />
          ))
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">{selectedUser.username} is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {uploadedImage && (
        <div className="px-6 py-3 border-t border-gray-800">
          <div className="relative inline-block">
            <img
              src={uploadedImage}
              alt="Upload preview"
              className="w-20 h-20 object-cover rounded-lg"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 border-t border-gray-800">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 bg-gray-800 text-white placeholder-gray-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={triggerImageUpload}
              className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Attach image"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() && !uploadedImage}
              className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}