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

/** Thrown when `fetch` itself never got a response (offline, DNS failure, dropped connection).
 *  Every browser rejects the fetch promise with a `TypeError` in that case — never an HTTP
 *  response — so it can't be told apart from a bug except by catching around the call. */
export class ApiOfflineError extends Error {
  constructor() {
    super('Sin conexión. Revisá tu internet e intentá de nuevo.')
    this.name = 'ApiOfflineError'
  }
}

async function buildHeaders(init: RequestInit): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const isFormData = init.body instanceof FormData
  return {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init.headers,
  }
}

/** The raw network call, with the current auth header attached fresh each time (so a retry after
 *  `refreshSession()` picks up the new token) and network-level failures normalized to
 *  `ApiOfflineError` instead of leaking a raw browser `TypeError`. */
async function rawFetch(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(`${env.apiUrl}${path}`, { ...init, headers: await buildHeaders(init) })
  } catch (cause) {
    if (cause instanceof TypeError) {
      throw new ApiOfflineError()
    }
    throw cause
  }
}

/**
 * Fetch wrapper that attaches the current Supabase access token.
 * 401 -> the access token may have simply expired: try one silent `refreshSession()` and retry
 *   the request with the new token before giving up. Only signs out if that retry also fails.
 * 403 -> valid session, but this account is not on the backend owner allowlist.
 * No connectivity -> throws `ApiOfflineError` with Spanish, user-safe copy (see `rawFetch`).
 *
 * `init.body` may be a `FormData` (e.g. the photo-analyze upload) — in that case the
 * `Content-Type` is left for the browser to set (with its multipart boundary), never forced to JSON.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await rawFetch(path, init)

  if (response.status === 401) {
    return handleResponse<T>(await retryAfterRefresh(path, init))
  }

  return handleResponse<T>(response)
}

/** Shared by `apiFetch`/`apiFetchBlob`: the access token may have simply expired, so try one
 *  silent `refreshSession()` and retry the request with the new token before giving up. Only
 *  signs out if that retry also fails. Returns the response for the caller to finish handling
 *  (JSON body vs. blob differ from here on, which is why this doesn't call `handleResponse` itself). */
async function retryAfterRefresh(path: string, init: RequestInit): Promise<Response> {
  const { data, error } = await supabase.auth.refreshSession()
  if (!error && data.session) {
    const retried = await rawFetch(path, init)
    if (retried.status !== 401) {
      return retried
    }
  }
  await supabase.auth.signOut()
  throw new Error('La sesión expiró. Iniciar sesión nuevamente.')
}

/** Filename from a `Content-Disposition` header (`filename*=UTF-8''...` preferred, falling back
 *  to plain `filename="..."`) — used by `apiFetchBlob` since the browser doesn't parse this itself
 *  for a fetch()ed response the way it would for a plain navigation/download. */
function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null
  const encodedMatch = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (encodedMatch) return decodeURIComponent(encodedMatch[1])
  const plainMatch = /filename="?([^";]+)"?/i.exec(header)
  return plainMatch ? plainMatch[1] : null
}

/**
 * Same auth/retry contract as `apiFetch`, but for a binary response (the data export) — returns
 * the raw `Blob` plus the filename from `Content-Disposition` instead of parsing JSON.
 */
export async function apiFetchBlob(path: string, init: RequestInit = {}): Promise<{ blob: Blob; filename: string }> {
  const response = await rawFetch(path, init)
  const resolved = response.status === 401 ? await retryAfterRefresh(path, init) : response

  if (resolved.status === 403) throw new ApiForbiddenError()
  if (resolved.status === 404) throw new ApiNotFoundError()
  if (!resolved.ok) throw new Error(await friendlyErrorMessage(resolved))

  const blob = await resolved.blob()
  const filename = filenameFromContentDisposition(resolved.headers.get('Content-Disposition')) ?? 'kcalma-export'
  return { blob, filename }
}

async function handleResponse<T>(response: Response): Promise<T> {
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

  // Some 2xx responses (e.g. POST /api/push/subscriptions' 201) carry no body at all — `.json()`
  // on an empty string throws a SyntaxError, so parse manually and only when there's something there.
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

/** Backend errors (e.g. the Gemini-analysis 502, or a 429 rate limit) carry a Spanish
 *  {"message": "..."} body — prefer it over a generic status-code message. */
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
