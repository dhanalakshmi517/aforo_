import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'

// Plugin to handle missing CSS files
const handleMissingCssPlugin = {
  name: 'handle-missing-css',
  resolveId(id: string) {
    // If it's a CSS file import that doesn't exist, create it
    if (id.endsWith('.css') || id.endsWith('.module.css')) {
      const resolvedPath = path.resolve(id)
      if (!fs.existsSync(resolvedPath)) {
        // Create the directory if it doesn't exist
        const dir = path.dirname(resolvedPath)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
        // Create an empty CSS file
        fs.writeFileSync(resolvedPath, '/* Auto-generated empty CSS file */')
        console.log(`Created missing CSS file: ${resolvedPath}`)
        return resolvedPath
      }
    }
    return null
  },
  load(id: string) {
    // Return empty CSS for missing CSS files
    if ((id.endsWith('.css') || id.endsWith('.module.css')) && !fs.existsSync(id)) {
      return 'export default {};'
    }
    return null
  }
}

// Simple configuration for production build
const config = {
  plugins: [handleMissingCssPlugin],
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