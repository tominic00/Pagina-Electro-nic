import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { apiKey, systemPrompt, mensajes } = await req.json()

    if (!apiKey) {
      return NextResponse.json({ error: "Falta la API Key" }, { status: 400 })
    }

    // Armamos el prompt contextualizado
    let promptCompleto = `[INSTRUCCIONES Y STOCK]\n${systemPrompt}\n\n[HISTORIAL DE CHAT]\n`
    
    mensajes.forEach((m: any) => {
      promptCompleto += `${m.rol === "user" ? "Cliente" : "Vendedor"}: ${m.texto}\n`
    })
    
    promptCompleto += `Vendedor:`

    // Llamada directa a la REST API oficial de Google (Servidor a Servidor)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptCompleto }]
          }
        ]
      })
    })

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 })
    }

    const respuestaTexto = data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude procesar la respuesta."

    return NextResponse.json({ respuesta: respuestaTexto })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}