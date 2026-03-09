'use client'

import { useRouter } from 'next/navigation'
import { GoogleOAuthProvider } from '@react-oauth/google'
import VideoDemo from './VideoDemo'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'no-client-id-configured'}>
    <div className="min-h-screen flex bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-gray-100">
      <VideoDemo />

      <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col justify-between min-h-screen bg-white dark:bg-gray-800 border-l border-slate-200 dark:border-gray-700 shadow-xl shadow-slate-200/50 dark:shadow-none px-6 sm:px-10 py-8">
        <div>
          <div
            className="flex items-center gap-2.5 mb-10 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-200/50 dark:shadow-none">
              G
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">
              The Gathering
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center">
          <div className="w-full">
            {children}
          </div>
        </div>

        <div className="flex gap-6 pt-6 text-xs text-slate-400 dark:text-gray-500">
          <a href="/privacy-policy" className="hover:text-slate-600 dark:hover:text-gray-300 transition-colors">
            Trợ giúp
          </a>
          <a href="/privacy-policy" className="hover:text-slate-600 dark:hover:text-gray-300 transition-colors">
            Điều khoản
          </a>
          <a href="/privacy-policy" className="hover:text-slate-600 dark:hover:text-gray-300 transition-colors">
            Quyền riêng tư
          </a>
        </div>
      </div>
    </div>
    </GoogleOAuthProvider>
  )
}
