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
import { AuthProvider } from './contexts/AuthContext';
import { MovieProvider } from './contexts/MovieContext';
import './styles/globals.css';
import { AuthForm } from './components/Auth/AuthForm';

function App() {
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
                <Route path="/auth" element={<AuthForm />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </div>
        </Router>
      </MovieProvider>
    </AuthProvider>
  );
}

export default App;