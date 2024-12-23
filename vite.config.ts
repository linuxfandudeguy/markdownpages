import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Chunk the libraries separately from the main bundle
        manualChunks: {
          // Chunk React libraries into a separate bundle
          reactVendor: ['react', 'react-dom'],
          
          // Chunk Markdown core libraries (marked and dompurify) together
          md: ['marked', 'dompurify'],
          
          // Chunk Markdown extensions (katex and highlight.js) together
          mdPlugins: ['katex', 'highlight.js'],
        },
        chunkFileNames: 'chunks/[name]-[hash].js', // Output chunk names with a hash for cache-busting
      },
    },
  },
})
