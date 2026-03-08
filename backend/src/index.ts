import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { sockets } from './sockets/sockets'
import routes from './routes/routes'
import realmsRouter from './routes/realms'
import profilesRouter from './routes/profiles'
import authRouter from './routes/auth'
import { connectDb } from './db'
import { sessionManager } from './session'

require('dotenv').config()

const app = express()
const server = http.createServer(app)

app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
}))
app.use(express.json({ limit: '50mb' }))

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL
  }
})

app.use(routes())
app.use(authRouter)
app.use(realmsRouter)
app.use(profilesRouter)
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