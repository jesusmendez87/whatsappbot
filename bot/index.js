import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from 'baileys'
import qrcode from 'qrcode-terminal'
import { getFlowResponse } from './flows.js'
import fs from 'fs'
import path from 'path'

const users = {}

async function start() {
    try {
        const { version } = await fetchLatestBaileysVersion()

        const { state, saveCreds } = await useMultiFileAuthState('auth')

        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            syncFullHistory: false,
            markOnlineOnConnect: false,
            generateHighQualityLinkPreview: false,
            browser: ['Windows', 'Chrome', '120.0.1'],
            connectTimeoutMs: 60_000,
            retryRequestDelayMs: 2000

        })

        sock.ev.on('creds.update', saveCreds)

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update

            if (qr) {
                console.log('📱 Escanea este QR:')
                qrcode.generate(qr, { small: true })
            }

            if (connection === 'open') {
                console.log('✅ CONECTADO A WHATSAPP')
            }

            if (connection === 'close') {
                const code = lastDisconnect?.error?.output?.statusCode
                const error = lastDisconnect?.error
                const shouldReconnect = code !== DisconnectReason.loggedOut

                console.log('❌ CONEXIÓN CERRADA')

                // Verificar si es error de sesión corrupta
                if (error?.message?.includes('bad-request') || error?.output?.statusCode === 500) {
                    console.log('🔄 Error de sesión detectado, limpiando auth y reiniciando...')
                    try {
                        const authPath = path.join(process.cwd(), 'auth')
                        if (fs.existsSync(authPath)) {
                            fs.rmSync(authPath, { recursive: true, force: true })
                            console.log('🗑️ Carpeta auth limpiada')
                        }
                        setTimeout(() => {
                            start()
                        }, 2000)
                        return
                    } catch (cleanError) {
                        console.log('⚠️ Error limpiando auth:', cleanError.message)
                    }
                }

                if (shouldReconnect) {
                    console.log('🔄 Reconectando...')
                    setTimeout(() => {
                        start()
                    }, 5000)
                }
            }
        })

        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            const msg = messages?.[0]
            if (!msg) return

            if (msg.key.fromMe) return

            if (
                msg.key.remoteJid === 'status@broadcast' ||
                msg.key.remoteJid?.includes('newsletter')
            ) return

            const messageContent = msg.message
            if (!messageContent) return

            const text =
                messageContent.conversation ||
                messageContent.extendedTextMessage?.text ||
                messageContent.imageMessage?.caption ||
                ''

            const clean = text.trim()
            if (!clean) return

            console.log('📩 REAL:', clean)

            const response = getFlowResponse(clean)
            if (!response) return

            await sock.sendMessage(msg.key.remoteJid, {
                text: response.text
            })
        })

    } catch (error) {
        console.log('❌ Error iniciando bot:', error.message)

        // Si hay error de sesión, limpiar y reiniciar
        if (error.message?.includes('bad-request') || error.message?.includes('init queries')) {
            console.log('🔄 Error de sesión detectado, limpiando auth y reiniciando...')
            try {
                const authPath = path.join(process.cwd(), 'auth')
                if (fs.existsSync(authPath)) {
                    fs.rmSync(authPath, { recursive: true, force: true })
                    console.log('🗑️ Carpeta auth limpiada')
                }
                setTimeout(() => {
                    start()
                }, 2000)
            } catch (cleanError) {
                console.log('⚠️ Error limpiando auth:', cleanError.message)
            }
        }
    }
    process.on('SIGINT', async () => {
        console.log("\n[!] Iniciando cierre de seguridad...");

        try {
            if (sock) {
                // Cerramos la conexión sin desvincular el QR
                sock.end(undefined);
                console.log("[✓] Conexión de socket finalizada.");
            }
        } catch (e) {
            console.error("[!] Error al cerrar socket:", e.message);
        }

        // Esperamos 1 segundo para asegurar que los archivos JSON de sesión se guarden
        setTimeout(() => {
            console.log("[✓] Proceso terminado.");
            process.exit(0);
        }, 1000);
    });
}

start()