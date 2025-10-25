// src/components/UserContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import ApiService from '../services/api';

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
    const savedUser = localStorage.getItem('auth_token') || localStorage.getItem('macromatch_user');
    if (savedUser) {
      try {
        // Try to parse as JSON first (in case it's a user object)
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch {
        // If it's just a token string, create a basic user object
        setUser({
          id: 'user_' + Date.now(),
          token: savedUser,
          name: 'User', // You can update this after fetching user profile
          calculatorData: null
        });
      }
    }
  }, []);

  const saveUserData = async (calculatorData) => {
    setLoading(true);
    try {
      if (!user?.token) {
        throw new Error('No authentication token found');
      }

      // Use the API service to save data
      const response = await ApiService.saveUserCalculatorData(
        user.id, 
        calculatorData, 
        user.token
      );

      const updatedUser = {
        ...user,
        calculatorData,
        lastUpdated: new Date().toISOString()
      };

      setUser(updatedUser);
      localStorage.setItem('macromatch_user', JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error) {
      console.error('Error saving data:', error);
      
      // Fallback to localStorage if API fails
      try {
        const updatedUser = {
          ...user,
          calculatorData,
          lastUpdated: new Date().toISOString()
        };
        setUser(updatedUser);
        localStorage.setItem('macromatch_user', JSON.stringify(updatedUser));
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
      if (user.token) {
        // Try to load from API first
        const data = await ApiService.getUserCalculatorData(user.id, user.token);
        return data;
      }
    } catch (error) {
      console.error('Error loading data from API:', error);
    }
    
    // Fallback to localStorage
    try {
      const savedUser = localStorage.getItem('macromatch_user');
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
      if (user?.token) {
        await ApiService.updateUserProfile(user.id, profileData, user.token);
      }
      
      const updatedUser = {
        ...user,
        ...profileData,
        lastUpdated: new Date().toISOString()
      };
      
      setUser(updatedUser);
      localStorage.setItem('macromatch_user', JSON.stringify(updatedUser));
      
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
    localStorage.removeItem('macromatch_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('spotify_access_token'); // Clear Spotify token too
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