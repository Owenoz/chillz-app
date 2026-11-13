import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        globIgnores: [
          '**/tv_channels.json',
          '**/sports_fixtures.json',
          '**/sports_teams.json',
        ],
        runtimeCaching: [
          {
            urlPattern: /\.(png|jpg|jpeg|webp|svg)(\?.*)?$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'chillz-images-v1',
              expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /supabase\.co/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'chillz-api-v1' },
          },
        ],
      },
      includeAssets: [
        'icon-192.png',
        'icon-512.png',
        'apple-touch-icon.png',
        'favicon-32.png',
        'favicon-16.png',
      ],
      manifest: {
        name: 'Chillz — Watch. Chill. Repeat.',
        short_name: 'Chillz',
        description: 'Live TV, sports, movies and world cinema — free, no login needed.',
        theme_color: '#0a0e1a',
        background_color: '#0a0e1a',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        lang: 'en',
        categories: ['entertainment', 'lifestyle'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Live TV',  short_name: 'TV',     url: '/tv',      icons: [{ src: 'icon-192.png', sizes: '192x192' }] },
          { name: 'Sports',   short_name: 'Sports', url: '/sports',  icons: [{ src: 'icon-192.png', sizes: '192x192' }] },
          { name: 'Movies',   short_name: 'Movies', url: '/movies',  icons: [{ src: 'icon-192.png', sizes: '192x192' }] },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,
  },
})
