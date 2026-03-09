import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User, { hashPassword, comparePassword } from '../models/User'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-12345'

router.post('/auth/register', async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body || {}
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' })
  const existing = await User.findOne({ email: String(email).trim().toLowerCase() })
  if (existing) return res.status(400).json({ message: 'Email already registered' })
  const hashed = await hashPassword(password)
  const user = await User.create({
    email: String(email).trim().toLowerCase(),
    password: hashed,
    displayName: displayName ? String(displayName).trim() : undefined,
  })
  const token = jwt.sign(
    { userId: (user as any)._id.toString(), email: user.email, displayName: user.displayName },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  return res.status(201).json({
    token,
    user: { id: (user as any)._id.toString(), email: user.email, displayName: user.displayName },
  })
})

router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' })
  const normalizedEmail = String(email).trim().toLowerCase()
  const user = await User.findOne({ email: normalizedEmail })
  if (!user) return res.status(401).json({ message: 'Email chưa đăng ký hoặc sai mật khẩu' })
  if (!user.password) return res.status(401).json({ message: 'Tài khoản đăng nhập bằng Google. Vui lòng dùng Google.' })
  const ok = await comparePassword(String(password), user.password)
  if (!ok) return res.status(401).json({ message: 'Email chưa đăng ký hoặc sai mật khẩu' })
  const token = jwt.sign(
    { userId: (user as any)._id.toString(), email: user.email, displayName: user.displayName },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  return res.json({
    token,
    user: { id: (user as any)._id.toString(), email: user.email, displayName: user.displayName },
  })
})

router.post('/auth/google', async (req: Request, res: Response) => {
  const { googleId, email, username, avatar } = req.body || {}
  if (!googleId || !email) return res.status(400).json({ message: 'Google ID and email are required' })
  const normalizedEmail = String(email).trim().toLowerCase()
  let user = await User.findOne({ googleId })
  if (!user) {
    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) {
      (existing as any).googleId = googleId
      if (avatar) (existing as any).avatar = avatar
      user = await existing.save()
    } else {
      user = await User.create({
        email: normalizedEmail,
        googleId,
        displayName: username ? String(username).trim() : normalizedEmail.split('@')[0],
        avatar: avatar || undefined,
      })
    }
  } else if (avatar) {
    (user as any).avatar = avatar
    await user.save()
  }
  const token = jwt.sign(
    { userId: (user as any)._id.toString(), email: user.email, displayName: user.displayName },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  return res.json({
    token,
    user: { id: (user as any)._id.toString(), email: user.email, displayName: user.displayName, avatar: (user as any).avatar },
  })
})

router.get('/auth/me', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email?: string; displayName?: string }
    return res.json({ id: decoded.userId, email: decoded.email, displayName: decoded.displayName })
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
})

export default router