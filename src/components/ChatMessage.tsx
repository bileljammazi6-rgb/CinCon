import React from 'react';
import { User, Bot, Volume2, Copy } from 'lucide-react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message;
}

function linkify(text: string): React.ReactNode {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline break-all">
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
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

  const copy = async () => {
    try { await navigator.clipboard.writeText(message.content); } catch {}
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
          <div className="text-sm leading-relaxed whitespace-pre-wrap flex-1 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={copy}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              title="Copy message"
            >
              <Copy className="w-4 h-4" />
            </button>
            {message.sender === 'ai' && (
              <button
                onClick={() => handleTextToSpeech(message.content)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                title="Listen to message"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>
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