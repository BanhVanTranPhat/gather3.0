import 'dotenv/config'
import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { sockets } from './sockets/sockets'
import routes from './routes/routes'
import realmsRouter from './routes/realms'
import profilesRouter from './routes/profiles'
import authRouter from './routes/auth'
import chatRouter from './routes/chat'
import eventsRouter from './routes/events'
import resourcesRouter from './routes/resources'
import forumRouter from './routes/forum'
import adminRouter from './routes/admin'
import { connectDb } from './db'
import { sessionManager } from './session'

const app = express()
const server = http.createServer(app)

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

const io = new SocketIOServer(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    credentials: true,
  },
})

app.use(routes())
app.use(authRouter)
app.use(realmsRouter)
app.use(profilesRouter)
app.use(chatRouter)
app.use(eventsRouter)
app.use(resourcesRouter)
app.use(forumRouter)
app.use(adminRouter)
sockets(io)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ message: 'Internal server error' })
})

const PORT = process.env.PORT || 5001

connectDb().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
  })
}).catch((err) => {
  console.error('MongoDB connection failed:', err)
  process.exit(1)
})


export { io }