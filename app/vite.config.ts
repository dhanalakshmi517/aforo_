import { defineConfig } from 'vite'
import path from 'path'

// Simple configuration for production build
const config = {
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: 'index.html'
      },
    },
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src')
    }
  }
}

export default defineConfig(config)
