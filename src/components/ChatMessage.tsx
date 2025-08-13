import React from 'react';
import { User, Bot, Volume2, Copy, Shield } from 'lucide-react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: Message;
}

function computeTrustScore(text: string): { score: number; color: string; label: string } {
  const links = (text.match(/https?:\/\//g) || []).length;
  const hasEvidence = /sources\s*\/\s*evidence|sources:|evidence:/i.test(text);
  let score = 20 + links * 15 + (hasEvidence ? 20 : 0);
  if (score > 100) score = 100;
  const color = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
  const label = score >= 75 ? 'High' : score >= 50 ? 'Medium' : 'Low';
  return { score, color, label };
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

  const copyText = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const trust = message.sender === 'ai' ? computeTrustScore(message.content) : null;

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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeText = String(children).replace(/\n$/, '');
                  if (!inline) {
                    return (
                      <div className="relative group">
                        <button
                          onClick={() => copyText(codeText)}
                          className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded"
                        >
                          Copy
                        </button>
                        <SyntaxHighlighter style={oneDark} language={match ? match[1] : undefined} PreTag="div" {...props}>
                          {codeText}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }
                  return <code className={className} {...props}>{children}</code>
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {trust && (
              <div className={`text-[10px] ${trust.color} flex items-center gap-1`} title={`Trust: ${trust.score}%`}>
                <Shield className="w-3.5 h-3.5"/>
                <span>{trust.label}</span>
              </div>
            )}
            <button
              onClick={() => copyText(message.content)}
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