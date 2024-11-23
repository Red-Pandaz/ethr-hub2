import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  base: '/',  // Set the base path for your app
  build: {
    outDir: 'dist',  // Specify output directory for build
    assetsDir: 'assets',  // Specify the folder for assets
    sourcemap: true,  // Enable sourcemaps for debugging
  },
  server: {
    host: '0.0.0.0',  // Expose the dev server to network (useful for remote testing)
    port: 3000,  // Define a custom port if needed
    https: {
      key: fs.readFileSync('/etc/letsencrypt/live/ethrhub.xyz/privkey.pem'),  // Private key
      cert: fs.readFileSync('/etc/letsencrypt/live/ethrhub.xyz/fullchain.pem'),  // Certificate
    },
  },
})
