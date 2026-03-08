'use server'
import { createClient } from '../auth/server'

/** Không dùng Agora; trả về null (voice/video tắt). Có thể tích hợp WebRTC giống Gather sau. */
export async function generateToken(channelName: string) {
  if (!process.env.NEXT_PUBLIC_AGORA_APP_ID || !process.env.APP_CERTIFICATE) {
    return null
  }
  const auth = await createClient()
  const { data: { session } } = await auth.auth.getSession()
  if (!session) return null

  try {
    const { RtcRole, RtcTokenBuilder } = await import('agora-token')
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID
    const appCertificate = process.env.APP_CERTIFICATE
    const uid = 0
    const role = RtcRole.PUBLISHER
    const expireTime = 3600
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const expiredTs = currentTimestamp + expireTime
    const token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, expiredTs, expiredTs)
    return token
  } catch {
    return null
  }
}
