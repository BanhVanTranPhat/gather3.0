/**
 * Client gọi backend gather-clone (Express + MongoDB).
 * Token lưu localStorage key: gather_clone_token
 */

const TOKEN_KEY = 'gather_clone_token'

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (typeof window === 'undefined') return
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}
): Promise<T> {
  const url = `${getBaseUrl()}${path}`
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body != null ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (data as { message?: string }).message || res.statusText
    throw new Error(msg)
  }
  return data as T
}

export const api = {
  get: <T = unknown>(path: string) => request<T>(path),
  post: <T = unknown>(path: string, body: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T = unknown>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
}

export async function authLogin(email: string, password: string) {
  const data = await api.post<{ token: string; user: { id: string; email: string; displayName?: string } }>(
    '/auth/login',
    { email, password }
  )
  setToken(data.token)
  return data as { token: string; user: { id: string; email: string; displayName?: string } }
}

export async function authRegister(email: string, password: string, displayName?: string) {
  const data = await api.post<{ token: string; user: { id: string; email: string; displayName?: string } }>(
    '/auth/register',
    { email, password, displayName }
  )
  setToken(data.token)
  return data as { token: string; user: { id: string; email: string; displayName?: string } }
}

export function authLogout() {
  setToken(null)
}
