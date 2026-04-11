export function getFlowResponse(text = '', userState = {}) {
  const msg = text.trim().toLowerCase()

  if (!msg) return null

  // estado opcional (si luego quieres flujos reales)
  const step = userState.step || 'start'

  if (step === 'start' && msg === 'hola') {
    return {
      text: `👋 Hola

¿En qué puedo ayudarte?

1️⃣ Información
2️⃣ Contacto
3️⃣ Asesor`,
      nextStep: 'menu'
    }
  }

  if (step === 'menu') {
    if (msg === '1') {
      return {
        text: `ℹ️ Info:
https://tuweb.com`,
        nextStep: 'start'
      }
    }

    if (msg === '2') {
      return {
        text: `📞 Tel: 9XXXXXXXX`,
        nextStep: 'start'
      }
    }

    if (msg === '3') {
      return {
        text: `Te contacto un asesor 👇
https://wa.me/34XXXXXXX`,
        nextStep: 'start'
      }
    }
  }

  return {
    text: `❌ Opción inválida

Escribe *hola* para empezar`,
    nextStep: 'start'
  }
}