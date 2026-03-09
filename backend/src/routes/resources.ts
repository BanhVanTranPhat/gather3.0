import { Router, Request, Response } from 'express'
import { verifyToken } from '../auth'
import Resource from '../models/Resource'

const router = Router()

function auth(req: Request): { id: string } | null {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return null
  return verifyToken(token)
}

router.get('/resources', async (req: Request, res: Response) => {
  const { realmId, type, q, page: pageStr } = req.query
  const page = Math.max(1, Number(pageStr) || 1)
  const limit = 12

  const filter: any = { isApproved: true }
  if (realmId) filter.$or = [{ realmId }, { realmId: null }]
  if (type && type !== 'all') filter.content_type = type

  let query = Resource.find(filter)

  if (q && typeof q === 'string' && q.trim()) {
    const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escaped, 'i')
    filter.$and = [{ $or: [{ title: regex }, { author: regex }, { description: regex }] }]
    query = Resource.find(filter)
  }

  const total = await Resource.countDocuments(filter)
  const resources = await query
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  return res.json({
    resources,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  })
})

router.post('/resources', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const { title, author, content_type, url, thumbnail_url, description, realmId, createdByName } = req.body
  if (!title || !content_type) {
    return res.status(400).json({ message: 'title and content_type required' })
  }

  const resource = await Resource.create({
    title: title.slice(0, 300),
    author: (author || '').slice(0, 200),
    content_type,
    url: url || '',
    thumbnail_url: thumbnail_url || '',
    description: (description || '').slice(0, 2000),
    realmId: realmId || null,
    createdBy: user.id,
    createdByName: createdByName || '',
    isApproved: true,
  })

  return res.status(201).json({ resource })
})

router.delete('/resources/:id', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const resource = await Resource.findById(req.params.id)
  if (!resource) return res.status(404).json({ message: 'Not found' })
  if (resource.createdBy !== user.id) return res.status(403).json({ message: 'Forbidden' })

  await Resource.deleteOne({ _id: resource._id })
  return res.status(204).send()
})

export default router
