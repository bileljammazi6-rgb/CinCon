import React, { useState } from 'react';
import { ChatInterface } from '../components/Chat/ChatInterface';
import { ChatSidebar } from '../components/Chat/ChatSidebar';
import { WatchTogether } from '../components/WatchTogether/WatchTogether';
import { Users, Video, MessageCircle } from 'lucide-react';

export function Messages() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showWatchTogether, setShowWatchTogether] = useState(false);

  if (showWatchTogether) {
    return <WatchTogether onClose={() => setShowWatchTogether(false)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 border-r border-gray-800">
        <ChatSidebar 
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
          onClose={() => {}}
        />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWatchTogether(true)}
              className="p-2 text-white hover:bg-gray-800 rounded-lg"
              title="Watch Together"
            >
              <Video className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Mobile User List */}
        <div className="bg-gray-900">
          <div className="p-4 border-b border-gray-800">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
              />
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Mobile User List */}
          <div className="max-h-96 overflow-y-auto">
            {[
              { id: '1', username: 'bilel8x', isAdmin: true, isOnline: true, lastMessage: 'Hey there!', lastMessageTime: '2 min ago' },
              { id: '2', username: 'john_doe', isAdmin: false, isOnline: true, lastMessage: 'How are you?', lastMessageTime: '5 min ago' },
              { id: '3', username: 'jane_smith', isAdmin: false, isOnline: false, lastMessage: 'See you later!', lastMessageTime: '1 hour ago' },
            ].map((userItem) => (
              <div
                key={userItem.id}
                onClick={() => setSelectedUser(userItem)}
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
                        <span className="text-xs text-gray-900 font-bold">A</span>
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
                    <p className="text-gray-400 truncate">
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
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <ChatInterface 
            selectedUser={selectedUser}
            onUserSelect={setSelectedUser}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select a user to start chatting</h3>
              <p className="text-gray-400">Choose someone from your contacts to begin a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}