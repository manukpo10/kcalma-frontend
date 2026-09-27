import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      // We register the service worker ourselves from src/components/UpdatePrompt.tsx
      // (virtual:pwa-register/react) so we control exactly when updates apply — see
      // that file for why (iOS backgrounds the PWA instead of relaunching it, and a
      // silent auto-reload could lose an in-progress add-meal flow).
      injectRegister: false,
      // Custom SW (src/sw.ts) instead of the generated one: push/notificationclick handlers
      // can't be expressed through generateSW's declarative options. `filename: 'sw.ts'` +
      // `strategies: 'injectManifest'` makes the plugin compile that file to dist/sw.js and
      // inject the precache manifest at the `self.__WB_MANIFEST` placeholder inside it.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Kcalma',
        short_name: 'Kcalma',
        description: 'Seguimiento de objetivos nutricionales diarios.',
        lang: 'es',
        theme_color: '#121110',
        background_color: '#121110',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      injectManifest: {
        // Precache build assets only. No runtimeCaching entries: API and Supabase
        // calls are cross-origin and must always hit the network, never the cache.
        // No "png" here on purpose: every in-app image is WebP-only now (see BrandMark.tsx /
        // LoginPage.tsx). The remaining PNGs in public/ (manifest/apple-touch icons) are OS-level
        // assets fetched once on install, not part of the app shell — `includeAssets` above still
        // force-includes apple-touch-icon-180x180.png since iOS reads it directly.
        globPatterns: ['**/*.{js,css,html,ico,webp,svg,webmanifest}'],
      },
    }),
  ],
})
