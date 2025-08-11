import React, { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceRecorderProps {
  onRecording: (audioBlob: Blob) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

export function VoiceRecorder({ onRecording, isRecording, setIsRecording }: VoiceRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        onRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      onClick={toggleRecording}
      className={`p-3 rounded-xl transition-colors ${
        isRecording 
          ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
      }`}
      title={isRecording ? 'Stop recording' : 'Start voice recording'}
    >
      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
}