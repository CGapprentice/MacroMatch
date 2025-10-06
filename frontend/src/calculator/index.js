// src/calculator/index.js
// Main export file for the calculator module

export { default as Calculator } from './components/Calculator';
export { useUser, UserProvider } from './components/UserContext';
export { useSpotify } from './components/SpotifyIntegration';
export { default as ApiService } from './services/api';

// Optional: Export workout database if other parts of the app need it
// export { workoutDatabase } from './utils/workoutDatabase';