import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { Watch } from './pages/Watch';
import { Community } from './pages/Community';
import { Profile } from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import { MovieProvider } from './contexts/MovieContext';
import { ChatProvider } from './contexts/ChatContext';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <MovieProvider>
        <ChatProvider>
          <Router>
            <div className="app">
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/watch/:id" element={<Watch />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </div>
          </Router>
        </ChatProvider>
      </MovieProvider>
    </AuthProvider>
  );
}

export default App;