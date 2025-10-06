// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Debugging: Check if env vars are loaded
  console.log('🔍 Environment variables check:');
  console.log('VITE_FIREBASE_API_KEY:', env.VITE_FIREBASE_API_KEY);
  console.log('VITE_FIREBASE_PROJECT_ID:', env.VITE_FIREBASE_PROJECT_ID);
  console.log('Working directory:', process.cwd());
  
  return {
    plugins: [react()],
  };
});
