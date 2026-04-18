import QRCode from 'qrcode'
import { useMultiFileAuthState } from '@whiskeysockets/baileys'
import express from 'express'
import helmet from "helmet"
import { Server } from 'socket.io'
import http from 'http'
import makeWASocket, { fetchLatestBaileysVersion } from '@whiskeysockets/baileys'

import { sendToLaravel } from './bot/bot.js'
import pino from 'pino'
import fs from 'fs'

const app = express()
app.use(helmet())
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

app.use(express.static('public'))
app.use(express.json())


app.post('/session/new', (req, res) => {
  const { sessionId } = req.body
  if (!sessionId) return res.status(400).json({ error: 'sessionId requerido' })
  if (sessions[sessionId]) return res.status(400).json({ error: 'Sesión ya existe' })
  startSession(sessionId)
  res.json({ ok: true, sessionId })
})

app.get('/sessions', (req, res) => {
  const list = Object.entries(sessions).map(([id, s]) => ({
    id,
    connected: s.connected
  }))
  res.json(list)
})

app.delete('/session/:id', (req, res) => {
  const { id } = req.params
  if (sessions[id]) {
    sessions[id].sock.logout()
    delete sessions[id]
    fs.rmSync(`auth/${id}`, { recursive: true, force: true })
  }
  res.json({ ok: true })
})

// Mapa de sesiones activas: { sessionId -> { sock, connected } }
const sessions = {}

const startSession = async (sessionId) => {
  const { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState(`auth/${sessionId}`)

  const sock = makeWASocket({
    version,
    auth: state,
    browser: ['Windows', 'Chrome', '120.0.0'],
    printQRInTerminal: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    logger: pino({ level: 'silent' })
  })

  sessions[sessionId] = { sock, connected: false }

  sock.ev.on('connection.update', async (update) => {
    const { qr, connection, lastDisconnect } = update

    if (qr) {
      const image = await QRCode.toDataURL(qr)
      io.emit(`qr:${sessionId}`, image)
      console.log(`📲 QR sesión ${sessionId}`)
    }

    if (connection === 'open') {
      console.log(`✅ Sesión ${sessionId} conectada`)
      sessions[sessionId].connected = true
      io.emit(`status:${sessionId}`, 'connected')
    }

    if (connection === 'close') {
      console.log(`❌ Sesión ${sessionId} cerrada`)
      sessions[sessionId].connected = false
      io.emit(`status:${sessionId}`, 'disconnected')
      const reason = lastDisconnect?.error?.output?.statusCode
      const delay = reason === 515 ? 2000 : 5000
      setTimeout(() => startSession(sessionId), delay)
    }
  })
sock.ev.on("messages.upsert", async ({ messages }) => {
  const msg = messages[0];

  if (!msg.message) return;

  const body =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text;

  const reply = await sendToLaravel({
    from: msg.key.remoteJid,
    body: body,
    pushName: msg.pushName
  });

  await sock.sendMessage(msg.key.remoteJid, {
    text: reply
  });
});

  sock.ev.on('creds.update', saveCreds)
}

// API: crear nueva sesión
app.post('/session/new', (req, res) => {
  const { sessionId } = req.body
  if (!sessionId) return res.status(400).json({ error: 'sessionId requerido' })
  if (sessions[sessionId]) return res.status(400).json({ error: 'Sesión ya existe' })
  startSession(sessionId)
  res.json({ ok: true, sessionId })
})

// API: listar sesiones
app.get('/sessions', (req, res) => {
  const list = Object.entries(sessions).map(([id, s]) => ({
    id,
    connected: s.connected
  }))
  res.json(list)
})

// API: eliminar sesión
app.delete('/session/:id', (req, res) => {
  const { id } = req.params
  if (sessions[id]) {
    sessions[id].sock.logout()
    delete sessions[id]
    fs.rmSync(`auth/${id}`, { recursive: true, force: true })
  }
  res.json({ ok: true })
})

// Al conectar un navegador, envía estado de todas las sesiones
io.on('connection', (socket) => {
  Object.entries(sessions).forEach(([id, s]) => {
    if (s.connected) socket.emit(`status:${id}`, 'connected')
  })
})

// Cargar sesiones guardadas al arrancar
const loadExistingSessions = () => {
  if (!fs.existsSync('auth')) return
  const dirs = fs.readdirSync('auth')
  dirs.forEach(id => {
    console.log(`🔄 Cargando sesión guardada: ${id}`)
    startSession(id)
  })
}

loadExistingSessions()
server.listen(3000, () => console.log('Servidor en http://localhost:3000'))