import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { ChatInterface } from '../components/Chat/ChatInterface';
import { ChatSidebar } from '../components/Chat/ChatSidebar';
import { WatchTogether } from '../components/WatchTogether/WatchTogether';
import { Users, MessageCircle, Play, Crown, Star, Clock, Film } from 'lucide-react';
import { movieLinks } from '../data/movieLinks';

export function Community() {
  const { user } = useAuth();
  const { users, selectedUser, selectUser } = useChat();
  const [activeTab, setActiveTab] = useState<'chat' | 'watch'>('chat');
  const [showWatchTogether, setShowWatchTogether] = useState(false);

  const isAdmin = user?.email === 'bilel8x@example.com';

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageCircle, count: users.length },
    { id: 'watch', label: 'Watch Together', icon: Play, count: Object.keys(movieLinks).length },
  ];

  const onlineUsers = users.filter(u => u.isOnline);
  const adminUsers = users.filter(u => u.isAdmin);

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Community</h1>
        <p className="text-gray-400 text-lg">Connect with friends and watch together</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Online Users</p>
              <p className="text-2xl font-bold text-white">{onlineUsers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <Film className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Available Movies</p>
              <p className="text-2xl font-bold text-white">{Object.keys(movieLinks).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Play className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Watch Sessions</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 rounded-xl p-2 mb-8">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'chat' | 'watch')}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all flex-1 justify-center
                  ${activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
                <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <ChatSidebar
              selectedUser={selectedUser}
              onUserSelect={selectUser}
              onClose={() => {}}
            />
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            {selectedUser ? (
              <ChatInterface
                selectedUser={selectedUser}
                onUserSelect={selectUser}
              />
            ) : (
              <div className="bg-gray-900 rounded-xl p-8 text-center">
                <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a user to start chatting</h3>
                <p className="text-gray-600">Choose someone from the sidebar to begin your conversation</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Watch Together Section */}
          <div className="bg-gray-900 rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Watch Together</h2>
                <p className="text-gray-400">Stream movies and TV shows with friends in real-time</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowWatchTogether(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  <Play className="h-5 w-5" />
                  Start Streaming
                </button>
              )}
            </div>

            {/* Current Session */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">The Chestnut Man - Episode 1</h3>
                    <p className="text-gray-400">Currently streaming • 12 viewers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Started by</p>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span className="text-white font-medium">bilel8x</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Content */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Available Content</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(movieLinks).slice(0, 8).map(([title, links]) => (
                  <div key={title} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer">
                    <div className="w-full h-24 bg-gradient-to-br from-red-600 to-purple-600 rounded-lg flex items-center justify-center mb-3">
                      <Film className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-white font-medium text-sm mb-1 truncate">{title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {links.length > 1 ? `${links.length} episodes` : 'Movie'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Community Stats */}
          <div className="bg-gray-900 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Community Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Top Contributors</h4>
                <div className="space-y-3">
                  {adminUsers.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                          <Crown className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{admin.username}</p>
                          <p className="text-gray-400 text-sm">Admin</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-white font-medium">9.8</span>
                        </div>
                        <p className="text-gray-400 text-xs">Rating</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm"><span className="font-medium">bilel8x</span> started streaming</p>
                      <p className="text-gray-400 text-xs">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm"><span className="font-medium">john_doe</span> joined the chat</p>
                      <p className="text-gray-400 text-xs">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm"><span className="font-medium">jane_smith</span> rated a movie</p>
                      <p className="text-gray-400 text-xs">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Watch Together Modal */}
      {showWatchTogether && (
        <WatchTogether onClose={() => setShowWatchTogether(false)} />
      )}
    </div>
  );
}