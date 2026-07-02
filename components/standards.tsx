"use client"

import React, { useState, useEffect } from "react"
import { ShieldCheck, Truck, Headphones, PenTool, Star } from "lucide-react" // 🚀 Íconos adaptados
import supabase from "@/lib/supabase"

// Diccionario seguro para mapear los strings guardados en Supabase
const iconMap: Record<string, any> = {
  PenTool, // Para repuestos/servicio
  Truck,
  ShieldCheck,
  Headphones,
  Star
}

// 🚀 TUS NUEVOS ESTÁNDARES DE SERVICIO
const itemsOriginales = [
  { icon: "ShieldCheck", title: "Garantía Escrita", text: "Comprá con tranquilidad. Todos nuestros equipos nuevos y usados cuentan con garantía oficial o propia del local." },
  { icon: "PenTool", title: "Repuestos Premium", text: "En nuestro servicio técnico utilizamos repuestos de máxima calidad para asegurar que tu equipo rinda al 100%." },
  { icon: "Truck", title: "Envíos Seguros", text: "Embalamos tu equipo con cuidado y despachamos a todo el país para que tu compra llegue en perfectas condiciones." },
  { icon: "Headphones", title: "Atención Especializada", text: "Asesoramiento real y humano. Te ayudamos a elegir el equipo correcto para vos y resolvemos todas tus dudas técnicas." },
]

export function Standards({ settingsOverride }: { settingsOverride?: any }) {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    if (settingsOverride) return

    supabase
      .from("home_settings")
      .select("*")
      .eq("id", "main")
      .single()
      .then(({ data }) => {
        if (data) setSettings(data)
      })
  }, [settingsOverride])

  const settingsActuales = settingsOverride || settings

  if (settingsActuales?.standards_visible === false) return null

  const tituloSeccion = settingsActuales?.standards_text || "Un compromiso absoluto con la tecnología"
  const listaTarjetas = Array.isArray(settingsActuales?.standards_items) && settingsActuales.standards_items.length === 4
    ? settingsActuales.standards_items
    : itemsOriginales

  return (
    <section id="estandar" className="bg-muted/30 py-24 lg:py-32 border-y border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        
        {/* ENCABEZADO */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-5 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-primary/60">
            <span className="h-px w-10 bg-primary/60" />
            Nuestro estándar
            <span className="h-px w-10 bg-primary/60" />
          </p>
          <h2 
            className="text-4xl font-bold leading-tight tracking-tighter text-foreground text-balance sm:text-5xl"
            dangerouslySetInnerHTML={{ __html: tituloSeccion }}
          />
        </div>

        {/* GRILLA DE CÍRCULOS */}
        <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {listaTarjetas.map((item: any, idx: number) => {
            const IconComponent = iconMap[item.icon] || iconMap[itemsOriginales[idx].icon] || Star
            return (
              <div key={idx} className="group flex flex-col items-center text-center">
                
                {/* Ícono Circular (Diseño premium, cambia de color al pasar el mouse) */}
                <div className="flex size-20 items-center justify-center rounded-full border border-border bg-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:border-primary/30 group-hover:shadow-md">
                  <div className="flex size-14 items-center justify-center rounded-full bg-muted/50 transition-colors duration-300 group-hover:bg-primary/5">
                    <IconComponent className="size-6 text-primary transition-colors duration-300 group-hover:text-primary" strokeWidth={2} />
                  </div>
                </div>
                
                {/* Textos */}
                <h3 
                  className="mt-6 text-lg font-bold tracking-tight text-foreground"
                  dangerouslySetInnerHTML={{ __html: item.title || itemsOriginales[idx].title }}
                />
                <p 
                  className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-[280px]"
                  dangerouslySetInnerHTML={{ __html: item.text || itemsOriginales[idx].text }}
                />
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}