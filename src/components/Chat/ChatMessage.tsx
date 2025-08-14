import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: any;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const formatTime = (timestamp: Date) => {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isOwn 
            ? 'bg-red-600 text-white' 
            : 'bg-gray-700 text-white'
        }`}>
          {message.type === 'image' ? (
            <div>
              <img 
                src={message.image} 
                alt="Shared image" 
                className="w-full h-auto rounded-lg mb-2 max-w-full"
              />
              {message.content && (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
          ) : (
            <p className="text-sm lg:text-base">{message.content}</p>
          )}
        </div>
        <div className={`text-xs text-gray-400 mt-1 ${
          isOwn ? 'text-right' : 'text-left'
        }`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}