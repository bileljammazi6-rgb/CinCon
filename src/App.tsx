import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/Auth/AuthForm';
import { Layout } from './components/Layout/Navigation';
import { SocialFeed } from './components/Social/SocialFeed';
import { MoviesSection } from './components/Movies/MoviesSection';
import { ChatList } from './components/Chat/ChatList';
import { UserProfile } from './components/Profile/UserProfile';
import { LocationMap } from './components/Location/LocationMap';
import { GlobalSearch } from './components/Search/GlobalSearch';
import { QuotesSection } from './components/Quotes/QuotesSection';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { NotificationCenter } from './components/Notifications/NotificationCenter';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CineConnect...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<SocialFeed />} />
          <Route path="/discover" element={<GlobalSearch />} />
          <Route path="/movies" element={<MoviesSection />} />
          <Route path="/messages" element={<ChatList />} />
          <Route path="/events" element={<LocationMap />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/quotes" element={<QuotesSection />} />
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;