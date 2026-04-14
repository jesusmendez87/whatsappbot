📱 WhatsApp Bot

Bot de WhatsApp desarrollado con Node.js que permite automatizar conversaciones, crear flujos personalizados y construir integraciones para distintos casos de uso (negocios, soporte, leads, etc.).

🚀 Características
🤖 Respuestas automáticas en WhatsApp
🔄 Sistema de flujos conversacionales
📲 Autenticación mediante QR
🧩 Arquitectura modular y escalable
🔌 Preparado para integraciones externas
💬 Gestión de múltiples conversaciones
🛠️ Tecnologías
Node.js
JavaScript / TypeScript
Baileys (WhatsApp Web API)
📦 Instalación

Clona el repositorio:

git clone https://github.com/jesusmendez87/whatsappbot.git
cd whatsappbot

Instala las dependencias:

npm install
▶️ Uso

Inicia el bot:

npm start

Modo desarrollo (si aplica):

npm run dev

Escanea el código QR que aparecerá en consola con tu WhatsApp.

📂 Estructura del proyecto
src/
 ├── flows/        # Flujos de conversación
 ├── handlers/     # Lógica de mensajes
 ├── services/     # Integraciones externas
 ├── utils/        # Funciones auxiliares
 └── index.js      # Punto de entrada
🧩 Ejemplo de flujo
addKeyword('hola')
  .addAnswer('¡Hola! ¿En qué puedo ayudarte?')
🔌 Integraciones posibles
APIs externas
IA (OpenAI, etc.)
Bases de datos (MongoDB, MySQL…)
CRM
⚠️ Notas
Este bot utiliza WhatsApp Web (no es una API oficial).
Es necesario mantener la sesión activa.
Usar con moderación para evitar bloqueos.
💡 Casos de uso
Atención al cliente automatizada
Captación de leads
Notificaciones automáticas
Bots para negocios locales
Automatización interna
🤝 Contribución

Las contribuciones son bienvenidas.
Puedes abrir un issue o enviar un pull request.

📄 Licencia

MIT

👨‍💻 Autor

Jesús Méndez

⭐ Si te resulta útil

Dale una estrella al repositorio ⭐
