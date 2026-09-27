/**
 * Whether the app is currently running installed on the home screen rather than in a regular
 * Safari/Chrome tab. `navigator.standalone` is iOS Safari's own (non-standard, boolean-or-
 * undefined) flag; `display-mode: standalone` is the cross-platform signal that also covers
 * Android/desktop installed PWAs and iOS 16.4+. iOS's Push API is only reachable once this is
 * true — Safari silently has no working `PushManager` for a page opened as a normal tab.
 */
export function isStandalonePwa(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches
}

/** Feature-detects the 3 APIs the whole flow depends on, without UA-sniffing. */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/** `PushManager.subscribe`'s `applicationServerKey` wants raw bytes, not the base64url string
 *  the backend hands back — RFC 4648 §5 (URL-safe, unpadded), same encoding as a VAPID key.
 *  Built via `new Uint8Array(length)` + a loop rather than `Uint8Array.from`: the latter types
 *  as `Uint8Array<ArrayBufferLike>`, which no longer satisfies `BufferSource` (TS's typed arrays
 *  are now generic over the buffer type, and `ArrayBufferLike` also admits `SharedArrayBuffer`). */
export function urlBase64ToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4)
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i)
  }
  return bytes
}
