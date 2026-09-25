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
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
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
    throw new Error(`Se produjo un error (${response.status}).`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
