import React, { useState } from 'react';
import { 
  Home, 
  Film, 
  MessageCircle, 
  Users, 
  Gamepad2, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  MonitorPlay,
  Bell,
  Heart,
  History,
  BookOpen,
  Music,
  Tv,
  Star
} from 'lucide-react';

interface NetflixSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: (section: string) => void;
  activeSection: string;
}

const NetflixSidebar: React.FC<NetflixSidebarProps> = ({
  isOpen,
  onToggle,
  onNavigate,
  activeSection
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, color: 'text-red-500' },
    { id: 'movies', label: 'Movies', icon: Film, color: 'text-blue-500' },
    { id: 'tv-shows', label: 'TV Shows', icon: Tv, color: 'text-green-500' },
    { id: 'watch-together', label: 'Watch Together', icon: MonitorPlay, color: 'text-purple-500' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, color: 'text-yellow-500' },
    { id: 'community', label: 'Community', icon: Users, color: 'text-indigo-500' },
    { id: 'games', label: 'Games', icon: Gamepad2, color: 'text-pink-500' },
    { id: 'favorites', label: 'Favorites', icon: Heart, color: 'text-red-400' },
    { id: 'history', label: 'History', icon: History, color: 'text-gray-400' },
    { id: 'learning', label: 'Learning', icon: BookOpen, color: 'text-emerald-500' },
    { id: 'music', label: 'Music', icon: Music, color: 'text-orange-500' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-cyan-500' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-500' }
  ];

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-64'}
        bg-gradient-to-b from-gray-900 via-gray-800 to-black
        border-r border-gray-700
        shadow-2xl
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-white font-bold text-xl">Netflix</span>
            </div>
          )}
          <button
            onClick={handleToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-300" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-2 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-red-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">U</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">User</p>
                <p className="text-gray-400 text-xs">Premium Member</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Button for Mobile */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
};

export default NetflixSidebar;