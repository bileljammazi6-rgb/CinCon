import React from 'react';
import { User, Bot, Volume2 } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const handleTextToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.sender === 'ai' && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[70%] rounded-2xl p-4 ${
        message.sender === 'user' 
          ? 'message-user rounded-br-md' 
          : 'message-ai rounded-bl-md'
      }`}>
        {message.image && (
          <img 
            src={message.image} 
            alt="Shared image" 
            className="w-full max-w-sm rounded-lg mb-3 border border-white/20"
          />
        )}
        
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">
            {message.content}
          </p>
          
          {message.sender === 'ai' && (
            <button
              onClick={() => handleTextToSpeech(message.content)}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-1 rounded-full hover:bg-white/10"
              title="Listen to message"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="text-xs text-gray-400 mt-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {message.sender === 'user' && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}