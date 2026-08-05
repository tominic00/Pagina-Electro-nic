import { useState, useEffect } from "react"
import { Bot, Settings, Play, Save, Sparkles, Key } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabAsistenteIA({ usuarioActual }: { usuarioActual: any }) {
  const [apiKey, setApiKey] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [mensajes, setMensajes] = useState<{rol: "user" | "ia", texto: string}[]>([
    { rol: "ia", texto: "¡Hola! Soy el simulador de tu vendedor virtual impulsado por Google Gemini (100% Gratis). Configurá tu API Key a la izquierda y probemos." }
  ])
  const [inputMensaje, setInputMensaje] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [stockActual, setStockActual] = useState<any[]>([])

  const defaultPrompt = `Sos el vendedor estrella de Electro·Nic, un local de celulares en Tucumán. Estás atendiendo a un cliente por WhatsApp.

REGLAS ESTRICTAS:
1. Respuestas súper cortas y al pie (máximo 2 oraciones por mensaje).
2. Hablá en argentino informal y amigable (usá 'vos', 'mirá', 'fijate', 'te comento').
3. NUNCA uses listas con viñetas, emojis exagerados ni negritas excesivas. Escribí como una persona real en WhatsApp.
4. Si preguntan por un equipo que NO está en el stock, decile: "Uh, de ese justo me quedé sin nada, pero te puedo ofrecer..." y ofrecele algo similar.
5. Si preguntan precio, pasale SIEMPRE el "Precio Minorista" en USD. Aclará que aceptan USDT, Dólares físicos y Pesos al cambio del día.
6. NUNCA inventes precios ni stock. Usá SOLO la información del inventario que te paso abajo.

INVENTARIO ACTUAL EN TIEMPO REAL:
{STOCK_DATA}`

  useEffect(() => {
    const savedKey = localStorage.getItem("electro_gemini_key") || ""
    const savedPrompt = localStorage.getItem("electro_ai_prompt") || defaultPrompt
    setApiKey(savedKey)
    setSystemPrompt(savedPrompt)

    const fetchStock = async () => {
      const { data } = await supabase.from("stock_mayorista").select("*").eq("estado", "Disponible")
      if (data) setStockActual(data)
    }
    fetchStock()
  }, [])

  const guardarConfig = () => {
    localStorage.setItem("electro_gemini_key", apiKey)
    localStorage.setItem("electro_ai_prompt", systemPrompt)
    alert("✅ Configuración guardada en tu navegador.")
  }

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMensaje.trim()) return
    if (!apiKey) return alert("⚠️ Necesitás pegar tu API Key GRATIS de Google Gemini para probar el simulador.")

    const nuevoMensajeUsuario = { rol: "user" as const, texto: inputMensaje }
    const historial = [...mensajes, nuevoMensajeUsuario]
    
    setMensajes(historial)
    setInputMensaje("")
    setIsTyping(true)

    try {
      const stockFormateado = stockActual.map(eq => 
        `- ${eq.equipo} | Condición: ${eq.condicion} | Bat: ${eq.bateria || 'N/A'}% | Precio Minorista: USD ${eq.precio_minorista_usd || eq.precio_venta_usd}`
      ).join("\n")

      const promptConStock = systemPrompt.replace("{STOCK_DATA}", stockFormateado || "Actualmente no hay stock disponible.")

      // Formato de historial para Google Gemini API
      const contentsForGemini = historial.slice(1).map(m => ({
        role: m.rol === "user" ? "user" : "model",
        parts: [{ text: m.texto }]
      }))

      // 🚀 LLAMADA A LA API CON ENDPOINT CORREGIDO (models/gemini-1.5-flash)
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: promptConStock }]
          },
          contents: contentsForGemini
        })
      })

      const data = await res.json()

      if (data.error) throw new Error(data.error.message)

      const respuestaIA = data.candidates[0].content.parts[0].text

      setMensajes([...historial, { rol: "ia", texto: respuestaIA }])

    } catch (error: any) {
      console.error(error)
      setMensajes([...historial, { rol: "ia", texto: `❌ Error de conexión con Gemini: ${error.message}` }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-xl font-black text-white flex items-center gap-2"><Bot className="size-5 text-indigo-500"/> Laboratorio de IA (Gratis)</h2>
        <p className="text-xs text-zinc-500 mt-1">Configurá la personalidad de tu vendedor automático impulsado por Google Gemini.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PANEL IZQUIERDO: CONFIGURACIÓN DEL CEREBRO */}
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2"><Key className="size-4"/> Conexión Google Gemini (100% Gratis)</h3>
            
            <label className="text-[10px] font-bold text-zinc-500 block mb-1.5">API Key de Gemini</label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)} 
              placeholder="AIzaSy..." 
              className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 font-mono mb-2" 
            />
            <p className="text-[10px] text-zinc-500 leading-relaxed mb-4">
              Obtené tu clave gratis en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a>. No requiere tarjeta.
            </p>

            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 mt-8 flex items-center gap-2"><Settings className="size-4"/> Comportamiento (System Prompt)</h3>
            <label className="text-[10px] font-bold text-zinc-500 block mb-1.5">Instrucciones para la Inteligencia Artificial</label>
            <textarea 
              value={systemPrompt} 
              onChange={e => setSystemPrompt(e.target.value)} 
              className="w-full bg-[#161B22] border border-zinc-800 text-zinc-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 font-mono h-[350px] resize-none" 
            />
            <p className="text-[10px] text-zinc-500 mt-2">La etiqueta <strong>{`{STOCK_DATA}`}</strong> se reemplaza dinámicamente con tus equipos reales.</p>

            <button onClick={guardarConfig} className="w-full mt-6 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-zinc-700">
              <Save className="size-4"/> Guardar Configuración
            </button>
          </div>
        </div>

        {/* PANEL DERECHO: SIMULADOR DE CHAT */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-xl flex flex-col h-[700px]">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 rounded-t-3xl flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="size-10 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Sparkles className="size-5 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-zinc-900 rounded-full"></div>
              </div>
              <div>
                <h3 className="text-sm font-black text-white leading-none">Vendedor IA</h3>
                <p className="text-[10px] text-zinc-400 mt-1">Conectado al Stock ({stockActual.length} items)</p>
              </div>
            </div>
            <button onClick={() => setMensajes([{ rol: "ia", texto: "Chat reiniciado. ¿En qué te ayudo?" }])} className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white px-3 py-1.5 bg-zinc-800 rounded-lg">Reiniciar</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0A0A0A]">
            {mensajes.map((msg, idx) => (
              <div key={idx} className={cn("flex w-full", msg.rol === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] rounded-2xl p-3 text-sm shadow-md", 
                  msg.rol === "user" 
                    ? "bg-emerald-500 text-black rounded-tr-sm" 
                    : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm"
                )}>
                  <p className="whitespace-pre-wrap">{msg.texto}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex w-full justify-start">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm p-4 shadow-md flex gap-1">
                  <div className="size-2 bg-zinc-500 rounded-full animate-bounce"></div>
                  <div className="size-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="size-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-zinc-800 bg-zinc-950 rounded-b-3xl shrink-0">
            <form onSubmit={enviarMensaje} className="flex gap-2">
              <input 
                type="text" 
                value={inputMensaje} 
                onChange={e => setInputMensaje(e.target.value)} 
                placeholder="Escribile un mensaje como si fueras un cliente..." 
                className="flex-1 bg-[#161B22] border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
                disabled={isTyping}
              />
              <button type="submit" disabled={isTyping || !inputMensaje.trim()} className="bg-indigo-500 hover:bg-indigo-400 text-white px-5 rounded-xl transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center">
                <Play className="size-5 fill-white" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}