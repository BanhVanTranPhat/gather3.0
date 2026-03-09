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
import { connectDb } from './db'
import { sessionManager } from './session'

require('dotenv').config()

const app = express()
const server = http.createServer(app)

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}))
app.use(express.json({ limit: '50mb' }))

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
sockets(io)

const PORT = process.env.PORT || 4000

connectDb().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
  })
}).catch((err) => {
  console.error('MongoDB connection failed:', err)
  process.exit(1)
})


export { io }