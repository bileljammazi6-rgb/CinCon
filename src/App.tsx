import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppleNav } from './components/AppleNav';
import { AppleSidebar } from './components/AppleSidebar';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { Series } from './pages/Series';
import { Search } from './pages/Search';
import { Gaming } from './pages/Gaming';
import { Community } from './pages/Community';
import { Profile } from './pages/Profile';
import { MoviePlayer } from './components/MoviePlayer';
import { SeriesPlayer } from './components/SeriesPlayer';
import { FloatingAIChat } from './components/FloatingAIChat';
import { AuthProvider } from './contexts/AuthContext';
import { MovieProvider } from './contexts/MovieContext';
import './styles/globals.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moviePlayer, setMoviePlayer] = useState<{
    isOpen: boolean;
    movie: any;
    downloadLinks: string[];
  }>({
    isOpen: false,
    movie: null,
    downloadLinks: []
  });
  const [seriesPlayer, setSeriesPlayer] = useState<{
    isOpen: boolean;
    series: any;
  }>({
    isOpen: false,
    series: null
  });

  useEffect(() => {
    // Listen for custom event to open movie player
    const handleOpenMoviePlayer = (event: CustomEvent) => {
      const { movie, downloadLinks } = event.detail;
      setMoviePlayer({
        isOpen: true,
        movie,
        downloadLinks
      });
    };

    // Listen for custom event to open series player
    const handleOpenSeriesPlayer = (event: CustomEvent) => {
      const { series } = event.detail;
      setSeriesPlayer({
        isOpen: true,
        series
      });
    };

    window.addEventListener('openMoviePlayer', handleOpenMoviePlayer as EventListener);
    window.addEventListener('openSeriesPlayer', handleOpenSeriesPlayer as EventListener);

    return () => {
      window.removeEventListener('openMoviePlayer', handleOpenMoviePlayer as EventListener);
      window.removeEventListener('openSeriesPlayer', handleOpenSeriesPlayer as EventListener);
    };
  }, []);

  const closeMoviePlayer = () => {
    setMoviePlayer({
      isOpen: false,
      movie: null,
      downloadLinks: []
    });
  };

  const closeSeriesPlayer = () => {
    setSeriesPlayer({
      isOpen: false,
      series: null
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AuthProvider>
      <MovieProvider>
        <Router>
          <div className="min-h-screen bg-black">
            {/* Apple TV Navigation */}
            <AppleNav onMenuClick={toggleSidebar} />
            
            {/* Apple TV Sidebar */}
            <AppleSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            {/* Main Content */}
            <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
              <div className="pt-20">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/series" element={<Series />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/gaming" element={<Gaming />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
            
            {/* Floating AI Chat - Always Accessible */}
            <FloatingAIChat />
            
            {/* Global Movie Player */}
            <MoviePlayer
              movie={moviePlayer.movie}
              isOpen={moviePlayer.isOpen}
              onClose={closeMoviePlayer}
            />
            
            {/* Global Series Player */}
            <SeriesPlayer
              series={seriesPlayer.series}
              isOpen={seriesPlayer.isOpen}
              onClose={closeSeriesPlayer}
            />
          </div>
        </Router>
      </MovieProvider>
    </AuthProvider>
  );
}

export default App;