import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  Home, 
  Film, 
  Tv, 
  Gamepad2, 
  MessageCircle, 
  User, 
  Heart, 
  Clock, 
  Download, 
  Settings, 
  HelpCircle, 
  Crown,
  Sparkles,
  TrendingUp,
  Star,
  Calendar,
  BookOpen,
  Zap,
  Users,
  Award,
  Target,
  Rocket
} from 'lucide-react';

interface AppleSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppleSidebar({ isOpen, onClose }: AppleSidebarProps) {
  const location = useLocation();

  const mainNavItems = [
    { path: '/', label: 'Home', icon: Home, description: 'Discover amazing content' },
    { path: '/movies', label: 'Movies', icon: Film, description: 'Watch the latest films' },
    { path: '/series', label: 'Series', icon: Tv, description: 'Binge-worthy TV shows' },
    { path: '/gaming', label: 'Gaming', icon: Gamepad2, description: 'Play with AI assistance' },
    { path: '/community', label: 'Community', icon: MessageCircle, description: 'Connect with fans' },
    { path: '/profile', label: 'Profile', icon: User, description: 'Your personal space' },
  ];

  const quickActions = [
    { path: '/my-list', label: 'My List', icon: Heart, description: 'Your favorites' },
    { path: '/recent', label: 'Recent', icon: Clock, description: 'Continue watching' },
    { path: '/downloads', label: 'Downloads', icon: Download, description: 'Offline content' },
    { path: '/trending', label: 'Trending', icon: TrendingUp, description: 'What\'s hot' },
    { path: '/top-rated', label: 'Top Rated', icon: Star, description: 'Best of the best' },
    { path: '/upcoming', label: 'Upcoming', icon: Calendar, description: 'Coming soon' },
  ];

  const aiFeatures = [
    { path: '/ai-chat', label: 'AI Chat', icon: Crown, description: 'Chat with Bilel AI' },
    { path: '/ai-recommendations', label: 'Smart Picks', icon: Sparkles, description: 'AI-powered suggestions' },
    { path: '/ai-analysis', label: 'Movie Analysis', icon: BookOpen, description: 'Deep insights' },
    { path: '/ai-games', label: 'AI Games', icon: Zap, description: 'Intelligent gaming' },
  ];

  const communityFeatures = [
    { path: '/achievements', label: 'Achievements', icon: Award, description: 'Unlock rewards' },
    { path: '/leaderboards', label: 'Leaderboards', icon: Target, description: 'Compete with friends' },
    { path: '/challenges', label: 'Challenges', icon: Rocket, description: 'Daily missions' },
    { path: '/friends', label: 'Friends', icon: Users, description: 'Connect & share' },
  ];

  const renderNavSection = (title: string, items: any[], className = '') => (
    <div className={className}>
      <h3 className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider mb-3 px-4">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#007aff]/20 text-[#007aff] border border-[#007aff]/30' 
                  : 'text-[#8e8e93] hover:text-white hover:bg-[#38383a]/50'
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${
                isActive ? 'text-[#007aff]' : 'text-[#8e8e93] group-hover:text-white'
              }`} />
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${
                  isActive ? 'text-[#007aff]' : 'text-white'
                }`}>
                  {item.label}
                </p>
                <p className="text-xs text-[#8e8e93] truncate">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`apple-sidebar ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#38383a]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#007aff] to-[#5856d6] rounded-2xl flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Movis Room</h2>
                <p className="text-xs text-[#8e8e93]">by Bilel</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#8e8e93] hover:text-white transition-colors lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto py-6 space-y-8">
            {/* Main Navigation */}
            {renderNavSection('Navigation', mainNavItems)}

            {/* Quick Actions */}
            {renderNavSection('Quick Actions', quickActions)}

            {/* AI Features */}
            {renderNavSection('AI Features', aiFeatures, 'border-t border-[#38383a] pt-8')}

            {/* Community */}
            {renderNavSection('Community', communityFeatures, 'border-t border-[#38383a] pt-8')}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#38383a] space-y-4">
            {/* AI Status */}
            <div className="bg-gradient-to-r from-[#007aff]/20 to-[#5856d6]/20 rounded-xl p-4 border border-[#007aff]/30">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-2 h-2 bg-[#30d158] rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-[#007aff]">AI System Online</span>
              </div>
              <p className="text-xs text-[#8e8e93]">
                Bilel AI is ready to assist you
              </p>
            </div>

            {/* Settings & Help */}
            <div className="flex items-center justify-between">
              <Link
                to="/settings"
                className="flex items-center space-x-2 text-[#8e8e93] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#38383a]/50"
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm">Settings</span>
              </Link>
              <Link
                to="/help"
                className="flex items-center space-x-2 text-[#8e8e93] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#38383a]/50"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="text-sm">Help</span>
              </Link>
            </div>

            {/* Version Info */}
            <div className="text-center">
              <p className="text-xs text-[#8e8e93]">
                Movis Room v1.0.0
              </p>
              <p className="text-xs text-[#8e8e93]">
                Powered by AI & Innovation
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}