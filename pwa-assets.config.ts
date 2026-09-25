import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Generates public/pwa-192x192.png, pwa-512x512.png, maskable-icon-512x512.png,
// apple-touch-icon-180x180.png and favicon.ico from public/logo.svg.
export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: minimal2023Preset,
  images: ['public/logo.svg'],
})
