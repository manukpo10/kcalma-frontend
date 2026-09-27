import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import { urlBase64ToUint8Array } from './pushSupport'
import type { PushSubscriptionRequest } from './types'

async function fetchPublicKey(): Promise<string> {
  const { publicKey } = await apiFetch<{ publicKey: string }>('/api/push/public-key')
  return publicKey
}

/**
 * Browser-side subscribe: asks the SW for a `PushSubscription` and registers it with the
 * backend. Assumes `Notification.requestPermission()` already resolved to `'granted'` — see
 * `RemindersSection`'s master toggle handler, which calls that first, in the same tap handler,
 * before this mutation ever runs.
 */
export function usePushSubscribe() {
  return useMutation({
    mutationFn: async () => {
      const registration = await navigator.serviceWorker.ready
      const publicKey = await fetchPublicKey()
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      const body: PushSubscriptionRequest = { ...subscription.toJSON(), userAgent: navigator.userAgent }
      await apiFetch('/api/push/subscriptions', { method: 'POST', body: JSON.stringify(body) })
      return subscription
    },
  })
}

/** Unregisters from the backend first (needs the endpoint URL to identify the row), then drops
 *  the browser-side subscription. If there's no active subscription (permission was revoked
 *  externally, etc.) this is a no-op — the caller still updates the server-side `enabled: false`
 *  preference regardless. */
export function usePushUnsubscribe() {
  return useMutation({
    mutationFn: async () => {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) return

      await apiFetch('/api/push/subscriptions', {
        method: 'DELETE',
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
      await subscription.unsubscribe()
    },
  })
}
