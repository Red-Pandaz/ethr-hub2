import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  base: '/',  
  build: {
    outDir: 'dist',  
    assetsDir: 'assets',  
    sourcemap: true,  
  },
  server: {
    host: '0.0.0.0', 
    port: 3000, 
    https: {
      key: fs.readFileSync('/etc/letsencrypt/live/ethrhub.xyz/privkey.pem'),  
      cert: fs.readFileSync('/etc/letsencrypt/live/ethrhub.xyz/fullchain.pem'), 
    },
  },
})
