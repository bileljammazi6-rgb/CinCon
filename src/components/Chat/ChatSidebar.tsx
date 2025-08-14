import React, { useState } from 'react';
import { Search, Crown, Circle } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';

interface ChatSidebarProps {
  selectedUser: any;
  onUserSelect: (user: any) => void;
  onClose: () => void;
}

export function ChatSidebar({ selectedUser, onUserSelect, onClose }: ChatSidebarProps) {
  const { users } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineUsers = filteredUsers.filter(user => user.isOnline);
  const offlineUsers = filteredUsers.filter(user => !user.isOnline);

  return (
    <div className="bg-gray-900 rounded-xl p-6 h-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Community Chat</h3>
        <p className="text-gray-400 text-sm">Connect with other members</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
        />
      </div>

      {/* Online Users */}
      {onlineUsers.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Circle className="h-3 w-3 text-green-500 fill-current" />
            <span className="text-green-500 text-sm font-medium">Online ({onlineUsers.length})</span>
          </div>
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                  selectedUser?.id === user.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{user.username}</p>
                    {user.isAdmin && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  {user.lastMessage && (
                    <p className="text-xs text-gray-400 truncate">
                      {user.lastMessage}
                    </p>
                  )}
                </div>
                {user.lastMessageTime && (
                  <span className="text-xs text-gray-400">
                    {user.lastMessageTime}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Offline Users */}
      {offlineUsers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Circle className="h-3 w-3 text-gray-500" />
            <span className="text-gray-500 text-sm font-medium">Offline ({offlineUsers.length})</span>
          </div>
          <div className="space-y-2">
            {offlineUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                  selectedUser?.id === user.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                }`}
              >
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-gray-300 font-medium text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{user.username}</p>
                    {user.isAdmin && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  {user.lastMessage && (
                    <p className="text-xs text-gray-500 truncate">
                      {user.lastMessage}
                    </p>
                  )}
                </div>
                {user.lastMessageTime && (
                  <span className="text-xs text-gray-500">
                    {user.lastMessageTime}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No users found</p>
        </div>
      )}
    </div>
  );
}