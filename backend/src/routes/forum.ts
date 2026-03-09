import { Router, Request, Response } from 'express'
import { verifyToken } from '../auth'
import Thread from '../models/Thread'
import Post from '../models/Post'

const router = Router()

function auth(req: Request): { id: string } | null {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return null
  return verifyToken(token)
}

router.get('/forum/threads', async (req: Request, res: Response) => {
  const { realmId, page: pageStr } = req.query
  if (!realmId) return res.status(400).json({ message: 'realmId required' })

  const page = Math.max(1, Number(pageStr) || 1)
  const limit = 20

  const total = await Thread.countDocuments({ realmId })
  const threads = await Thread.find({ realmId })
    .sort({ lastPostAt: -1, updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  return res.json({
    threads,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  })
})

router.get('/forum/threads/:id', async (req: Request, res: Response) => {
  const thread = await Thread.findById(req.params.id).lean()
  if (!thread) return res.status(404).json({ message: 'Not found' })

  const { page: pageStr } = req.query
  const page = Math.max(1, Number(pageStr) || 1)
  const limit = 20

  const total = await Post.countDocuments({ threadId: thread._id })
  const posts = await Post.find({ threadId: thread._id })
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  return res.json({
    thread,
    posts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  })
})

router.post('/forum/threads', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const { realmId, title, body, authorName } = req.body
  if (!realmId || !title) return res.status(400).json({ message: 'realmId and title required' })

  const thread = await Thread.create({
    title: title.slice(0, 300),
    body: (body || '').slice(0, 5000),
    authorId: user.id,
    authorName: authorName || '',
    realmId,
    postCount: 0,
    lastPostAt: new Date(),
  })

  return res.status(201).json({ thread })
})

router.post('/forum/threads/:id/posts', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const thread = await Thread.findById(req.params.id)
  if (!thread) return res.status(404).json({ message: 'Thread not found' })

  const { body, authorName } = req.body
  if (!body || !body.trim()) return res.status(400).json({ message: 'body required' })

  const post = await Post.create({
    threadId: thread._id,
    body: body.slice(0, 5000),
    authorId: user.id,
    authorName: (authorName || '').slice(0, 100),
  })

  await Thread.findByIdAndUpdate(thread._id, {
    $inc: { postCount: 1 },
    $set: { lastPostAt: new Date() },
  })

  return res.status(201).json({ post })
})

router.delete('/forum/threads/:id', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const thread = await Thread.findById(req.params.id)
  if (!thread) return res.status(404).json({ message: 'Not found' })
  if (thread.authorId !== user.id) return res.status(403).json({ message: 'Forbidden' })

  await Post.deleteMany({ threadId: thread._id })
  await Thread.deleteOne({ _id: thread._id })
  return res.status(204).send()
})

router.delete('/forum/posts/:id', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ message: 'Not found' })
  if (post.authorId !== user.id) return res.status(403).json({ message: 'Forbidden' })

  await Post.deleteOne({ _id: post._id })
  await Thread.findByIdAndUpdate(post.threadId, { $inc: { postCount: -1 } })
  return res.status(204).send()
})

export default router
