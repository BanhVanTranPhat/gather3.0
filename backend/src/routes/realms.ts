import { Router, Request, Response } from 'express'
import { verifyToken } from '../auth'
import Realm from '../models/Realm'
import Profile from '../models/Profile'
import { v4 as uuidv4 } from 'uuid'
import Event from '../models/Event'
import Thread from '../models/Thread'
import Post from '../models/Post'
import Resource from '../models/Resource'
import ChatChannel from '../models/ChatChannel'
import ChatMessage from '../models/ChatMessage'

const router = Router()

function auth(req: Request): { id: string } | null {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return null
  return verifyToken(token)
}

/** MongoDB ObjectId là 24 hex chars. UUID có dạng 8-4-4-4-12. */
function isObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id)
}

function realmQuery(id: string) {
  return isObjectId(id) ? { $or: [{ _id: id }, { id }] } : { id }
}

router.get('/realms', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 50))
  const total = await Realm.countDocuments({ owner_id: user.id })
  const owned = await Realm.find({ owner_id: user.id }).select('id name share_id').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean()
  return res.json({
    realms: owned.map((r) => ({ id: (r as any).id || (r as any)._id?.toString(), name: r.name, share_id: r.share_id })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  })
})

router.get('/realms/by-share/:shareId', async (req: Request, res: Response) => {
  const realm = await Realm.findOne({ share_id: req.params.shareId }).lean()
  if (!realm) return res.status(404).json({ message: 'Not found' })
  return res.json({
    id: (realm as any).id || (realm as any)._id?.toString(),
    name: realm.name,
    owner_id: realm.owner_id,
    map_data: realm.map_data,
    share_id: realm.share_id,
    only_owner: realm.only_owner,
  })
})

router.get('/realms/:id', async (req: Request, res: Response) => {
  const realm = await Realm.findOne(realmQuery(req.params.id)).lean()
  if (!realm) return res.status(404).json({ message: 'Not found' })
  return res.json({
    id: (realm as any).id || (realm as any)._id?.toString(),
    name: realm.name,
    owner_id: realm.owner_id,
    map_data: realm.map_data,
    share_id: realm.share_id,
    only_owner: realm.only_owner,
  })
})

router.get('/realms/:id/members', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })
  const realm = await Realm.findOne(realmQuery(req.params.id)).lean()
  if (!realm) return res.status(404).json({ message: 'Not found' })

  const shareId = realm.share_id
  const members: { uid: string; displayName: string }[] = []

  // Owner
  const ownerProfile = await Profile.findOne({ id: realm.owner_id }).lean()
  members.push({
    uid: realm.owner_id,
    displayName: ownerProfile?.displayName || 'Owner',
  })

  if (shareId) {
    const visitors = await Profile.find({ visited_realms: shareId })
      .select('id displayName')
      .limit(200)
      .lean()
    for (const v of visitors) {
      if (v.id === realm.owner_id) continue
      members.push({
        uid: v.id,
        displayName: v.displayName || v.id.slice(0, 8),
      })
    }
  }

  return res.json({ members })
})

router.post('/realms', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })
  const { name, map_data } = req.body || {}
  const realm = await Realm.create({
    id: uuidv4(),
    owner_id: user.id,
    name: name || 'New Space',
    map_data: map_data || null,
    share_id: uuidv4().slice(0, 8),
    only_owner: false,
  })
  return res.status(201).json({
    id: realm.id || (realm as any)._id?.toString(),
    name: realm.name,
    share_id: realm.share_id,
    owner_id: realm.owner_id,
  })
})

router.patch('/realms/:id', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })
  const realm = await Realm.findOne(realmQuery(req.params.id))
  if (!realm || realm.owner_id !== user.id) return res.status(404).json({ message: 'Not found' })
  if (req.body.map_data !== undefined) realm.map_data = req.body.map_data
  if (req.body.name !== undefined) realm.name = req.body.name
  if (req.body.share_id !== undefined) realm.share_id = req.body.share_id
  if (req.body.only_owner !== undefined) realm.only_owner = req.body.only_owner
  await realm.save()
  return res.json(realm)
})

router.delete('/realms/:id', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })
  const realm = await Realm.findOne(realmQuery(req.params.id))
  if (!realm || realm.owner_id !== user.id) return res.status(404).json({ message: 'Not found' })

  const realmId = (realm as any).id || realm._id.toString()
  const shareId = realm.share_id
  const channels = await ChatChannel.find({ realmId }).select('_id').lean()
  const channelIds = channels.map((c) => c._id)
  const threads = await Thread.find({ realmId }).select('_id').lean()
  const threadIds = threads.map((t) => t._id)

  await Promise.all([
    Event.deleteMany({ realmId }),
    Resource.deleteMany({ realmId }),
    threadIds.length ? Post.deleteMany({ threadId: { $in: threadIds } }) : Promise.resolve(),
    Thread.deleteMany({ realmId }),
    channelIds.length ? ChatMessage.deleteMany({ channelId: { $in: channelIds } }) : Promise.resolve(),
    ChatChannel.deleteMany({ realmId }),
    Realm.deleteOne({ _id: realm._id }),
  ])
  if (shareId) {
    await Profile.updateMany({ visited_realms: shareId }, { $pull: { visited_realms: shareId } })
  }
  return res.status(204).send()
})

export default router