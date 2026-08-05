import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { apiKey, systemPrompt, mensajes } = await req.json()

    if (!apiKey) {
      return NextResponse.json({ error: "Falta la API Key" }, { status: 400 })
    }

    const messagesForGroq = [
      { role: "system", content: systemPrompt },
      ...mensajes.map((m: any) => ({
        role: m.rol === "user" ? "user" : "assistant",
        content: m.texto
      }))
    ]

    // Llamada a Groq
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messagesForGroq,
        temperature: 0.65
      })
    })

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 })
    }

    const respuestaTexto = data.choices?.[0]?.message?.content || "No pude procesar la respuesta."

    // 🚨 DETECTOR DE SOLICITUD DE REUNIÓN FUERA DE HORA
    // Si la IA detecta que le dio los datos o avisó al dueño, dispara la alerta
    const textoMinuscula = respuestaTexto.toLowerCase()
    const esSolicitudReunion = textoMinuscula.includes("notificación al dueño") || 
                               textoMinuscula.includes("le aviso al dueño") ||
                               textoMinuscula.includes("le mandé la notificación")

    if (esSolicitudReunion) {
      const ultimoMensajeCliente = mensajes[mensajes.length - 1]?.texto || "Sin datos"
      
      // A) OPCIÓN GRATIS 1: Notificación por Telegram a tu celular
      await enviarAlertaTelegram(`🚨 *NUEVA SOLICITUD DE REUNIÓN FUERA DE HORA*\n\n💬 *Mensaje del cliente:* "${ultimoMensajeCliente}"\n\n📌 *Revisá el chat para confirmar el horario.*`)

      // B) OPCIÓN WHATSAPP (Si usás la API oficial o un proveedor de WhatsApp)
      // await enviarAlertaWhatsApp("TU_NUMERO_PERSONAL", ultimoMensajeCliente)
    }

    return NextResponse.json({ respuesta: respuestaTexto })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}

// Función auxiliar para mandarte la alerta al celular por Telegram gratis
async function enviarAlertaTelegram(mensaje: string) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: mensaje,
        parse_mode: "Markdown"
      })
    })
  } catch (e) {
    console.error("Error enviando alerta por Telegram:", e)
  }
}