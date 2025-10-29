import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  base: './',
  server: {
    open: '/Pages/HomePage.html'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
