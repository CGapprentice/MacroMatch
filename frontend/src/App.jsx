// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { UserProvider } from './components/UserContext';
import { useUser } from './components/UserContext';
import HomePage from "./pages/HomePage";
import Calculator from './components/Calculator';
import SocialFeed from './components/SocialFeed';
import PlaylistGenerator from './components/PlaylistGenerator';
import './login.css';
import './App.css';

const MockLogin = () => {
  return (
    <div className="loginInfo">
      <div className="gradient"></div>
      <div className="card"></div>
      <div className="loginContext">
        <div className="loginText">
          <h1>Mock Login</h1>
          <p>For development testing</p>
          <button
            onClick={() => {
              const mockUser = {
                id: 'test-user-123',
                name: 'Test User',
                email: 'test@example.com',
                token: 'mock-token-123'
              };
              localStorage.setItem('macromatch_user', JSON.stringify(mockUser));
              window.location.href = '/calculator';
            }}
            className="google"
          >
            Login as Test User
          </button>
        </div>
      </div>
    </div>
  );
};

// Navigation component
const Navigation = () => {
  const location = useLocation();

  const { userData, logout } = useUser(); // Assuming useUser gives a logout function
  const isLoggedIn = userData && userData.id; // Check if user data exists
  
  // Don't show nav on login page
  if (location.pathname === '/login') {
    return null;
  }

  const isActive = (path) => location.pathname === path ? 'nav-link-active' : '';

  return (
    <nav className="app-navigation">
      <div className="nav-container">
        <Link to="/" className={`nav-link ${isActive('/')}`}>
          🏠 Home
        </Link>
        <Link to="/calculator" className={`nav-link ${isActive('/calculator')}`}>
          📊 Calculator
        </Link>
        <Link to="/social" className={`nav-link ${isActive('/social')}`}>
          👥 Social Feed
        </Link>
        <Link to="/playlist" className={`nav-link ${isActive('/playlist')}`}>
          🎵 Playlists
        </Link>
        {isLoggedIn ? (
          <button onClick={logout} className="nav-link">
            Log Out
          </button>
        ) : (
          // Optional: Show a link to login if they bypassed the redirect
          <Link to="/login" className="nav-link">
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <UserProvider>
      <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <div>
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<MockLogin />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/social" element={<SocialFeed />} />
            <Route path="/playlist" element={<PlaylistGenerator />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;