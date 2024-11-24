import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react()],
  base: '/',  
  build: {
    outDir: 'dist',  
    assetsDir: 'assets',  
    sourcemap: true,  
  },
  ...(isProduction && {
    server: {
      host: '0.0.0.0', 
      port: 3000, 
      https: {
        key: fs.readFileSync('/etc/letsencrypt/live/ethrhub.xyz/privkey.pem'),  
        cert: fs.readFileSync('/etc/letsencrypt/live/ethrhub.xyz/fullchain.pem'), 
      },
    },
  }),
})