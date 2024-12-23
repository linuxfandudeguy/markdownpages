import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Chunk the large libraries separately from the main bundle
        manualChunks: {
          // Example of chunking large libraries that are often heavy
          reactVendor: ['react', 'react-dom'],
          markdown: ['marked', 'katex', 'highlight.js'], // Add libraries that can be split out
        },
        chunkFileNames: 'chunks/[name]-[hash].js', // Output chunk names with a hash for cache-busting
      },
    },
  },
})
