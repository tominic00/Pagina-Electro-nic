import { useState, useEffect } from "react"
import { Bot, Settings, Play, Save, Sparkles, Zap, Radio, CheckCircle2 } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function TabAsistenteIA({ usuarioActual }: { usuarioActual: any }) {
  const [apiKey, setApiKey] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [mensajes, setMensajes] = useState<{rol: "user" | "ia", texto: string}[]>([
    { rol: "ia", texto: "¡Hola! Soy el simulador de tu vendedor virtual. Configurá tu API Key y probá el chat." }
  ])
  const [inputMensaje, setInputMensaje] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isTestingDifusion, setIsTestingDifusion] = useState(false)
  const [stockActual, setStockActual] = useState<any[]>([])

  const defaultPrompt = `Sos el vendedor ejecutivo y estrella de Electro·Nic, tienda de celulares en Yerba Buena, Tucumán. Atendés a clientes por WhatsApp.

UBICACIÓN Y HORARIOS HABITUALES (PARA MINORISTAS):
- Dirección: Florida Sur 24 local 2 (frente al Banco Francés), Yerba Buena.
- Lunes a Viernes: de 9:30 a 13:30 hs y de 17:30 a 21:30 hs.
- Sábados: de 10:00 a 14:00 hs.

TONO, MEMORIA Y ESTILO DE RESPUESTA:
1. TENÉ MEMORIA DEL CHAT: Prestá atención a lo que el cliente YA TE DIJO en mensajes anteriores (su nombre, horario, modelo que busca). NUNCA le vuelvas a preguntar algo que ya respondió.
2. RESPUESTAS CORTAS Y DIRECTAS: Máximo 3 o 4 oraciones por mensaje. Escribí como una persona real en chat.
3. TONO ARGENTINO NATURAL: Usá 'vos', 'te cuento', 'fijate', 'de una'.
4. PROHIBIDO ABUSAR DE MULETILLAS: NO repitas 'che', 'mirá' o el nombre del cliente en todos los mensajes. Evitá frases robóticas.
5. AVANZÁ RÁPIDO: Si el cliente dice "Sí", "Me interesa" o se muestra receptivo, proponé cerrar la compra o la visita al local.

REUNIONES Y CITAS (PARA MINORISTAS):
- Para coordinar una cita, necesitás 4 datos: NOMBRE, EQUIPO DE INTERÉS, DÍA y HORA.
- Apenas tengas los 4 datos, CERRÁ LA CITA diciendo: "¡Espectacular [Nombre]! Ya le mandé la notificación al dueño con tu pedido para ver el [Equipo] el [Día y Hora]. En breve te confirmamos por acá." y agregá al final: [AGENDAR_CITA: Nombre - Equipo - Día y Hora].

REGALOS Y PROMOCIONES VIGENTES (MINORISTA):
- Todos los iPhone USADOS vienen con Funda + Vidrio Templado DE REGALO. 🎁
- Llevando cualquier equipo, tenés un 20% DE DESCUENTO en el cargador rápido.

MANEJO DE PRECIOS Y STOCK:
- Precios SIEMPRE en USD ("Precio Minorista"). Medios de pago: USDT, Dólares físicos y Pesos al cambio del día.
- NUNCA inventes precios ni stock. Usá ÚNICAMENTE el inventario de abajo.

INVENTARIO ACTUAL EN TIEMPO REAL:
{STOCK_DATA}`

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await supabase.from("configuracion_ia").select("*").eq("id", 1).single()
        if (data) {
          setSystemPrompt(data.system_prompt || defaultPrompt)
          setApiKey(data.groq_api_key || "")
        } else {
          setSystemPrompt(defaultPrompt)
        }
      } catch (err) {
        setSystemPrompt(defaultPrompt)
      }
    }

    const fetchStock = async () => {
      const { data } = await supabase.from("stock_mayorista").select("*").eq("estado", "Disponible")
      if (data) setStockActual(data)
    }

    fetchConfig()
    fetchStock()
  }, [])

  const guardarConfig = async () => {
    try {
      const keyLimpia = apiKey.trim()
      const { error } = await supabase.from("configuracion_ia").upsert({
        id: 1,
        system_prompt: systemPrompt,
        groq_api_key: keyLimpia,
        updated_at: new Date().toISOString()
      })

      if (error) throw error

      alert("✅ Configuración de Groq guardada correctamente en Supabase y aplicada a WhatsApp.")
    } catch (error: any) {
      alert("❌ Error al guardar en base de datos: " + error.message)
    }
  }

  const probarDifusionMatutina = async () => {
    if (!confirm("¿Deseas enviar la prueba de difusión matutina a tus clientes mayoristas ahora?")) return
    setIsTestingDifusion(true)
    try {
      const res = await fetch("/api/difusion-matutina")
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      alert(`🚀 ¡Difusión enviada con éxito a ${data.mensajesEnviados || 0} clientes mayoristas!`)
    } catch (e: any) {
      alert("Error en difusión: " + e.message)
    } finally {
      setIsTestingDifusion(false)
    }
  }

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMensaje.trim()) return
    const keyLimpia = apiKey.trim()
    if (!keyLimpia) return alert("⚠️ Necesitás pegar tu API Key de Groq para probar el simulador.")

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

      const res = await fetch("/api/chat-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: keyLimpia,
          systemPrompt: promptConStock,
          mensajes: historial.slice(1)
        })
      })

      const data = await res.json()

      if (data.error) throw new Error(data.error)

      setMensajes([...historial, { rol: "ia", texto: data.respuesta }])

    } catch (error: any) {
      setMensajes([...historial, { rol: "ia", texto: `❌ Error: ${error.message}` }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2"><Bot className="size-5 text-indigo-500"/> Laboratorio de IA & Automatización WA</h2>
          <p className="text-xs text-zinc-500 mt-1">Configurá la personalidad del vendedor virtual y probá las difusiones automatizadas.</p>
        </div>
        <button onClick={probarDifusionMatutina} disabled={isTestingDifusion} className="bg-orange-500 hover:bg-orange-400 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50">
          <Radio className="size-4" /> {isTestingDifusion ? "Enviando..." : "Probar Difusión 10:00 AM"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PANEL IZQUIERDO: CONFIGURACIÓN */}
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2"><Zap className="size-4 text-orange-400"/> Conexión Groq (Gratis)</h3>
            
            <label className="text-[10px] font-bold text-zinc-500 block mb-1.5">API Key de Groq</label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)} 
              placeholder="gsk_..." 
              className="w-full bg-[#161B22] border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 font-mono mb-2" 
            />

            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 mt-8 flex items-center gap-2"><Settings className="size-4"/> Comportamiento Ejecutivo (Prompt)</h3>
            <textarea 
              value={systemPrompt} 
              onChange={e => setSystemPrompt(e.target.value)} 
              className="w-full bg-[#161B22] border border-zinc-800 text-zinc-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 font-mono h-[350px] resize-none" 
            />

            <button onClick={guardarConfig} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95">
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