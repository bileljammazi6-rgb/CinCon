import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Image, 
  Brain, 
  Sparkles, 
  Settings, 
  Download,
  Upload,
  Camera,
  FileText,
  MessageSquare,
  Zap,
  Lightbulb,
  TrendingUp,
  User,
  Bot
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { supabaseService, ChatMessage as SupabaseMessage, ChatRoom } from '../services/supabaseService';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { ImageUpload } from '../components/ImageUpload';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'image' | 'voice';
  imageData?: string;
  suggestions?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [aiPersonality, setAiPersonality] = useState<'bilel' | 'assistant' | 'creative'>('bilel');
  const [temperature, setTemperature] = useState(0.7);
  const [currentRoom, setCurrentRoom] = useState<string>('ai');
  const [username, setUsername] = useState<string>('Anonymous');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeChat();
    loadChatSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      // Initialize database and create AI room
      await supabaseService.initializeDatabase();
      
      // Load existing messages from AI room
      const existingMessages = await supabaseService.getRoomMessages('ai', 50);
      const formattedMessages: Message[] = existingMessages.map(msg => ({
        id: msg.id.toString(),
        content: msg.content,
        sender: msg.sender === 'ai' ? 'ai' : 'user',
        timestamp: new Date(msg.created_at),
        type: 'text'
      }));
      
      setMessages(formattedMessages);
      
      // Subscribe to real-time messages
      const subscription = supabaseService.subscribeToMessages('ai', (newMessage) => {
        const formattedMessage: Message = {
          id: newMessage.id.toString(),
          content: newMessage.content,
          sender: newMessage.sender === 'ai' ? 'ai' : 'user',
          timestamp: new Date(newMessage.created_at),
          type: 'text'
        };
        
        setMessages(prev => [...prev, formattedMessage]);
      });
      
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatSessions = () => {
    // Load from localStorage or database
    const stats = localStorage.getItem('aiChatSessions');
    if (stats) {
      setChatSessions(JSON.parse(stats));
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    setCurrentSession(newSession);
    setMessages([]);
    setChatSessions(prev => [newSession, ...prev]);
  };

  const saveSession = (session: ChatSession) => {
    const updatedSessions = chatSessions.map(s => 
      s.id === session.id ? session : s
    );
    setChatSessions(updatedSessions);
    localStorage.setItem('aiChatSessions', JSON.stringify(updatedSessions));
  };

  const sendMessage = async (content: string, type: 'text' | 'image' | 'voice' = 'text', imageData?: string) => {
    if (!content.trim() && !imageData) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: content || 'Image uploaded',
      sender: 'user',
      timestamp: new Date(),
      type,
      imageData
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Save user message to Supabase
      await supabaseService.sendMessage(currentRoom, username, content || 'Image uploaded');

      let aiResponse: string;
      
      if (type === 'image' && imageData) {
        aiResponse = await geminiService.sendMessage('Analyze this image and provide insights.', imageData);
      } else {
        aiResponse = await geminiService.sendMessage(content);
      }

      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save AI message to Supabase
      await supabaseService.sendMessage(currentRoom, 'ai', aiResponse);

      // Generate smart suggestions
      const suggestions = await geminiService.getSmartSuggestions(
        content,
        messages.map(m => m.content).slice(-5)
      );
      
      aiMessage.suggestions = suggestions;
      setSmartSuggestions(suggestions);

      // Update session
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          messages: [...messages, userMessage, aiMessage],
          lastUpdated: new Date(),
          title: messages.length === 0 ? content.slice(0, 30) + '...' : currentSession.title
        };
        saveSession(updatedSession);
        setCurrentSession(updatedSession);
      }

    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (imageData: string) => {
    sendMessage('', 'image', imageData);
    setShowImageUpload(false);
  };

  const handleVoiceRecording = (audioBlob: Blob) => {
    // Convert audio to text (this would use a speech-to-text service)
    // For now, we'll simulate it
    const simulatedText = "Voice message recorded - speech-to-text would be implemented here";
    sendMessage(simulatedText, 'voice');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
  };

  const clearChat = () => {
    setMessages([]);
    if (currentSession) {
      const updatedSession = { ...currentSession, messages: [] };
      saveSession(updatedSession);
      setCurrentSession(updatedSession);
    }
  };

  const exportChat = () => {
    const chatData = {
      session: currentSession,
      messages,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-${currentSession?.title || 'session'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderMessage = (message: Message) => (
    <div
      key={message.id}
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
          message.sender === 'user' 
            ? 'bg-blue-600 text-white' 
            : 'bg-purple-600 text-white'
        }`}>
          {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        <div className={`rounded-lg px-4 py-2 ${
          message.sender === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-100'
        }`}>
          {message.type === 'image' && message.imageData && (
            <div className="mb-2">
              <img 
                src={message.imageData} 
                alt="Uploaded" 
                className="max-w-xs rounded-lg"
              />
            </div>
          )}
          
          {message.type === 'voice' && (
            <div className="mb-2 flex items-center text-sm">
              <Mic className="mr-2" size={16} />
              Voice Message
            </div>
          )}
          
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-600">
              <div className="text-sm text-gray-300 mb-2">💡 Smart Suggestions:</div>
              <div className="flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-400 mt-2">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold mb-4">AI Chat Sessions</h2>
          
          {/* Username Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
            />
          </div>
          
          <button
            onClick={createNewSession}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
          >
            <MessageSquare className="inline mr-2" size={16} />
            New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chatSessions.map(session => (
            <div
              key={session.id}
              onClick={() => {
                setCurrentSession(session);
                setMessages(session.messages);
              }}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentSession?.id === session.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              }`}
            >
              <div className="font-medium truncate">{session.title}</div>
              <div className="text-sm text-gray-400">
                {session.lastUpdated.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={clearChat}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🤖 AI Chat Hub
              </h1>
              <p className="text-gray-400">Powered by Google Gemini AI + Supabase</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={exportChat}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <Download className="mr-2" size={16} />
                Export
              </button>
              
              <button
                onClick={() => setShowImageUpload(true)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <Image className="mr-2" size={16} />
                Image
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold mb-2">Welcome to AI Chat!</h2>
              <p className="text-gray-400 mb-6">
                I'm your AI assistant powered by Google Gemini. Ask me anything, upload images for analysis, or start a voice conversation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <Brain className="mx-auto mb-2 text-purple-400" size={24} />
                  <h3 className="font-bold">Smart AI</h3>
                  <p className="text-sm text-gray-400">Advanced conversational AI</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <Camera className="mx-auto mb-2 text-blue-400" size={24} />
                  <h3 className="font-bold">Image Analysis</h3>
                  <p className="text-sm text-gray-400">AI-powered image understanding</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <Mic className="mx-auto mb-2 text-green-400" size={24} />
                  <h3 className="font-bold">Voice Chat</h3>
                  <p className="text-sm text-gray-400">Natural voice interactions</p>
                </div>
              </div>
            </div>
          ) : (
            messages.map(renderMessage)
          )}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center mr-3">
                  <Bot size={16} />
                </div>
                <div className="bg-gray-700 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... (Shift+Enter for new line)"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white resize-none focus:outline-none focus:border-purple-500"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              
              {showSuggestions && smartSuggestions.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-gray-700 rounded-lg p-3 border border-gray-600">
                  <div className="text-sm text-gray-300 mb-2">💡 Smart Suggestions:</div>
                  <div className="flex flex-wrap gap-2">
                    {smartSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <VoiceRecorder
                onRecordingComplete={handleVoiceRecording}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
              />
              
              <button
                onClick={() => setShowImageUpload(true)}
                className="bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg transition-colors"
                title="Upload Image"
              >
                <Image size={20} />
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white p-3 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                title="Send Message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Upload Image for Analysis</h3>
            <ImageUpload onImageUpload={handleImageUpload} />
            <button
              onClick={() => setShowImageUpload(false)}
              className="w-full mt-4 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;
