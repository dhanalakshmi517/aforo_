import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  server: {
    open: true,
    host: true,
    port: 3000,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
})
