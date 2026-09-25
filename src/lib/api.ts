import { env } from './env'
import { supabase } from './supabase'

/** Thrown on 403: the signed-in Supabase account is not on the backend owner allowlist. */
export class ApiForbiddenError extends Error {
  constructor() {
    super('Esta cuenta no tiene acceso.')
    this.name = 'ApiForbiddenError'
  }
}

/** Thrown on 404 — used by the profile guard to route to onboarding. */
export class ApiNotFoundError extends Error {
  constructor() {
    super('No encontrado')
    this.name = 'ApiNotFoundError'
  }
}

/**
 * Fetch wrapper that attaches the current Supabase access token.
 * 401 -> session is gone, sign out so the app falls back to the login screen.
 * 403 -> valid session, but this account is not on the backend owner allowlist.
 *
 * `init.body` may be a `FormData` (e.g. the photo-analyze upload) — in that case the
 * `Content-Type` is left for the browser to set (with its multipart boundary), never forced to JSON.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const isFormData = init.body instanceof FormData

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  if (response.status === 401) {
    await supabase.auth.signOut()
    throw new Error('La sesión expiró. Iniciar sesión nuevamente.')
  }

  if (response.status === 403) {
    throw new ApiForbiddenError()
  }

  if (response.status === 404) {
    throw new ApiNotFoundError()
  }

  if (!response.ok) {
    throw new Error(await friendlyErrorMessage(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

/** Backend errors (e.g. the Gemini-analysis 502) carry a Spanish {"message": "..."} body — prefer it. */
async function friendlyErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      return body.message
    }
  } catch {
    // Not a JSON body — fall through to the generic message.
  }
  return `Se produjo un error (${response.status}).`
}
