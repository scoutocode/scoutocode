import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Base URL pour GitHub Pages (nom du repo)
  // Mettre '/' si hébergé à la racine (ex: username.github.io)
  base: '/scoutocode/',
  plugins: [
    tailwindcss(),
    svelte(),
  ],
})
