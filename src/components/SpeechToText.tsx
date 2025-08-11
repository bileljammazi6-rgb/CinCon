import React, { useEffect, useRef, useState } from 'react';
import { Keyboard as KeyboardIcon } from 'lucide-react';

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
}

export function SpeechToText({ onTranscript }: SpeechToTextProps) {
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'auto';
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) onTranscript(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscript]);

  const toggle = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        // ignored
      }
    }
  };

  if (!recognitionRef.current) {
    return null;
  }

  return (
    <button
      onClick={toggle}
      className={`p-3 rounded-xl transition-colors ${
        isListening ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse' : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
      }`}
      title={isListening ? 'Stop speech-to-text' : 'Start speech-to-text'}
    >
      <KeyboardIcon className="w-5 h-5" />
    </button>
  );
}