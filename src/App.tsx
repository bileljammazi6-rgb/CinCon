import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { TVShows } from './pages/TVShows';
import { Messages } from './pages/Messages';
import { MyList } from './pages/MyList';
import { Search } from './pages/Search';
import { MovieDetail } from './pages/MovieDetail';
import { Gaming } from './pages/Gaming';
import AIChat from './pages/AIChat';
import { AuthProvider } from './contexts/AuthContext';
import { MovieProvider } from './contexts/MovieContext';
import { FloatingAIChat } from './components/FloatingAIChat';
import { MoviePlayer } from './components/MoviePlayer';
import './styles/globals.css';
import { AuthForm } from './components/Auth/AuthForm';

function App() {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [moviePlayer, setMoviePlayer] = useState<{
    isOpen: boolean;
    movie: any;
    downloadLinks: string[];
  }>({
    isOpen: false,
    movie: null,
    downloadLinks: []
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

    window.addEventListener('openMoviePlayer', handleOpenMoviePlayer as EventListener);

    return () => {
      window.removeEventListener('openMoviePlayer', handleOpenMoviePlayer as EventListener);
    };
  }, []);

  const closeMoviePlayer = () => {
    setMoviePlayer({
      isOpen: false,
      movie: null,
      downloadLinks: []
    });
  };

  return (
    <AuthProvider>
      <MovieProvider>
        <Router>
          <div className="app">
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/tv-shows" element={<TVShows />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/my-list" element={<MyList />} />
                <Route path="/search" element={<Search />} />
                <Route path="/movie/:id" element={<MovieDetail />} />
                <Route path="/gaming" element={<Gaming />} />
                <Route path="/ai-chat" element={<AIChat />} />
                <Route path="/auth" element={<AuthForm />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
            
            {/* Floating AI Chat - Always Accessible */}
            <FloatingAIChat 
              isOpen={isAIChatOpen} 
              onToggle={() => setIsAIChatOpen(!isAIChatOpen)} 
            />

            {/* Global Movie Player */}
            <MoviePlayer
              movie={moviePlayer.movie}
              isOpen={moviePlayer.isOpen}
              onClose={closeMoviePlayer}
            />
          </div>
        </Router>
      </MovieProvider>
    </AuthProvider>
  );
}

export default App;