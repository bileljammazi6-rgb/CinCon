import React, { useState, useEffect } from 'react';
import NetflixSidebar from './components/NetflixSidebar';
import NetflixHero from './components/NetflixHero';
import NetflixMovieGrid from './components/NetflixMovieGrid';
import NetflixChat from './components/NetflixChat';
import NetflixWatchTogether from './components/NetflixWatchTogether';
import { movieLinks } from './data/movieLinks';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedMovie, setSelectedMovie] = useState<{ name: string; links: string[] } | null>(null);
  const [currentUser] = useState({
    id: '1',
    name: 'You',
    isAdmin: false
  });

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const handleMovieSelect = (movieName: string, links: string[]) => {
    setSelectedMovie({ name: movieName, links });
    // You can implement movie playback logic here
    console.log(`Selected movie: ${movieName} with ${links.length} links`);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="min-h-screen bg-black">
            <NetflixHero
              title="Welcome to Netflix"
              description="Unlimited movies, TV shows, and more. Watch anywhere. Cancel anytime."
              onPlay={() => setActiveSection('movies')}
              onInfo={() => setActiveSection('movies')}
            />
            <NetflixMovieGrid
              title="Trending Now"
              subtitle="Popular movies and TV shows"
              onMovieSelect={handleMovieSelect}
              showHero={false}
            />
          </div>
        );
      
      case 'movies':
        return (
          <NetflixMovieGrid
            title="All Movies & TV Shows"
            subtitle="Browse our complete collection"
            onMovieSelect={handleMovieSelect}
            showHero={false}
          />
        );
      
      case 'tv-shows':
        return (
          <NetflixMovieGrid
            title="TV Shows"
            subtitle="Binge-worthy series and episodes"
            onMovieSelect={handleMovieSelect}
            showHero={false}
          />
        );
      
      case 'watch-together':
        return (
          <NetflixWatchTogether
            currentUser={currentUser}
            onClose={() => setActiveSection('home')}
          />
        );
      
      case 'chat':
        return (
          <NetflixChat
            currentUser={currentUser}
            onClose={() => setActiveSection('home')}
          />
        );
      
      case 'community':
        return (
          <div className="min-h-screen bg-black p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-white mb-8">Community</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="netflix-card p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Movie Discussions</h3>
                  <p className="text-gray-300 mb-4">Join conversations about your favorite movies and TV shows.</p>
                  <button className="netflix-button">Join Discussion</button>
                </div>
                <div className="netflix-card p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Watch Parties</h3>
                  <p className="text-gray-300 mb-4">Organize and join watch parties with friends.</p>
                  <button className="netflix-button">Create Party</button>
                </div>
                <div className="netflix-card p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Recommendations</h3>
                  <p className="text-gray-300 mb-4">Share and discover new content with the community.</p>
                  <button className="netflix-button">Share</button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'games':
        return (
          <div className="min-h-screen bg-black p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl font-bold text-white mb-8">Games</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['Chess', 'Tic Tac Toe', '2048', 'Memory Match', 'Snake', 'Rock Paper Scissors', 'Quiz', 'Voice Chat'].map((game) => (
                  <div key={game} className="netflix-card p-6 text-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl font-bold">{game.charAt(0)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{game}</h3>
                    <button className="netflix-button w-full">Play Now</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'favorites':
        return (
          <div className="min-h-screen bg-black p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl font-bold text-white mb-8">My Favorites</h1>
              <div className="text-center text-gray-400">
                <p className="text-xl">No favorites yet</p>
                <p className="text-lg">Start adding movies and TV shows to your favorites!</p>
              </div>
            </div>
          </div>
        );
      
      case 'history':
        return (
          <div className="min-h-screen bg-black p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl font-bold text-white mb-8">Watch History</h1>
              <div className="text-center text-gray-400">
                <p className="text-xl">No watch history yet</p>
                <p className="text-lg">Your viewing history will appear here</p>
              </div>
            </div>
          </div>
        );
      
      case 'learning':
        return (
          <div className="min-h-screen bg-black p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl font-bold text-white mb-8">Learning Tools</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="netflix-card p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Tajwid Coach</h3>
                  <p className="text-gray-300 mb-4">Learn proper Quran recitation techniques.</p>
                  <button className="netflix-button">Start Learning</button>
                </div>
                <div className="netflix-card p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Isnad Explorer</h3>
                  <p className="text-gray-300 mb-4">Explore Islamic knowledge chains.</p>
                  <button className="netflix-button">Explore</button>
                </div>
                <div className="netflix-card p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Quiz Room</h3>
                  <p className="text-gray-300 mb-4">Test your knowledge with interactive quizzes.</p>
                  <button className="netflix-button">Take Quiz</button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'music':
        return (
          <div className="min-h-screen bg-black p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl font-bold text-white mb-8">Music</h1>
              <div className="text-center text-gray-400">
                <p className="text-xl">Music feature coming soon</p>
                <p className="text-lg">Stay tuned for music streaming capabilities</p>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="min-h-screen bg-black p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-white mb-8">Notifications</h1>
              <div className="text-center text-gray-400">
                <p className="text-xl">No new notifications</p>
                <p className="text-lg">You're all caught up!</p>
              </div>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="min-h-screen bg-black p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>
              <div className="space-y-6">
                <div className="netflix-card p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Display Name</label>
                      <input
                        type="text"
                        value={currentUser.name}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value="user@example.com"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="netflix-card p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Dark Mode</span>
                      <button className="w-12 h-6 bg-red-600 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Auto-play</span>
                      <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-white mb-4">404</h1>
              <p className="text-xl text-gray-400">Page not found</p>
              <button
                onClick={() => setActiveSection('home')}
                className="netflix-button mt-6"
              >
                Go Home
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Netflix Sidebar */}
      <NetflixSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNavigate={handleNavigate}
        activeSection={activeSection}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {renderContent()}
      </div>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-40">
        <div className="flex justify-around py-2">
          {['home', 'movies', 'chat', 'games'].map((section) => (
            <button
              key={section}
              onClick={() => handleNavigate(section)}
              className={`p-3 rounded-lg transition-colors ${
                activeSection === section ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-xs capitalize">{section}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;