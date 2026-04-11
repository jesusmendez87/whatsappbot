import QRCode from 'qrcode'
import { useMultiFileAuthState } from '@whiskeysockets/baileys'
import express from 'express'
import { Server } from 'socket.io'
import http from 'http'
import makeWASocket, {fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import { getFlowResponse } from 'bot/flows.js'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' }
})
app.use(express.static('public'))

let lastQR = null

const start = async () => {
    const { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState('auth')

    const sock = makeWASocket({
        version,
        auth: state,
        browser: ['Windows', 'Chrome', '120.0.0'],
        printQRInTerminal: false,
        syncFullHistory: false,
        markOnlineOnConnect: false
    })

sock.ev.on('connection.update', async (update) => {
    const { qr, connection, lastDisconnect } = update

    if (qr && qr !== lastQR) {
        lastQR = qr
        const image = await QRCode.toDataURL(qr)
        io.emit('qr', image)
        console.log('📲 QR actualizado')
    }

    if (connection === 'open') {
        console.log('✅ Conectado a WhatsApp')
        io.emit('status', 'connected')
    }

    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode

        console.log('❌ Conexión cerrada:', reason)

        // 🔥 IMPORTANTE: reiniciar socket
        if (reason === 515) {
            console.log('🔄 Reiniciando stream...')
            setTimeout(() => start(), 2000)
        } else {
            setTimeout(() => start(), 5000)
        }
    }
})

    sock.ev.on('creds.update', saveCreds)
}

start()

 

server.listen(3000, () => console.log('Servidor en http://localhost:3000'))