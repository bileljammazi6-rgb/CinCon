import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Plus, X, Crown } from 'lucide-react';

interface ChatSidebarProps {
  selectedUser: any;
  onUserSelect: (user: any) => void;
  onClose: () => void;
}

export function ChatSidebar({ selectedUser, onUserSelect, onClose }: ChatSidebarProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  // Mock users - in real app this would come from API
  useEffect(() => {
    setUsers([
      { id: '1', username: 'bilel8x', isAdmin: true, isOnline: true, lastMessage: 'Hey there!', lastMessageTime: '2 min ago' },
      { id: '2', username: 'john_doe', isAdmin: false, isOnline: true, lastMessage: 'How are you?', lastMessageTime: '5 min ago' },
      { id: '3', username: 'jane_smith', isAdmin: false, isOnline: false, lastMessage: 'See you later!', lastMessageTime: '1 hour ago' },
      { id: '4', username: 'mike_wilson', isAdmin: false, isOnline: true, lastMessage: 'Great movie!', lastMessageTime: '2 hours ago' },
    ]);
  }, []);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Messages</h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-white hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.map((userItem) => (
          <div
            key={userItem.id}
            onClick={() => onUserSelect(userItem)}
            className={`p-4 border-b border-gray-800 cursor-pointer transition-colors ${
              selectedUser?.id === userItem.id ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {userItem.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                {userItem.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                )}
                {userItem.isAdmin && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Crown className="h-3 w-3 text-gray-900" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium truncate">
                    {userItem.username}
                  </h3>
                  {userItem.isAdmin && (
                    <span className="text-xs bg-yellow-500 text-gray-900 px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 truncate">
                  {userItem.lastMessage}
                </p>
                <p className="text-xs text-gray-500">
                  {userItem.lastMessageTime}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Chat */}
      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          <Plus className="h-5 w-5" />
          New Chat
        </button>
      </div>
    </div>
  );
}