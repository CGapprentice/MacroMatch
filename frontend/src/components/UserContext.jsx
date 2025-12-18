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
  const [calculatorResults, setCalculatorResults] = useState(()=>{{
    const saved = localStorage.getItem('calculatorResults');
    return saved ? JSON.parse(saved) : null;
  }});
  const [macroResults, setMacroResults] = useState(()=>{{
    const saved = localStorage.getItem('macroResult');
    return saved ? JSON.parse(saved) : null
}})
  const [clickGooglePopUp, setClickGooglePopUp] = useState(() => {
    return localStorage.getItem('clickGooglePopUp') === 'true';
  });

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('firebase_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Combine user data with token
        setUser({ ...userData, token });
      } catch (error) {
        console.error("Error parsing saved user:", error);
        // If parsing fails but we have a token, create a minimal user
        setUser({
          id: 'user_' + Date.now(),
          token: token,
          name: 'User',
          calculatorData: null
        });
      }
    } else if (token) {
       // Only token exists (legacy or partial state)
       setUser({
         id: 'user_' + Date.now(),
         token: token,
         name: 'User',
         calculatorData: null
       });
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
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
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
      if (user?.token) {
        await ApiService.updateUserProfile(user.id, profileData, user.token);
      }
      
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
    resetClickGooglePopUp();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('spotify_access_token'); // Clear Spotify token too
    localStorage.removeItem('calculatorResults')
    localStorage.removeItem('macroResult')
  };

  const clickedGooglePopUp = () =>{
    setClickGooglePopUp(true);
    localStorage.setItem('clickGooglePopUp', 'true');
  }

  const resetClickGooglePopUp = () =>{
    setClickGooglePopUp(false);
    localStorage.removeItem('clickGooglePopUp');
  }

  const saveCalculatorData = (data) =>{
    setCalculatorResults(data);
    localStorage.setItem('calculatorResults', JSON.stringify(data));
  }

  const saveAllMacros = (data) =>{
    setMacroResults(data);
    localStorage.setItem('macroResult', JSON.stringify(data));
  }

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      saveUserData,
      loadUserData,
      updateUserProfile,
      clickedGooglePopUp,
      resetClickGooglePopUp,
      calculatorResults,
      setCalculatorResults,
      saveCalculatorData,
      saveAllMacros,
      macroResults,
      clickGooglePopUp,
      setMacroResults,
      loading,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};