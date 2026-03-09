/**
 * Server auth: đọc token từ cookie và gọi backend (Express + MongoDB).
 */
import { cookies } from 'next/headers'

const TOKEN_KEY = 'gather_clone_token'

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
}

async function getServerToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(TOKEN_KEY)?.value ?? null
}

async function request(path: string, token: string | null, options: { method?: string; body?: unknown } = {}) {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${path}`
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body != null ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error((data as any).message || res.statusText)
    return data
  } catch (e: any) {
    clearTimeout(timeoutId)
    if (e?.name === 'AbortError') throw new Error('Backend timeout. Is the server running?')
    if (e?.cause?.code === 'ECONNREFUSED' || String(e?.message || '').toLowerCase().includes('fetch failed')) {
      throw new Error(`Cannot reach backend at ${baseUrl}. Start it with: npm run dev (in backend folder).`)
    }
    throw e
  }
}

export async function createClient() {
  const token = await getServerToken()

  return {
    auth: {
      async getSession() {
        if (!token) return { data: { session: null } }
        try {
          const user = await request('/auth/me', token)
          return { data: { session: { access_token: token, user: { id: user.id, email: user.email, user_metadata: user } } } }
        } catch {
          return { data: { session: null } }
        }
      },
      async getUser(_accessToken?: string) {
        const t = _accessToken || token
        if (!t) return { data: { user: null }, error: { message: 'No token' } }
        try {
          const user = await request('/auth/me', t)
          return { data: { user: { id: user.id, email: user.email, user_metadata: user } }, error: null }
        } catch (e: any) {
          return { data: { user: null }, error: { message: e?.message || 'Invalid token' } }
        }
      },
    },
    from(table: string) {
      let path = table === 'realms' ? '/realms' : '/profiles/me'
      let id: string | null = null
      let method = 'GET'
      let body: any = undefined

      const run = () => request(path, token, { method, body })

      return {
        select(_cols?: string) {
          return this
        },
        eq(col: string, val: string) {
          if (col === 'id') id = val
          if (table === 'realms' && col === 'id') path = `/realms/${val}`
          if (table === 'realms' && col === 'share_id') path = `/realms/by-share/${val}`
          return this
        },
        single: async () => {
          try {
            const data = await run()
            return { data: Array.isArray(data) ? data[0] : data, error: null }
          } catch (e: any) {
            return { data: null, error: { message: e?.message || 'Request failed' } }
          }
        },
        insert(obj: any) {
          method = 'POST'
          body = table === 'realms' ? { name: obj.name, map_data: obj.map_data } : obj
          path = table === 'realms' ? '/realms' : '/profiles/me'
          return this
        },
        update(obj: any) {
          method = 'PATCH'
          body = obj
          if (table === 'realms' && id) path = `/realms/${id}`
          return this
        },
        then(resolve: (r: any) => any, reject?: (e: any) => void) {
          return run()
            .then((d) => resolve({ data: method === 'POST' ? (Array.isArray(d) ? d : [d]) : d, error: null }))
            .catch((e) => (reject ? reject(e) : resolve({ data: null, error: { message: e?.message || 'Request failed' } })))
        },
      }
    },
  }
}
