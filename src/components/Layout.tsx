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
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: Home, badge: null },
    { name: 'Movies', href: '/movies', icon: Film, badge: null },
    { name: 'TV Shows', href: '/tv-shows', icon: Tv, badge: null },
    { name: 'Gaming', href: '/gaming', icon: Gamepad2, badge: 'NEW' },
    { name: 'AI Chat', href: '/ai-chat', icon: Brain, badge: 'AI' },
    { name: 'Messages', href: '/messages', icon: MessageCircle, badge: notifications > 0 ? notifications : null },
    { name: 'My List', href: '/my-list', icon: Heart, badge: null },
    { name: 'Search', href: '/search', icon: Search, badge: null },
  ];

  const secondaryNavigation = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-700">
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                CineFlix AI
              </h1>
              <p className="text-xs text-slate-400">Entertainment Hub</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive(item.href) ? 'text-purple-400' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span
                    className={`ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
              </Link>
            ))}
          </div>

          {/* Secondary Navigation */}
          <div className="pt-6 border-t border-slate-700">
            <div className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Account
            </div>
            <div className="space-y-1">
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-4 w-4 flex-shrink-0 ${
                      isActive(item.href) ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="group flex w-full items-center px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-all duration-200"
              >
                <LogOut className="mr-3 h-4 w-4 flex-shrink-0 text-slate-400 group-hover:text-white" />
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* User Info */}
        {user && (
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.email || 'User'}
                </p>
                <p className="text-xs text-slate-400">Premium Member</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <div className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4 lg:mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search movies, TV shows, games..."
                  className="w-full rounded-lg border-0 bg-slate-700 py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      navigate('/search');
                    }
                  }}
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs font-medium text-white flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Quick Actions */}
              <div className="hidden sm:flex items-center space-x-2">
                <button className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Now
                </button>
                <button className="inline-flex items-center rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 transition-colors">
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