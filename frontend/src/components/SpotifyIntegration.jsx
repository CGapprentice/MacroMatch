// src/components/SpotifyIntegration.jsx
import React, { useState, useEffect } from 'react';

const SPOTIFY_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  REDIRECT_URI: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
  SCOPES: [
    'user-read-private',
    'user-read-email',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-top-read'
  ].join(' ')
};

export const useSpotify = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setSpotifyUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Generate code verifier and challenge for PKCE
  const generateCodeChallenge = async (codeVerifier) => {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    // Check if we've already processed this code
    const processedCode = sessionStorage.getItem('processed_code');
  
    if (code && code !== processedCode) {
      // 1. Determine where to send the user back to
      // Priority: 1. State from Spotify, 2. SessionStorage backup, 3. Home
      const returnPath = state || sessionStorage.getItem('spotify_return_path') || '/';

      // 2. Clean the URL and navigate to the return path immediately
      window.history.pushState({}, null, returnPath);

      // 3. Mark as processed and exchange the token
      sessionStorage.setItem('processed_code', code);
      exchangeCodeForToken(code);
  
      // 4. Cleanup the backup path
      sessionStorage.removeItem('spotify_return_path');
    }

    // Load stored token
    const storedToken = localStorage.getItem('spotify_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
      getSpotifyUser(storedToken);
    }
  }, []);

  // Add storage event listener to sync across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'spotify_access_token') {
        setAccessToken(e.newValue);
        if (e.newValue) {
          getSpotifyUser(e.newValue);
        } else {
          setIsConnected(false);
          setSpotifyUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const exchangeCodeForToken = async (code) => {
    const codeVerifier = sessionStorage.getItem('code_verifier');
  
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: SPOTIFY_CONFIG.CLIENT_ID,
          grant_type: 'authorization_code',
          code,
          redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
          code_verifier: codeVerifier
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Token received:", data.access_token); // Debug log
        setAccessToken(data.access_token);
        localStorage.setItem('spotify_access_token', data.access_token);
        setIsConnected(true);
        sessionStorage.removeItem('code_verifier');
        sessionStorage.removeItem('processed_code'); // Clear the processed flag
        getSpotifyUser(data.access_token);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getSpotifyUser = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setSpotifyUser(userData);
        setIsConnected(true);
      } else {
        localStorage.removeItem('spotify_access_token');
        setAccessToken(null);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error getting Spotify user:', error);
      localStorage.removeItem('spotify_access_token');
      setAccessToken(null);
      setIsConnected(false);
    }
  };

  const connectSpotify = async () => {
    console.log("connectSpotify called!");
  
    // if (!SPOTIFY_CONFIG.CLIENT_ID || !SPOTIFY_CONFIG.REDIRECT_URI) {
    //   alert('Spotify integration is not configured yet. Please set up Spotify Developer Dashboard credentials.');
    //   return;
    // }
  
    const codeVerifier = generateCodeVerifier();
    sessionStorage.setItem('code_verifier', codeVerifier);

    const returnPath = window.location.pathname;
    sessionStorage.setItem('spotify_return_path', returnPath);

    const codeChallenge = await generateCodeChallenge(codeVerifier);
  
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${SPOTIFY_CONFIG.CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(SPOTIFY_CONFIG.REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(SPOTIFY_CONFIG.SCOPES)}&` +
      `code_challenge_method=S256&` +
      `code_challenge=${codeChallenge}&` +
      `state=${encodeURIComponent(window.location.pathname)}`;
    
    window.location.href = authUrl;
  };

  const generatePlaylist = async (workoutType, duration, fitnessLevel) => {
    if (!accessToken || !user) {
      throw new Error('Not connected to Spotify');
    }

    const playlistName = `MacroMatch ${workoutType} - ${duration}min (${fitnessLevel})`;
    const playlist = await createPlaylist(playlistName);
    
    const tracks = await getRecommendations(workoutType, duration);
    
    await addTracksToPlaylist(playlist.id, tracks);
    
    return playlist;
  };

  const createPlaylist = async (name) => {
    const response = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description: 'Generated by MacroMatch Fitness Calculator',
        public: false
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create playlist');
    }

    return await response.json();
  };

  const getRecommendations = async (workoutType, duration) => {
    const profile = getMusicProfile(workoutType);
    const targetTracks = Math.ceil(duration / 3.5);

    const params = new URLSearchParams({
      limit: Math.min(targetTracks, 50),
      seed_genres: profile.genres.join(','),
      target_energy: profile.energy,
      target_tempo: profile.tempo,
      target_danceability: profile.danceability,
      target_popularity: 40  // Changed to target_popularity to potentially avoid issues; adjust as needed
    });

    const url = `https://api.spotify.com/v1/recommendations?${params.toString()}`;
    console.log("Getting recommendations:", url);

    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        return data.tracks;
      } else {
        console.log("Recommendations failed with status:", response.status);
        // Fallback to curated tracks
        return getFallbackTracks(targetTracks);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      // Fallback to curated tracks
      return getFallbackTracks(targetTracks);
    }
  };

  const getFallbackTracks = (targetTracks) => {
    const validTracks = [
      { uri: 'spotify:track:3n3Ppam7vgaVa1iaRUc9Lp', name: 'Mr. Brightside' },
      { uri: 'spotify:track:7qiZfU4dY1lWllzX7mPBI5', name: 'Shape of You' },
      { uri: 'spotify:track:60nZcImufyMA1MKQY3dcCH', name: 'Levitating' },
      { uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b', name: 'Blinding Lights' },
      { uri: 'spotify:track:2takcwOaAZWiXQijPHIx7B', name: 'Time' },
      { uri: 'spotify:track:3cfOd4CMv2snFaKAnMdnvK', name: 'Somebody That I Used to Know' },
      { uri: 'spotify:track:5ChkMS8OtdzJeqyybCc9R5', name: 'Stressed Out' },
      { uri: 'spotify:track:6habFhsOp2NvshLv26DqMb', name: 'Such Great Heights' },
      { uri: 'spotify:track:0DiWol3AO6WpXZgp0goxAV', name: 'One Dance' }
    ];

    return validTracks.slice(0, targetTracks);
  };

  const addTracksToPlaylist = async (playlistId, tracks) => {
    const trackUris = tracks.map(track => track.uri);
    
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uris: trackUris })
    });

    if (!response.ok) {
      throw new Error('Failed to add tracks to playlist');
    }
  };

  return {
    isConnected,
    user,
    connectSpotify,
    generatePlaylist
  };
};

// Helper function for music profiles
const getMusicProfile = (workoutType) => {
  const profiles = {
    cardio: {
      energy: 0.8,
      tempo: 150,
      danceability: 0.7,
      genres: ['dance', 'edm', 'pop']
    },
    strength: {
      energy: 0.7,
      tempo: 120,
      danceability: 0.5,
      genres: ['rock', 'hip-hop', 'metal']
    },
    flexibility: {
      energy: 0.3,
      tempo: 80,
      danceability: 0.4,
      genres: ['ambient', 'chill', 'acoustic']
    },
    mixed: {
      energy: 0.6,
      tempo: 130,
      danceability: 0.6,
      genres: ['pop', 'rock', 'dance']
    }
  };

  return profiles[workoutType] || profiles.mixed;
};

export default useSpotify;