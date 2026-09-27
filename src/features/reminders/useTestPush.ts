import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'

/** POST /api/push/test — fires at whatever subscription(s) the backend already has for this
 *  user; nothing to send from here. */
export function useSendTestPush() {
  return useMutation({
    mutationFn: () => apiFetch<{ sent: boolean }>('/api/push/test', { method: 'POST' }),
  })
}
