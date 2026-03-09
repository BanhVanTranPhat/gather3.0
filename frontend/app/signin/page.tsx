'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleLogin } from '@react-oauth/google'
import { Mail, ArrowRight, RefreshCw } from 'lucide-react'
import { authLogin, authRegister, authGoogle } from '@/utils/backendApi'

type Stage = 'email' | 'password'

export default function SignIn() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Email không hợp lệ')
      return
    }
    setError('')
    setStage('password')
  }

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

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse?.credential) return
    setError('')
    setLoading(true)
    try {
      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]))
      const data = await authGoogle({
        googleId: payload.sub,
        email: payload.email || '',
        username: payload.name || payload.email?.split('@')[0],
        avatar: payload.picture,
      })
      const token = data.token
      if (token && typeof document !== 'undefined') {
        document.cookie = `gather_clone_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
      }
      router.push('/app')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập Google thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {stage === 'email' && (
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
            Chào mừng
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-8">
            Nhập email để đăng nhập hoặc tạo tài khoản mới
          </p>

          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 dark:text-gray-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email"
                autoFocus
                autoComplete="email"
                placeholder="ban@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm bg-slate-50/50 dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all focus:ring-2 ${
                  error ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 dark:border-gray-600 focus:border-teal-500 focus:ring-teal-100 dark:focus:ring-teal-900/50'
                }`}
              />
            </div>
            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
          </div>

          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-teal-500/25 hover:shadow-teal-500/30"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Nhận mã xác thực <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
            <span className="text-xs text-slate-400">hoặc</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
          </div>

          <div className="flex justify-center mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Đăng nhập Google thất bại')}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
            />
          </div>

          <button
            onClick={() => {
              setStage('password')
              setError('')
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-200 dark:border-gray-600 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700/50 text-slate-600 dark:text-gray-300 text-sm font-semibold transition-all"
          >
            Đăng nhập bằng mật khẩu
          </button>
        </div>
      )}

      {stage === 'password' && (
        <div>
          <button
            onClick={() => {
              setStage('email')
              setError('')
            }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-600 mb-6 transition-colors"
          >
            ← Quay lại
          </button>

          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
            {isRegister ? 'Đăng ký' : 'Đăng nhập'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">
            {isRegister ? 'Tạo tài khoản với email và mật khẩu' : 'Nhập email và mật khẩu của bạn'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="ban@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50/50 dark:bg-gray-700 text-slate-900 dark:text-white text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/50 transition-all"
                required
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-gray-300 mb-1.5">
                  Tên hiển thị (tùy chọn)
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Tên của bạn"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50/50 dark:bg-gray-700 text-slate-900 dark:text-white text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/50 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-gray-300 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50/50 dark:bg-gray-700 text-slate-900 dark:text-white text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/50 transition-all"
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold transition-all disabled:opacity-60 mb-4 shadow-md shadow-teal-500/25"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : isRegister ? (
                'Đăng ký'
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <button
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
            }}
            className="w-full text-center text-xs text-slate-500 hover:text-teal-600"
          >
            {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
          </button>
        </div>
      )}
    </div>
  )
}
