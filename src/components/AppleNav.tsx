import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  User, 
  Bell, 
  Settings, 
  Home, 
  Film, 
  Tv, 
  Gamepad2, 
  MessageCircle, 
  Crown,
  Sparkles,
  X
} from 'lucide-react';

interface AppleNavProps {
  onMenuClick: () => void;
}

export function AppleNav({ onMenuClick }: AppleNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/movies', label: 'Movies', icon: Film },
    { path: '/series', label: 'Series', icon: Tv },
    { path: '/gaming', label: 'Gaming', icon: Gamepad2 },
    { path: '/community', label: 'Community', icon: MessageCircle },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search page with query
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Main Navigation */}
      <nav className={`apple-nav transition-all duration-300 ${
        isScrolled ? 'bg-black/95 shadow-2xl' : 'bg-black/80'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-6">
              {/* Menu Button */}
              <button
                onClick={onMenuClick}
                className="p-2 text-white hover:text-[#007aff] transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-r from-[#007aff] to-[#5856d6] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-white">Movis Room</h1>
                  <p className="text-xs text-[#8e8e93]">by Bilel</p>
                </div>
              </Link>

              {/* Navigation Items */}
              <div className="hidden lg:flex items-center space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`apple-nav-item flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                        isActive ? 'active bg-[#007aff]/10' : 'hover:bg-[#38383a]/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                {showSearch ? (
                  <form onSubmit={handleSearch} className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8e8e93]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search movies, series, games..."
                        className="apple-search-input w-80 pl-10 pr-4 py-2 text-sm"
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      className="apple-button-secondary px-4 py-2 text-sm"
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSearch(false)}
                      className="p-2 text-[#8e8e93] hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="p-2 text-[#8e8e93] hover:text-white transition-colors duration-200"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Notifications */}
              <button className="p-2 text-[#8e8e93] hover:text-white transition-colors duration-200 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff3b30] rounded-full"></span>
              </button>

              {/* Settings */}
              <button className="p-2 text-[#8e8e93] hover:text-white transition-colors duration-200">
                <Settings className="h-5 w-5" />
              </button>

              {/* AI Badge */}
              <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-[#007aff]/20 to-[#5856d6]/20 px-3 py-2 rounded-xl border border-[#007aff]/30">
                <Sparkles className="h-4 w-4 text-[#007aff]" />
                <span className="text-xs text-[#007aff] font-medium">AI Powered</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-2xl border-t border-[#38383a]">
        <div className="flex items-center justify-around py-3">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'text-[#007aff] bg-[#007aff]/10' 
                    : 'text-[#8e8e93] hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}