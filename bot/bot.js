import axios from "axios";

export async function sendToLaravel(messageData) {
  try {
    const res = await axios.post("http://localhost:8000/api/bot/webhook", {
      phone: messageData.from,
      message: messageData.body,
      name: messageData.pushName || null
    });

    return res.data.reply;
  } catch (err) {
    console.error("❌ Error Laravel:", err.message);
    return "Error en el sistema";
  }
}