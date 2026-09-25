import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Source of truth for the PWA/app icons: a cleaned, cropped, transparent
// export of the "K" mark from the real logo (imagenes/logo.png at the repo
// root, left untouched). Regenerated via scripts/generate-brand-assets.mjs,
// which also produces the transparent Login/header assets in src/assets/brand.
export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: minimal2023Preset,
  images: ['public/logo-mark-source.png'],
})
