import { faqs } from './faqs.js'
import { stateManager } from './utils/stateManager.js'

const MENU_MESSAGE = `👋 ¡Hola! Bienvenido/a al Desguace 😊

¿En qué puedo ayudarte hoy?

1️⃣ Buscar una pieza
2️⃣ Consultar envíos
3️⃣ Garantía y devoluciones
4️⃣ Hablar con un agente
0️⃣ Volver al menú principal`

const RESPONSES = {
  '1': '🔍 Indícanos marca, modelo, año y pieza que necesitas y te confirmamos disponibilidad y precio.',
  '2': '📦 Realizamos envíos a toda España en 24-48h. Consúltanos el coste junto con tu pieza.',
  '3': '✅ Todas nuestras piezas tienen 12 meses de garantía y devolución en 14 días si no es compatible.',
  '4': '👤 En breve un agente se pondrá en contacto contigo. Horario: L-V 9:00-14:00 y 15:00-17:00.',
}

function buscarFaq(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return faqs.find(faq => faq.preguntas.some(p => t.includes(p)))
}

export async function handleWelcomeFlow(sock, msg) {
  const jid = msg.key.remoteJid
  const text = (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text || ''
  ).trim()

  const textLower = text.toLowerCase()
  const state = stateManager.get(jid) || { step: 'menu' }

  // 1. Siempre intenta responder FAQ primero
  const faq = buscarFaq(textLower)
  if (faq) {
    await sock.sendMessage(jid, { text: faq.respuesta })
    return
  }

  // 2. Reset al menú
  if (state.step === 'menu' || textLower === '0') {
    stateManager.set(jid, { step: 'awaiting_option' })
    await sock.sendMessage(jid, { text: MENU_MESSAGE })
    return
  }

  // 3. Opción del menú seleccionada
  if (state.step === 'awaiting_option') {
    const response = RESPONSES[text]
    if (response) {
      await sock.sendMessage(jid, { text: response })
    } else {
      await sock.sendMessage(jid, {
        text: '❓ Opción no válida. Elige una opción del 1 al 4 o escribe tu consulta directamente.'
      })
    }
  }
}