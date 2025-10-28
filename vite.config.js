import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Servir la racine du projet pour permettre l'accès aux dossiers `Styles` et `Scripts`
  root: '.',
  // Permet de construire des chemins relatifs pour la build statique
  base: './',
  server: {
    // Ouvre directement la page Pages/HomePage.html lors du démarrage
    open: '/Pages/HomePage.html'
  },
  build: {
    // Sortie dans /dist à la racine du projet
    outDir: 'dist',
    emptyOutDir: true
  }
})
