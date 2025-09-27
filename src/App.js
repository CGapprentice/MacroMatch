import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './components/UserContext';
import Calculator from './components/Calculator';
import SocialFeed from './components/SocialFeed'; // Add this import
import './App.css';

// Simple login component for testing
const MockLogin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Mock Login</h2>
        <p className="text-gray-600 mb-4">For development testing</p>
        <button
          onClick={() => {
            // Mock login - set a fake user in localStorage
            const mockUser = {
              id: 'test-user-123',
              name: 'Test User',
              email: 'test@example.com',
              token: 'mock-token-123'
            };
            localStorage.setItem('macromatch_user', JSON.stringify(mockUser));
            window.location.href = '/calculator';
          }}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Login as Test User
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<MockLogin />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/social" element={<SocialFeed />} /> {/* Add this route */}
            <Route path="/" element={<Navigate to="/calculator" replace />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;