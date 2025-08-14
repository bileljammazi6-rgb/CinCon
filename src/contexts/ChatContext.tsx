import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  content: string;
  image?: string;
  sender: string;
  receiver: string;
  timestamp: Date;
  type: 'text' | 'image';
}

interface ChatUser {
  id: string;
  username: string;
  isOnline: boolean;
  isAdmin: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface ChatContextType {
  messages: Message[];
  users: ChatUser[];
  selectedUser: ChatUser | null;
  unreadCount: number;
  sendMessage: (content: string, image?: string) => void;
  selectUser: (user: ChatUser) => void;
  addUser: (user: ChatUser) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize with mock data
  useEffect(() => {
    const mockUsers: ChatUser[] = [
      { id: '1', username: 'bilel8x', isOnline: true, isAdmin: true, lastMessage: 'Hey there!', lastMessageTime: '2 min ago' },
      { id: '2', username: 'john_doe', isOnline: true, isAdmin: false, lastMessage: 'How are you?', lastMessageTime: '5 min ago' },
      { id: '3', username: 'jane_smith', isOnline: false, isAdmin: false, lastMessage: 'See you later!', lastMessageTime: '1 hour ago' },
      { id: '4', username: 'mike_wilson', isOnline: true, isAdmin: false, lastMessage: 'Great movie!', lastMessageTime: '2 hours ago' },
    ];

    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Welcome to CineFlix! 🎬',
        sender: 'bilel8x',
        receiver: 'all',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        type: 'text'
      },
      {
        id: '2',
        content: 'Thanks! This looks amazing!',
        sender: 'john_doe',
        receiver: 'all',
        timestamp: new Date(Date.now() - 1000 * 60 * 3),
        type: 'text'
      }
    ];

    setUsers(mockUsers);
    setMessages(mockMessages);
    setUnreadCount(2);
  }, []);

  const sendMessage = (content: string, image?: string) => {
    if (!user || !selectedUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      image,
      sender: user.email || 'anonymous',
      receiver: selectedUser.username,
      timestamp: new Date(),
      type: image ? 'image' : 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Update last message for the user
    setUsers(prev => prev.map(u => 
      u.id === selectedUser.id 
        ? { ...u, lastMessage: content, lastMessageTime: 'now' }
        : u
    ));
  };

  const selectUser = (user: ChatUser) => {
    setSelectedUser(user);
    // Mark messages as read
    setUnreadCount(0);
  };

  const addUser = (newUser: ChatUser) => {
    setUsers(prev => [...prev, newUser]);
  };

  const value = {
    messages,
    users,
    selectedUser,
    unreadCount,
    sendMessage,
    selectUser,
    addUser,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}