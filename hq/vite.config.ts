import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectManifest: { swSrc: 'src/sw.ts', swDest: 'dist/sw.js' },
      manifest: {
        name: 'Abdul & Lilia — Honeymoon HQ',
        short_name: 'Honeymoon HQ',
        description: 'Onze huwelijksreis door Indonesië',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F2F7FB',
        theme_color: '#1A5C82',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: { outDir: 'dist', sourcemap: false },
})
