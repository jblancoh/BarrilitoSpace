import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@barrilitospace/shared'],
  },
  build: {
    commonjsOptions: {
      include: [/@barrilitospace\/shared/, /node_modules/],
    },
  },
})
