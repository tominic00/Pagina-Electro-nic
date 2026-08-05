import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { apiKey, systemPrompt, mensajes } = await req.json()

    if (!apiKey) {
      return NextResponse.json({ error: "Falta la API Key de Groq" }, { status: 400 })
    }

    // Armamos el historial en el formato oficial de OpenAI / Groq
    const messagesForGroq = [
      { role: "system", content: systemPrompt },
      ...mensajes.map((m: any) => ({
        role: m.rol === "user" ? "user" : "assistant",
        content: m.texto
      }))
    ]

    // Llamada a la API ultrarrápida de Groq (Modelo Llama-3.3-70b)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // El modelo más potente y rápido de Meta
        messages: messagesForGroq,
        temperature: 0.65
      })
    })

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 })
    }

    const respuestaTexto = data.choices?.[0]?.message?.content || "No pude procesar la respuesta."

    return NextResponse.json({ respuesta: respuestaTexto })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}