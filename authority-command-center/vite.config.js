import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built dist/ works on Netlify Drop, Vercel, or any static host.
export default defineConfig({
  plugins: [react()],
  base: './',
})
