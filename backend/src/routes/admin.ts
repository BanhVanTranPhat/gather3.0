import { Router, Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import Profile from '../models/Profile'
import Realm from '../models/Realm'
import Event from '../models/Event'
import Resource from '../models/Resource'
import Thread from '../models/Thread'
import Post from '../models/Post'
import ChatMessage from '../models/ChatMessage'
import ChatChannel from '../models/ChatChannel'

const router = Router()
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required')
const JWT_SECRET: string = process.env.JWT_SECRET

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role?: string }
    const user = await User.findById(decoded.userId).lean()
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: admin only' })
    ;(req as any).adminUser = user
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

router.use('/admin', requireAdmin)

// ── Overview stats ──
router.get('/admin/stats', async (_req: Request, res: Response) => {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [totalUsers, newUsers30d, newUsers7d, totalRealms, totalEvents, totalResources, totalThreads, totalPosts, totalMessages] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Realm.countDocuments(),
    Event.countDocuments(),
    Resource.countDocuments(),
    Thread.countDocuments(),
    Post.countDocuments(),
    ChatMessage.countDocuments(),
  ])

  return res.json({
    totalUsers, newUsers30d, newUsers7d,
    totalRealms, totalEvents, totalResources,
    totalThreads, totalPosts, totalMessages,
  })
})

// ── User registration trend (last 12 months) ──
router.get('/admin/stats/users-trend', async (_req: Request, res: Response) => {
  const now = new Date()
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)

  const pipeline = await User.aggregate([
    { $match: { createdAt: { $gte: twelveMonthsAgo } } },
    { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, count: { $sum: 1 } } },
  ])

  const countMap = new Map(pipeline.map((r) => [`${r._id.y}-${r._id.m}`, r.count]))
  const months: { label: string; count: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    months.push({
      label: d.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
      count: countMap.get(key) || 0,
    })
  }
  return res.json({ months })
})

// ── Resource distribution by type ──
router.get('/admin/stats/resources-by-type', async (_req: Request, res: Response) => {
  const result = await Resource.aggregate([
    { $group: { _id: '$content_type', count: { $sum: 1 } } },
  ])
  return res.json({ distribution: result.map((r) => ({ type: r._id, count: r.count })) })
})

// ── Spaces per user (top 10 owners) ──
router.get('/admin/stats/realms-per-owner', async (_req: Request, res: Response) => {
  const result = await Realm.aggregate([
    { $group: { _id: '$owner_id', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ])
  const ownerIds = result.map((r) => r._id)
  const users = await User.find({ _id: { $in: ownerIds } }, 'displayName email').lean()
  const userMap = new Map(users.map((u) => [(u as any)._id.toString(), u.displayName || u.email]))
  return res.json({
    owners: result.map((r) => ({ ownerId: r._id, name: userMap.get(r._id) || r._id, count: r.count })),
  })
})

// ── Forum activity (threads + posts per day, last 30 days) ──
router.get('/admin/stats/forum-activity', async (_req: Request, res: Response) => {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0)

  const [threadAgg, postAgg] = await Promise.all([
    Thread.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, d: { $dayOfMonth: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
    Post.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, d: { $dayOfMonth: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
  ])

  const threadMap = new Map(threadAgg.map((r) => [`${r._id.y}-${r._id.m}-${r._id.d}`, r.count]))
  const postMap = new Map(postAgg.map((r) => [`${r._id.y}-${r._id.m}-${r._id.d}`, r.count]))

  const days: { label: string; threads: number; posts: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    days.push({
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      threads: threadMap.get(key) || 0,
      posts: postMap.get(key) || 0,
    })
  }
  return res.json({ days })
})

// ── CRUD: Users list ──
router.get('/admin/users', async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = 20
  const q = req.query.q as string
  const filter: any = {}
  if (q) {
    const escaped = String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.$or = [{ email: new RegExp(escaped, 'i') }, { displayName: new RegExp(escaped, 'i') }]
  }
  const total = await User.countDocuments(filter)
  const users = await User.find(filter, '-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean()
  return res.json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } })
})

router.patch('/admin/users/:id/role', async (req: Request, res: Response) => {
  const { role } = req.body
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' })
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password').lean()
  if (!user) return res.status(404).json({ message: 'User not found' })
  return res.json({ user })
})

router.delete('/admin/users/:id', async (req: Request, res: Response) => {
  const admin = (req as any).adminUser
  if (admin._id.toString() === req.params.id) return res.status(400).json({ message: 'Cannot delete yourself' })
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  const uid = user._id.toString()
  await Promise.all([
    Profile.deleteMany({ id: uid }),
    Realm.deleteMany({ owner_id: uid }),
    Event.deleteMany({ createdBy: uid }),
    Resource.deleteMany({ createdBy: uid }),
    Thread.deleteMany({ authorId: uid }),
    Post.deleteMany({ authorId: uid }),
    User.findByIdAndDelete(uid),
  ])
  return res.status(204).send()
})

// ── CRUD: Realms ──
router.get('/admin/realms', async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = 20
  const total = await Realm.countDocuments()
  const realms = await Realm.find({}, '-map_data').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean()
  return res.json({ realms, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } })
})

router.delete('/admin/realms/:id', async (req: Request, res: Response) => {
  const realm = await Realm.findById(req.params.id)
  if (!realm) return res.status(404).json({ message: 'Realm not found' })
  const realmId = (realm as any).id || realm._id.toString()
  const shareId = realm.share_id
  await Promise.all([
    Event.deleteMany({ realmId }),
    Thread.deleteMany({ realmId }).then(async () => {
      const threadIds = (await Thread.find({ realmId }).select('_id').lean()).map((t) => t._id)
      if (threadIds.length) await Post.deleteMany({ threadId: { $in: threadIds } })
    }),
    Resource.deleteMany({ realmId }),
    ChatChannel.find({ realmId }).then(async (channels) => {
      const channelIds = channels.map((c) => c._id)
      if (channelIds.length) await ChatMessage.deleteMany({ channelId: { $in: channelIds } })
      await ChatChannel.deleteMany({ realmId })
    }),
    Realm.findByIdAndDelete(req.params.id),
  ])
  if (shareId) {
    await Profile.updateMany({ visited_realms: shareId }, { $pull: { visited_realms: shareId } })
  }
  return res.status(204).send()
})

// ── CRUD: Events ──
router.get('/admin/events', async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = 20
  const total = await Event.countDocuments()
  const events = await Event.find().sort({ startTime: -1 }).skip((page - 1) * limit).limit(limit).lean()
  return res.json({ events, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } })
})

router.delete('/admin/events/:id', async (req: Request, res: Response) => {
  await Event.findOneAndDelete({ eventId: req.params.id })
  return res.status(204).send()
})

// ── CRUD: Resources ──
router.get('/admin/resources', async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = 20
  const total = await Resource.countDocuments()
  const resources = await Resource.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean()
  return res.json({ resources, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } })
})

router.delete('/admin/resources/:id', async (req: Request, res: Response) => {
  await Resource.findByIdAndDelete(req.params.id)
  return res.status(204).send()
})

// ── CRUD: Threads ──
router.get('/admin/threads', async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = 20
  const total = await Thread.countDocuments()
  const threads = await Thread.find().sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean()
  return res.json({ threads, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } })
})

router.delete('/admin/threads/:id', async (req: Request, res: Response) => {
  await Post.deleteMany({ threadId: req.params.id })
  await Thread.findByIdAndDelete(req.params.id)
  return res.status(204).send()
})

export default router
