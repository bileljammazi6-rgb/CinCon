import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMovies } from '../contexts/MovieContext';
import { MovieCard } from '../components/MovieCard';
import { User, Settings, Heart, Clock, Star, Crown, Edit, Camera, LogOut, Film, Play } from 'lucide-react';
import { movieLinks } from '../data/movieLinks';

export function Profile() {
  const { user, signOut } = useAuth();
  const { trending } = useMovies();
  const [activeTab, setActiveTab] = useState<'overview' | 'watchlist' | 'history' | 'settings'>('overview');

  const isAdmin = user?.email === 'bilel8x@example.com';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'watchlist', label: 'My List', icon: Heart },
    { id: 'history', label: 'Watch History', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const mockWatchHistory = trending.slice(0, 6);
  const mockWatchlist = Object.entries(movieLinks).slice(0, 8);

  const stats = [
    { label: 'Movies Watched', value: '47', icon: Clock, color: 'blue' },
    { label: 'Watchlist', value: '23', icon: Heart, color: 'red' },
    { label: 'Average Rating', value: '8.2', icon: Star, color: 'yellow' },
    { label: 'Days Active', value: '156', icon: User, color: 'green' },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-600',
      red: 'bg-red-600',
      yellow: 'bg-yellow-600',
      green: 'bg-green-600',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-600';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-400 mb-2">Please sign in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-16 w-16 text-white" />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
              <Camera className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{user.email}</h1>
              {isAdmin && (
                <div className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-black rounded-full text-sm font-medium">
                  <Crown className="h-4 w-4" />
                  Admin
                </div>
              )}
            </div>
            <p className="text-gray-400 text-lg mb-4">Movie enthusiast and community member</p>
            
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 ${getColorClasses(stat.color)} rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 rounded-xl p-2 mb-8">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Recent Activity */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Watched "The Chestnut Man" Episode 3</p>
                  <p className="text-gray-400 text-sm">2 hours ago</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-white">8.5</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Added "Smurfs 2025" to watchlist</p>
                  <p className="text-gray-400 text-sm">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Rated "Jurassic World 2025" 9/10</p>
                  <p className="text-gray-400 text-sm">3 days ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Favorite Genres */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Favorite Genres</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Action', 'Drama', 'Sci-Fi', 'Horror'].map((genre) => (
                <div key={genre} className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Film className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-white font-medium">{genre}</p>
                  <p className="text-gray-400 text-sm">15 movies</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'watchlist' && (
        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">My Watchlist</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {mockWatchlist.map(([title, links]) => (
              <div key={title} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg">
                  <div className="aspect-[2/3] bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center">
                    <Film className="h-16 w-16 text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-3 bg-red-600 text-white rounded-full hover:bg-red-700">
                      <Play className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    <Heart className="h-3 w-3" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-white font-medium text-sm truncate">{title}</h3>
                  <p className="text-gray-400 text-xs">{links.length > 1 ? `${links.length} episodes` : 'Movie'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Watch History</h3>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {mockWatchHistory.map((movie) => (
              <MovieCard key={movie.id} movie={movie} showProgress />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Profile Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Display Name</label>
                  <input
                    type="text"
                    defaultValue={user.email}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Preferences</h4>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500" />
                  <span className="text-white">Email notifications for new releases</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500" />
                  <span className="text-white">Auto-play next episode</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500" />
                  <span className="text-white">Show content ratings</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800">
              <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}