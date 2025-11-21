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
        // Add the specific directories we need
        path.resolve(__dirname, 'src/client/static'),
        path.resolve(__dirname, 'src/assets'),
        path.resolve(__dirname, 'src/client'),
        path.resolve(__dirname, 'src/admin'),
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, '.wasp/out/web-app'),
        path.resolve(__dirname, '.wasp/out/sdk/wasp'),
        path.resolve(__dirname, 'node_modules')
      ],
      strict: false
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