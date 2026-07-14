"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation" // 🚀 Forma ultra-segura de leer la URL
import { Loader2, CheckCircle2, Wrench, Clock, Smartphone, Star, Send } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

export default function SeguimientoCliente() {
  const params = useParams()
  const idOrden = params?.id as string

  const [orden, setOrden] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errorDB, setErrorDB] = useState<string | null>(null) // 🚀 Detector de errores
  
  // Estados para los formularios interactivos
  const [aceptando, setAceptando] = useState(false)
  const [mensajeTexto, setMensajeTexto] = useState("")
  const [rating, setRating] = useState(0)
  const [resenaTexto, setResenaTexto] = useState("")

  useEffect(() => {
    if (!idOrden) return;

    const fetchOrden = async () => {
      const { data, error } = await supabase.from("ventas_b2b").select("*").eq("id", idOrden).single()
      
      if (error) {
        setErrorDB(error.message)
        console.error("Error de Supabase:", error)
      } else if (data) {
        setOrden(data)
      }
      setLoading(false)
    }
    fetchOrden()
  }, [idOrden])

  const aceptarPresupuesto = async () => {
    setAceptando(true)
    const { error } = await supabase.from("ventas_b2b").update({ presupuesto_aceptado: true }).eq("id", idOrden)
    if (!error) setOrden({ ...orden, presupuesto_aceptado: true })
    setAceptando(false)
  }

  const enviarMensaje = async () => {
    if (!mensajeTexto.trim()) return
    setAceptando(true)
    const { error } = await supabase.from("ventas_b2b").update({ mensaje_cliente: mensajeTexto }).eq("id", idOrden)
    if (!error) setOrden({ ...orden, mensaje_cliente: mensajeTexto })
    setAceptando(false)
  }

  const enviarResena = async () => {
    if (rating === 0) return alert("Por favor, marcá la cantidad de estrellas.")
    setAceptando(true)
    const { error } = await supabase.from("ventas_b2b").update({ rating_estrellas: rating, resena_texto: resenaTexto }).eq("id", idOrden)
    if (!error) setOrden({ ...orden, rating_estrellas: rating, resena_texto: resenaTexto })
    setAceptando(false)
  }

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-purple-500"><Loader2 className="size-8 animate-spin" /></div>
  
  // 🚀 SI SUPABASE NOS BLOQUEA, AHORA LO VEREMOS EN LETRAS ROJAS EN EL CELULAR
  if (errorDB) return (
    <div className="min-h-screen bg-[#09090b] flex flex-col gap-4 items-center justify-center text-white font-bold p-6 text-center">
      <span className="text-red-500 text-4xl">⚠️</span>
      <p>Error al conectar con la base de datos:</p>
      <code className="text-xs text-red-400 bg-red-950 p-4 rounded-xl shadow-lg border border-red-900 break-all">{errorDB}</code>
    </div>
  )

  if (!orden) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white font-bold">Orden no encontrada o eliminada.</div>

  const debeSaldo = orden.monto_pagado < orden.total_trato

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col md:items-center">
      
      {/* HEADER */}
      <div className="bg-[#161B22] border-b border-zinc-800 p-4 sticky top-0 z-10 w-full md:max-w-md flex items-center gap-3 shadow-lg">
        <div className="size-10 bg-purple-600 rounded-full flex items-center justify-center shrink-0 border-2 border-zinc-900"><Wrench className="size-5 text-white" /></div>
        <div>
          <h1 className="font-black text-lg leading-none">Electro·nic Soporte</h1>
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1 mt-1"><span className="relative flex size-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span></span> En línea</p>
        </div>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto w-full md:max-w-md flex-1 pb-10">
        <p className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Ticket #{orden.id.slice(0,8).toUpperCase()}</p>

        {/* 1. RECEPCIÓN */}
        <div className="flex flex-col gap-1 w-[90%]">
          <span className="text-[10px] text-zinc-500 font-bold ml-2">Electro·nic</span>
          <div className="bg-zinc-800 text-sm text-zinc-200 p-4 rounded-2xl rounded-tl-sm shadow-md">
            ¡Hola, <b>{orden.cliente_referencia?.split(' ')[0] || "Cliente"}</b>! 👋 Ingresamos tu <b>{orden.nombre_producto?.replace("Servicio: ", "")}</b>.<br/><br/><b>Falla reportada:</b> {orden.diagnostico_falla || "Revisión General"}
          </div>
        </div>

        {/* 2. PRESUPUESTO */}
        <div className="flex flex-col gap-1 w-[90%]">
          <span className="text-[10px] text-zinc-500 font-bold ml-2">Electro·nic</span>
          <div className="bg-zinc-800 text-sm text-zinc-200 p-4 rounded-2xl rounded-tl-sm shadow-md">
            El presupuesto estimado es de <b>$ {Number(orden.total_trato || 0).toLocaleString("es-AR")}</b>.<br/><br/>
            
            {!orden.presupuesto_aceptado && !orden.mensaje_cliente ? (
              <div className="mt-3 border-t border-zinc-700 pt-3">
                <p className="text-xs font-bold mb-3">¿Nos das el OK para reparar?</p>
                <div className="flex gap-2">
                  <button onClick={aceptarPresupuesto} disabled={aceptando} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-2.5 rounded-xl shadow-lg shadow-purple-600/20">Aceptar</button>
                </div>
                <div className="mt-3">
                  <p className="text-[10px] font-bold text-zinc-400 mb-1">O dejá un mensaje al técnico:</p>
                  <div className="flex gap-2">
                    <input type="text" value={mensajeTexto} onChange={e=>setMensajeTexto(e.target.value)} placeholder="Tengo una duda..." className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 text-xs outline-none focus:border-purple-500" />
                    <button onClick={enviarMensaje} className="bg-zinc-700 text-white p-2 rounded-xl"><Send className="size-4"/></button>
                  </div>
                </div>
              </div>
            ) : orden.presupuesto_aceptado ? (
               <div className="mt-2 text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 p-2 rounded-lg"><CheckCircle2 className="size-4" /> Presupuesto Aprobado.</div>
            ) : null}
          </div>
        </div>

        {/* 3. MENSAJE DEL CLIENTE */}
        {orden.mensaje_cliente && (
          <div className="flex flex-col gap-1 w-[85%] self-end ml-auto items-end">
            <span className="text-[10px] text-zinc-500 font-bold mr-2">Vos</span>
            <div className="bg-purple-600 text-sm text-white p-3 rounded-2xl rounded-tr-sm shadow-md">{orden.mensaje_cliente}</div>
            {!orden.presupuesto_aceptado && (
              <button onClick={aceptarPresupuesto} className="mt-1 text-[10px] font-bold text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-full hover:bg-purple-500/10 transition-colors">Dar el OK Final al Presupuesto</button>
            )}
          </div>
        )}

        {/* 4. APROBACIÓN VERDE */}
        {orden.presupuesto_aceptado && (
          <div className="flex flex-col gap-1 w-[85%] self-end ml-auto items-end">
            <span className="text-[10px] text-zinc-500 font-bold mr-2">Vos</span>
            <div className="bg-emerald-600 text-sm text-white p-3 rounded-2xl rounded-tr-sm shadow-md">¡Dale para adelante! 👍</div>
          </div>
        )}

        {/* 5. EN PROCESO */}
        {(orden.estado === "En Laboratorio" || orden.estado === "Listo" || orden.estado === "Entregado") && orden.presupuesto_aceptado && (
          <div className="flex flex-col gap-1 w-[90%]">
            <span className="text-[10px] text-zinc-500 font-bold ml-2">Electro·nic</span>
            <div className="bg-zinc-800 text-sm text-zinc-200 p-4 rounded-2xl rounded-tl-sm shadow-md"><span className="flex items-center gap-2 font-bold text-amber-400 mb-1"><Clock className="size-4"/> Trabajando...</span>Tu equipo está en nuestro laboratorio. Te avisamos ni bien termine.</div>
          </div>
        )}

        {/* 6. LISTO PARA RETIRAR */}
        {(orden.estado === "Listo" || orden.estado === "Entregado") && (
          <div className="flex flex-col gap-1 w-[90%]">
            <span className="text-[10px] text-zinc-500 font-bold ml-2">Electro·nic</span>
            <div className="bg-zinc-800 text-sm text-zinc-200 p-4 rounded-2xl rounded-tl-sm border border-emerald-500/30"><span className="flex items-center gap-2 font-black text-emerald-400 mb-2"><CheckCircle2 className="size-5"/> ¡Equipo Terminado! 🎉</span>Ya podés pasar a retirar.{debeSaldo && <span className="block mt-2 font-bold text-amber-400">Saldo pendiente en el local: $ {Number(orden.total_trato - orden.monto_pagado).toLocaleString("es-AR")}</span>}</div>
          </div>
        )}

        {/* 7. ENTREGADO & SISTEMA DE RESEÑAS */}
        {orden.estado === "Entregado" && (
           <div className="flex flex-col gap-1 w-full pt-4 border-t border-zinc-800 mt-8 animate-in slide-in-from-bottom-10 fade-in duration-500">
             {!orden.rating_estrellas ? (
               <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col items-center shadow-lg">
                 <h3 className="font-black text-white text-base mb-1">¡Gracias por elegirnos!</h3>
                 <p className="text-xs text-zinc-400 mb-4 text-center">¿Cómo calificarías nuestro servicio?</p>
                 <div className="flex gap-2 mb-4">
                   {[1,2,3,4,5].map(star => (
                     <button key={star} onClick={()=>setRating(star)} className="transition-all active:scale-90 hover:scale-110">
                       <Star className={cn("size-8", rating >= star ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "text-zinc-700")} />
                     </button>
                   ))}
                 </div>
                 <textarea placeholder="Dejanos un breve comentario o reseña..." value={resenaTexto} onChange={e=>setResenaTexto(e.target.value)} className="w-full h-20 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm resize-none mb-3 outline-none focus:border-amber-500" />
                 <button onClick={enviarResena} disabled={aceptando} className="w-full bg-amber-500 text-black font-black uppercase tracking-widest py-3 rounded-xl hover:bg-amber-400 transition-colors">Enviar Reseña</button>
               </div>
             ) : (
               <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex flex-col items-center">
                 <div className="flex gap-1 mb-2">{[1,2,3,4,5].map(s => <Star key={s} className={cn("size-4", orden.rating_estrellas >= s ? "fill-amber-500 text-amber-500" : "text-zinc-700")} />)}</div>
                 <p className="text-sm font-bold text-white text-center italic">"{orden.resena_texto}"</p>
                 <p className="text-[10px] text-amber-500/50 uppercase font-black mt-3">¡Reseña Guardada!</p>
               </div>
             )}
           </div>
        )}
      </div>
    </div>
  )
}