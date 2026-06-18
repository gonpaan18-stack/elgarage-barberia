import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'favicon.ico'],
      manifest: {
        name: 'El Garage — Panel',
        short_name: 'El Garage',
        description: 'Panel del dueño para gestionar turnos',
        theme_color: '#0E0F11',
        background_color: '#0E0F11',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'logo-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
