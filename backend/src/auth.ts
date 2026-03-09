import jwt from 'jsonwebtoken'

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required')
const JWT_SECRET: string = process.env.JWT_SECRET

export interface JwtPayload {
  userId: string
  email?: string
  displayName?: string
  [key: string]: unknown
}

/** Verify JWT (giống Gather). */
export function verifyToken(accessToken: string): { id: string; user_metadata: { email?: string; displayName?: string }; email?: string } | null {
  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET) as unknown as JwtPayload
    const userId = (decoded as any).userId || (decoded as any).id || (decoded as any).sub
    if (!userId) return null
    return {
      id: userId,
      email: decoded.email,
      user_metadata: { email: decoded.email, displayName: decoded.displayName },
    }
  } catch {
    return null
  }
}
