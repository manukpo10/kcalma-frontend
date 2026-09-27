/** Minimal shape of the global `window.turnstile` API — see
 *  https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/. Only the
 *  pieces TurnstileWidget actually uses. */
export interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: { sitekey: string; callback: (token: string) => void; 'error-callback'?: () => void },
  ) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

let scriptPromise: Promise<TurnstileApi> | null = null

/**
 * Lazily injects Cloudflare's Turnstile script at most once per page load and resolves with the
 * global API it attaches to `window.turnstile` — no npm dependency (see vercel.json for the CSP
 * allowance this needs: script-src/frame-src 'https://challenges.cloudflare.com').
 */
export function loadTurnstileScript(): Promise<TurnstileApi> {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile)
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.turnstile) {
          resolve(window.turnstile)
        } else {
          reject(new Error('Turnstile no se cargó correctamente.'))
        }
      }
      script.onerror = () => reject(new Error('No se pudo cargar el widget de verificación.'))
      document.head.appendChild(script)
    })
  }
  return scriptPromise
}
