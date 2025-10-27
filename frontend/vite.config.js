import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    // This tells the server to listen on all local network interfaces,
    // which includes both 'localhost' and '127.0.0.1'.
    host: '127.0.0.1', 
    port: 5173, // Ensure this matches the port in your URI
  },
});