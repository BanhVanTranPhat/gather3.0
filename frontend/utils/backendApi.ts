/**
 * Client gọi backend Gathering (Express + MongoDB).
 * Token lưu localStorage key: gathering_token
 */

const TOKEN_KEY = 'gathering_token'

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (typeof window === 'undefined') return
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`
  }
}

async function request<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}
): Promise<T> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${path}`
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body != null ? JSON.stringify(options.body) : undefined,
    })
  } catch (e) {
    const msg = (e as Error)?.message || ''
    if (/failed to fetch|networkerror|load failed/i.test(msg))
      throw new Error('Không kết nối được server. Chạy backend: cd backend && npm run dev (port 5001).')
    throw e
  }

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

export async function authGoogle(payload: { credential?: string; googleId?: string; email?: string; username?: string; avatar?: string }) {
  const data = await api.post<{ token: string; user: { id: string; email: string; displayName?: string; avatar?: string; role?: string } }>(
    '/auth/google',
    payload
  )
  setToken(data.token)
  return data
}

export async function authSendOtp(email: string) {
  return api.post<{ sent: boolean; isNewUser: boolean }>('/auth/send-otp', { email })
}

export async function authVerifyOtp(email: string, code: string, displayName?: string) {
  const data = await api.post<{ token: string; user: { id: string; email: string; displayName?: string } }>(
    '/auth/verify-otp',
    { email, code, displayName }
  )
  setToken(data.token)
  return data
}

export function authLogout() {
  setToken(null)
}
