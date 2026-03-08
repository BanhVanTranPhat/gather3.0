'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authLogin, authRegister } from '@/utils/backendApi'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = isRegister
        ? await authRegister(email, password, displayName || undefined)
        : await authLogin(email, password)
      const token = data.token
      if (token && typeof document !== 'undefined') {
        document.cookie = `gather_clone_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
      }
      router.push('/app')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center w-full pt-24 px-4">
      <h1 className="text-2xl font-bold mb-4">{isRegister ? 'Đăng ký' : 'Đăng nhập'}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-3 py-2 border rounded"
          required
        />
        {isRegister && (
          <input
            type="text"
            placeholder="Tên hiển thị (tùy chọn)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="px-3 py-2 border rounded"
          />
        )}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="py-2 bg-blue-600 text-white rounded disabled:opacity-50">
          {loading ? 'Đang xử lý...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
        </button>
      </form>
      <button
        type="button"
        onClick={() => { setIsRegister(!isRegister); setError(''); }}
        className="mt-4 text-sm text-gray-600 underline"
      >
        {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
      </button>
    </div>
  )
}
