import { defineConfig, type UserConfigExport } from 'vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Determine if we're in production build
  const isProduction = mode === 'production'
  
  const config: UserConfigExport = {
    server: {
      open: true,
      host: true,
      port: 3000,
      strictPort: true,
    },
    resolve: {
      alias: {
        '@src': isProduction 
          ? path.resolve(__dirname, '.wasp/build/web-app/src')
          : path.resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: isProduction ? '.wasp/build/web-app/build' : 'dist',
      rollupOptions: {
        input: {
          main: isProduction 
            ? path.resolve(__dirname, '.wasp/build/web-app/index.html')
            : path.resolve(__dirname, 'index.html')
        },
      },
    },
  }
  
  return config
})