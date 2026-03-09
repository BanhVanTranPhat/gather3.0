import { Router, Request, Response } from 'express'
import { verifyToken } from '../auth'
import ChatChannel from '../models/ChatChannel'
import ChatMessage from '../models/ChatMessage'
import { users } from '../Users'
import { formatEmailToName } from '../utils'

const router = Router()

function auth(req: Request): { id: string; email?: string; displayName?: string } | null {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return null
  const user = verifyToken(token)
  if (!user) return null
  return { id: user.id, email: user.email, displayName: user.user_metadata?.displayName }
}

async function ensureDefaultChannels(realmId: string, userId: string) {
  const existing = await ChatChannel.findOne({ realmId, type: 'channel' })
  if (existing) return

  await ChatChannel.insertMany([
    { realmId, name: 'general', type: 'channel', members: [], createdBy: userId },
    { realmId, name: 'social', type: 'channel', members: [], createdBy: userId },
  ])
}

router.get('/chat/channels/:realmId', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const { realmId } = req.params
  await ensureDefaultChannels(realmId, user.id)

  const channels = await ChatChannel.find({
    realmId,
    $or: [
      { type: 'channel' },
      { type: 'dm', members: user.id },
    ],
  }).sort({ type: 1, createdAt: 1 })

  return res.json({ channels })
})

router.post('/chat/channels', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const { realmId, name, type, members } = req.body
  if (!realmId || !name || !type) {
    return res.status(400).json({ message: 'realmId, name, type required' })
  }

  if (type === 'dm') {
    if (!members || !Array.isArray(members) || members.length !== 2) {
      return res.status(400).json({ message: 'DM requires exactly 2 members' })
    }
    const existing = await ChatChannel.findOne({
      realmId,
      type: 'dm',
      members: { $all: members, $size: 2 },
    })
    if (existing) return res.json({ channel: existing })
  }

  const channel = await ChatChannel.create({
    realmId,
    name: name.slice(0, 30),
    type,
    members: members || [],
    createdBy: user.id,
  })

  return res.json({ channel })
})

router.get('/chat/messages/:channelId', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const { channelId } = req.params
  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50))
  const skip = (page - 1) * limit

  const messages = await ChatMessage.find({ channelId })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .lean()

  return res.json({ messages: messages.reverse(), page, hasMore: messages.length === limit })
})

router.delete('/chat/channels/:channelId', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const channel = await ChatChannel.findById(req.params.channelId)
  if (!channel) return res.status(404).json({ message: 'Channel not found' })
  if (channel.createdBy !== user.id) return res.status(403).json({ message: 'Not owner' })
  if (channel.type === 'channel' && ['general', 'social'].includes(channel.name)) {
    return res.status(400).json({ message: 'Cannot delete default channels' })
  }

  await ChatMessage.deleteMany({ channelId: channel._id })
  await channel.deleteOne()
  return res.json({ success: true })
})

export default router
