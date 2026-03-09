import { Router, Request, Response } from 'express'
import { verifyToken } from '../auth'
import Profile from '../models/Profile'

const router = Router()

function auth(req: Request): { id: string } | null {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return null
  return verifyToken(token)
}

router.get('/profiles/me', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })
  let profile = await Profile.findOne({ id: user.id }).lean()
  if (!profile) {
    await Profile.create({ id: user.id, visited_realms: [], skin: undefined })
    profile = await Profile.findOne({ id: user.id }).lean()
  }
  return res.json(profile || { id: user.id, skin: undefined, visited_realms: [] })
})

router.patch('/profiles/me', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const allowed: Record<string, unknown> = {}
  const ALLOWED_FIELDS = ['displayName', 'bio', 'avatar', 'skin', 'avatarConfig'] as const
  for (const key of ALLOWED_FIELDS) {
    if (req.body[key] !== undefined) allowed[key] = req.body[key]
  }
  if (typeof allowed.displayName === 'string') allowed.displayName = (allowed.displayName as string).slice(0, 100)
  if (typeof allowed.bio === 'string') allowed.bio = (allowed.bio as string).slice(0, 500)

  const profile = await Profile.findOneAndUpdate(
    { id: user.id },
    { $set: allowed },
    { upsert: true, new: true }
  ).lean()
  return res.json(profile)
})

export default router