 import { getFlowResponse } from './flows.js'
import { useMultiFileAuthState } from '@whiskeysockets/baileys'
import express from 'express'
import { Server } from 'socket.io'
import http from 'http'
import makeWASocket, {fetchLatestBaileysVersion } from '@whiskeysockets/baileys'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const start = async () => {
        const { version } = await fetchLatestBaileysVersion()

        const { state, saveCreds } = await useMultiFileAuthState('auth')

const sock = makeWASocket({
    version,
    auth: state,
    browser: ['Windows', 'Chrome', '120.0.0'],
    printQRInTerminal: true,
    markOnlineOnConnect: false
})

sock.ev.on('connection.update', (update) => {
    const { qr, connection, lastDisconnect } = update

    if (qr) {
        console.log('QR generado')
        io.emit('qr', qr)
    }

    if (connection === 'close') {
        console.log('Conexión cerrada', lastDisconnect?.error)
    }

    if (connection === 'open') {
        console.log('✅ Conectado a WhatsApp')
    }
})

    sock.ev.on('creds.update', saveCreds)
}

start()

 

server.listen(3000, () => console.log('Servidor en http://localhost:3000'))