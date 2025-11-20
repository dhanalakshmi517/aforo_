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
    assetsDir: 'assets',
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets')
    }
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  server: {
    fs: {
      // Allow serving files from these directories
      allow: [
        // Default allowed directories
        process.cwd(),
        // Add the static directory to the allow list
        path.resolve(__dirname, 'src/client/static'),
        // Add the assets directory to the allow list
        path.resolve(__dirname, 'src/assets')
      ]
    }
  },
  // Ensure static assets are copied during build
  publicDir: 'public',
  optimizeDeps: {
    include: [
      path.resolve(__dirname, 'src/client/static/**/*')
    ]
  }
}

export default defineConfig(config)