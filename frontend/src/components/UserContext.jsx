// src/components/UserContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUserToken } from '../firebase';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('firebase_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser({
          ...userData,
          token
        });
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('firebase_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const saveUserData = async (calculatorData) => {
    setLoading(true);
    try {
      // Get fresh Firebase token
      const idToken = await getCurrentUserToken();
      
      if (!idToken) {
        throw new Error('No authentication token found');
      }

      // Save to backend (MongoDB)
      const response = await fetch('http://localhost:5000/api/auth/calculator-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(calculatorData)
      });

      if (!response.ok) {
        throw new Error('Failed to save data to server');
      }

      // Also save locally as backup
      const updatedUser = {
        ...user,
        calculatorData,
        lastUpdated: new Date().toISOString()
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('Data saved successfully');
      return { success: true };
    } catch (error) {
      console.error('Error saving data:', error);
      
      // Fallback to localStorage
      try {
        const updatedUser = {
          ...user,
          calculatorData,
          lastUpdated: new Date().toISOString()
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('Data saved locally as fallback');
        return { success: true };
      } catch (localError) {
        return { success: false, error: error.message };
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!user) return null;
    
    setLoading(true);
    try {
      // Get fresh Firebase token
      const idToken = await getCurrentUserToken();
      
      if (idToken) {
        // Try to load from backend first
        const response = await fetch('http://localhost:5000/api/auth/calculator-data', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            return data.data;
          }
        }
      }
    } catch (error) {
      console.error('Error loading data from server:', error);
    }
    
    // Fallback to localStorage
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.calculatorData) {
          return userData.calculatorData;
        }
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    } finally {
      setLoading(false);
    }
    
    return null;
  };

  const updateUserProfile = async (profileData) => {
    setLoading(true);
    try {
      // Get fresh Firebase token
      const idToken = await getCurrentUserToken();
      
      if (idToken) {
        // Update on backend
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify(profileData)
        });

        if (response.ok) {
          const data = await response.json();
          const updatedUser = data.user;
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return { success: true };
        }
      }
      
      // Fallback to local update
      const updatedUser = {
        ...user,
        ...profileData,
        lastUpdated: new Date().toISOString()
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('firebase_token');
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      saveUserData,
      loadUserData,
      updateUserProfile,
      loading,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};
