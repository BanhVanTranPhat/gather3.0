import { Router, Request, Response } from 'express'
import { verifyToken } from '../auth'
import Event from '../models/Event'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

function auth(req: Request): { id: string } | null {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return null
  return verifyToken(token)
}

router.get('/events', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const { realmId, month, year } = req.query
  if (!realmId) return res.status(400).json({ message: 'realmId required' })

  const filter: any = { realmId }

  if (month && year) {
    const m = Number(month)
    const y = Number(year)
    const start = new Date(y, m, 1)
    const end = new Date(y, m + 1, 0, 23, 59, 59, 999)
    filter.startTime = { $gte: start, $lte: end }
  }

  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50))
  const total = await Event.countDocuments(filter)
  const events = await Event.find(filter).sort({ startTime: 1 }).skip((page - 1) * limit).limit(limit).lean()
  return res.json({ events, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } })
})

router.post('/events', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const { realmId, title, description, startTime, endTime, location, maxParticipants, createdByName } = req.body
  if (!realmId || !title || !startTime || !endTime) {
    return res.status(400).json({ message: 'realmId, title, startTime, endTime required' })
  }
  const parsedStart = new Date(startTime)
  const parsedEnd = new Date(endTime)
  if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
    return res.status(400).json({ message: 'Invalid date format' })
  }
  if (parsedEnd <= parsedStart) {
    return res.status(400).json({ message: 'End time must be after start time' })
  }

  const event = await Event.create({
    eventId: uuidv4(),
    realmId,
    title: (title as string).slice(0, 200),
    description: (description || '').slice(0, 2000),
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    createdBy: user.id,
    createdByName: createdByName || '',
    attendees: [{ userId: user.id, username: createdByName || '', status: 'going' }],
    location: location || '',
    maxParticipants: maxParticipants || undefined,
  })

  return res.status(201).json({ event })
})

router.patch('/events/:id', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const event = await Event.findOne({ eventId: req.params.id })
  if (!event) return res.status(404).json({ message: 'Not found' })
  if (event.createdBy !== user.id) return res.status(403).json({ message: 'Forbidden' })

  if (req.body.title !== undefined) event.title = req.body.title.slice(0, 200)
  if (req.body.description !== undefined) event.description = req.body.description.slice(0, 2000)
  if (req.body.startTime !== undefined) event.startTime = new Date(req.body.startTime)
  if (req.body.endTime !== undefined) event.endTime = new Date(req.body.endTime)
  if (req.body.location !== undefined) event.location = req.body.location
  if (req.body.maxParticipants !== undefined) event.maxParticipants = req.body.maxParticipants

  await event.save()
  return res.json({ event })
})

router.delete('/events/:id', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const event = await Event.findOne({ eventId: req.params.id })
  if (!event) return res.status(404).json({ message: 'Not found' })
  if (event.createdBy !== user.id) return res.status(403).json({ message: 'Forbidden' })

  await Event.deleteOne({ _id: event._id })
  return res.status(204).send()
})

router.post('/events/:id/rsvp', async (req: Request, res: Response) => {
  const user = auth(req)
  if (!user) return res.status(401).json({ message: 'Unauthorized' })

  const { status, username } = req.body
  if (!['going', 'maybe', 'not_going'].includes(status)) {
    return res.status(400).json({ message: 'status must be going, maybe, or not_going' })
  }
  const safeUsername = typeof username === 'string' ? username.slice(0, 100) : ''

  const updated = await Event.findOneAndUpdate(
    { eventId: req.params.id, 'attendees.userId': user.id },
    { $set: { 'attendees.$.status': status, 'attendees.$.username': safeUsername || undefined } },
    { new: true }
  )

  if (updated) return res.json({ event: updated })

  const event = await Event.findOne({ eventId: req.params.id })
  if (!event) return res.status(404).json({ message: 'Not found' })

  if (status === 'going' && event.maxParticipants) {
    const goingCount = event.attendees.filter((a) => a.status === 'going').length
    if (goingCount >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' })
    }
  }

  const pushed = await Event.findOneAndUpdate(
    { eventId: req.params.id, 'attendees.userId': { $ne: user.id } },
    { $push: { attendees: { userId: user.id, username: safeUsername, status } } },
    { new: true }
  )
  return res.json({ event: pushed || event })
})

export default router
