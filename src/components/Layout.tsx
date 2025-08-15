import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Film,
  Tv,
  Heart,
  User,
  LogOut,
  Bell,
  Settings,
  Menu,
  X,
  Play,
  Plus,
  MessageCircle,
  Gamepad2,
  Brain,
  Crown,
  TrendingUp,
  Bookmark,
  Star,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Download,
  Share2,
  Clock,
  Calendar,
  Eye,
  ThumbsUp,
  Filter,
  Grid,
  List,
  ChevronDown,
  ChevronRight,
  Zap,
  Sparkles,
  Target,
  Users,
  Award,
  ArrowRight,
  RefreshCw,
  Info,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(5);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Sample notifications - in a real app, these would come from the database
  const sampleNotifications = [
    { id: 1, type: 'movie', message: 'New movie "Inception" available for download', time: '2 min ago', read: false },
    { id: 2, type: 'ai', message: 'Bilel AI has new movie recommendations for you', time: '5 min ago', read: false },
    { id: 3, type: 'game', message: 'New AI quiz available in Gaming section', time: '10 min ago', read: false },
    { id: 4, type: 'chat', message: 'New message from Community Chat', time: '15 min ago', read: false },
    { id: 5, type: 'system', message: 'Welcome to CineFlix AI! Explore our features', time: '1 hour ago', read: true }
  ];

  // Online status detection
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme management
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  // Update notification count
  useEffect(() => {
    const unreadCount = sampleNotifications.filter(n => !n.read).length;
    setNotifications(unreadCount);
  }, []);

  const markNotificationAsRead = (id: number) => {
    // In a real app, this would update the database
    const updatedNotifications = sampleNotifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    setNotifications(unreadCount);
  };

  const markAllAsRead = () => {
    // In a real app, this would update the database
    setNotifications(0);
  };

  const navigation = [
    { 
      name: 'Home', 
      href: '/', 
      icon: Home, 
      badge: null,
      description: 'Discover trending content'
    },
    { 
      name: 'Movies', 
      href: '/movies', 
      icon: Film, 
      badge: null,
      description: 'Latest movies & downloads'
    },
    { 
      name: 'TV Shows', 
      href: '/tv-shows', 
      icon: Tv, 
      badge: null,
      description: 'Binge-worthy series'
    },
    { 
      name: 'Gaming', 
      href: '/gaming', 
      icon: Gamepad2, 
      badge: 'NEW',
      description: 'AI-powered games'
    },
    { 
      name: 'AI Chat', 
      href: '/ai-chat', 
      icon: Brain, 
      badge: 'AI',
      description: 'Conversational AI'
    },
    { 
      name: 'Messages', 
      href: '/messages', 
      icon: MessageCircle, 
      badge: notifications > 0 ? notifications : null,
      description: 'Community chat'
    },
    { 
      name: 'My List', 
      href: '/my-list', 
      icon: Heart, 
      badge: null,
      description: 'Your favorites'
    },
    { 
      name: 'Search', 
      href: '/search', 
      icon: Search, 
      badge: null,
      description: 'Find anything'
    },
  ];

  const quickActions = [
    { name: 'Random Movie', icon: Film, action: () => navigate('/movies') },
    { name: 'AI Insight', icon: Brain, action: () => navigate('/ai-chat') },
    { name: 'Quick Game', icon: Gamepad2, action: () => navigate('/gaming') },
    { name: 'Trending', icon: TrendingUp, action: () => navigate('/') },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSidebarOpen(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100'
    }`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          theme === 'dark' 
            ? 'bg-gradient-to-b from-slate-800/95 via-slate-900/95 to-slate-800/95' 
            : 'bg-gradient-to-b from-white/95 via-slate-50/95 to-white/95'
        } backdrop-blur-xl shadow-2xl border-r ${
          theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/50'
        }`}
      >
        {/* Logo & Header */}
        <div className={`flex h-20 items-center justify-between px-6 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                CineFlix AI
              </h1>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Entertainment Hub
              </p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-700/50">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search movies, shows, games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border-0 ${
                theme === 'dark' 
                  ? 'bg-slate-700/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500' 
                  : 'bg-slate-100/50 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-purple-500'
              } transition-all duration-200`}
            />
          </form>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                  : `text-slate-300 hover:bg-slate-700/50 hover:text-white ${
                      theme === 'light' ? 'hover:bg-slate-100/50' : ''
                    }`
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive(item.href) ? 'text-purple-400' : 'text-slate-400 group-hover:text-white'
                }`}
              />
              <div className="flex-1">
                <span className="flex items-center">
                  {item.name}
                  {item.badge && (
                    <span
                      className={`ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.badge === 'NEW'
                          ? 'bg-green-100 text-green-800'
                          : item.badge === 'AI'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </span>
                <p className={`text-xs mt-1 ${
                  isActive(item.href) ? 'text-purple-300/70' : 'text-slate-500 group-hover:text-slate-300'
                }`}>
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Quick Actions
            </h3>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${
                showQuickActions ? 'rotate-180' : ''
              }`} />
            </button>
          </div>
          
          {showQuickActions && (
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={action.action}
                  className="w-full flex items-center px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Info & Controls */}
        {user && (
          <div className={`border-t ${
            theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
          } p-4`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                } truncate`}>
                  {user.email || 'User'}
                </p>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Premium Member
                </p>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-yellow-400 hover:bg-slate-700' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button
                  onClick={toggleSound}
                  className={`p-2 rounded-lg transition-colors ${
                    soundEnabled 
                      ? 'text-green-400 hover:bg-slate-700' 
                      : 'text-red-400 hover:bg-slate-700'
                  }`}
                  title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className={`p-3 border-t ${
          theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                onlineStatus ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                {onlineStatus ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Wifi className={`h-3 w-3 ${
                onlineStatus ? 'text-green-400' : 'text-red-400'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <div className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-slate-800/80 border-slate-700' 
            : 'bg-white/80 border-slate-200'
        }`}>
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Page Title */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                {location.pathname === '/' && 'Home'}
                {location.pathname === '/movies' && 'Movies'}
                {location.pathname === '/tv-shows' && 'TV Shows'}
                {location.pathname === '/gaming' && 'Gaming'}
                {location.pathname === '/ai-chat' && 'AI Chat'}
                {location.pathname === '/messages' && 'Messages'}
                {location.pathname === '/my-list' && 'My List'}
                {location.pathname === '/search' && 'Search'}
                {location.pathname.startsWith('/movie/') && 'Movie Details'}
                {location.pathname.startsWith('/tv/') && 'TV Show Details'}
              </h2>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center space-x-1 bg-slate-700/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="hidden sm:flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-600/50 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filters</span>
              </button>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs font-medium text-white flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl z-50">
                    <div className="p-4 border-b border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">Notifications</h3>
                        {notifications > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {sampleNotifications.length > 0 ? (
                        <div className="space-y-1">
                          {sampleNotifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 hover:bg-slate-700/50 transition-colors cursor-pointer ${
                                !notification.read ? 'bg-slate-700/30' : ''
                              }`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.type === 'movie' ? 'bg-green-400' :
                                  notification.type === 'ai' ? 'bg-purple-400' :
                                  notification.type === 'game' ? 'bg-blue-400' :
                                  notification.type === 'chat' ? 'bg-yellow-400' :
                                  'bg-slate-400'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${
                                    !notification.read ? 'text-white font-medium' : 'text-slate-300'
                                  }`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0 mt-2" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-400">
                          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No notifications</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 border-t border-slate-700/50">
                      <button
                        onClick={() => navigate('/messages')}
                        className="w-full text-center text-purple-400 hover:text-purple-300 transition-colors text-sm"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="hidden sm:flex items-center space-x-2">
                <button className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium py-2 px-4 transition-all duration-200 hover:scale-105">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Now
                </button>
                <button className="inline-flex items-center rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium py-2 px-4 transition-colors">
                  <Plus className="mr-2 h-4 w-4" />
                  Add to List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}